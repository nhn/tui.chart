import Component from './component';
import { ChartState, Options } from '@t/store/store';
import {
  BoxPlotResponderModel,
  BulletResponderModel,
  CircleResponderModel,
  RectResponderModel,
  ResponderModel,
  SectorResponderModel,
} from '@t/components/series';
import { includes } from '@src/helpers/utils';
import { TooltipModelName } from '@t/components/tooltip';
import { isSameSeriesResponder, SelectedSeriesEventModel } from '@src/helpers/responders';
import { makeObservableObjectToNormal } from '@src/store/reactive';

export type ResponderSeriesModel = { [key in TooltipModelName]: ResponderModel[] };

type ActiveSeriesNames = { [key in TooltipModelName]: string[] };

export default class SelectedSeries extends Component {
  models: ResponderSeriesModel = {} as ResponderSeriesModel;

  seriesModels: ResponderSeriesModel = {} as ResponderSeriesModel;

  activeSeriesNames: ActiveSeriesNames = {} as ActiveSeriesNames;

  isShow = false;

  private getSeriesNames(selectedSeries: ResponderModel[], name: string) {
    const names: string[] = [];

    if (includes(['line', 'area', 'radar', 'bubble', 'scatter', 'bullet', 'boxPlot'], name)) {
      selectedSeries.forEach((model) => {
        const label = (model as CircleResponderModel | BulletResponderModel | BoxPlotResponderModel)
          .name;
        if (label) {
          names.push(label);
        }
      });
    } else if (includes(['bar', 'column', 'radialBar'], name)) {
      selectedSeries.forEach((model) => {
        const label = (model as RectResponderModel).data?.label;
        if (label) {
          names.push(label);
        }
      });
    } else if (name === 'pie') {
      Object.keys(this.models)
        .flatMap((key) => this.models[key])
        .forEach((model) => {
          const label =
            (model as SectorResponderModel).data?.rootParentName ||
            (model as SectorResponderModel).data?.label;
          if (label) {
            names.push(label);
          }
        });
    }

    return names;
  }

  getSelectedSeriesModelsForRendering(selectedSeriesEventModel: SelectedSeriesEventModel) {
    const { models, eventDetectType, name } = selectedSeriesEventModel;
    let renderingModels = models;

    if (
      (name === 'column' || name === 'bar' || name === 'bullet') &&
      eventDetectType === 'grouped'
    ) {
      renderingModels = models.filter((model) => !(model as RectResponderModel).data);
    } else if (name === 'radialBar' && eventDetectType === 'grouped') {
      renderingModels = models.filter((model) => !(model as SectorResponderModel).data);
    }

    return renderingModels;
  }

  getSelectedSeriesModels(selectedSeriesEventModel: SelectedSeriesEventModel) {
    const { models, eventDetectType, name } = selectedSeriesEventModel;
    let selectedSeriesModels = models;

    if (
      (name === 'column' || name === 'bar' || name === 'bullet') &&
      eventDetectType === 'grouped'
    ) {
      selectedSeriesModels = models.filter((model) => (model as RectResponderModel).data);
    } else if (name === 'radialBar' && eventDetectType === 'grouped') {
      selectedSeriesModels = models.filter((model) => (model as SectorResponderModel).data);
    }

    return selectedSeriesModels;
  }

  renderSelectedSeries = (selectedSeriesEventModel: SelectedSeriesEventModel) => {
    const { name, alias } = selectedSeriesEventModel;
    const models = this.getSelectedSeriesModelsForRendering(selectedSeriesEventModel);

    this.models[alias || name] = isSameSeriesResponder({
      ...selectedSeriesEventModel,
      models,
      comparisonModel: this.models[alias || name],
    })
      ? []
      : models;
    this.seriesModels[alias || name] = this.getSelectedSeriesModels(selectedSeriesEventModel);
    this.isShow = !!Object.values(this.models).flatMap((value) => value).length;
    this.eventBus.emit(
      this.isShow ? 'selectSeries' : 'unselectSeries',
      makeObservableObjectToNormal(this.seriesModels)
    );
    this.activeSeriesNames[name] = this.getSeriesNames(selectedSeriesEventModel.models, name);
    this.setActiveState();
  };

  resetSelectedSeries = () => {
    this.models = {} as ResponderSeriesModel;
    this.store.dispatch('setAllLegendActiveState', true);
  };

  private setActiveState() {
    if (this.isShow) {
      this.store.dispatch('setAllLegendActiveState', false);
      Object.values(this.activeSeriesNames).forEach((names) => {
        names.forEach((name) => {
          this.store.dispatch('setLegendActiveState', { name, active: true });
        });
      });
    } else {
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

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
