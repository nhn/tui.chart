import Component from "./component";
import { makeTickPixelPositions, crispPixel } from "../helpers/calculator";
import { TICK_SIZE } from "../brushes/axis";
import { includes } from "../helpers/utils";
import { getAxisTheme } from "../helpers/axes";
import { getTitleFontString } from "../helpers/style";
export var AxisType;
(function (AxisType) {
    AxisType["X"] = "xAxis";
    AxisType["Y"] = "yAxis";
    AxisType["SECONDARY_Y"] = "secondaryYAxis";
    AxisType["CIRCULAR"] = "circularAxis";
    AxisType["VERTICAL"] = "verticalAxis";
})(AxisType || (AxisType = {}));
function getOffsetAndAnchorKey(hasBasedYAxis) {
    return {
        offsetKey: hasBasedYAxis ? 'y' : 'x',
        anchorKey: hasBasedYAxis ? 'x' : 'y',
    };
}
export default class Axis extends Component {
    constructor() {
        super(...arguments);
        this.models = { label: [], tick: [], axisLine: [] };
        this.axisSize = 0;
    }
    initialize({ name }) {
        this.type = 'axis';
        this.name = name;
        this.yAxisComponent = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
    }
    render({ layout, axes, theme, scale }) {
        var _a;
        if (axes.centerYAxis || !axes[this.name]) {
            return;
        }
        this.theme = getAxisTheme(theme, this.name);
        this.rect = layout[this.name];
        this.axisSize = this.yAxisComponent ? this.rect.height : this.rect.width;
        const { viewLabels } = axes[this.name];
        const { offsetKey, anchorKey } = getOffsetAndAnchorKey(this.yAxisComponent);
        const renderOptions = this.makeRenderOptions(axes[this.name], (_a = scale) === null || _a === void 0 ? void 0 : _a[this.name]);
        const hasOnlyAxisLine = this.hasOnlyAxisLine();
        if (!hasOnlyAxisLine) {
            this.models.label = this.renderLabelModels(viewLabels, offsetKey, anchorKey, renderOptions);
            this.models.tick = this.renderTickModels(offsetKey, anchorKey, renderOptions);
        }
        this.models.axisLine = [this.renderAxisLineModel()];
        if (!this.drawModels) {
            this.drawModels = {
                tick: [],
                label: [],
                axisLine: this.models.axisLine,
            };
            ['tick', 'label'].forEach((type) => {
                this.drawModels[type] = this.models[type].map((m) => {
                    const drawModel = Object.assign({}, m);
                    if (this.yAxisComponent) {
                        drawModel.y = 0;
                    }
                    else {
                        drawModel.x = 0;
                    }
                    return drawModel;
                });
            });
        }
    }
    renderAxisLineModel() {
        const zeroPixel = crispPixel(0);
        let lineModel;
        const { color: strokeStyle, width: lineWidth } = this.theme;
        if (this.yAxisComponent) {
            const x = this.getYAxisXPoint();
            lineModel = {
                type: 'line',
                x,
                y: zeroPixel,
                x2: x,
                y2: crispPixel(this.axisSize),
                strokeStyle,
                lineWidth,
            };
        }
        else {
            lineModel = {
                type: 'line',
                x: zeroPixel,
                y: zeroPixel,
                x2: crispPixel(this.axisSize),
                y2: zeroPixel,
                strokeStyle,
                lineWidth,
            };
        }
        return lineModel;
    }
    renderTickModels(offsetKey, anchorKey, renderOptions) {
        const tickAnchorPoint = this.yAxisComponent ? this.getYAxisXPoint() : crispPixel(0);
        const { tickInterval, relativePositions } = renderOptions;
        const tickSize = includes([AxisType.SECONDARY_Y, AxisType.X], this.name)
            ? TICK_SIZE
            : -TICK_SIZE;
        return relativePositions.reduce((positions, position, index) => {
            return index % tickInterval
                ? positions
                : [
                    ...positions,
                    {
                        type: 'tick',
                        isYAxis: this.yAxisComponent,
                        tickSize,
                        [offsetKey]: crispPixel(position),
                        [anchorKey]: tickAnchorPoint,
                        strokeStyle: this.theme.color,
                        lineWidth: this.theme.width,
                    },
                ];
        }, []);
    }
    renderLabelModels(labels, offsetKey, anchorKey, renderOptions) {
        const { needRotateLabel, radian, offsetY } = renderOptions;
        const labelTheme = this.theme.label;
        const font = getTitleFontString(labelTheme);
        const textAlign = this.getLabelTextAlign(needRotateLabel);
        const style = ['default', { textAlign, font, fillStyle: labelTheme.color }];
        const labelAnchorPoint = this.yAxisComponent ? this.getYAxisAnchorPoint() : offsetY;
        return labels.map(({ text, offsetPos }) => ({
            type: 'label',
            text,
            style,
            radian,
            [offsetKey]: crispPixel(offsetPos),
            [anchorKey]: labelAnchorPoint,
        }));
    }
    makeRenderOptions(axisData, scale) {
        var _a, _b, _c, _d;
        const { tickCount, tickInterval } = axisData;
        const sizeRatio = (_b = (_a = scale) === null || _a === void 0 ? void 0 : _a.sizeRatio, (_b !== null && _b !== void 0 ? _b : 1));
        const positionRatio = (_d = (_c = scale) === null || _c === void 0 ? void 0 : _c.positionRatio, (_d !== null && _d !== void 0 ? _d : 0));
        const relativePositions = makeTickPixelPositions(this.axisSize * sizeRatio, tickCount, this.axisSize * positionRatio);
        if (this.yAxisComponent) {
            return {
                relativePositions,
                tickInterval,
            };
        }
        const { needRotateLabel, radian, offsetY } = axisData;
        return {
            relativePositions,
            tickInterval,
            needRotateLabel,
            radian,
            offsetY,
        };
    }
    getYAxisAnchorPoint() {
        return this.isRightSide() ? crispPixel(this.rect.width) : crispPixel(0);
    }
    getLabelTextAlign(needRotateLabel) {
        const yAxisTextAlign = this.isRightSide() ? 'right' : 'left';
        const xAxisTextAlign = needRotateLabel ? 'left' : 'center';
        return this.yAxisComponent ? yAxisTextAlign : xAxisTextAlign;
    }
    isRightSide() {
        return this.name === AxisType.SECONDARY_Y;
    }
    getYAxisXPoint() {
        return this.isRightSide() ? crispPixel(0) : crispPixel(this.rect.width);
    }
    hasOnlyAxisLine() {
        return ((this.yAxisComponent && !this.rect.width) || (this.name === AxisType.X && !this.rect.height));
    }
}
