import Component from "./component";
import { getValueString } from "../helpers/tooltip";
import { getBodyTemplate, tooltipTemplates } from "../helpers/tooltipTemplate";
import { isBoolean, isNumber, isString } from "../helpers/utils";
import { getTranslateString } from "../helpers/style";
import { sanitizeHTML } from "../helpers/htmlSanitizer";
const DEFAULT_TOOLTIP_TRANSITION = 'transform 0.2s ease';
export default class Tooltip extends Component {
    constructor() {
        super(...arguments);
        this.tooltipInfoModels = {};
        this.onSeriesPointHovered = ({ models, name }) => {
            var _a;
            this.tooltipInfoModels[name] = ((_a = models) === null || _a === void 0 ? void 0 : _a.length) ? [...models] : [];
            const isShow = !!this.getTooltipInfoModels().length;
            if (isShow) {
                this.renderTooltip();
            }
            else {
                this.removeTooltip();
            }
        };
    }
    isTooltipContainerOverflow(x, y) {
        const { width, height } = this.tooltipContainerEl.getBoundingClientRect();
        const { x: rectX, y: rectY, width: rectWidth, height: rectHeight } = this.rect;
        return {
            overflowX: x > rectX + rectWidth || x + width > rectX + rectWidth,
            overflowY: y > rectY + rectHeight || y + height > rectY + rectHeight,
        };
    }
    getPositionInRect(model) {
        const { target } = model;
        const startX = this.rect.x + model.x;
        const startY = this.rect.y + model.y;
        let x = startX + target.radius + target.width + this.offsetX;
        let y = startY + this.offsetY;
        const { overflowX, overflowY } = this.isTooltipContainerOverflow(x, y);
        const { width, height } = this.tooltipContainerEl.getBoundingClientRect();
        if (overflowX) {
            x =
                startX - (width + target.radius + this.offsetX) > 0
                    ? startX - (width + target.radius + this.offsetX)
                    : startX + this.offsetX;
        }
        if (overflowY) {
            y =
                startY + target.height - (height + this.offsetY) > 0
                    ? startY + target.height - (height + this.offsetY)
                    : y;
        }
        return { x, y };
    }
    setTooltipPosition(model) {
        const { x, y } = this.getPositionInRect(model);
        this.tooltipContainerEl.style.transform = getTranslateString(x, y);
    }
    getTooltipInfoModels() {
        return Object.values(this.tooltipInfoModels).flatMap((item) => item);
    }
    renderTooltip() {
        const model = this.getTooltipInfoModels().reduce((acc, item) => {
            const { data, x, y, radius, width, height } = item;
            acc.x = acc.x ? (acc.x + x) / 2 : x;
            acc.y = acc.y ? (acc.y + y) / 2 : y;
            if (isNumber(radius)) {
                acc.target.radius = radius;
            }
            if (width) {
                acc.target.width = width;
            }
            if (height) {
                acc.target.height = height;
            }
            acc.data.push(Object.assign(Object.assign({}, data), { value: Array.isArray(data.value)
                    ? data.value.map((titleValue) => (Object.assign(Object.assign({}, titleValue), { formattedValue: this.getFormattedValue(titleValue.value, data) })))
                    : data.value, formattedValue: this.getFormattedValue(data.value, data) }));
            if (!acc.category && data.category) {
                acc.category = data.category;
            }
            if (data.templateType) {
                acc.templateType = data.templateType;
            }
            return acc;
        }, { type: 'tooltip', x: 0, y: 0, data: [], target: { radius: 0, width: 0, height: 0 } });
        this.tooltipContainerEl.innerHTML = sanitizeHTML(this.templateFunc(model, {
            header: tooltipTemplates.defaultHeader(model, this.theme),
            body: getBodyTemplate(model.templateType)(model, this.theme),
        }, this.theme));
        this.setTooltipPosition(model);
    }
    initialize({ chartEl }) {
        this.type = 'tooltip';
        this.name = 'tooltip';
        this.chartEl = chartEl;
        this.tooltipContainerEl = document.createElement('div');
        this.tooltipContainerEl.classList.add('toastui-chart-tooltip-container');
        const { width, height, top, left } = this.chartEl.getBoundingClientRect();
        this.tooltipContainerEl.style.transform = getTranslateString(left + width / 2, top + height / 2);
        this.chartEl.appendChild(this.tooltipContainerEl);
        this.eventBus.on('seriesPointHovered', this.onSeriesPointHovered);
    }
    removeTooltip() {
        this.tooltipContainerEl.innerHTML = '';
    }
    setTooltipTransition(options) {
        var _a;
        const transition = (_a = options.tooltip) === null || _a === void 0 ? void 0 : _a.transition;
        if (isBoolean(transition) && transition) {
            this.tooltipContainerEl.style.transition = DEFAULT_TOOLTIP_TRANSITION;
        }
        else if (isString(transition)) {
            this.tooltipContainerEl.style.transition = transition;
        }
    }
    render({ layout, options, theme }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this.setTooltipTransition(options);
        this.rect = layout.plot;
        this.theme = theme.tooltip;
        this.templateFunc = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.template, (_c !== null && _c !== void 0 ? _c : tooltipTemplates['default']));
        this.offsetX = (_f = (_e = (_d = options) === null || _d === void 0 ? void 0 : _d.tooltip) === null || _e === void 0 ? void 0 : _e.offsetX, (_f !== null && _f !== void 0 ? _f : 10));
        this.offsetY = (_j = (_h = (_g = options) === null || _g === void 0 ? void 0 : _g.tooltip) === null || _h === void 0 ? void 0 : _h.offsetY, (_j !== null && _j !== void 0 ? _j : 0));
        this.formatter = (_l = (_k = options) === null || _k === void 0 ? void 0 : _k.tooltip) === null || _l === void 0 ? void 0 : _l.formatter;
    }
    getFormattedValue(value, tooltipDataInfo) {
        return this.formatter
            ? this.formatter(value, tooltipDataInfo)
            : getValueString(value);
    }
}
