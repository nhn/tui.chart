import Component from "./component";
import { getLegendItemHeight, LEGEND_CHECKBOX_SIZE, LEGEND_ICON_SIZE, LEGEND_ITEM_MARGIN_X, LEGEND_MARGIN_X, } from "../brushes/legend";
import { getTextWidth } from "../helpers/calculator";
import { isVerticalAlign, padding } from "../store/layout";
import { sum } from "../helpers/utils";
import { getTitleFontString } from "../helpers/style";
import { makeObservableObjectToNormal } from "../store/reactive";
export default class Legend extends Component {
    constructor() {
        super(...arguments);
        this.activatedResponders = [];
        this.seriesColorMap = {};
        this.seriesIconTypeMap = {};
        this.onClickCheckbox = (responders) => {
            const { label, checked } = responders[0];
            this.store.dispatch('setAllLegendActiveState', true);
            this.store.dispatch('setLegendCheckedState', { name: label, checked: !checked });
            if (checked) {
                this.store.dispatch('disableSeries', label);
            }
            else {
                this.store.dispatch('enableSeries', label);
            }
            this.eventBus.emit('needDraw');
        };
        this.onClickLabel = (responders) => {
            const { label } = responders[0];
            this.eventBus.emit('resetSelectedSeries');
            if (this.activatedResponders.length && this.activatedResponders[0].label === label) {
                this.store.dispatch('setAllLegendActiveState', true);
                this.activatedResponders = [];
            }
            else {
                this.store.dispatch('setAllLegendActiveState', false);
                this.store.dispatch('setLegendActiveState', { name: label, active: true });
                this.activatedResponders = responders;
            }
            this.eventBus.emit('needDraw');
        };
    }
    onClick({ responders }) {
        var _a;
        if (responders.length) {
            const { data } = responders[0];
            if (((_a = data) === null || _a === void 0 ? void 0 : _a.name) === 'checkbox') {
                this.eventBus.emit('clickLegendCheckbox', makeObservableObjectToNormal(responders));
            }
            else {
                this.eventBus.emit('clickLegendLabel', makeObservableObjectToNormal(responders));
            }
        }
    }
    initialize() {
        this.type = 'legend';
        this.name = 'legend';
        this.eventBus.on('clickLegendCheckbox', this.onClickCheckbox);
        this.eventBus.on('clickLegendLabel', this.onClickLabel);
    }
    initColorAndIconTypeMap(legendData) {
        this.seriesColorMap = {};
        this.seriesIconTypeMap = {};
        legendData.forEach(({ label, color, iconType }) => {
            this.seriesColorMap[label] = color;
            this.seriesIconTypeMap[label] = iconType;
        });
    }
    renderLegendModel(legend) {
        const defaultX = 0;
        const { data, showCheckbox, align, useScatterChartIcon } = legend;
        const verticalAlign = isVerticalAlign(align);
        const legendWidths = data.map(({ width }) => width);
        const itemHeight = getLegendItemHeight(this.theme.label.fontSize);
        return [
            Object.assign({ type: 'legend', align,
                showCheckbox, data: data.map((datum, idx) => {
                    var _a;
                    const xOffset = sum(legendWidths.slice(0, idx)) + LEGEND_ITEM_MARGIN_X * idx;
                    return Object.assign(Object.assign({}, datum), { iconType: (_a = this.seriesIconTypeMap[datum.label], (_a !== null && _a !== void 0 ? _a : datum.iconType)), color: this.seriesColorMap[datum.label], x: verticalAlign ? defaultX + xOffset : defaultX, y: verticalAlign ? padding.Y : padding.Y + itemHeight * idx, useScatterChartIcon });
                }) }, this.theme.label),
        ];
    }
    makeCheckboxResponder(data, showCheckbox) {
        return showCheckbox
            ? data.map((m) => (Object.assign(Object.assign({}, m), { type: 'rect', x: m.x, y: m.y, width: LEGEND_CHECKBOX_SIZE, height: LEGEND_CHECKBOX_SIZE, data: { name: 'checkbox' } })))
            : [];
    }
    makeLabelResponder(data, showCheckbox) {
        const font = getTitleFontString(this.theme.label);
        return data.map((m) => (Object.assign(Object.assign({}, m), { type: 'rect', x: m.x +
                (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
                LEGEND_ICON_SIZE +
                LEGEND_MARGIN_X, y: m.y, width: getTextWidth(m.label, font), data: { name: 'label' }, height: LEGEND_CHECKBOX_SIZE })));
    }
    render({ layout, legend, theme }) {
        this.isShow = legend.visible;
        if (!this.isShow) {
            return;
        }
        // @TODO: stack 일 떄 라벨 순서 역순으로(스택이 쌓인 순서대로) 되어야
        const { showCheckbox, data: legendData } = legend;
        this.rect = layout.legend;
        this.theme = theme.legend;
        this.initColorAndIconTypeMap(legendData);
        this.models = this.renderLegendModel(legend);
        const { data } = this.models[0];
        const checkboxResponder = this.makeCheckboxResponder(data, showCheckbox);
        const labelResponder = this.makeLabelResponder(data, showCheckbox);
        this.responders = [...checkboxResponder, ...labelResponder];
    }
}
