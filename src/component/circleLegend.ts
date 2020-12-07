import Component from './component';
import { ChartState, Options, CircleLegend as CircleLegendType } from '@t/store/store';
import { CircleLegendModels } from '@t/components/circleLegend';
import { BubbleSeriesType } from '@t/options';
import { getMaxRadius } from '@src/component/bubbleSeries';
import { message } from '@src/message';

export default class CircleLegend extends Component {
  models: CircleLegendModels = { circleLegend: [] };

  initialize() {
    this.type = 'circleLegend';
  }

  render({ layout, series, circleLegend }: ChartState<Options>) {
    if (!series.bubble) {
      throw new Error(message.CIRCLE_LEGEND_RENDER_ERROR);
    }

    this.isShow = circleLegend.visible;

    if (!this.isShow) {
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
