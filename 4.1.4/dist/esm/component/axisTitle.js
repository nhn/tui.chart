import Component from "./component";
import { includes } from "../helpers/utils";
import { getTitleFontString } from "../helpers/style";
import { getAxisTheme } from "../helpers/axes";
import { AxisType } from "./axis";
export default class AxisTitle extends Component {
    initialize({ name }) {
        this.type = 'axisTitle';
        this.name = name;
        this.isYAxis = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
    }
    renderAxisTitle(option, textAlign) {
        const { text, offsetX, offsetY } = option;
        const [x, y] = this.isYAxis
            ? [this.name === AxisType.Y ? offsetX : this.rect.width + offsetX, offsetY]
            : [this.rect.width + offsetX, offsetY];
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
        let result = 'right';
        if (this.name === AxisType.Y) {
            result = hasCenterYAxis ? 'center' : 'left';
        }
        return result;
    }
    render({ axes, layout, theme }) {
        var _a;
        const titleOption = (_a = axes[this.name]) === null || _a === void 0 ? void 0 : _a.title;
        this.isShow = !!titleOption;
        if (!this.isShow) {
            return;
        }
        this.rect = layout[`${this.name}Title`];
        this.theme = getAxisTheme(theme, this.name).title;
        this.models = this.renderAxisTitle(titleOption, this.getTextAlign(!!axes.centerYAxis));
    }
}
