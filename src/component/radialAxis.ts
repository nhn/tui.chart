import Component from './component';
import { LabelModel } from '@t/components/axis';
import { ChartState, Options } from '@t/store/store';
import { getRadialRadiusValues } from '@src/helpers/radar';
import { calculateDegreeToRadian, getRadialPosition } from '@src/helpers/sector';

export default class RadialAxis extends Component {
  models: LabelModel[] = [];

  initialize() {
    this.type = 'axis';
    this.name = 'radialAxis';
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout.plot;

    if (!axes.radialAxis) {
      return;
    }

    const { axisSize, centerX, centerY, labels } = axes.radialAxis!;
    const radiusRange = getRadialRadiusValues(labels, axisSize, 1);

    this.models = radiusRange.map((radius, index) => ({
      type: 'label',
      text: labels[index],
      style: ['default', { textAlign: 'center' }],
      ...getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(0)),
    }));
  }
}
