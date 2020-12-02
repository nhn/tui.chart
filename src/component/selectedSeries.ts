import Component from './component';
import { ChartState, Options } from '@t/store/store';
import {
  BoxPlotResponderModel,
  BulletResponderModel,
  CircleResponderModel,
  HeatmapRectResponderModel,
  RectResponderModel,
  ResponderModel,
  SectorResponderModel,
  TreemapRectResponderModel,
} from '@t/components/series';
import {
  isClickSameCircleResponder,
  isClickSameDataResponder,
  isClickSameGroupedRectResponder,
  isClickSameLabelResponder,
  isClickSameNameResponder,
  isClickSameBoxPlotDataResponder,
} from '@src/helpers/responders';
import { includes } from '@src/helpers/utils';
import { TooltipModelName } from '@t/components/tooltip';
import { LineTypeEventDetectType } from '@t/options';

interface SelectedSeriesEventModel {
  models: ResponderModel[];
  name: string;
  eventDetectType?: LineTypeEventDetectType;
  alias?: string;
}

export type ResponderSeriesModel = { [key in TooltipModelName]: ResponderModel[] };

type ActiveSeriesNames = { [key in TooltipModelName]: string[] };

export default class SelectedSeries extends Component {
  models: ResponderSeriesModel = {} as ResponderSeriesModel;

  activeSeriesNames: ActiveSeriesNames = {} as ActiveSeriesNames;

  isShow = false;

  // eslint-disable-next-line complexity
  isClickSameSeries({ models, name, eventDetectType, alias }: SelectedSeriesEventModel) {
    switch (name) {
      case 'heatmap':
        return isClickSameNameResponder<HeatmapRectResponderModel>(
          models as HeatmapRectResponderModel[],
          this.models[name] as HeatmapRectResponderModel[]
        );
      case 'bullet':
        return isClickSameNameResponder<BulletResponderModel>(
          models as BulletResponderModel[],
          this.models[name] as BulletResponderModel[]
        );
      case 'radar':
      case 'bubble':
      case 'scatter':
      case 'area':
      case 'line':
        return isClickSameCircleResponder(
          models as CircleResponderModel[],
          this.models[name] as CircleResponderModel[]
        );
      case 'pie':
        return isClickSameDataResponder<SectorResponderModel>(
          models as SectorResponderModel[],
          this.models[alias || name] as SectorResponderModel[]
        );
      case 'column':
      case 'bar':
        return eventDetectType === 'grouped'
          ? isClickSameGroupedRectResponder(
              models as RectResponderModel[],
              this.models[name] as RectResponderModel[]
            )
          : isClickSameDataResponder<RectResponderModel>(
              models as RectResponderModel[],
              this.models[name] as RectResponderModel[]
            );
      case 'boxPlot':
        return eventDetectType === 'grouped'
          ? isClickSameDataResponder<BoxPlotResponderModel>(
              models as BoxPlotResponderModel[],
              this.models[name] as BoxPlotResponderModel[]
            )
          : isClickSameBoxPlotDataResponder(
              models as BoxPlotResponderModel[],
              this.models[name] as BoxPlotResponderModel[]
            );
      case 'treemap':
        return isClickSameLabelResponder(
          models as TreemapRectResponderModel[],
          this.models[name] as TreemapRectResponderModel[]
        );
      default:
        return false;
    }
  }

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
    } else if (includes(['bar', 'column'], name)) {
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

  getSelectedSeriesModels(selectedSeriesEventModel: SelectedSeriesEventModel) {
    const { models, eventDetectType, name } = selectedSeriesEventModel;
    let selectedSeriesModels = models;

    if ((name === 'column' || name === 'bar') && eventDetectType === 'grouped') {
      selectedSeriesModels = models.filter((model) => !(model as RectResponderModel).data);
    }

    return selectedSeriesModels;
  }

  renderSelectedSeries = (selectedSeriesEventModel: SelectedSeriesEventModel) => {
    const { name, alias } = selectedSeriesEventModel;
    const models = this.getSelectedSeriesModels(selectedSeriesEventModel);

    this.models[alias || name] = this.isClickSameSeries({ ...selectedSeriesEventModel, models })
      ? []
      : models;

    this.isShow = !!Object.values(this.models).flatMap((value) => value).length;
    this.eventBus.emit(this.isShow ? 'selectSeries' : 'unselectSeries', this.models);
    this.activeSeriesNames[name] = this.getSeriesNames(selectedSeriesEventModel.models, name);
    this.setActiveState();
  };

  resetSelectedSeries = () => {
    this.models = {} as ResponderSeriesModel;
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
