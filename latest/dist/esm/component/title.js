import Component from "./component";
import { isString } from "../helpers/utils";
import { getTextWidth } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
export default class Title extends Component {
    initialize() {
        this.type = 'title';
        this.name = 'title';
    }
    renderTitle(options) {
        var _a, _b, _c;
        let text = '';
        let x = 0;
        let y = 0;
        let align = 'left';
        if (isString(options)) {
            text = options;
        }
        else {
            text = options.text;
            align = (_a = options.align, (_a !== null && _a !== void 0 ? _a : 'left'));
            x += (_b = options.offsetX, (_b !== null && _b !== void 0 ? _b : 0));
            y += (_c = options.offsetY, (_c !== null && _c !== void 0 ? _c : 0));
        }
        const font = getTitleFontString(this.theme);
        const textWidth = getTextWidth(text, font);
        if (align === 'center') {
            x += (this.rect.width - textWidth) / 2;
        }
        else if (align === 'right') {
            x += this.rect.width - textWidth;
        }
        return [
            {
                type: 'label',
                x,
                y,
                text,
                style: ['title', { font, fillStyle: this.theme.color }],
            },
        ];
    }
    render({ options, layout, theme }) {
        var _a;
        this.isShow = !!((_a = options.chart) === null || _a === void 0 ? void 0 : _a.title);
        if (!this.isShow) {
            return;
        }
        this.theme = theme.title;
        this.rect = layout.title;
        this.models = this.renderTitle(options.chart.title);
    }
}
