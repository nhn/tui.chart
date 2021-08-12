import Component from "./component";
import { getTextHeight, getTextWidth } from "../helpers/calculator";
import { getTitleFontString } from "../helpers/style";
import { isNoData } from "../helpers/validation";
const DEFAULT_NO_DATA_TEXT = 'No data to display';
export default class NoDataText extends Component {
    initialize() {
        this.type = 'noDataText';
        this.name = 'noDataText';
    }
    getCenterPosition(text, font) {
        const textWidth = getTextWidth(text, font);
        const textHeight = getTextHeight(text, font);
        return {
            x: (this.rect.width - textWidth) / 2,
            y: (this.rect.height - textHeight) / 2,
        };
    }
    render({ layout, series, options, theme }) {
        var _a, _b, _c;
        const text = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.lang) === null || _b === void 0 ? void 0 : _b.noData, (_c !== null && _c !== void 0 ? _c : DEFAULT_NO_DATA_TEXT));
        const labelTheme = theme.noData;
        const font = getTitleFontString(labelTheme);
        const fillStyle = labelTheme.color;
        this.isShow = isNoData(series);
        this.rect = layout.plot;
        this.models = [
            Object.assign(Object.assign({ type: 'label' }, this.getCenterPosition(text, font)), { text, style: [{ font, fillStyle }] }),
        ];
    }
}
