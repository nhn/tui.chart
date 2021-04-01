import Component from "./component";
import { getActiveSeriesMap } from "../helpers/legend";
import { getRadialPosition, calculateDegreeToRadian, DEGREE_360 } from "../helpers/sector";
import { getRGBA } from "../helpers/color";
import { getLimitOnAxis } from "../helpers/axes";
import { radarDefault } from "../helpers/theme";
import { isNumber, isNull } from "../helpers/utils";
import { message } from "../message";
import { makeLabelsFromLimit } from "../helpers/calculator";
const NONE_AREA_OPACITY = 0;
const seriesOpacity = {
    INACTIVE: 0.2,
    ACTIVE: 1,
};
export default class RadarSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { area: [], line: [], dot: [] };
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = ({ index, seriesIndex, state }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.radar.data[seriesIndex];
            const model = this.responders.filter(({ name: dataName }) => dataName === name)[index];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme([model], 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ index, seriesIndex, state }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.radar.data[seriesIndex];
            const models = [this.responders.filter(({ name: dataName }) => dataName === name)[index]];
            if (!models.length) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getRespondersWithTheme(models, 'hover'),
                name: this.name,
            });
            this.activatedResponders = models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'radar';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    render(state) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { layout, radialAxes, series, legend, options, theme, scale } = state;
        if (!series.radar) {
            throw new Error(message.noDataError(this.name));
        }
        this.theme = theme.series.radar;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const categories = state.categories;
        const { axisSize, centerX, centerY } = radialAxes.verticalAxis;
        const { limit, stepSize } = scale.verticalAxis;
        const labels = makeLabelsFromLimit(limit, stepSize);
        const { min, max } = getLimitOnAxis(labels);
        const renderOptions = {
            categories,
            degree: DEGREE_360 / categories.length,
            centerX,
            centerY,
            showArea: (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.showArea, (_c !== null && _c !== void 0 ? _c : false)),
            ratio: axisSize / (max - min),
        };
        const radarData = (_d = series.radar) === null || _d === void 0 ? void 0 : _d.data;
        const radarPointsData = this.makeRadarPointsData(radarData, renderOptions);
        const circleModel = this.renderDotModels(radarPointsData);
        this.models.area = ((_f = (_e = options) === null || _e === void 0 ? void 0 : _e.series) === null || _f === void 0 ? void 0 : _f.showArea) ? this.renderAreaModels(radarPointsData) : [];
        this.models.line = this.renderLineModels(radarPointsData);
        this.models.dot = ((_h = (_g = options) === null || _g === void 0 ? void 0 : _g.series) === null || _h === void 0 ? void 0 : _h.showDot) ? circleModel : [];
        if (!this.drawModels) {
            this.drawModels = {
                area: this.initDrawModels('area', centerX, centerY),
                line: this.initDrawModels('line', centerX, centerY),
                dot: this.models.dot.map((m) => (Object.assign(Object.assign({}, m), { x: centerX, y: centerY }))),
            };
        }
        const tooltipDataArr = this.makeTooltipModel(circleModel, categories);
        this.responders = circleModel.map((m, index) => (Object.assign(Object.assign({}, m), { data: tooltipDataArr[index], color: getRGBA(m.color, 1) })));
    }
    initDrawModels(modelName, centerX, centerY) {
        return this.models[modelName].map((m) => {
            var _a;
            return (Object.assign(Object.assign({}, m), { distances: (_a = m.distances) === null || _a === void 0 ? void 0 : _a.map(() => 0), points: m.points.map(() => ({ x: centerX, y: centerY })) }));
        });
    }
    makeTooltipModel(circleModel, categories) {
        return circleModel.map(({ name, color, value, index }) => ({
            label: name,
            color,
            value,
            category: categories[index],
        }));
    }
    getRespondersWithTheme(responders, type) {
        const { radius, borderWidth, borderColor, color } = this.theme[type].dot;
        return responders.map((responder) => {
            const modelColor = (color !== null && color !== void 0 ? color : responder.color);
            return Object.assign(Object.assign({}, responder), { radius, color: modelColor, borderColor: (borderColor !== null && borderColor !== void 0 ? borderColor : getRGBA(modelColor, 0.5)), borderWidth });
        });
    }
    onClick({ responders }) {
        if (this.selectable) {
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme(responders, 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
    onMousemove({ responders }) {
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getRespondersWithTheme(responders, 'hover'),
            name: this.name,
        });
        this.activatedResponders = responders;
        this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
        this.eventBus.emit('needDraw');
    }
    makeRadarPointsData(seriesData, renderOptions) {
        const { centerX, centerY, degree, ratio, showArea } = renderOptions;
        return seriesData.map(({ data, color: seriesColor, name }) => {
            const radarPoints = data.reduce((acc, value, index) => {
                if (isNull(value)) {
                    return {
                        distances: [...acc.distances, 0],
                        linePoints: [...acc.linePoints, null],
                        areaPoints: [...acc.areaPoints, { x: centerX, y: centerY }],
                    };
                }
                const distance = value * ratio;
                const point = getRadialPosition(centerX, centerY, distance, calculateDegreeToRadian(degree * index));
                return {
                    distances: [...acc.distances, distance],
                    linePoints: [...acc.linePoints, point],
                    areaPoints: [...acc.areaPoints, point],
                };
            }, { linePoints: [], distances: [], areaPoints: [] });
            if (!isNull(data[0]) && !isNull(data[data.length - 1])) {
                radarPoints.linePoints.push(radarPoints.linePoints[0]);
                radarPoints.areaPoints.push(radarPoints.areaPoints[0]);
            }
            return Object.assign(Object.assign({ name,
                seriesColor,
                data }, radarPoints), this.getSeriesColor(showArea, seriesColor, name));
        });
    }
    renderAreaModels(radarPointsData) {
        return radarPointsData.map(({ distances, areaPoints, name, fillColor, seriesColor }) => ({
            type: 'areaPoints',
            name,
            distances,
            points: areaPoints,
            fillColor,
            color: getRGBA(seriesColor, 0),
            lineWidth: 0,
        }));
    }
    renderLineModels(radarPointsData) {
        const { lineWidth, dashSegments } = this.theme;
        return radarPointsData.map(({ distances, linePoints, name, lineColor }) => ({
            type: 'linePoints',
            lineWidth: (lineWidth !== null && lineWidth !== void 0 ? lineWidth : radarDefault.LINE_WIDTH),
            name,
            distances,
            points: linePoints,
            color: lineColor,
            dashSegments,
        }));
    }
    renderDotModels(radarPointsData) {
        const { radius, color: dotColor } = this.theme.dot;
        const result = [];
        radarPointsData.forEach(({ linePoints, lineColor, name, data }, seriesIndex) => linePoints.slice(0, linePoints.length - 1).forEach((point, index) => {
            var _a;
            if (!isNull(point)) {
                result.push(Object.assign(Object.assign({ type: 'circle' }, point), { radius, color: (dotColor !== null && dotColor !== void 0 ? dotColor : lineColor), style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }], name,
                    seriesIndex,
                    index, value: (_a = data) === null || _a === void 0 ? void 0 : _a[index] }));
            }
        }));
        return result;
    }
    getSeriesColor(showArea, seriesColor, name) {
        const active = this.activeSeriesMap[name];
        const { select, areaOpacity } = this.theme;
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        const color = getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
        let fillOpacity = NONE_AREA_OPACITY;
        if (showArea) {
            const selectedAreaOpacity = active ? select.areaOpacity : select.restSeries.areaOpacity;
            fillOpacity = selected ? selectedAreaOpacity : areaOpacity;
        }
        return { lineColor: color, fillColor: getRGBA(color, fillOpacity) };
    }
}
