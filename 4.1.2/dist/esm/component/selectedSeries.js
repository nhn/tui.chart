import Component from "./component";
import { includes } from "../helpers/utils";
import { isSameSeriesResponder } from "../helpers/responders";
import { makeObservableObjectToNormal } from "../store/reactive";
export default class SelectedSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = {};
        this.seriesModels = {};
        this.activeSeriesNames = {};
        this.isShow = false;
        this.renderSelectedSeries = (selectedSeriesEventModel) => {
            const { name, alias } = selectedSeriesEventModel;
            const models = this.getSelectedSeriesModelsForRendering(selectedSeriesEventModel);
            this.models[alias || name] = isSameSeriesResponder(Object.assign(Object.assign({}, selectedSeriesEventModel), { models, comparisonModel: this.models[alias || name] }))
                ? []
                : models;
            this.seriesModels[alias || name] = this.getSelectedSeriesModels(selectedSeriesEventModel);
            this.isShow = !!Object.values(this.models).flatMap((value) => value).length;
            this.eventBus.emit(this.isShow ? 'selectSeries' : 'unselectSeries', makeObservableObjectToNormal(this.seriesModels));
            this.activeSeriesNames[name] = this.getSeriesNames(selectedSeriesEventModel.models, name);
            this.setActiveState();
        };
        this.resetSelectedSeries = () => {
            this.models = {};
            this.store.dispatch('setAllLegendActiveState', true);
        };
    }
    getSeriesNames(selectedSeries, name) {
        const names = [];
        if (includes(['line', 'area', 'radar', 'bubble', 'scatter', 'bullet', 'boxPlot'], name)) {
            selectedSeries.forEach((model) => {
                const label = model
                    .name;
                if (label) {
                    names.push(label);
                }
            });
        }
        else if (includes(['bar', 'column', 'radialBar'], name)) {
            selectedSeries.forEach((model) => {
                var _a;
                const label = (_a = model.data) === null || _a === void 0 ? void 0 : _a.label;
                if (label) {
                    names.push(label);
                }
            });
        }
        else if (name === 'pie') {
            Object.keys(this.models)
                .flatMap((key) => this.models[key])
                .forEach((model) => {
                var _a, _b;
                const label = ((_a = model.data) === null || _a === void 0 ? void 0 : _a.rootParentName) || ((_b = model.data) === null || _b === void 0 ? void 0 : _b.label);
                if (label) {
                    names.push(label);
                }
            });
        }
        return names;
    }
    getSelectedSeriesModelsForRendering(selectedSeriesEventModel) {
        const { models, eventDetectType, name } = selectedSeriesEventModel;
        let renderingModels = models;
        if ((name === 'column' || name === 'bar' || name === 'bullet') &&
            eventDetectType === 'grouped') {
            renderingModels = models.filter((model) => !model.data);
        }
        else if (name === 'radialBar' && eventDetectType === 'grouped') {
            renderingModels = models.filter((model) => !model.data);
        }
        return renderingModels;
    }
    getSelectedSeriesModels(selectedSeriesEventModel) {
        const { models, eventDetectType, name } = selectedSeriesEventModel;
        let selectedSeriesModels = models;
        if ((name === 'column' || name === 'bar' || name === 'bullet') &&
            eventDetectType === 'grouped') {
            selectedSeriesModels = models.filter((model) => model.data);
        }
        else if (name === 'radialBar' && eventDetectType === 'grouped') {
            selectedSeriesModels = models.filter((model) => model.data);
        }
        return selectedSeriesModels;
    }
    setActiveState() {
        if (this.isShow) {
            this.store.dispatch('setAllLegendActiveState', false);
            Object.values(this.activeSeriesNames).forEach((names) => {
                names.forEach((name) => {
                    this.store.dispatch('setLegendActiveState', { name, active: true });
                });
            });
        }
        else {
            this.store.dispatch('setAllLegendActiveState', true);
        }
        this.eventBus.emit('needDraw');
    }
    initialize() {
        this.type = 'selectedSeries';
        this.name = 'selectedSeries';
        this.eventBus.on('renderSelectedSeries', this.renderSelectedSeries);
        this.eventBus.on('resetSelectedSeries', this.resetSelectedSeries);
    }
    render({ layout }) {
        this.rect = layout.plot;
    }
}
