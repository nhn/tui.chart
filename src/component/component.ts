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
  PieSeriesModels,
  RadarSeriesModels,
  BoxPlotSeriesModels,
  TreemapSeriesModels,
  ResponderModel,
} from '@t/components/series';
import { AxisModels, LabelModel, LineModel } from '@t/components/axis';
import { ExportMenuModels } from '@t/components/exportMenu';
import { LegendModel } from '@t/components/legend';
import { CircleLegendModels } from '@t/components/circleLegend';
import { PlotModels } from '@t/components/plot';
import { DataLabelModels } from '@t/components/dataLabels';
import { ZoomModels } from '@t/components/zoom';
import { RadarPlotModels } from '@t/components/radarPlot';
import { isSameArray } from '@src/helpers/arrayUtil';
import { HoveredSeriesModel } from '@src/component/hoveredSeries';
import { ResetButtonModels } from '@t/components/resetButton';
import { SpectrumLegendModels } from '@t/components/spectrumLegend';

export type ComponentType =
  | 'component'
  | 'series'
  | 'hoveredSeries'
  | 'legend'
  | 'axis'
  | 'tooltip'
  | 'plot'
  | 'circleLegend'
  | 'spectrumLegend'
  | 'dataLabels'
  | 'title'
  | 'axisTitle'
  | 'exportMenu'
  | 'resetButton'
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
  | RadarSeriesModels
  | BoxPlotSeriesModels
  | ZoomModels
  | PlotModels
  | RadarPlotModels
  | LineModel[]
  | LabelModel[]
  | DataLabelModels
  | LegendModel[]
  | HoveredSeriesModel
  | TreemapSeriesModels
  | ResetButtonModels
  | SpectrumLegendModels;

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

  responders!: ResponderModel[];

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
          if (isNumber(current[key])) {
            current[key] = current[key] + (target[key] - current[key]) * delta;
          } else if (key === 'points') {
            current[key] = this.getCurrentModelToMatchTargetModel(
              current[key],
              current[key],
              target[key]
            );
            current[key].forEach((curPoint, idx) => {
              const { x, y } = curPoint;
              const { x: nextX, y: nextY } = target[key][idx];

              curPoint.x = x + (nextX - x) * delta;
              curPoint.y = y + (nextY - y) * delta;
            });

            if (current[key].length && current[key][0].controlPoint) {
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
      return [...currentModels, ...targetModels.slice(currentModels.length, targetModels.length)];
    }

    if (currentModels.length > targetModels.length) {
      return currentModels.slice(0, targetModels.length);
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
