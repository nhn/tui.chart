import Component from "./component";
import { AxisType } from "./axis";
import { includes } from "../helpers/utils";
import { getTitleFontString } from "../helpers/style";
import { getAxisTheme } from "../helpers/axes";
export default class AxisTitle extends Component {
    initialize({ name }) {
        this.type = 'axisTitle';
        this.name = name;
        this.isYAxis = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
        this.isCircularAxis = this.name === AxisType.CIRCULAR;
    }
    getTitlePosition(offsetX, offsetY) {
        if (this.isCircularAxis) {
            return [this.rect.width / 2 + offsetX, this.rect.height / 2 + offsetY];
        }
        return this.isYAxis
            ? [this.name === AxisType.Y ? offsetX : this.rect.width + offsetX, offsetY]
            : [this.rect.width + offsetX, offsetY];
    }
    renderAxisTitle(option, textAlign) {
        const { text, offsetX, offsetY } = option;
        const [x, y] = this.getTitlePosition(offsetX, offsetY);
        const font = getTitleFontString(this.theme);
        const fillStyle = this.theme.color;
        return [
            {
                type: 'label',
                text,
                x,
                y,
                style: ['axisTitle', { textAlign, fillStyle, font }],
            },
        ];
    }
    getTextAlign(hasCenterYAxis = false) {
        if (this.name === AxisType.Y) {
            return hasCenterYAxis ? 'center' : 'left';
        }
        if (this.isCircularAxis) {
            return 'center';
        }
        return 'right';
    }
    getCircularAxisTitleRect(option, plotRect, circularAxisData) {
        const { x, y } = plotRect;
        const { centerX, centerY, axisSize, radius: { outer: outerRadius }, } = circularAxisData;
        const { offsetY } = option;
        return {
            x: centerX + x - axisSize / 2,
            y: centerY + y - outerRadius / 2,
            width: axisSize,
            height: this.theme.fontSize + offsetY,
        };
    }
    render({ axes, radialAxes, layout, theme }) {
        var _a, _b, _c;
        const titleOption = this.isCircularAxis ? (_a = radialAxes[this.name]) === null || _a === void 0 ? void 0 : _a.title : (_b = axes[this.name]) === null || _b === void 0 ? void 0 : _b.title;
        this.isShow = !!titleOption;
        if (!this.isShow) {
            return;
        }
        this.theme = getAxisTheme(theme, this.name).title;
        this.rect = layout[`${this.name}Title`];
        this.models = this.renderAxisTitle(titleOption, this.getTextAlign(!!((_c = axes) === null || _c === void 0 ? void 0 : _c.centerYAxis)));
    }
}
