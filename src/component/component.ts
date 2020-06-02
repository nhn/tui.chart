import { ChartState, Options } from '@t/store/store';
import { Rect } from '@t/options';
import Store from '../store/store';
import Painter from '@src/painter';
import EventEmitter from '../eventEmitter';
import { isNumber } from '@src/helpers/utils';
import { setSplineControlPoint } from '@src/helpers/calculator';

type ComponentType =
  | 'component'
  | 'series'
  | 'legend'
  | 'axis'
  | 'tooltip'
  | 'plot'
  | 'circleLegend';

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

  models!: any; // @TODO: 정의

  drawModels!: any; // @TODO: 정의

  responders!: any[]; // @TODO: 정의

  constructor({ store, eventBus }: { store: Store<Options>; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  abstract initialize(args: any): void;

  abstract render(state: ChartState<Options>, computed: Record<string, any>): void;

  update(delta: number) {
    if (!this.drawModels) {
      return;
    }

    if (Array.isArray(this.models)) {
      this.updateModels(this.drawModels, this.models, delta);
    } else {
      Object.keys(this.models).forEach((type) => {
        const currentModels = this.drawModels[type];
        const targetModels = this.models[type];

        this.updateModels(currentModels, targetModels, delta);
      });
    }
  }

  initUpdate(delta: number) {
    this.update(delta);
  }

  updateModels(currentModels, targetModels, delta) {
    currentModels.forEach((current: Record<string, any>, index: number) => {
      const target = targetModels[index];

      Object.keys(current).forEach((key) => {
        if (!current || !target) {
          return;
        }

        if (key[0] !== '_') {
          if (isNumber(current[key])) {
            current[key] = current[key] + (target[key] - current[key]) * delta;
          } else if (key === 'opacity') {
            // 투명도도 서서히 증가 시키면 좋을듯
          } else if (key === 'points') {
            this.changeCurrentModelToMatchTargetModel(current[key], current[key], target[key]);

            current[key].forEach((curPoint, idx) => {
              const { x, y } = curPoint;
              const { x: nextX, y: nextY } = target[key][idx];

              curPoint.x = x + (nextX - x) * delta;
              curPoint.y = y + (nextY - y) * delta;
            });

            if (current[key][0].controlPoint) {
              setSplineControlPoint(current[key]);
            }
          } else {
            current[key] = target[key];
          }
        }
      });
    });
  }

  sync() {
    if (!this.drawModels) {
      return;
    }

    if (Array.isArray(this.models)) {
      this.syncModels(this.drawModels, this.models);
    } else {
      Object.keys(this.models).forEach((type) => {
        const currentModels = this.drawModels[type];
        const targetModels = this.models[type];

        this.syncModels(currentModels, targetModels, type);
      });
    }
  }

  changeCurrentModelToMatchTargetModel(models, currentModels, targetModels) {
    if (currentModels.length < targetModels.length) {
      models.splice(
        currentModels.length,
        0,
        ...targetModels.slice(currentModels.length, targetModels.length)
      );
    } else if (currentModels.length > targetModels.length) {
      models.splice(targetModels.length, currentModels.length);
    }
  }

  syncModels(currentModels, targetModels, type?: string) {
    const drawModels = type ? this.drawModels[type] : this.drawModels;

    this.changeCurrentModelToMatchTargetModel(drawModels, currentModels, targetModels);
  }

  beforeDraw?(painter: Painter): void;

  onClick?(responseData: any): void;

  onMousemove?(responseData: any): void;

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
