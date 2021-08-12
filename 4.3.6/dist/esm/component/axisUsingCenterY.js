import Component from "./component";
import { makeTickPixelPositions, crispPixel } from "../helpers/calculator";
import { getAxisTheme } from "../helpers/axes";
import { getTitleFontString } from "../helpers/style";
import { AxisType } from "./axis";
export default class AxisUsingCenterY extends Component {
    constructor() {
        super(...arguments);
        this.models = { label: [], tick: [], axisLine: [] };
    }
    initialize({ name }) {
        this.type = 'axis';
        this.name = name;
        this.yAxisComponent = name === AxisType.Y;
    }
    render({ layout, axes, theme }) {
        const { centerYAxis } = axes;
        if (!centerYAxis) {
            return;
        }
        this.theme = getAxisTheme(theme, this.name);
        this.rect = layout[this.name];
        if (this.name === 'yAxis') {
            this.rect = Object.assign(Object.assign({}, this.rect), { x: centerYAxis.x });
        }
        const { viewLabels, tickCount, tickInterval, needRotateLabel, radian, offsetY } = axes[this.name];
        const renderOptions = {
            tickInterval,
            centerYAxis,
            needRotateLabel,
            radian,
            offsetY,
            relativePositions: makeTickPixelPositions(this.axisSize(centerYAxis), tickCount),
        };
        const offsetKey = this.yAxisComponent ? 'y' : 'x';
        const anchorKey = this.yAxisComponent ? 'x' : 'y';
        this.models.label = this.renderLabelModels(viewLabels, offsetKey, anchorKey, renderOptions);
        this.models.tick = this.renderTickModels(offsetKey, anchorKey, renderOptions);
        this.models.axisLine = this.renderAxisLineModel(centerYAxis);
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
    renderAxisLineModel({ xAxisHalfSize, secondStartX }) {
        const zeroPixel = crispPixel(0);
        const widthPixel = crispPixel(this.rect.width);
        let axisLine;
        if (this.yAxisComponent) {
            const heightPixel = crispPixel(this.rect.height);
            axisLine = [
                {
                    type: 'line',
                    x: widthPixel,
                    y: zeroPixel,
                    x2: widthPixel,
                    y2: heightPixel,
                },
                {
                    type: 'line',
                    x: zeroPixel,
                    y: zeroPixel,
                    x2: zeroPixel,
                    y2: heightPixel,
                },
            ];
        }
        else {
            axisLine = [
                {
                    type: 'line',
                    x: zeroPixel,
                    y: zeroPixel,
                    x2: crispPixel(xAxisHalfSize),
                    y2: zeroPixel,
                },
                {
                    type: 'line',
                    x: crispPixel(secondStartX),
                    y: zeroPixel,
                    x2: widthPixel,
                    y2: zeroPixel,
                },
            ];
        }
        return axisLine;
    }
    renderTickModels(offsetKey, anchorKey, renderOptions) {
        const tickAnchorPoint = this.yAxisComponent ? crispPixel(this.rect.width) : crispPixel(0);
        const { tickInterval, centerYAxis: { secondStartX }, relativePositions, } = renderOptions;
        return relativePositions.reduce((positions, position, index) => {
            if (index % tickInterval) {
                return positions;
            }
            const model = {
                type: 'tick',
                isYAxis: this.yAxisComponent,
                tickSize: this.yAxisComponent ? -5 : 5,
                [offsetKey]: crispPixel(position),
                [anchorKey]: tickAnchorPoint,
            };
            const addedTickModel = Object.assign({}, model);
            if (this.yAxisComponent) {
                addedTickModel[anchorKey] = crispPixel(0);
                addedTickModel.tickSize = 5;
            }
            else {
                addedTickModel[offsetKey] = crispPixel(position + secondStartX);
            }
            return [...positions, model, addedTickModel];
        }, []);
    }
    renderLabelModels(labels, offsetKey, anchorKey, renderOptions) {
        const { centerYAxis: { secondStartX, yAxisLabelAnchorPoint }, offsetY, needRotateLabel, radian, } = renderOptions;
        const labelTheme = this.theme.label;
        const font = getTitleFontString(labelTheme);
        let labelAnchorPoint, textAlign, textLabels;
        if (this.yAxisComponent) {
            labelAnchorPoint = crispPixel(yAxisLabelAnchorPoint);
            textAlign = 'center';
            textLabels = labels;
        }
        else {
            labelAnchorPoint = offsetY;
            textLabels = [...labels].reverse();
            textAlign = needRotateLabel ? 'left' : 'center';
        }
        const style = ['default', { textAlign, font, fillStyle: labelTheme.color }];
        return textLabels.reduce((positions, { text, offsetPos }, index) => {
            const model = {
                type: 'label',
                text,
                style,
                [offsetKey]: crispPixel(offsetPos) + (this.yAxisComponent ? 0 : secondStartX),
                [anchorKey]: labelAnchorPoint,
                radian,
            };
            const models = [model];
            if (!this.yAxisComponent) {
                const addedLabelModel = Object.assign(Object.assign({}, model), { text: labels[index].text, [offsetKey]: crispPixel(model[offsetKey] - secondStartX) });
                models.push(addedLabelModel);
            }
            return [...positions, ...models];
        }, []);
    }
    axisSize(centerYAxis) {
        let size;
        if (this.yAxisComponent) {
            size = this.rect.height;
        }
        else {
            size = centerYAxis.xAxisHalfSize;
        }
        return size;
    }
    beforeDraw(painter) {
        painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        painter.ctx.lineWidth = 1;
    }
}
