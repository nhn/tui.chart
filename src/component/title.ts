import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TitleOption } from '@t/options';
import { isString } from '@src/helpers/utils';
import { LabelModel } from '@t/components/axis';
import { getTextWidth } from '@src/helpers/calculator';
import { TITLE_TEXT } from '@src/brushes/basic';

export default class Title extends Component {
  models!: LabelModel[];

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

    const textWidth = getTextWidth(text, TITLE_TEXT);

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
        style: ['title'],
      },
    ];
  }

  render({ options, layout }: ChartState<Options>) {
    if (!options.chart?.title) {
      return;
    }

    this.rect = layout.title;
    this.models = this.renderTitle(options.chart.title);
  }
}
