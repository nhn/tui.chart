import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { DataLabelModel } from '@t/components/series';

export default class DataLabels extends Component {
  models!: DataLabelModel[];

  drawModels!: DataLabelModel[];

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  render({ series, layout, dataLabels }: ChartState<Options>) {
    this.rect = layout.plot;

    this.models = this.renderLabelModel(dataLabels);

    if (!this.drawModels) {
      this.drawModels = this.models.map((m) => {
        const drawModel = { ...m };

        if (isLabelAxisOnYAxis(series)) {
          drawModel.x = 0;
        } else {
          drawModel.y = this.rect.height;
        }

        return drawModel;
      });
    }
  }

  renderLabelModel(dataLabels): DataLabelModel[] {
    return dataLabels.map((dataLabel) => {
      const { x, y, text, style, bgColor, textStrokeColor } = dataLabel;

      return {
        type: 'dataLabel',
        text,
        x,
        y,
        bgColor,
        textStrokeColor,
        style: ['default', style],
      };
    });
  }
}
