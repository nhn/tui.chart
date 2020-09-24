import Component from './component';
import { ChartState, Options } from '@t/store/store';
import {
  CircleResponderModel,
  HeatmapRectResponderModel,
  RectResponderModel,
  ResponderModel,
} from '@t/components/series';
import {
  isClickSameCircleResponder,
  isClickSameHeatmapRectResponder,
  isClickSameRectResponder,
} from '@src/helpers/responders';

interface SelectedSeriesEventModel {
  models: ResponderModel[];
  name: string;
}

export default class SelectedSeries extends Component {
  models: ResponderModel[] = [];

  isShow = false;

  isClickSameSeries({ models, name }: SelectedSeriesEventModel) {
    switch (name) {
      case 'heatmap':
        return isClickSameHeatmapRectResponder(
          models as HeatmapRectResponderModel[],
          this.models as HeatmapRectResponderModel[]
        );
      case 'bubble':
      case 'scatter':
      case 'area':
      case 'line':
        return isClickSameCircleResponder(
          models as CircleResponderModel[],
          this.models as CircleResponderModel[]
        );
      case 'column':
      case 'bar':
        return isClickSameRectResponder(
          models as RectResponderModel[],
          this.models as RectResponderModel[]
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
