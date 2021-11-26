import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { ChartTheme } from '@t/theme';
import { ComparecircleModels } from '@t/components/series';

export default class Comparecircle extends Component {
  models!: ComparecircleModels;

  theme!: Required<ChartTheme>;

  initialize() {
    this.type = 'component';
    this.name = 'comparecircle';
  }

  render({ layout, theme }: ChartState<Options>) {
    const { width, height } = layout.plot;
    this.theme = theme.chart as Required<ChartTheme>;
    this.models = [
      {
        type: 'comparecircle',
        color: 'rgba(0, 0, 0, 0)',
        radius: 132,
        x: width/2+10,
        y: height/2+44,
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 2,
      },
    ];
  }
}
