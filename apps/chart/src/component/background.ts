import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { ChartTheme } from '@t/theme';
import { BackgroundModel } from '@t/components/series';

export default class Background extends Component {
  models!: BackgroundModel;

  theme!: Required<ChartTheme>;

  initialize() {
    this.type = 'background';
    this.name = 'background';
  }

  render({ layout, theme }: ChartState<Options>) {
    const { width, height } = layout.chart;
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
