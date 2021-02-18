import Component from "./component";
import { getRadialPosition, calculateDegreeToRadian, DEGREE_NEGATIVE_90, DEGREE_360, } from "../helpers/sector";
import { range } from "../helpers/utils";
export default class RadarPlot extends Component {
    constructor() {
        super(...arguments);
        this.models = { plot: [], line: [] };
    }
    initialize() {
        this.type = 'plot';
        this.name = 'radialPlot';
    }
    render(state) {
        var _a, _b, _c;
        const { layout, radialAxes, options, series, theme } = state;
        this.rect = layout.plot;
        this.circularAxisTheme = theme.circularAxis;
        const isRadarChart = !!series.radar;
        const categories = (_a = state.categories, (_a !== null && _a !== void 0 ? _a : []));
        const plotType = (_c = (_b = options.plot) === null || _b === void 0 ? void 0 : _b.type, (_c !== null && _c !== void 0 ? _c : (isRadarChart ? 'spiderweb' : 'circle')));
        const renderOptions = this.makeRenderOptions(radialAxes, plotType, categories);
        this.models = {
            plot: this.renderPlot(renderOptions),
            line: series.radialBar ? this.renderLine(renderOptions) : [],
        };
    }
    makeRenderOptions(radialAxes, type, categories = []) {
        const { centerX, centerY, radiusRanges, innerRadius, outerRadius } = radialAxes.verticalAxis;
        const { degree, totalAngle, labels, tickInterval, drawingStartAngle, startAngle, endAngle, clockwise, } = radialAxes.circularAxis;
        const usingArcPlot = totalAngle !== DEGREE_360;
        const lineCount = labels.length;
        return {
            type,
            categories,
            degree,
            centerX,
            centerY,
            initialRadius: innerRadius,
            radius: outerRadius,
            radiusRanges,
            lineCount,
            tickInterval,
            drawingStartAngle,
            usingArcPlot,
            startAngle,
            endAngle,
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
        const { degree, centerX, centerY, categories, radiusRanges } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return radiusRanges.map((radius) => {
            const points = categories.map((_, index) => getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index)));
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
            style: [{ strokeStyle, lineWidth }],
            radius,
            x: centerX,
            y: centerY,
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
        const { centerX, centerY, initialRadius, radius, lineCount, degree, tickInterval, drawingStartAngle, clockwise, } = renderOptions;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return range(0, lineCount).reduce((acc, cur, index) => {
            const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
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
}
