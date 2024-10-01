import OBSWebSocket from 'obs-websocket-js';

const SCROLL_DURATION = 2000;
const SCROLL_WAIT = 2000;

class OBS {
    private obs: OBSWebSocket;
    public readonly isEnabled: boolean;

    constructor(isEnabled: boolean) {
        this.obs = new OBSWebSocket();
        this.isEnabled = isEnabled;
    }

    async connect(): Promise<void> {
        if (this.isEnabled) {
            console.log('OBS', 'CONNECT')
            await this.obs.connect('ws://localhost:4455');
        }
    }

    async start(): Promise<void> {
        if (this.isEnabled) {
            console.log('OBS', 'START')
            await this.obs.call('StartRecord');
        }
    }

    async stop(): Promise<void> {
        if (this.isEnabled) {
            console.log('OBS', 'STOP')
            await this.obs.call('StopRecord');
        }
    }
}

const params = new URLSearchParams(window.location.search);
const obs = new OBS(params.has('obs'));

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class SlideShow {
    private readonly _mainElement: HTMLElement;
    private readonly _footerElement: HTMLElement;
    private readonly _pageElement: HTMLElement;
    private readonly _styleElement: HTMLStyleElement;

    private _count = 0;
    private _imgList1: Array<HTMLImageElement> = [];
    private _imgList2: Array<HTMLImageElement> = [];

    constructor() {
        this._mainElement = document.getElementById('main')!;
        this._footerElement = document.getElementById('footer')!;
        this._pageElement = document.getElementById('page')!;
        this._styleElement = document.createElement('style');
        document.head.appendChild(this._styleElement);
    }

    async load() {
        console.log('LOAD');
        const response = await fetch('data.json');
        let file_list = await response.json();
        // file_list = file_list.slice(0, 10);
        // console.log(file_list);

        for (let file of file_list) {
            const img1 = await this.createImage(this._mainElement, file);
            this._imgList1.push(img1);
            const img2 = await this.createImage(this._footerElement, file);
            this._imgList2.push(img2);
        }

        const keyframes1 = this.buildKeyframes(this._imgList1, 'main');
        const keyframes2 = this.buildKeyframes(this._imgList2, 'footer');
        this._styleElement.innerHTML = [keyframes1, keyframes2].join('\n');
        this._count = file_list.length;
        this.updatePage(0);
    }

    createImage(parent: HTMLElement, src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.src = `img/${src}`;
            // img.style.opacity = '0';
            img.addEventListener('load', () => {
                parent.appendChild(img);
                // img.classList.add('fade-in');
                img.style.width = `${img.width}px`;
                img.style.height = `${img.height}px`;
                resolve(img);
            });
        });
    }

    buildKeyframes(imgList: Array<HTMLImageElement>, name: string): string {
        const keyframes: Array<string> = [];
        let x1 = 0;
        let x2 = 0;

        for (let i = 0; i < imgList.length; i++) {
            const img = imgList[i];
            x2 -= img.width;
            keyframes.push(`@keyframes ${name}${i} { from { transform: translateX(${x1}px); } to { transform: translateX(${x2}px); }}`);
            x1 = x2;
        }

        return keyframes.join('\n')
    }

    async execute(): Promise<void> {
        console.log('EXECUTE');

        for (let i = 0; i < this._count; i++) {
            this._mainElement.style.animation = `main${i} ${SCROLL_DURATION}ms ease-in-out forwards`;
            this._footerElement.style.animation = `footer${i} ${SCROLL_DURATION}ms ease-in-out forwards`;
            await sleep(SCROLL_DURATION);

            this.updatePage(i);
            // const ii = Math.max(0, i - 1);
            // this._imgList1[ii].style.display = 'hidden';
            // this._imgList2[ii].style.display = 'hidden';
            await sleep(SCROLL_WAIT);
        }

        document.body.classList.add('fade-out');
        await sleep(5000);
    }

    updatePage(i: number): void {
        this._pageElement.textContent = `${(i + 1)}/${this._count}`;
    }
}

window.onload = async () => {
    // DOMが読み込まれた後に実行したいコードをここに書きます
    console.log('INIT');
    obs.connect();
    obs.start();

    setTimeout(() => {
        const audio = document.getElementById('audio') as HTMLAudioElement;
        audio.play();
    }, 1000); // 3秒のディレイ

    const slideShow = new SlideShow();
    await slideShow.load();
    await sleep(1000 * 12);
    await slideShow.execute();
    await sleep(1000 * 15);
    obs.stop();
};
