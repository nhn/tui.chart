import Component from './component';
import { RectModel } from '@t/components/common';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';

type TooltipModel = RectModel[];

export default class Tooltip extends Component {
  models!: TooltipModel;

  initialize() {
    this.type = 'tooltip';
    this.name = 'tooltip';

    this.eventBus.on('renderTooltip', this.renderTooltip);
  }

  render(chartState) {
    const { layout } = chartState;

    this.rect = layout.map;
  }

  renderTooltip({ responders }: { responders: GeoFeatureResponderModel[] }) {
    if (responders?.[0]) {
      console.log(responders[0].centroid);
    }
  }

  resetTooltip() {
    console.log('reset tooltip');
  }
}
