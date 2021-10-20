import { message } from "./message";
export default class Painter {
    constructor(chart) {
        this.width = 0;
        this.height = 0;
        this.brushes = {};
        this.chart = chart;
    }
    showUnsupportedCanvasFeatureError() {
        if (!this.ctx.setLineDash) {
            console.warn(message.DASH_SEGMENTS_UNAVAILABLE_ERROR);
        }
    }
    setup() {
        const { height, width } = this.chart.store.state.chart;
        if (!this.canvas) {
            const canvas = document.createElement('canvas');
            this.canvas = canvas;
            this.chart.el.appendChild(canvas);
            canvas.addEventListener('click', this.chart);
            canvas.addEventListener('mousemove', this.chart);
            canvas.addEventListener('mousedown', this.chart);
            canvas.addEventListener('mouseup', this.chart);
            canvas.addEventListener('mouseout', this.chart);
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.ctx = ctx;
            }
        }
        this.setSize(width, height);
        this.showUnsupportedCanvasFeatureError();
    }
    setSize(width, height) {
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        let ratio = 1;
        if ('deviceXDPI' in window.screen) {
            // IE mobile or IE
            ratio =
                window.screen.deviceXDPI /
                    window.screen.logicalXDPI;
        }
        else if (window.hasOwnProperty('devicePixelRatio')) {
            ratio = window.devicePixelRatio;
        }
        this.width = width * ratio || 0;
        this.height = height * ratio || 0;
        this.scaleCanvasRatio(ratio);
    }
    scaleCanvasRatio(ratio) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.scale(ratio, ratio);
    }
    add(name, brush) {
        this.brushes[name] = brush;
    }
    addGroups(groups) {
        groups.forEach((group) => {
            Object.keys(group).forEach((key) => {
                this.add(key, group[key]);
            });
        });
    }
    paint(name, brushModel) {
        if (this.brushes[name]) {
            this.brushes[name](this.ctx, brushModel);
        }
        else {
            throw new Error(message.noBrushError(name));
        }
    }
    paintForEach(brushModels) {
        brushModels.forEach((m) => this.paint(m.type, m));
    }
    beforeFrame() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    beforeDraw(transX, transY) {
        this.ctx.save();
        this.ctx.translate(transX, transY);
    }
    afterDraw() {
        this.ctx.restore();
    }
}
