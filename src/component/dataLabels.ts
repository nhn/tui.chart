import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { DataLabels as DataLabelOptions, DataLabelStyle } from '@t/options';
import { DataLabel, DataLabelModel, DataLabelType } from '@t/components/dataLabels';
import { includes } from '@src/helpers/utils';
import { isModelExistingInRect } from '@src/helpers/coordinate';

function getOptionStyle(type: DataLabelType, options: DataLabelOptions): DataLabelStyle {
  return includes(['pieSeriesName', 'stackTotal'], type) && options[type]
    ? options[type].style
    : options.style;
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
    return dataLabels.reduce<DataLabelModel[]>((acc, dataLabel) => {
      const { type, x, y, text, textAlign, textBaseline, defaultColor } = dataLabel;

      return isModelExistingInRect(this.rect, { x, y: y + 1 })
        ? [
            ...acc,
            {
              type: 'dataLabel',
              dataLabelType: type,
              text,
              x,
              y: y + 1,
              textAlign,
              textBaseline,
              defaultColor,
              style: getOptionStyle(type, options),
              opacity: 1,
            },
          ]
        : acc;
    }, []);
  }
}
