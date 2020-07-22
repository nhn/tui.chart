import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { DataLabels as DataLabelOptions, DataLabelStyle } from '@t/options';
import { DataLabel, DataLabelModel, DataLabelType } from '@t/components/dataLabels';
import { includes } from '@src/helpers/utils';

function getOptionStyle(type: DataLabelType, options: DataLabelOptions) {
  let style: DataLabelStyle | undefined;

  if (includes(['pieSeriesName', 'stackTotal'], type)) {
    style = options[type].style;
  } else {
    style = options.style;
  }

  return style;
}
export default class DataLabels extends Component {
  models: DataLabelModel[] = [];

  drawModels!: DataLabelModel[];

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    this.drawModels = this.models.map((m) => ({ ...m, opacity: delta }));
  }

  render({ layout, dataLabels, options }: ChartState<Options>) {
    if (!dataLabels?.visible) {
      return;
    }

    this.rect = layout.plot;
    this.models = this.renderLabelModel(dataLabels.data, options?.series?.dataLabels ?? {});

    if (!this.drawModels) {
      this.drawModels = this.models.map((m) => ({ ...m, opacity: 0 }));
    }
  }

  renderLabelModel(dataLabels: DataLabel[], options: DataLabelOptions): DataLabelModel[] {
    return dataLabels.map((dataLabel) => {
      const { type, x, y, text, textAlign, textBaseline, defaultColor } = dataLabel;

      return {
        type: 'dataLabel',
        dataLabelType: type,
        text,
        x,
        y: y + 1,
        textAlign,
        textBaseline,
        defaultColor,
        style: getOptionStyle(type, options),
      };
    });
  }
}
