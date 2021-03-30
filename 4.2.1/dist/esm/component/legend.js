import Component from "./component";
import { getLegendItemHeight, LEGEND_CHECKBOX_SIZE, LEGEND_ICON_SIZE, LEGEND_ITEM_MARGIN_X, LEGEND_MARGIN_X, } from "../brushes/legend";
import { getTextWidth } from "../helpers/calculator";
import { isVerticalAlign, padding } from "../store/layout";
import { isUndefined } from "../helpers/utils";
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
    getXPositionWhenVerticalAlign(data) {
        const { offset, rowWidths } = data.reduce((acc, datum) => {
            const { rowIndex, columnIndex, width } = datum;
            if (isUndefined(acc.rowWidths[rowIndex])) {
                acc.rowWidths[rowIndex] = 0;
                acc.offset[rowIndex] = [0];
            }
            acc.rowWidths[rowIndex] += width + (columnIndex ? LEGEND_ITEM_MARGIN_X : 0);
            acc.offset[rowIndex][columnIndex + 1] =
                acc.offset[rowIndex][columnIndex] + LEGEND_ITEM_MARGIN_X + width;
            return acc;
        }, { offset: [], rowWidths: [] });
        const { width } = this.rect;
        rowWidths.forEach((rowWidth, rowIndex) => {
            const xMargin = (width - rowWidth) / 2;
            offset[rowIndex] = offset[rowIndex].map((xOffset) => xOffset + xMargin);
        });
        return offset;
    }
    getXPositionWhenHorizontalAlign(data) {
        const maxWidths = data.reduce((acc, datum) => {
            const { columnIndex, width } = datum;
            if (isUndefined(acc[columnIndex])) {
                acc[columnIndex] = 0;
            }
            acc[columnIndex] = Math.max(acc[columnIndex], width);
            return acc;
        }, []);
        return data.reduce((acc, datum) => {
            const { rowIndex, columnIndex } = datum;
            if (isUndefined(acc[rowIndex])) {
                acc[rowIndex] = [0];
            }
            acc[rowIndex][columnIndex + 1] =
                acc[rowIndex][columnIndex] + LEGEND_ITEM_MARGIN_X + maxWidths[columnIndex];
            return acc;
        }, []);
    }
    renderLegendModel(legend) {
        const { data, showCheckbox, align, useScatterChartIcon } = legend;
        const verticalAlign = isVerticalAlign(align);
        const itemHeight = getLegendItemHeight(this.theme.label.fontSize);
        const xPosition = verticalAlign
            ? this.getXPositionWhenVerticalAlign(data)
            : this.getXPositionWhenHorizontalAlign(data);
        return [
            Object.assign({ type: 'legend', align,
                showCheckbox, data: data.map((datum) => {
                    var _a;
                    const { label, iconType, rowIndex, columnIndex } = datum;
                    return Object.assign(Object.assign({}, datum), { iconType: (_a = this.seriesIconTypeMap[label], (_a !== null && _a !== void 0 ? _a : iconType)), color: this.seriesColorMap[label], x: xPosition[rowIndex][columnIndex], y: padding.Y + itemHeight * rowIndex, useScatterChartIcon });
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
        this.isShow = legend.visible && !!legend.data.length;
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
