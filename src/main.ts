function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

class SlideShow {
    private readonly SCROLL_DURATION = 3000;
    private readonly SCROLL_WAIT = 1000;

    private readonly _mainElement: HTMLElement;
    private readonly _footerElement: HTMLElement;
    private readonly _pageElement: HTMLElement;
    private _startTime = 0;
    private _count = 0;
    private _imgList1: Array<HTMLImageElement> = [];
    private _imgList2: Array<HTMLImageElement> = [];

    constructor() {
        this._mainElement = document.getElementById('main')!;
        this._footerElement = document.getElementById('footer')!;
        this._pageElement = document.getElementById('page')!;
    }

    async load() {
        const response = await fetch('data.json');
        const file_list = await response.json();
        console.log(file_list);

        for (let file of file_list) {
            const img1 = document.createElement('img');
            img1.src = `img/${file}`;
            // img1.loading = 'lazy';
            this._mainElement.appendChild(img1);
            this._imgList1.push(img1);

            const img2 = document.createElement('img');
            img2.src = `img/${file}`;
            // img2.loading = 'lazy';
            this._footerElement.appendChild(img2);
            this._imgList2.push(img2);
        }

        this._count = file_list.length;
        this.updatePage(0);
    }

    async run(): Promise<void> {
        console.log('RUN');

        for (let i = 0; i < this._count; i++) {
            await this.animate(i);
            this.updatePage(i);
            await this.sleep(this.SCROLL_WAIT);
        }

        document.body.classList.add('fade-out');
        await this.sleep(3);
        document.body.style.opacity = '0';
    }

    updatePage(i: number): void {
        this._pageElement.textContent = `${(i + 1)}/${this._count}`;
    }

    sleep(ms: number): Promise<void> {
        // console.log('SLEEP');
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animate(i: number): Promise<void> {
        // console.log('ANIMATE', i);
        this._startTime = Date.now();
        return new Promise(async (resolve) => {
            this.scroll(
                resolve,
                this._mainElement,
                this._mainElement.scrollLeft,
                this._imgList1[i].width,
                0);

            const img2 = this._imgList2[i];
            this.scroll(
                resolve,
                this._footerElement,
                this._footerElement.scrollLeft,
                img2.width,
                0);
        });
    }

    scroll(resolve: () => void, element: HTMLElement, ix: number, width: number, rx: number): void {
        const tick = (Date.now() - this._startTime);
        const progress = Math.min(tick / this.SCROLL_DURATION, 1);
        const easedProgress = easeInOutQuad(progress);
        const x = ix + Math.floor(width * easedProgress);

        if (rx !== x) {
            // element.style.transform = `translateX(${-x}px)`;
            element.scrollLeft = x;
        }

        if (progress < 1) {
            requestAnimationFrame(() => this.scroll(resolve, element, ix, width, x));
        } else {
            resolve();
        }
    }
}

(async () => {
    const slideShow = new SlideShow();
    await slideShow.load();
    await slideShow.sleep(12000);
    slideShow.run();
})();


