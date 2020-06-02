import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { CircleModel } from '@t/components/series';

export default class CircleLegend extends Component {
  models: CircleModel[] = [];

  initialize() {
    this.type = 'circleLegend';
  }

  render(chartState: ChartState<Options>) {
    // this.rect = layout.plot;
    console.log(chartState);
  }
}
