import Component from './component';

export default class GeoFeature extends Component {
  initialize() {
    this.type = 'geoFeature';
    this.name = 'geoFeature';
  }

  render(chartState) {
    const { series, theme } = chartState;
    const { colors } = theme;
    console.log(series);
    this.models = series.map((m, idx) => ({
      brushType: 'geoFeature',
      feature: m,
      color: colors[idx % colors.length],
    }));
  }
}
