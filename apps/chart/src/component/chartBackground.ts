import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { ChartTheme } from '@t/theme';
import { RectModel } from '@t/components/series';

export default class ChartBackground extends Component {
  models!: RectModel[];

  theme!: Required<ChartTheme>;

  initialize() {
    this.type = 'chartBackground';
    this.name = 'chartBackground';
  }

  render({ chart, theme }: ChartState<Options>) {
    const { width, height } = chart;
    this.theme = theme.chart as Required<ChartTheme>;
    this.rect = { x: 0, y: 0, width, height };
    this.models = [
      {
        type: 'rect',
        ...this.rect,
        color: this.theme.backgroundColor,
      },
    ];
  }
}
