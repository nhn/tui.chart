import Component from './component';
import { LabelModel } from '@t/components/axis';
import { ChartState, Options } from '@t/store/store';
import { getRadarRadiusValues } from '@src/helpers/radar';
import { calculateDegreeToRadian, getRadialPosition } from '@src/helpers/sector';

export default class RadarAxis extends Component {
  name!: string;

  models: LabelModel[] = [];

  initialize() {
    this.type = 'axis';
    this.name = name;
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout.plot;

    if (!axes.radarAxis) {
      return;
    }

    const { axisSize, centerX, centerY, labels } = axes.radarAxis!;
    const radiusRange = getRadarRadiusValues(labels, axisSize, 1);

    this.models = radiusRange.map((radius, index) => ({
      type: 'label',
      text: labels[index],
      style: ['default', { textAlign: 'center' }],
      ...getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(0)),
    }));
  }
}
