import Component from './component';
import { GeoFeatureModel, GeoFeatureResponderModel } from '@t/components/geoFeature';

export default class GeoFeature extends Component {
  models!: GeoFeatureModel[];

  responders!: GeoFeatureResponderModel[];

  initialize() {
    this.type = 'geoFeature';
    this.name = 'geoFeature';
  }

  render(chartState) {
    const { series, theme, layout } = chartState;
    const { colors } = theme;

    this.rect = layout.map;
    this.models = series.map((m, idx) => ({
      type: 'geoFeature',
      feature: m,
      color: colors[idx % colors.length],
    }));
    this.responders = this.models.map((m) => ({ ...m, responderType: 'geoFeature' }));
  }

  onClick({ responders }: { responders: GeoFeatureResponderModel[] }) {
    if (responders.length) {
      console.log(responders[0].feature.properties);
    }
  }
}
