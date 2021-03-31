import Component from './component';
import {
  RadarSeriesModels,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
  AreaPointsModel,
} from '@t/components/series';
import { ChartState } from '@t/store/store';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { RadarSeriesType, Point, RadarChartOptions } from '@t/options';
import { getRadialPosition, calculateDegreeToRadian, DEGREE_360 } from '@src/helpers/sector';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getLimitOnAxis } from '@src/helpers/axes';
import { radarDefault } from '@src/helpers/theme';
import { RadarChartSeriesTheme, DotTheme } from '@t/theme';
import { RespondersThemeType } from '@src/helpers/responders';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { isNumber, isNull } from '@src/helpers/utils';
import { message } from '@src/message';
import { makeLabelsFromLimit } from '@src/helpers/calculator';

type RenderOptions = {
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  showArea: boolean;
  ratio: number;
};
const NONE_AREA_OPACITY = 0;
const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

type RadarPointsData = {
  distances: number[];
  linePoints: (Point | null)[];
  areaPoints: Point[];
  seriesColor: string;
  fillColor: string;
  lineColor: string;
  name: string;
  data: number[];
};

interface RadarCircleModel extends CircleModel {
  name: string;
  value: number;
  index: number;
}

export default class RadarSeries extends Component {
  models: RadarSeriesModels = { area: [], line: [], dot: [] };

  drawModels!: RadarSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: CircleResponderModel[] = [];

  theme!: Required<RadarChartSeriesTheme>;

  initialize() {
    this.type = 'series';
    this.name = 'radar';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, radialAxes, series, legend, options, theme, scale } = state;

    if (!series.radar) {
      throw new Error(message.noDataError(this.name));
    }

    this.theme = theme.series.radar as Required<RadarChartSeriesTheme>;

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const categories = state.categories as string[];
    const { axisSize, centerX, centerY } = radialAxes.verticalAxis!;

    const { limit, stepSize } = scale.verticalAxis!;
    const labels = makeLabelsFromLimit(limit, stepSize);
    const { min, max } = getLimitOnAxis(labels);

    const renderOptions = {
      categories,
      degree: DEGREE_360 / categories.length,
      centerX,
      centerY,
      showArea: options?.series?.showArea ?? false,
      ratio: axisSize / (max - min),
    };

    const radarData = series.radar?.data;
    const radarPointsData = this.makeRadarPointsData(radarData, renderOptions);
    const circleModel = this.renderDotModels(radarPointsData);
    this.models.area = options?.series?.showArea ? this.renderAreaModels(radarPointsData) : [];
    this.models.line = this.renderLineModels(radarPointsData);
    this.models.dot = options?.series?.showDot ? circleModel : [];

    if (!this.drawModels) {
      this.drawModels = {
        area: this.initDrawModels<AreaPointsModel>('area', centerX, centerY),
        line: this.initDrawModels<LinePointsModel>('line', centerX, centerY),
        dot: this.models.dot.map((m) => ({ ...m, x: centerX, y: centerY })),
      };
    }
    const tooltipDataArr = this.makeTooltipModel(circleModel, categories);

