import Component from './component';
import { LineModel } from '@t/components/axis';
import { ChartState, Options, ValueAxisData } from '@t/store/store';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { crispPixel } from '@src/helpers/calculator';
import { isNumber } from '@src/helpers/utils';

export default class ZeroAxis extends Component {
  models: LineModel[] = [];

  initialize() {
    this.type = 'zeroAxis';
    this.name = 'zeroAxis';
  }

  render({ layout, axes, series, options }: ChartState<Options>) {
    this.rect = layout.plot;
    const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options });
    const valueAxisName = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
    const { zeroPosition } = axes[valueAxisName]! as ValueAxisData;

    if (isNumber(zeroPosition)) {
      this.models = this.renderZeroModel(zeroPosition, labelAxisOnYAxis);
    }
  }

  renderZeroModel(zeroPosition: number, vertical: boolean): LineModel[] {
    const zeroPixel = crispPixel(0);
    const position = crispPixel(zeroPosition);

    let model: LineModel;

    if (vertical) {
      model = {
        type: 'line',
        x: position,
        y: zeroPixel,
        x2: position,
        y2: crispPixel(this.rect.height),
        strokeStyle: 'rgba(0, 0, 0, 0.5)',
      };
    } else {
      model = {
        type: 'line',
        x: zeroPixel,
        y: position,
        x2: crispPixel(this.rect.width),
        y2: position,
        strokeStyle: 'rgba(0, 0, 0, 0.5)',
      };
    }

    return [model];
  }
}
