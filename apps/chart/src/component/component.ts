import { ChartState, Options } from '@t/store/store';
import { LineTypeSeriesOptions, Rect } from '@t/options';
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
  ResponderModel,
  TreemapSeriesModels,
  HeatmapRectModels,
  NestedPieSeriesModels,
  ScatterSeriesModels,
  BulletSeriesModels,
  BackgroundModel,
  GaugeSeriesModels,
  NoDataTextModel,
  RadialBarSeriesModels,
} from '@t/components/series';
import { AxisModels, LineModel, LabelModel } from '@t/components/axis';
import { ExportMenuModels } from '@t/components/exportMenu';
import { LegendModel } from '@t/components/legend';
import { CircleLegendModels } from '@t/components/circleLegend';
import { PlotModels } from '@t/components/plot';
import { DataLabelModels, SeriesDataLabels } from '@t/components/dataLabels';
import { ZoomModels } from '@t/components/zoom';
import { RadialPlotModels } from '@t/components/radialPlot';
import { isSameArray } from '@src/helpers/arrayUtil';
import { HoveredSeriesModel } from '@src/component/hoveredSeries';
import { BackButtonModels, ResetButtonModels } from '@t/components/resetButton';
import { SpectrumLegendModels } from '@t/components/spectrumLegend';
import { ResponderSeriesModel } from '@src/component/selectedSeries';
import { RadialAxisModels } from '@t/components/radialAxis';

export type ComponentType =
  | 'component'
  | 'series'
  | 'hoveredSeries'
  | 'selectedSeries'
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
  | 'zoom'
  | 'backButton'
  | 'background'
  | 'noDataText';

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
  | RadialPlotModels
  | LineModel[]
  | LabelModel[]
  | DataLabelModels
  | LegendModel[]
  | HoveredSeriesModel
  | TreemapSeriesModels
  | ResetButtonModels
  | SpectrumLegendModels
  | BackButtonModels
  | HeatmapRectModels
  | NestedPieSeriesModels
  | ResponderSeriesModel
  | ScatterSeriesModels
  | BulletSeriesModels
  | BackgroundModel
  | RadialAxisModels
  | RadialBarSeriesModels
  | GaugeSeriesModels
  | NoDataTextModel;

export type RespondersModel = {
  component: Component;
  detected: ResponderModel[];
}[];

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
            const matchedModel = this.getCurrentModelToMatchTargetModel(
              current[key],
              current[key],
              target[key]
            );
            const newPoints = matchedModel.map((curPoint, idx) => {
              const next = target[key][idx];
              if (curPoint && next) {
                const { x, y } = curPoint;
                const { x: nextX, y: nextY } = next;

                return { ...next, x: x + (nextX - x) * delta, y: y + (nextY - y) * delta };
              }

              return next;
            });

            if ((this.store.state.options.series as LineTypeSeriesOptions)?.spline) {
              setSplineControlPoint(newPoints);
            }
            current[key] = newPoints;
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
    } else if (!Object.keys(this.models).length) {
      this.drawModels = this.models;
    } else {
      Object.keys(this.models).forEach((type) => {
        const currentModels = this.drawModels[type];
        const targetModels = this.models[type];

        this.syncModels(currentModels, targetModels, type);
      });
    }
  }

  getCurrentModelToMatchTargetModel(models, currentModels, targetModels) {
    if (!models || !currentModels) {
      return [...targetModels];
    }

    if (getFirstValidValue(targetModels)?.name) {
      const modelNames = [...new Set(models.map(({ name }) => name))];
      const targetNames = [...new Set(targetModels.map(({ name }) => name))];
      const same = isSameArray(modelNames, targetNames);

      if (!same) {
        return this.getCurrentModelWithDifferentModel(
          models,
          currentModels,
          targetModels,
          modelNames,
          targetNames
        );
      }
    }
    const currentLength = currentModels.length;
    const targetLength = targetModels.length;

    if (currentLength < targetLength) {
      return [...currentModels, ...targetModels.slice(currentLength, targetLength)];
    }

    if (currentLength > targetLength) {
      return currentModels.slice(0, targetLength);
    }

    return models;
  }

  private getCurrentModelWithDifferentModel(
    models,
    currentModels,
    targetModels,
    modelNames,
    targetNames
  ) {
    const currentLength = currentModels.length;
    const targetLength = targetModels.length;

    if (currentLength > targetLength) {
      const newModels = models.filter(({ name }) => includes(targetNames, name));

      return newModels.length !== targetModels.length ? targetModels : newModels;
    }

    if (currentLength < targetLength) {
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

      if (models.length + notIncludedModels.models.length === targetLength) {
        const newModels = [...models];

        notIncludedModels.models.forEach((model, idx) => {
          newModels.splice(notIncludedModels.modelIdx[idx], 0, model);
        });

        return newModels;
      }

      return targetModels;
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

  renderDataLabels(data: SeriesDataLabels, name?: string) {
    setTimeout(() => {
      this.eventBus.emit('renderDataLabels', { data, name: name ?? this.name });
    }, 0);
  }

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
