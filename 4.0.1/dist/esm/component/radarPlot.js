import Component from "./component";
import { getRadialPosition, calculateDegreeToRadian } from "../helpers/sector";
import { getRadialRadiusValues } from "../helpers/radarSeries";
const CATEGORY_LABEL_PADDING = 35;
export default class RadarPlot extends Component {
    constructor() {
        super(...arguments);
        this.models = { plot: [], dot: [], label: [] };
    }
    initialize() {
        this.type = 'plot';
        this.name = 'radar';
    }
    render(state) {
        var _a, _b;
        const { layout, axes, options } = state;
        this.rect = layout.plot;
        const categories = (_a = state.categories, (_a !== null && _a !== void 0 ? _a : []));
        const renderOptions = this.makeRenderOptions(axes.radialAxis, (_b = options.plot) === null || _b === void 0 ? void 0 : _b.type, categories);
        this.models = {
            plot: this.renderPlot(renderOptions),
            dot: this.renderCategoryDot(renderOptions),
            label: this.renderCategoryLabel(renderOptions),
        };
    }
    makeRenderOptions(radialAxis, type = 'spiderweb', categories = []) {
        const { labels, axisSize, centerX, centerY } = radialAxis;
        return {
            type,
            categories,
            degree: 360 / categories.length,
            centerX,
            centerY,
            seriesRadius: axisSize,
            radiusRange: getRadialRadiusValues(labels, axisSize).slice(1, labels.length),
        };
    }
    renderPlot(renderOptions) {
        return renderOptions.type === 'spiderweb'
            ? this.makeSpiderwebPlot(renderOptions)
            : this.makeCirclePlot(renderOptions);
    }
    makeSpiderwebPlot(renderOptions) {
        const { degree, centerX, centerY, categories, radiusRange } = renderOptions;
        return radiusRange.map((radius) => {
            const points = categories.map((_, index) => getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index)));
            return {
                type: 'polygon',
                color: 'rgba(0, 0, 0, 0.05)',
                lineWidth: 1,
                points,
            };
        });
    }
    makeCirclePlot(renderOptions) {
        const { centerX, centerY, radiusRange } = renderOptions;
        return radiusRange.map((radius) => ({
            type: 'circle',
            color: 'rgba(0, 0, 0, 0)',
            style: ['plot'],
            radius,
            x: centerX,
            y: centerY,
        }));
    }
    renderCategoryDot(renderOptions) {
        const { degree, centerX, centerY, categories, seriesRadius } = renderOptions;
        return categories.map((_, index) => {
            const { x, y } = getRadialPosition(centerX, centerY, seriesRadius, calculateDegreeToRadian(degree * index));
            return {
                type: 'rect',
                color: 'rgba(0, 0, 0, .5)',
                width: 4,
                height: 4,
                x: x - 2,
                y: y - 2,
            };
        });
    }
    renderCategoryLabel(renderOptions) {
        const { degree, centerX, centerY, categories, seriesRadius } = renderOptions;
        const radius = seriesRadius + CATEGORY_LABEL_PADDING;
        return categories.map((text, index) => (Object.assign({ type: 'label', style: ['default', { textAlign: 'center' }], text }, getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index)))));
    }
}
