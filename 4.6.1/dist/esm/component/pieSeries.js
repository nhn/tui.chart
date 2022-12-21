import Component from "./component";
import { getRGBA } from "../helpers/color";
import { getRadialAnchorPosition, makeAnchorPositionParam, withinRadian, getDefaultRadius, DEGREE_360, DEGREE_0, DEGREE_90, } from "../helpers/sector";
import { getActiveSeriesMap } from "../helpers/legend";
import { getDataLabelsOptions, RADIUS_PADDING } from "../helpers/dataLabels";
import { getTotalAngle, isSemiCircle, getSemiCircleCenterY, makePieTooltipData, pieTooltipLabelFormatter, } from "../helpers/pieSeries";
import { calculateSizeWithPercentString, isNumber, isUndefined, last, } from "../helpers/utils";
import { pick } from "../helpers/utils";
import { message } from "../message";
import { getMaxLabelSize } from "../helpers/axes";
import { getFont } from "../helpers/style";
function getCalculatedRadiusRange({ alias, renderOptions, radiusRangeMap, pieIndex, radiusRanges, totalPieAliasCount, }) {
    var _a, _b, _c, _d, _e;
    const radiusRangeLength = Object.keys(radiusRangeMap).length;
    const { defaultRadius = 0 } = renderOptions;
    let { inner, outer } = renderOptions.radiusRange;
    if (!radiusRangeMap[alias]) {
        if (!radiusRangeLength) {
            const radius = defaultRadius / totalPieAliasCount;
            inner = pieIndex * radius;
            outer = (pieIndex + 1) * radius;
        }
        else {
            if (pieIndex && radiusRanges[pieIndex - 1].outer) {
                inner = radiusRanges[pieIndex - 1].outer;
            }
            if ((_a = radiusRanges[pieIndex + 1]) === null || _a === void 0 ? void 0 : _a.inner) {
                outer = radiusRanges[pieIndex + 1].inner;
            }
            else if (pieIndex === totalPieAliasCount - 1) {
                outer = defaultRadius;
            }
            else {
                const radius = (defaultRadius -
                    (_c = (_b = radiusRanges[pieIndex - 1]) === null || _b === void 0 ? void 0 : _b.outer, (_c !== null && _c !== void 0 ? _c : 0)) -
                    (_e = (_d = radiusRanges[pieIndex + 1]) === null || _d === void 0 ? void 0 : _d.inner, (_e !== null && _e !== void 0 ? _e : 0))) /
                    (totalPieAliasCount - radiusRangeLength);
                outer = inner + radius;
            }
        }
    }
    return { inner, outer };
}
function getPieSeriesOpacityByDepth(originAlpha, depth, indexOfGroup, brightness = 0.85) {
    const depthAlpha = Number((originAlpha * Math.pow(brightness, depth)).toFixed(2));
    return Number((Math.pow(depthAlpha, (indexOfGroup + 1))).toFixed(2));
}
function getMaxDataLabelSize(seriesNameLabels, options, dataLabelTheme) {
    var _a, _b;
    const outerLabels = [
        {
            hasOuterLabel: options.visible && options.anchor === 'outer',
            labels: ['00.00%'],
            theme: dataLabelTheme,
        },
        {
            hasOuterLabel: ((_a = options.pieSeriesName) === null || _a === void 0 ? void 0 : _a.visible) && ((_b = options.pieSeriesName) === null || _b === void 0 ? void 0 : _b.anchor) === 'outer',
            labels: seriesNameLabels,
            theme: dataLabelTheme.pieSeriesName,
        },
    ];
    return outerLabels.reduce((acc, cur) => {
        const { width, height } = acc;
        const { hasOuterLabel, labels, theme } = cur;
        if (hasOuterLabel) {
            const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(labels, 0, getFont(theme));
            return {
                width: Math.max(maxLabelWidth + RADIUS_PADDING, width),
                height: Math.max(maxLabelHeight + RADIUS_PADDING, height),
            };
        }
        return acc;
    }, { width: 0, height: 0 });
}
export default class PieSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { series: [] };
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.alias || this.name });
            this.eventBus.emit('renderHoveredSeries', { models: [], name: this.alias || this.name });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = ({ seriesIndex, name }) => {
            if (!isNumber(seriesIndex) || (!isUndefined(name) && name !== this.alias)) {
                return;
            }
            const model = this.responders[seriesIndex];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getResponderModelsWithTheme([model], 'select'),
                name: this.name,
                alias: this.alias,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ seriesIndex, name }) => {
            if (!isNumber(seriesIndex) || (!isUndefined(name) && name !== this.alias)) {
                return;
            }
            const models = [this.responders[seriesIndex]];
            if (!models.length) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getResponderModelsWithTheme(models, 'hover'),
                name: this.name,
                alias: this.alias,
            });
            this.activatedResponders = this.makeTooltipResponder(models);
            this.eventBus.emit('seriesPointHovered', {
                models: this.activatedResponders,
                name: this.alias || this.name,
            });
            this.eventBus.emit('needDraw');
        };
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        let currentDegree;
        const index = this.models.series.findIndex(({ clockwise, degree: { start, end }, totalAngle }) => {
            currentDegree = clockwise ? totalAngle * delta : DEGREE_360 - totalAngle * delta;
            return withinRadian(clockwise, start, end, currentDegree);
        });
        this.syncEndAngle(index < 0 ? this.models.series.length : index);
        if (~index) {
            this.drawModels.series[index].degree.end = currentDegree;
        }
    }
    syncEndAngle(index) {
        if (index < 1) {
            return;
        }
        for (let i = 0; i < index; i += 1) {
            const prevTargetEndDegree = this.models.series[i].degree.end;
            if (this.drawModels.series[i].degree.end !== prevTargetEndDegree) {
                this.drawModels.series[i].degree.end = prevTargetEndDegree;
            }
        }
    }
    initialize(param) {
        var _a, _b;
        this.type = 'series';
        this.name = 'pie';
        this.alias = (_b = (_a = param) === null || _a === void 0 ? void 0 : _a.alias, (_b !== null && _b !== void 0 ? _b : ''));
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    render(chartState) {
        var _a, _b, _c, _d;
        const { layout, series, legend, options, nestedPieSeries, theme } = chartState;
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        if (!series.pie) {
            throw new Error(message.noDataError(this.name));
        }
        const pieTheme = theme.series.pie;
        this.theme = this.alias ? pieTheme[this.alias] : pieTheme;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        let seriesModel, tooltipDataModel;
        const dataLabelsOptions = getDataLabelsOptions(options, this.alias);
        if (nestedPieSeries) {
            const { data } = nestedPieSeries[this.alias];
            const pieAlias = Object.keys(nestedPieSeries);
            const pieIndex = pieAlias.findIndex((alias) => alias === this.alias);
            // check the data label of the last Pie series
            const lastAlias = last(pieAlias);
            const lastSeries = nestedPieSeries[lastAlias];
            const maxPieDataLabelSize = getMaxDataLabelSize(lastSeries.data.map(({ name }) => name), getDataLabelsOptions(options, lastAlias), this.theme.dataLabels);
            const renderOptionsMap = this.getRenderOptionsMap(options, pieAlias, maxPieDataLabelSize);
            seriesModel = this.renderPieModel(data, renderOptionsMap[this.alias], pieIndex);
            tooltipDataModel = makePieTooltipData(data, (_b = categories) === null || _b === void 0 ? void 0 : _b[pieIndex]);
        }
        else {
            const pieData = (_c = series.pie) === null || _c === void 0 ? void 0 : _c.data;
            const { width, height } = getMaxDataLabelSize(pieData.map(({ name }) => name), dataLabelsOptions, this.theme.dataLabels);
            const renderOptions = this.makeRenderOptions(options, width, height);
            seriesModel = this.renderPieModel(pieData, renderOptions);
            tooltipDataModel = makePieTooltipData(pieData, (_d = categories) === null || _d === void 0 ? void 0 : _d[0]);
        }
        this.models.series = seriesModel;
        if (!this.drawModels) {
            this.drawModels = {
                series: this.models.series.map((m) => (Object.assign(Object.assign({}, m), { degree: Object.assign(Object.assign({}, m.degree), { end: m.degree.start }) }))),
            };
        }
        if (dataLabelsOptions.visible) {
            const dataLabelData = seriesModel.map((m) => (Object.assign(Object.assign({}, m), { value: `${pieTooltipLabelFormatter(m.percentValue)}`, theme: this.theme.dataLabels })));
            this.renderDataLabels(dataLabelData, this.alias);
        }
        this.responders = seriesModel.map((m, index) => (Object.assign(Object.assign({}, m), { type: 'sector', radius: m.radius, seriesIndex: index, data: Object.assign(Object.assign({}, tooltipDataModel[index]), { percentValue: m.percentValue }), color: getRGBA(m.color, 1) })));
    }
    getRadiusRangeMap(options, pieAlias) {
        return pieAlias.reduce((acc, alias) => {
            var _a, _b;
            const seriesOptions = this.getOptions(options, alias).series;
            if ((_a = seriesOptions) === null || _a === void 0 ? void 0 : _a.radiusRange) {
                acc[alias] = (_b = seriesOptions) === null || _b === void 0 ? void 0 : _b.radiusRange;
            }
            return acc;
        }, {});
    }
    getRenderOptionsMap(options, pieAlias, maxPieDataLabelSize) {
        const renderOptionsMap = this.initRenderOptionsMap(options, pieAlias, maxPieDataLabelSize);
        const radiusRangeMap = this.getRadiusRangeMap(options, pieAlias);
        pieAlias.forEach((alias, pieIndex) => {
            const radiusRanges = Object.values(renderOptionsMap).map(({ radiusRange }) => radiusRange);
            renderOptionsMap[alias].radiusRange = getCalculatedRadiusRange({
                alias,
                renderOptions: renderOptionsMap[alias],
                radiusRangeMap,
                pieIndex,
                radiusRanges,
                totalPieAliasCount: pieAlias.length,
            });
        });
        return renderOptionsMap;
    }
    initRenderOptionsMap(options, pieAlias, { width, height }) {
        return pieAlias.reduce((acc, alias) => (Object.assign(Object.assign({}, acc), { [alias]: this.makeRenderOptions(this.getOptions(options, alias), width, height) })), {});
    }
    getOptions(chartOptions, alias) {
        var _a;
        const options = Object.assign({}, chartOptions);
        if (((_a = options) === null || _a === void 0 ? void 0 : _a.series) && alias) {
            options.series = Object.assign(Object.assign({}, options.series), options.series[alias]);
        }
        return options;
    }
    makeRenderOptions(options, maxDataLabelWidth = 0, maxDataLabelHeight = 0) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const seriesOptions = options.series;
        const clockwise = (_b = (_a = seriesOptions) === null || _a === void 0 ? void 0 : _a.clockwise, (_b !== null && _b !== void 0 ? _b : true));
        const startAngle = (_e = (_d = (_c = seriesOptions) === null || _c === void 0 ? void 0 : _c.angleRange) === null || _d === void 0 ? void 0 : _d.start, (_e !== null && _e !== void 0 ? _e : DEGREE_0));
        const endAngle = (_h = (_g = (_f = seriesOptions) === null || _f === void 0 ? void 0 : _f.angleRange) === null || _g === void 0 ? void 0 : _g.end, (_h !== null && _h !== void 0 ? _h : DEGREE_360));
        const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
        const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
        const { width, height } = this.rect;
        const defaultRadius = getDefaultRadius(this.rect, isSemiCircular, maxDataLabelWidth, maxDataLabelHeight);
        const innerRadius = calculateSizeWithPercentString(defaultRadius, (_l = (_k = (_j = seriesOptions) === null || _j === void 0 ? void 0 : _j.radiusRange) === null || _k === void 0 ? void 0 : _k.inner, (_l !== null && _l !== void 0 ? _l : 0)));
        const outerRadius = calculateSizeWithPercentString(defaultRadius, (_p = (_o = (_m = seriesOptions) === null || _m === void 0 ? void 0 : _m.radiusRange) === null || _o === void 0 ? void 0 : _o.outer, (_p !== null && _p !== void 0 ? _p : (this.alias ? 0 : defaultRadius))));
        const cx = width / 2;
        const cy = isSemiCircular ? getSemiCircleCenterY(this.rect.height, clockwise) : height / 2;
        return {
            clockwise,
            cx,
            cy,
            drawingStartAngle: startAngle - DEGREE_90,
            radiusRange: {
                inner: innerRadius,
                outer: outerRadius,
            },
            angleRange: {
                start: startAngle,
                end: endAngle,
            },
            totalAngle,
            defaultRadius,
        };
    }
    renderPieModel(seriesRawData, renderOptions, pieIndex) {
        const sectorModels = [];
        const total = seriesRawData.reduce((sum, { data }) => sum + ((data !== null && data !== void 0 ? data : 0)), 0);
        const { clockwise, cx, cy, drawingStartAngle, radiusRange: { inner, outer }, totalAngle, } = renderOptions;
        const defaultStartDegree = clockwise ? DEGREE_0 : DEGREE_360;
        const { lineWidth, strokeStyle } = this.theme;
        seriesRawData.forEach((rawData, seriesIndex) => {
            const color = this.alias
                ? this.getAliasSeriesColor(rawData, seriesRawData, pieIndex)
                : this.getSeriesColor(rawData);
            const { data, name } = rawData;
            if (data) {
                const degree = Math.max((data / total) * totalAngle, 1) * (clockwise ? 1 : -1);
                const percentValue = (data / total) * 100;
                const prevModel = sectorModels[sectorModels.length - 1];
                const startDegree = seriesIndex && prevModel ? prevModel.degree.end : defaultStartDegree;
                const endDegree = clockwise
                    ? Math.min(startDegree + degree, DEGREE_360)
                    : Math.max(startDegree + degree, DEGREE_0);
                sectorModels.push({
                    type: 'sector',
                    name,
                    color,
                    x: cx,
                    y: cy,
                    degree: {
                        start: startDegree,
                        end: endDegree,
                    },
                    radius: {
                        inner,
                        outer,
                    },
                    value: data,
                    style: [{ strokeStyle }],
                    lineWidth,
                    clockwise,
                    drawingStartAngle,
                    totalAngle,
                    percentValue,
                });
            }
        });
        return sectorModels;
    }
    makeTooltipResponder(responders) {
        return responders.map((responder) => (Object.assign(Object.assign({}, responder), getRadialAnchorPosition(makeAnchorPositionParam('center', this.models.series[responder.seriesIndex])))));
    }
    onMousemove({ responders }) {
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getResponderModelsWithTheme(responders, 'hover'),
            name: this.alias || this.name,
        });
        this.activatedResponders = this.makeTooltipResponder(responders);
        this.eventBus.emit('seriesPointHovered', {
            models: this.activatedResponders,
            name: this.alias || this.name,
        });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders }) {
        if (this.selectable) {
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getResponderModelsWithTheme(responders, 'select'),
                name: this.name,
                alias: this.alias,
            });
            this.eventBus.emit('needDraw');
        }
    }
    getResponderModelsWithTheme(responders, type) {
        const theme = this.theme[type];
        const lineWidth = theme.lineWidth;
        const isSameLineWidth = this.theme.lineWidth === lineWidth;
        const thickness = isSameLineWidth ? 0 : lineWidth * 0.5;
        return responders.map((m) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, m), { color: (_b = (_a = theme) === null || _a === void 0 ? void 0 : _a.color, (_b !== null && _b !== void 0 ? _b : m.color)), lineWidth, style: [
                    pick(theme, 'strokeStyle', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'),
                ], radius: {
                    inner: Math.max(m.radius.inner - thickness, 0),
                    outer: m.radius.outer + thickness,
                } }));
        });
    }
    getOpacity(active, selectedState) {
        const { select, areaOpacity } = this.theme;
        const { areaOpacity: selectedAreaOpacity, restSeries: { areaOpacity: restAreaOpacity }, } = select;
        const selectThemeOpacity = active ? selectedAreaOpacity : restAreaOpacity;
        return selectedState ? selectThemeOpacity : areaOpacity;
    }
    getIndexOfGroup(seriesRawData, parentName, name) {
        return seriesRawData
            .filter((datum) => parentName === datum.parentName)
            .findIndex((datum) => name === datum.name);
    }
    getSeriesColor(rawData) {
        const { color, name } = rawData;
        const active = this.activeSeriesMap[name];
        const opacity = this.getOpacity(active, this.hasActiveSeries());
        return getRGBA(color, opacity);
    }
    getAliasSeriesColor(rawData, seriesRawData, pieIndex) {
        const { color, name } = rawData;
        const { select: { color: selectedColor }, } = this.theme;
        const { rootParentName, parentName } = rawData;
        const indexOfGroup = this.getIndexOfGroup(seriesRawData, parentName, name);
        const opacity = this.getAliasSeriesOpacity(rootParentName, parentName, pieIndex, indexOfGroup, name);
        const active = this.activeSeriesMap[(rootParentName !== null && rootParentName !== void 0 ? rootParentName : name)];
        const seriesColor = active ? (selectedColor !== null && selectedColor !== void 0 ? selectedColor : color) : color;
        return getRGBA(seriesColor, opacity);
    }
    getAliasSeriesOpacity(rootParentName, parentName, pieIndex, indexOfGroup, name) {
        const active = this.activeSeriesMap[(rootParentName !== null && rootParentName !== void 0 ? rootParentName : name)];
        const opacity = this.getOpacity(active, this.hasActiveSeries());
        return pieIndex && parentName
            ? getPieSeriesOpacityByDepth(opacity, pieIndex, indexOfGroup)
            : opacity;
    }
    hasActiveSeries() {
        return Object.values(this.activeSeriesMap).some((elem) => !elem);
    }
}
