import { ChartState, Options } from '@t/store/store';
import { Rect } from '@t/options';
import Store from '../store/store';
import Painter from '@src/painter';
import EventEmitter from '../eventEmitter';
import { getFirstValidValue, includes, isNumber } from '@src/helpers/utils';
import { setSplineControlPoint } from '@src/helpers/calculator';
import {
  AreaSeriesModels,
  BoxSeriesModels,
  CircleSeriesModels,
  LineSeriesModels,
  CircleResponderModel,
  RectModel,
  PieSeriesModels,
  SectorResponderModel,
  RectResponderModel,
} from '@t/components/series';
import { AxisModels, LabelModel, LineModel } from '@t/components/axis';
import { ExportMenuModels } from '@t/components/exportMenu';
import { LegendModel } from '@t/components/legend';
import { TooltipModel } from '@t/components/tooltip';
import { CircleLegendModels } from '@t/components/circleLegend';
import { PlotModels } from '@t/components/plot';
import { DataLabelModel, DataLabelModels } from '@t/components/dataLabels';
import { ZoomModels } from '@t/components/zoom';
import { isSameArray } from '@src/helpers/arrayUtil';

export type ComponentType =
  | 'component'
  | 'series'
  | 'hoveredSeries'
  | 'legend'
  | 'axis'
  | 'tooltip'
  | 'plot'
  | 'circleLegend'
  | 'dataLabels'
  | 'title'
  | 'axisTitle'
  | 'exportMenu'
  | 'zeroAxis'
  | 'zoom';

type ComponentModels =
  | AxisModels
  | AreaSeriesModels
  | BoxSeriesModels
  | CircleSeriesModels
  | LineSeriesModels
  | ExportMenuModels
  | CircleLegendModels
  | PieSeriesModels
  | ZoomModels
  | PlotModels
  | LineModel[]
  | LabelModel[]
  | DataLabelModels
  | LegendModel[]
  | TooltipModel[];

type ComponentResponders = Array<
  CircleResponderModel | RectModel | SectorResponderModel | RectResponderModel
>;

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

  selectable!: boolean;

  store: Store<Options>;

  eventBus: EventEmitter;

  models!: ComponentModels;

  drawModels!: ComponentModels;

  responders!: ComponentResponders;

  activeSeriesMap?: { [key: string]: boolean };

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
          const curValue = current[key];

          if (isNumber(current[key])) {
            current[key] = curValue + (target[key] - curValue) * delta;
          } else if (key === 'points') {
            current[key] = this.getCurrentModelToMatchTargetModel(curValue, curValue, target[key]);
            curValue.forEach((curPoint, idx) => {
              const { x, y } = curPoint;
              const { x: nextX, y: nextY } = target[key][idx];

              curPoint.x = x + (nextX - x) * delta;
              curPoint.y = y + (nextY - y) * delta;
            });

            if (curValue.length && curValue[0].controlPoint) {
              setSplineControlPoint(curValue);
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

  getCurrentModelToMatchTargetModel(models, currentModels, targetModels) {
    if (getFirstValidValue(targetModels)?.name) {
      const modelNames = [...new Set(models.map(({ name }) => name))];
      const targetNames = [...new Set(targetModels.map(({ name }) => name))];
      const same = isSameArray(modelNames, targetNames);

      if (!same) {
        if (currentModels.length > targetModels.length) {
          return models.filter(({ name }) => includes(targetNames, name));
        }

        if (currentModels.length < targetModels.length) {
          const notIncludedModels = targetModels.reduce(
            (acc, cur, idx) => {
              const notIncluded = !includes(modelNames, cur.name);

              return notIncluded
                ? {
                    models: [...acc.models, cur],
                    modelIdx: [...acc.modelIdx, idx],
                  }
                : acc;
            },
            { models: [], modelIdx: [] }
          );

          const newModels = [...models];

          notIncludedModels.models.forEach((model, idx) => {
            const modelIdx = notIncludedModels.modelIdx[idx];

            newModels.splice(modelIdx, 0, model);
          });

          return newModels;
        }
      }
    }

    if (currentModels.length < targetModels.length) {
      return [...models, ...targetModels.slice(currentModels.length, targetModels.length)];
    }

    if (currentModels.length > targetModels.length) {
      return models.slice(0, targetModels.length);
    }

    return models;
  }

  syncModels(currentModels, targetModels, type?: string) {
    const drawModels = type ? this.drawModels[type] : this.drawModels;
    const model = this.getCurrentModelToMatchTargetModel(drawModels, currentModels, targetModels);

    if (type) {
      this.drawModels[type] = model;
    } else {
      this.drawModels = model;
    }
  }

  getSelectableOption(options: Options) {
    return options?.series?.selectable ?? false;
  }

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
