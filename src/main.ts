import OBSWebSocket from 'obs-websocket-js';

const OBS_ADDRESS = '127.0.0.1:4455';
const OBS_PASSWORD = 'testtest';

class SlideShow {
    private readonly SCROLL_DURATION = 3000;
    private readonly SCROLL_WAIT = 1000;

    private readonly _mainElement: HTMLElement;
    private readonly _footerElement: HTMLElement;
    private readonly _pageElement: HTMLElement;
    private readonly _styleElement: HTMLStyleElement;
    private readonly _obs: OBSWebSocket;

    private _count = 0;
    private _imgList1: Array<HTMLImageElement> = [];
    private _imgList2: Array<HTMLImageElement> = [];

    constructor() {
        this._mainElement = document.getElementById('main')!;
        this._footerElement = document.getElementById('footer')!;
        this._pageElement = document.getElementById('page')!;
        this._styleElement = document.createElement('style');
        document.head.appendChild(this._styleElement);
        this._obs = new OBSWebSocket();
    }

    async load() {
        const response = await fetch('data.json');
        let file_list = await response.json();
        // file_list = file_list.slice(0, 10);
        // console.log(file_list);

        for (let i = 0; i < file_list.length; i++) {
            const file = file_list[i];
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
            img.style.opacity = '0';
            img.addEventListener('load', () => {
                parent.appendChild(img);
                img.classList.add('fade-in');
                img.style.width = `${img.width}px`;
                img.style.height = `${img.height}px`;
                resolve(img);
            });
        });
    }

    buildKeyframes(imgList: Array<HTMLImageElement>, name: string): string {
        const keyframes = [];
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

    async run(): Promise<void> {
        for (let i = 0; i < this._count; i++) {
            this._mainElement.style.animation = `main${i} ${this.SCROLL_DURATION}ms ease-in-out forwards`;
            this._footerElement.style.animation = `footer${i} ${this.SCROLL_DURATION}ms ease-in-out forwards`;
            await this.sleep(this.SCROLL_DURATION);

            this.updatePage(i);
            // const ii = Math.max(0, i - 1);
            // this._imgList1[ii].style.display = 'hidden';
            // this._imgList2[ii].style.display = 'hidden';
            await this.sleep(this.SCROLL_WAIT);
        }

        document.body.classList.add('fade-out');
        await this.sleep(5);
    }

    updatePage(i: number): void {
        this._pageElement.textContent = `${(i + 1)}/${this._count}`;
    }

    sleep(ms: number): Promise<void> {
        // console.log('SLEEP');
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async obsConnect() {
        console.log('OBS', 'CONNECT');
        try {
            await this._obs.connect(`ws://${OBS_ADDRESS}`);
        } catch (e) {
            console.error(e);
        }
    }

    async obsDisconnect() {
        console.log('OBS', 'DISCONNECT');
        try {
            await this._obs.disconnect();
        } catch (e) {
            console.error(e);
        }
    }

    async obsStartRecording() {
        console.log('OBS', 'START');
        try {
            await this._obs.call('StartRecording')
        } catch (e) {
            console.error(e);
        }
    }

    async obsStopRecording() {
        console.log('OBS', 'STOP');
        try {
            await this._obs.call('StopRecording')
        } catch (e) {
            console.error(e);
        }
    }
}

(async () => {
    const slideShow = new SlideShow();
    await slideShow.load();
    await slideShow.sleep(13000);
    // slideShow.obsConnect();
    // slideShow.obsStartRecording();
    // slideShow.obsStopRecording();
    slideShow.run();
    // slideShow.obsDisconnect();
})();


