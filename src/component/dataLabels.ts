import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { DataLabels as DataLabelOptions } from '@t/options';
import { DataLabel, DataLabelModel, DataLabelType } from '@t/components/dataLabels';

function getOptionStyle(type: DataLabelType, options: DataLabelOptions) {
  let font: string | undefined;
  let fillStyle: string | undefined;
  let strokeStyle: string | undefined;

  if (type === 'pieSeriesName') {
    font = options.pieSeriesName?.style?.font;
    fillStyle = options.pieSeriesName?.style?.color;
    strokeStyle = options.pieSeriesName?.style?.textStrokeColor;
  } else if (type === 'stackTotal') {
    font = options.stackTotal?.style?.font;
    fillStyle = options.stackTotal?.style?.color;
    strokeStyle = options.stackTotal?.style?.textStrokeColor;
  } else {
    font = options.style?.font;
    fillStyle = options.style?.color;
    strokeStyle = options.style?.textStrokeColor;
  }

  return {
    font,
    fillStyle,
    strokeStyle,
  };
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
      const { type, x, y, text, textAlign, textBaseline, fillColor } = dataLabel;
      const { font, fillStyle, strokeStyle } = getOptionStyle(type, options);

      return {
        type: 'dataLabel',
        dataLabelType: type,
        text,
        x,
        y: y + 1,
        textAlign,
        textBaseline,
        font,
        fillStyle: fillStyle ?? fillColor,
        strokeStyle: strokeStyle,
      };
    });
  }
}
