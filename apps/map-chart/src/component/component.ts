import { ChartState, Rect } from '@t/store';
import Store from '@src/store/store';
import Painter from '@src/painter';
import { EventEmitter } from '@toast-ui/shared';
import { ResponderModel } from '@t/responders';
import { GeoFeatureModel } from '@t/components/geoFeature';
import { RectModel } from '@t/components/common';

export type ComponentType =
  | 'component'
  | 'geoFeature'
  | 'legend'
  | 'zoomButton'
  | 'title'
  | 'tooltip';
type ComponentModels = GeoFeatureModel[] | RectModel[];

export default abstract class Component {
  name = 'Component';

  type: ComponentType = 'component';

  rect: Rect = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  };

  isShow = true;

  store: Store;

  eventBus: EventEmitter;

  models!: ComponentModels;

  drawModels!: ComponentModels;

  responders!: ResponderModel[];

  constructor({ store, eventBus }: { store: Store; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  abstract initialize(args: any): void;

  abstract render(state: ChartState, computed: Record<string, any>): void;

  beforeDraw?(painter: Painter): void;

  onClick?(responseData: any): void;

  onMousemove?(responseData: any): void;

  onMouseenterComponent?(): void;

  onMouseoutComponent?(): void;

  onMousedown?(responseData: any): void;

  onMouseup?(responseData: any): void;

  draw(painter: Painter) {
    const models = this.drawModels ? this.drawModels : this.models;
    if (Array.isArray(models)) {
      painter.paintForEach(models);
    } else if (models) {
      Object.keys(models).forEach((item) => {
        painter.paintForEach(models[item]);
      });
    }
  }
}
