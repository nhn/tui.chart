import Component from './component';
import { getRGBA } from '@toast-ui/shared';
import { GeoFeatureModel, GeoFeatureResponderModel } from '@t/components/geoFeature';

export default class Series extends Component {
  models!: GeoFeatureModel[];

  responders!: GeoFeatureResponderModel[];

  initialize() {
    this.type = 'geoFeature';
    this.name = 'series';
  }

  render(chartState) {
    const { series, layout } = chartState;

    this.rect = layout.map;
    this.models = series.map((m) => ({ type: 'series', ...m }));
    this.responders = this.models.map((m) => ({
      ...m,
      // @TODO: A darker color than the series color should be applied.
      //  Will ask the designer about the default color and opacity.
      color: getRGBA(m?.color!, 1),
      responderType: 'geoFeature',
    }));
  }

  onMousemove({ responders }: { responders: GeoFeatureResponderModel[] }) {
    this.eventBus.emit('renderHoveredSeries', { responders });
    this.eventBus.emit('renderTooltip', { responders });
  }

  onClick({ responders }: { responders: GeoFeatureResponderModel[] }) {
    if (responders.length) {
      console.log(responders[0]);
    }
  }
}
