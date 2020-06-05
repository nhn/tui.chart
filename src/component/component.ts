import { ChartState, Options } from '@t/store/store';
import { Rect } from '@t/options';
import Store from '../store/store';
import Painter from '@src/painter';
import EventEmitter from '../eventEmitter';

type ComponentType = 'component' | 'series' | 'legend' | 'axis' | 'tooltip' | 'plot';

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

  store: Store<Options>;

  eventBus: EventEmitter;

  animationTargetModels!: any; // @TODO: 정의

  models!: any; // @TODO: 정의

  responders!: any[]; // @TODO: 정의

  constructor({ store, eventBus }: { store: Store<Options>; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  abstract initialize(args: any): void;

  abstract render(state: ChartState<Options>, computed: Record<string, any>): void;

  update(delta: number) {
    // if (!this.models) {
    //   return;
    // }

    if (!this.animationTargetModels || !this.models) {
      return;
    }

    if (Array.isArray(this.animationTargetModels)) {
      this.updateModels(this.models, this.animationTargetModels, delta);
    } else {
      Object.keys(this.animationTargetModels).forEach((type) => {
        const currentModels = this.models[type];
        const targetModels = this.animationTargetModels[type];

        this.updateModels(currentModels, targetModels, delta);
      });
    }
  }

  updateModels(currentModels, targetModels, delta) {
    currentModels.forEach((current: Record<string, any>, index: number) => {
      const target = targetModels[index];

      Object.keys(current).forEach((key) => {
        if (key[0] !== '_' && key !== 'text') {
          if (typeof current[key] === 'number') {
            current[key] = current[key] + (target[key] - current[key]) * delta;
          } else if (key === 'opacity') {
            // 투명도도 서서히 증가 시키면 좋을듯
          } else {
            current[key] = target[key];
          }
        }
      });
    });
  }

  sync() {
    if (!this.animationTargetModels || !this.models) {
      return;
    }

    if (Array.isArray(this.animationTargetModels)) {
      this.syncModels(this.models, this.animationTargetModels);
    } else {
      Object.keys(this.animationTargetModels).forEach((type) => {
        const currentModels = this.models[type];
        const targetModels = this.animationTargetModels[type];

        this.syncModels(currentModels, targetModels, type);
      });
    }
  }

  syncModels(currentModels, targetModels, type?: string) {
    const drawModels = type ? this.models[type] : this.models;

    if (currentModels.length < targetModels.length) {
      drawModels.splice(
        currentModels.length,
        0,
        ...targetModels.slice(currentModels.length, targetModels.length)
      );
    } else if (currentModels.length > targetModels.length) {
      drawModels.splice(targetModels.length, currentModels.length);
    }
  }

  beforeDraw?(painter: Painter): void;

  onClick?(responseData: any): void;

  onMousemove?(responseData: any): void;

  draw(painter: Painter) {
    const models = this.models;

    if (Array.isArray(models)) {
      painter.paintForEach(models);
    } else if (models) {
      Object.keys(models).forEach((item) => {
        painter.paintForEach(models[item]);
      });
    }
  }
}
