import Component from './component';
import { GeoFeatureModel, GeoFeatureResponderModel } from '@t/components/geoFeature';

export default class HoveredSeries extends Component {
  models: GeoFeatureModel[] = [];

  responders!: GeoFeatureResponderModel[];

  isShow = false;

  initialize() {
    this.type = 'geoFeature';
    this.name = 'hoveredSeries';

    this.eventBus.on('renderHoveredSeries', this.renderHoveredSeries);
    this.eventBus.on('resetHoveredSeries', this.resetHoveredSeries);
  }

  render({ layout }) {
    this.rect = layout.map;
  }

  private isSameResponders(responders: GeoFeatureResponderModel[]) {
    return responders.length === this.models.length && responders[0] === this.models[0];
  }

  renderHoveredSeries = ({ responders }: { responders: GeoFeatureResponderModel[] }) => {
    this.isShow = !!responders.length;

    if (!this.isSameResponders(responders)) {
      this.models = [...responders];
      this.eventBus.emit('needDraw');
    }
  };

  resetHoveredSeries = () => {
    this.models = [];
  };
}
