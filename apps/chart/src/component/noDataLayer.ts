import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { NoDataLayerModel } from '@t/components/series';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';
import { isNoData } from '@src/helpers/validation';

export default class NoDataLayer extends Component {
  models!: NoDataLayerModel;

  initialize() {
    this.type = 'noDataLayer';
    this.name = 'noDataLayer';
  }

  private getCenterPosition(text: string, font: string) {
    const textWidth = getTextWidth(text, font);
    const textHeight = getTextHeight(text, font);

    return {
      x: (this.rect.width - textWidth) / 2,
      y: (this.rect.height - textHeight) / 2,
    };
  }

  render({ layout, series, options, theme }: ChartState<Options>) {
    const DEFAULT_NO_DATA_TEXT = 'No data to display';
    const text = options?.lang?.noData ?? DEFAULT_NO_DATA_TEXT;
    const labelTheme = theme.noData;
    const font = getTitleFontString(labelTheme);
    const fillStyle = labelTheme.color;
    this.isShow = isNoData(series);

    this.rect = layout.plot;
    this.models = [
      {
        type: 'label',
        ...this.getCenterPosition(text, font),
        text,
        style: [{ font, fillStyle }],
      },
    ];
  }
}
