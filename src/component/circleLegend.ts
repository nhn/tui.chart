import Component from './component';
import { ChartState, Options, CircleLegend as CircleLegendType } from '@t/store/store';
import { CircleLegendModel } from '@t/components/circleLegend';
import { BubbleSeriesType } from '@t/options';
import { getMaxRadius } from '@src/component/bubbleSeries';
import { showCircleLegend } from '@src/store/legend';

export default class CircleLegend extends Component {
  models: { circleLegend: CircleLegendModel[] } = { circleLegend: [] };

  initialize() {
    this.type = 'circleLegend';
  }

  render({ layout, series, options, circleLegend }: ChartState<Options>) {
    if (!series.bubble) {
      throw new Error('circleLegend is only possible when bubble series is present');
    }

    if (!showCircleLegend(options, !!series.bubble)) {
      return;
    }

    const bubbleData = series.bubble.data;
    this.rect = layout.circleLegend!;
    this.renderCircleLegend(bubbleData, circleLegend);
  }

  renderCircleLegend(bubbleData: BubbleSeriesType[], circleLegend: CircleLegendType) {
    const value = getMaxRadius(bubbleData);
    const { radius } = circleLegend;

    this.models.circleLegend = [
      {
        type: 'circleLegend',
        radius,
        value,
        x: radius,
        y: this.rect.height - radius,
      },
    ];
  }
}
