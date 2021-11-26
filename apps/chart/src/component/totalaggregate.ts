import Component from './component';
import { ChartState, Layout, Options } from '@t/store/store';
import { getTextWidth } from '@src/helpers/calculator';
import { FontTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { LabelModel } from '@t/components/axis';

export default class TotalAggregate extends Component {
  models!: LabelModel[];

  theme!: Required<FontTheme>;

  initialize() {
    this.type = 'component';
    this.name = 'totalaggregate';
  }

  renderTitle(aggregate: number, layout:Layout): LabelModel[] {
    let text = aggregate.toString();
    const { width, height } = layout.plot;
    let x = width/2+10;
    let y = height/2+38;
    const font = getTitleFontString(this.theme);
    const textWidth = getTextWidth(text, font);
    x -= (textWidth) / 2;
    
    return [
      {
        type: 'label',
        x,
        y,
        text,
        style: ['title', { font, fillStyle: this.theme.color }],
      },
    ];
  }

  render({ layout, theme, chart }: ChartState<Options>) {
    this.isShow = !!chart?.totalAggregate;

    if (!this.isShow) {
      return;
    }

    this.theme = theme.title as Required<FontTheme>;
    this.models = this.renderTitle(chart!.totalAggregate!, layout);
  }
}
