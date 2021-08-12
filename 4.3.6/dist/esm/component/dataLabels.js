import Component from "./component";
import { isUndefined } from "../helpers/utils";
import { isModelExistingInRect } from "../helpers/coordinate";
import { getDataLabelsOptions, getDefaultDataLabelsOptions, makePointLabelInfo, makeSectorLabelInfo, makePieSeriesNameLabelInfo, makeRectLabelInfo, makeLineLabelInfo, makeSectorBarLabelInfo, } from "../helpers/dataLabels";
import { pickStackOption } from "../store/stackSeriesData";
function getLabelInfo(model, labelOptions, rect, name) {
    var _a;
    const { type } = model;
    const dataLabel = [];
    if (type === 'point') {
        dataLabel.push(makePointLabelInfo(model, labelOptions, rect));
    }
    else if (type === 'sector') {
        if (name === 'radialBar') {
            dataLabel.push(makeSectorBarLabelInfo(model, labelOptions));
        }
        else {
            dataLabel.push(makeSectorLabelInfo(model, labelOptions));
            if ((_a = labelOptions.pieSeriesName) === null || _a === void 0 ? void 0 : _a.visible) {
                const seriesNameLabel = makePieSeriesNameLabelInfo(model, labelOptions);
                dataLabel.push(seriesNameLabel);
            }
        }
    }
    else if (type === 'line') {
        dataLabel.push(makeLineLabelInfo(model, labelOptions));
    }
    else {
        dataLabel.push(makeRectLabelInfo(model, labelOptions));
    }
    return dataLabel;
}
export default class DataLabels extends Component {
    constructor() {
        super(...arguments);
        this.dataLabelsMap = {};
        this.renderSeriesDataLabels = (seriesDataLabel) => {
            this.appendDataLabels(seriesDataLabel);
            this.models = this.renderLabelModel();
            if (!this.drawModels) {
                this.drawModels = this.getDrawModelsAppliedOpacity(0);
            }
            else {
                this.sync();
            }
        };
    }
    initialize() {
        this.type = 'dataLabels';
        this.name = 'dataLabels';
        this.eventBus.on('renderDataLabels', this.renderSeriesDataLabels);
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        this.drawModels = this.getDrawModelsAppliedOpacity(delta);
    }
    render({ layout, options, series, nestedPieSeries }) {
        this.rect = layout.plot;
        this.options = options;
        this.isShow = this.visibleDataLabels(series, nestedPieSeries);
    }
    visibleDataLabels(series, nestedPieSeries) {
        var _a, _b;
        const visibleCommonSeriesDataLabels = !!((_b = (_a = this.options.series) === null || _a === void 0 ? void 0 : _a.dataLabels) === null || _b === void 0 ? void 0 : _b.visible);
        const visibleComboSeriesDataLabels = Object.keys(series).some((seriesName) => { var _a, _b, _c; return !!((_c = (_b = (_a = this.options.series) === null || _a === void 0 ? void 0 : _a[seriesName]) === null || _b === void 0 ? void 0 : _b.dataLabels) === null || _c === void 0 ? void 0 : _c.visible); });
        const visibleNestedPieSeriesDataLabels = !!(nestedPieSeries &&
            Object.keys(nestedPieSeries).some((alias) => {
                var _a, _b, _c;
                return !!((_c = (_b = (_a = this.options.series) === null || _a === void 0 ? void 0 : _a[alias]) === null || _b === void 0 ? void 0 : _b.dataLabels) === null || _c === void 0 ? void 0 : _c.visible);
            }));
        return (visibleCommonSeriesDataLabels ||
            visibleComboSeriesDataLabels ||
            visibleNestedPieSeriesDataLabels);
    }
    appendDataLabels({ name, data }) {
        const dataLabelOptions = getDataLabelsOptions(this.options, name);
        const withStack = !!pickStackOption(this.options);
        const labels = [];
        data.forEach((model) => {
            var _a;
            const { type, value } = model;
            const labelOptions = getDefaultDataLabelsOptions(dataLabelOptions, type, withStack);
            const disableStackTotal = type === 'stackTotal' && !((_a = labelOptions.stackTotal) === null || _a === void 0 ? void 0 : _a.visible);
            if (disableStackTotal || isUndefined(value)) {
                return;
            }
            labels.splice(labels.length, 0, ...getLabelInfo(model, labelOptions, this.rect, name));
        });
        this.dataLabelsMap[name] = { data: labels, options: dataLabelOptions };
    }
    getDrawModelsAppliedOpacity(opacity) {
        return Object.keys(this.models).reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: this.models[key].map((m) => (Object.assign(Object.assign({}, m), { opacity }))) })), { series: [], total: [] });
    }
    renderLabelModel() {
        return Object.keys(this.dataLabelsMap)
            .map((seriesName) => {
            const { data } = this.dataLabelsMap[seriesName];
            return this.makeLabelModel(data);
        })
            .reduce((acc, cur) => ({
            series: [...acc.series, ...cur.series],
            total: [...acc.total, ...cur.total],
        }), { series: [], total: [] });
    }
    makeLabelModel(dataLabels) {
        return dataLabels.reduce((acc, dataLabel) => {
            var _a;
            const { type, x, y, text, textAlign, textBaseline, name, callout, theme, radian, } = dataLabel;
            if (!isModelExistingInRect(this.rect, { x, y })) {
                return acc;
            }
            const modelName = type === 'stackTotal' ? 'total' : 'series';
            return Object.assign(Object.assign({}, acc), { [modelName]: [
                    ...(_a = acc[modelName], (_a !== null && _a !== void 0 ? _a : [])),
                    {
                        type: 'dataLabel',
                        dataLabelType: type,
                        text,
                        x,
                        y,
                        textAlign,
                        textBaseline,
                        opacity: 1,
                        name,
                        callout,
                        theme,
                        radian,
                    },
                ] });
        }, { series: [], total: [] });
    }
}
