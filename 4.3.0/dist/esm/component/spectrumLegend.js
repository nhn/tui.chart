import Component from "./component";
import { range } from "../helpers/utils";
import { isVerticalAlign } from "../store/layout";
export default class SpectrumLegend extends Component {
    constructor() {
        super(...arguments);
        this.labels = [];
        this.renderSpectrumTooltip = ([responderData]) => {
            if (responderData) {
                const { labels, align } = this;
                const { colorValue, color } = responderData;
                const { width, height } = this.rect;
                this.models.tooltip = [
                    {
                        type: 'spectrumTooltip',
                        width,
                        height,
                        x: 0,
                        y: 0,
                        labels,
                        align,
                        colorRatio: responderData.colorRatio,
                        color,
                        text: String(colorValue),
                        verticalAlign: isVerticalAlign(align),
                    },
                ];
            }
            else {
                this.models.tooltip = [];
            }
        };
    }
    initialize() {
        this.type = 'spectrumLegend';
        this.name = 'spectrumLegend';
    }
    makeLabels(scale) {
        const { stepCount, limit, stepSize } = scale;
        const minValue = limit.min;
        return range(0, stepCount + 1).reduce((labels, value) => {
            return [...labels, String(minValue + stepSize * value)];
        }, []);
    }
    renderSpectrumLegendModel(startColor, endColor) {
        const { labels, align } = this;
        const { width, height } = this.rect;
        return [
            {
                type: 'spectrumLegend',
                width,
                height,
                x: 0,
                y: 0,
                labels,
                align,
                startColor,
                endColor,
                verticalAlign: isVerticalAlign(this.align),
            },
        ];
    }
    render({ layout, legend, colorValueScale, theme }) {
        var _a, _b;
        this.rect = layout.legend;
        this.align = legend.align;
        this.isShow = legend.visible && !!legend.data.length;
        if (!this.isShow) {
            return;
        }
        this.labels = this.makeLabels(colorValueScale);
        const { startColor, endColor } = ((_a = theme.series) === null || _a === void 0 ? void 0 : _a.heatmap) || ((_b = theme.series) === null || _b === void 0 ? void 0 : _b.treemap);
        this.models = { legend: this.renderSpectrumLegendModel(startColor, endColor), tooltip: [] };
        this.eventBus.on('renderSpectrumTooltip', this.renderSpectrumTooltip);
    }
}
