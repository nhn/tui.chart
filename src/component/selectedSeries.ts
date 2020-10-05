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
} from '@t/components/series';
import {
  isClickSameCircleResponder,
  isClickSameDataResponder,
  isClickSameNameResponder,
} from '@src/helpers/responders';

interface SelectedSeriesEventModel {
  models: ResponderModel[];
  name: string;
}

export default class SelectedSeries extends Component {
  models: ResponderModel[] = [];

  isShow = false;

  // eslint-disable-next-line complexity
  isClickSameSeries({ models, name }: SelectedSeriesEventModel) {
    switch (name) {
      case 'heatmap':
        return isClickSameNameResponder<HeatmapRectResponderModel>(
          models as HeatmapRectResponderModel[],
          this.models as HeatmapRectResponderModel[]
        );
      case 'bullet':
        return isClickSameNameResponder<BulletResponderModel>(
          models as BulletResponderModel[],
          this.models as BulletResponderModel[]
        );
      case 'radar':
      case 'bubble':
      case 'scatter':
      case 'area':
      case 'line':
        return isClickSameCircleResponder(
          models as CircleResponderModel[],
          this.models as CircleResponderModel[]
        );
      case 'pie':
      case 'nestedPie':
        return isClickSameDataResponder<SectorResponderModel>(
          models as SectorResponderModel[],
          this.models as SectorResponderModel[]
        );
      case 'column':
      case 'bar':
        return isClickSameDataResponder<RectResponderModel>(
          models as RectResponderModel[],
          this.models as RectResponderModel[]
        );
      case 'boxPlot':
        return isClickSameDataResponder<BoxPlotResponderModel>(
          models as BoxPlotResponderModel[],
          this.models as BoxPlotResponderModel[]
        );
      default:
        return false;
    }
  }

  renderSelectedSeries = (selectedSeriesEventModel: SelectedSeriesEventModel) => {
    const { models } = selectedSeriesEventModel;
    const selectedSeries = this.isClickSameSeries(selectedSeriesEventModel) ? [] : models;

    this.isShow = !!selectedSeries.length;
    this.models = selectedSeries;
  };

  initialize() {
    this.type = 'selectedSeries';
    this.name = 'selectedSeries';
    this.eventBus.on('renderSelectedSeries', this.renderSelectedSeries);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
