import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { NoDataLayerModel } from '@t/components/series';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';

export default class NoDataLayer extends Component {
  models!: NoDataLayerModel;

  initialize() {
    this.type = 'background';
    this.name = 'background';
  }

  private getCenterPosition(text: string) {
    const textWidth = getTextWidth(text);
    const textHeight = getTextHeight(text);

    return {
      x: (this.rect.width - textWidth) / 2,
      y: (this.rect.height - textHeight) / 2,
    };
  }

  render({ layout, series }: ChartState<Options>) {
    const text = 'No data to display';
    // this.isShow = series;

    this.rect = layout.plot;
    this.models = [
      {
        type: 'label',
        ...this.getCenterPosition(text),
        text,
        style: ['default'],
      },
    ];
  }
}
