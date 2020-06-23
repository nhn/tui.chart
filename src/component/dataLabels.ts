import Component from './component';
import { LabelModel } from '@t/components/axis';
import { ChartState, Options } from '@t/store/store';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';

export default class DataLabels extends Component {
  models!: LabelModel[];

  drawModels!: LabelModel[];

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  render({ series, layout, dataLabels }: ChartState<Options>) {
    this.rect = layout.plot;
    if (!dataLabels.length) {
      return;
    }

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

  renderLabelModel(dataLabels): LabelModel[] {
    return dataLabels.map((dataLabel) => {
      const { x, y, text, style } = dataLabel;

      return {
        type: 'label',
        text,
        x,
        y,
        style: ['default', style],
      } as LabelModel;
    });
  }
}
