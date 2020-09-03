import Component from './component';
import { PieChartOptions } from '@t/options';
import { ChartState } from '@t/store/store';
import { PieSeriesModels, RectResponderModel } from '@t/components/series';

export default class TreemapSeries extends Component {
  models: PieSeriesModels = { series: [] };

  responders!: RectResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'treemap';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series } = chartState;

    if (!series.treemap) {
      throw new Error("There's no pie data");
    }

    this.rect = layout.plot;

    const treemapData = series.treemap.data;
  }

  onMousemove({ responders }) {
    // this.eventBus.emit('renderHoveredSeries', { models: responders, name: this.name });
    //
    // this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    // this.eventBus.emit('needDraw');
  }
}
