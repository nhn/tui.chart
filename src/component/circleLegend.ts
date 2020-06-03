import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { CircleLegendModel } from '@t/components/circleLegend';

export default class CircleLegend extends Component {
  model!: { circleLegend: CircleLegendModel };

  initialize() {
    this.type = 'circleLegend';
  }

  render(chartState: ChartState<Options>) {
    // this.rect = layout.plot;
    console.log(chartState);
  }
}
