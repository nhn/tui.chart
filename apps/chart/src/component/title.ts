import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TitleOption } from '@t/options';
import { isString } from '@src/helpers/utils';
import { getTextWidth } from '@src/helpers/calculator';
import { FontTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { LabelModel } from '@t/components/axis';

export default class Title extends Component {
  models!: LabelModel[];

  theme!: Required<FontTheme>;

  initialize() {
    this.type = 'title';
    this.name = 'title';
  }

  renderTitle(options: string | TitleOption): LabelModel[] {
    let text = '';
    let x = 0;
    let y = 0;
    let align = 'left';

    if (isString(options)) {
      text = options;
    } else {
      text = options.text;
      align = options.align ?? 'left';
      x += options.offsetX ?? 0;
      y += options.offsetY ?? 0;
    }

    const font = getTitleFontString(this.theme);
    const textWidth = getTextWidth(text, font);

    if (align === 'center') {
      x += (this.rect.width - textWidth) / 2;
    } else if (align === 'right') {
      x += this.rect.width - textWidth;
    }

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

  render({ options, layout, theme }: ChartState<Options>) {
    this.isShow = !!options.chart?.title;

    if (!this.isShow) {
      return;
    }

    this.theme = theme.title as Required<FontTheme>;
    this.rect = layout.title;
    this.models = this.renderTitle(options.chart!.title!);
  }
}
