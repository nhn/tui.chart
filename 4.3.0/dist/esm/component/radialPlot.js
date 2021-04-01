import Component from "./component";
import { getRadialPosition, calculateDegreeToRadian, DEGREE_NEGATIVE_90, DEGREE_360, calculateValidAngle, DEGREE_0, } from "../helpers/sector";
import { range } from "../helpers/utils";
import { isLabelAxisOnYAxis } from "../helpers/axes";
export function getScaleMaxLimitValue(scale, totalAngle) {
    const { limit: { max }, stepSize, } = scale;
    return max + (totalAngle < DEGREE_360 ? DEGREE_0 : stepSize);
}
function findCategoryIndex(categories, value) {
    return categories.findIndex((category) => category === value);
}
export default class RadarPlot extends Component {
    constructor() {
        super(...arguments);
        this.models = { plot: [], line: [], band: [] };
    }
    initialize(initParam) {
        var _a, _b;
        this.type = 'plot';
        this.name = (_b = (_a = initParam) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : 'radialPlot'));
    }
    render(state) {
        var _a, _b, _c, _d, _e, _f;
        const { layout, radialAxes, options, series, theme, scale } = state;
        this.rect = layout.plot;
        this.circularAxisTheme = theme.circularAxis;
        const categories = (_a = state.categories, (_a !== null && _a !== void 0 ? _a : []));
        if (this.name === 'gauge') {
            const bandData = (_d = (_c = (_b = options) === null || _b === void 0 ? void 0 : _b.plot) === null || _c === void 0 ? void 0 : _c.bands, (_d !== null && _d !== void 0 ? _d : []));
            const hasCategoryAxis = !isLabelAxisOnYAxis({ series, categories });
            const renderOptions = this.makeRenderOptionsOnGauge(hasCategoryAxis, radialAxes.circularAxis, categories, scale);
            this.models.band = this.renderBands(bandData, renderOptions, categories);
        }
        else {
            const isRadarChart = !!series.radar;
            const plotType = (_f = (_e = options.plot) === null || _e === void 0 ? void 0 : _e.type, (_f !== null && _f !== void 0 ? _f : (isRadarChart ? 'spiderweb' : 'circle')));
            const renderOptions = this.makeRenderOptions(radialAxes, plotType, categories);
            this.models.plot = this.renderPlot(renderOptions);
            this.models.line = series.radialBar ? this.renderLine(renderOptions) : [];
        }
    }
    makeRenderOptionsOnGauge(hasCategoryAxis, circularAxis, categories, scale) {
        const { angle: { total, start }, radius: { outer }, clockwise, centerX, centerY, } = circularAxis;
        const { width: bandWidth, margin: bandMargin } = circularAxis.band;
        return {
            centerX,
            centerY,
            clockwise,
            totalAngle: total,
            scaleMaxLimitValue: hasCategoryAxis
                ? categories.length
                : getScaleMaxLimitValue(scale.circularAxis, total),
            startAngle: start,
            outerRadius: outer,
            bandWidth,
            bandMargin,
            hasCategoryAxis,
        };
    }
    makeRenderOptions(radialAxes, type, categories = []) {
        const { centerX, centerY, radius: { ranges, inner, outer }, } = radialAxes.verticalAxis;
        const { angle: { central, total, start, end, drawingStart }, label: { labels }, tickInterval, clockwise, } = radialAxes.circularAxis;
        const usingArcPlot = total !== DEGREE_360;
        const lineCount = labels.length;
        return {
            type,
            categories,
            centralAngle: central,
            centerX,
            centerY,
            initialRadius: inner,
            radius: outer,
            radiusRanges: ranges,
            lineCount,
            tickInterval,
            drawingStartAngle: drawingStart,
            usingArcPlot,
            startAngle: start,
            endAngle: end,
            clockwise,
        };
    }
    renderPlot(renderOptions) {
        const { type, usingArcPlot } = renderOptions;
        if (usingArcPlot) {
            return this.makeArc(renderOptions);
        }
        if (type === 'spiderweb') {
            return this.makeSpiderwebPlot(renderOptions);
        }
        return this.makeCirclePlot(renderOptions);
    }
    makeSpiderwebPlot(renderOptions) {
        const { centralAngle, centerX, centerY, categories, radiusRanges } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return radiusRanges.map((radius) => {
            const points = categories.map((_, index) => getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(centralAngle * index)));
            return {
                type: 'polygon',
                color: strokeStyle,
                lineWidth,
                points,
            };
        });
    }
    makeCirclePlot(renderOptions) {
        const { centerX, centerY, radiusRanges } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return radiusRanges.map((radius) => ({
            type: 'circle',
            color: 'rgba(0, 0, 0, 0)',
            radius,
            x: centerX,
            y: centerY,
            borderColor: strokeStyle,
            borderWidth: lineWidth,
        }));
    }
    makeArc(renderOptions) {
        const { centerX, centerY, radiusRanges, startAngle, endAngle, clockwise } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return radiusRanges.map((radius) => ({
            type: 'arc',
            borderWidth: lineWidth,
            borderColor: strokeStyle,
            x: centerX,
            y: centerY,
            angle: { start: startAngle, end: endAngle },
            drawingStartAngle: DEGREE_NEGATIVE_90,
            radius,
            clockwise,
        }));
    }
    renderLine(renderOptions) {
        const { centerX, centerY, initialRadius, radius, lineCount, centralAngle, tickInterval, drawingStartAngle, clockwise, } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return range(0, lineCount).reduce((acc, cur, index) => {
            const startDegree = drawingStartAngle + centralAngle * index * (clockwise ? 1 : -1);
            const { x, y } = getRadialPosition(centerX, centerY, initialRadius, calculateDegreeToRadian(startDegree));
            const { x: x2, y: y2 } = getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(startDegree));
            return index % tickInterval === 0
                ? [
                    ...acc,
                    {
                        type: 'line',
                        x,
                        y,
                        x2,
                        y2,
                        strokeStyle,
                        lineWidth,
                    },
                ]
                : acc;
        }, []);
    }
    renderBands(bands, renderOptions, categories) {
        const sectors = [];
        const { centerX, centerY, clockwise, totalAngle, scaleMaxLimitValue, startAngle, outerRadius, bandWidth, bandMargin, hasCategoryAxis, } = renderOptions;
        bands.forEach(({ range: rangeData, color }, index) => {
            const value = hasCategoryAxis
                ? findCategoryIndex(categories, rangeData[1].toString()) -
                    findCategoryIndex(categories, rangeData[0].toString())
                : Number(rangeData[1]) - Number(rangeData[0]);
            const degree = (value / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
            const validDegree = calculateValidAngle(degree);
            const prevModel = sectors[sectors.length - 1];
            const startDegree = index && prevModel ? prevModel.degree.end : startAngle;
            const endDegree = calculateValidAngle(startDegree + validDegree);
            sectors.push({
                type: 'sector',
                color,
                x: centerX,
                y: centerY,
                clockwise,
                degree: {
                    start: startDegree,
                    end: endDegree,
                },
                radius: {
                    inner: outerRadius + bandMargin,
                    outer: outerRadius + bandWidth,
                },
            });
        });
        return sectors;
    }
}
