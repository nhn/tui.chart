var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import Component from "./component";
import { crispPixel } from "../helpers/calculator";
import { isUndefined, includes } from "../helpers/utils";
import { isSameSeriesResponder } from "../helpers/responders";
import { makeObservableObjectToNormal } from "../store/reactive";
const guideLineType = {
    line: 'circle',
    area: 'circle',
    boxPlot: 'boxPlot',
};
export default class HoveredSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { guideLine: [] };
        this.isShow = false;
        this.renderHoveredSeries = ({ models, name, eventDetectType, }) => {
            var _a, _b;
            const prevModels = this.getSeriesModels(name);
            this.models[name] = [...models];
            this.isShow = !!this.getSeriesModels().length;
            const isSame = !!((_a = prevModels) === null || _a === void 0 ? void 0 : _a.length) &&
                !!models.length &&
                isSameSeriesResponder({ models, comparisonModel: prevModels, eventDetectType, name });
            if (((_b = prevModels) === null || _b === void 0 ? void 0 : _b.length) && !models.length) {
                this.eventBus.emit('unhoverSeries', makeObservableObjectToNormal(prevModels));
            }
            else if (models.length && !isSame) {
                this.eventBus.emit('hoverSeries', makeObservableObjectToNormal(models));
            }
            this.modelForGuideLine = this.getModelForGuideLine(name);
            if (eventDetectType === 'grouped') {
                this.renderGroupedModels(name);
            }
        };
        this.resetHoveredSeries = () => {
            this.models = { guideLine: [] };
        };
    }
    getSeriesModels(type) {
        var _a;
        const _b = this.models, { guideLine } = _b, models = __rest(_b, ["guideLine"]);
        return (_a = (type ? models[type] : Object.values(models))) === null || _a === void 0 ? void 0 : _a.flatMap((val) => val);
    }
    hasGuideLine() {
        const [rectModel] = this.getSeriesModels().filter(({ type }) => type === 'rect');
        return !isUndefined(this.modelForGuideLine) && isUndefined(rectModel);
    }
    getModelForGuideLine(name) {
        return this.getSeriesModels().filter(({ type }) => type === guideLineType[name])[0];
    }
    renderGroupedModels(name) {
        if (includes(Object.keys(guideLineType), name)) {
            if (this.isShow && this.hasGuideLine()) {
                this.models.guideLine = [this.renderGuideLineModel(this.modelForGuideLine)];
            }
            else {
                this.models.guideLine = [];
            }
        }
    }
    renderGuideLineModel(model) {
        const x = crispPixel(model.type === 'boxPlot' && model.boxPlotDetection
            ? model.boxPlotDetection.x + model.boxPlotDetection.width / 2
            : model.x);
        return {
            type: 'line',
            x,
            y: 0,
            x2: x,
            y2: this.rect.height,
            strokeStyle: '#ddd',
            lineWidth: 1,
        };
    }
    initialize() {
        this.type = 'hoveredSeries';
        this.name = 'hoveredSeries';
        this.eventBus.on('renderHoveredSeries', this.renderHoveredSeries);
        this.eventBus.on('resetHoveredSeries', this.resetHoveredSeries);
    }
    render({ layout }) {
        this.rect = layout.plot;
    }
}