    this.responders = circleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
      color: getRGBA(m.color, 1),
    }));
  }

  initDrawModels<T extends AreaPointsModel | LinePointsModel>(
    modelName: 'area' | 'line',
    centerX: number,
    centerY: number
  ) {
    return (this.models[modelName] as T[]).map((m) => ({
      ...m,
      distances: m.distances?.map(() => 0),
      points: m.points.map(() => ({ x: centerX, y: centerY })),
    }));
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  };

  makeTooltipModel(circleModel: RadarCircleModel[], categories: string[]): TooltipData[] {
    return circleModel.map<TooltipData>(({ name, color, value, index }) => ({
      label: name,
      color,
      value,
      category: categories[index],
    }));
  }

  getRespondersWithTheme(responders: CircleResponderModel[], type: RespondersThemeType) {
    const { radius, borderWidth, borderColor, color } = this.theme[type].dot!;

    return responders.map((responder) => {
      const modelColor = color ?? responder.color;

      return {
        ...responder,
        radius,
        color: modelColor,
        borderColor: borderColor ?? getRGBA(modelColor, 0.5),
        borderWidth,
      };
    });
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: this.getRespondersWithTheme(responders, 'select'),
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme(responders, 'hover'),
      name: this.name,
    });

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  makeRadarPointsData(
    seriesData: RadarSeriesType[],
    renderOptions: RenderOptions
  ): RadarPointsData[] {
    const { centerX, centerY, degree, ratio, showArea } = renderOptions;

    return seriesData.map(({ data, color: seriesColor, name }) => {
      const radarPoints = data.reduce<{
        distances: number[];
        linePoints: (Point | null)[];
        areaPoints: Point[];
      }>(
        (acc, value, index) => {
          if (isNull(value)) {
            return {
              distances: [...acc.distances, 0],
              linePoints: [...acc.linePoints, null],
              areaPoints: [...acc.areaPoints, { x: centerX, y: centerY }],
            };
          }
          const distance = value * ratio;
          const point = getRadialPosition(
            centerX,
            centerY,
            distance,
            calculateDegreeToRadian(degree * index)
          );

          return {
            distances: [...acc.distances, distance],
            linePoints: [...acc.linePoints, point],
            areaPoints: [...acc.areaPoints, point],
          };
        },
        { linePoints: [], distances: [], areaPoints: [] }
      );

      if (!isNull(data[0]) && !isNull(data[data.length - 1])) {
        radarPoints.linePoints.push(radarPoints.linePoints[0]);
        radarPoints.areaPoints.push(radarPoints.areaPoints[0]);
      }

      return {
        name,
        seriesColor,
        data,
        ...radarPoints,
        ...this.getSeriesColor(showArea, seriesColor!, name),
      } as RadarPointsData;
    });
  }

  renderAreaModels(radarPointsData: RadarPointsData[]): AreaPointsModel[] {
    return radarPointsData.map(({ distances, areaPoints, name, fillColor, seriesColor }) => ({
      type: 'areaPoints',
      name,
      distances,
      points: areaPoints,
      fillColor,
      color: getRGBA(seriesColor, 0),
      lineWidth: 0,
    }));
  }

  renderLineModels(radarPointsData: RadarPointsData[]): LinePointsModel[] {
    const { lineWidth, dashSegments } = this.theme;

    return radarPointsData.map(({ distances, linePoints, name, lineColor }) => ({
      type: 'linePoints',
      lineWidth: lineWidth ?? radarDefault.LINE_WIDTH,
      name,
      distances,
      points: linePoints,
      color: lineColor,
      dashSegments,
    }));
  }

  renderDotModels(radarPointsData: RadarPointsData[]): RadarCircleModel[] {
    const { radius, color: dotColor } = this.theme.dot as Required<DotTheme>;
    const result: RadarCircleModel[] = [];

    radarPointsData.forEach(({ linePoints, lineColor, name, data }, seriesIndex) =>
      linePoints.slice(0, linePoints.length - 1).forEach((point, index) => {
        if (!isNull(point)) {
          result.push({
            type: 'circle',
            ...point,
            radius,
            color: dotColor ?? lineColor,
            style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
            name,
            seriesIndex,
            index,
            value: data?.[index],
          });
        }
      })
    );

    return result;
  }

  getSeriesColor(showArea: boolean, seriesColor: string, name: string) {
    const active = this.activeSeriesMap![name];
    const { select, areaOpacity } = this.theme;
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);
    const color = getRGBA(seriesColor!, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
    let fillOpacity = NONE_AREA_OPACITY;

    if (showArea) {
      const selectedAreaOpacity = active ? select.areaOpacity! : select.restSeries!.areaOpacity;
      fillOpacity = selected ? selectedAreaOpacity : areaOpacity;
    }

    return { lineColor: color, fillColor: getRGBA(color, fillOpacity) };
  }

  selectSeries = ({ index, seriesIndex, state }: SelectSeriesHandlerParams<RadarChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.radar!.data[seriesIndex];
    const model = this.responders.filter(({ name: dataName }) => dataName === name)[index];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getRespondersWithTheme([model], 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ index, seriesIndex, state }: SelectSeriesHandlerParams<RadarChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.radar!.data[seriesIndex];
    const models = [this.responders.filter(({ name: dataName }) => dataName === name)[index]];

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme(models, 'hover'),
      name: this.name,
    });

    this.activatedResponders = models;
    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
