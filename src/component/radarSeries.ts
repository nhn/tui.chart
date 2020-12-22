import Component from './component';
import {
  RadarSeriesModels,
  PolygonModel,
  CircleModel,
  CircleResponderModel,
} from '@t/components/series';
import { ChartState } from '@t/store/store';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { RadarSeriesType, Point, RadarChartOptions } from '@t/options';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getLimitOnAxis } from '@src/helpers/axes';
import { radarDefault } from '@src/helpers/theme';
import { RadarChartSeriesTheme, DotTheme } from '@t/theme';
import { RespondersThemeType } from '@src/helpers/responders';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { isNumber } from '@src/helpers/utils';
import { message } from '@src/message';
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

export default class RadarSeries extends Component {
  models: RadarSeriesModels = { polygon: [], dot: [] };

  drawModels!: RadarSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  theme!: Required<RadarChartSeriesTheme>;

  initialize() {
    this.type = 'series';
    this.name = 'radar';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, axes, series, legend, options, theme } = state;

    if (!series.radar) {
      throw new Error(message.noDataError(this.name));
    }

    this.theme = theme.series.radar as Required<RadarChartSeriesTheme>;

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const categories = state.categories as string[];
    const { labels, axisSize, centerX, centerY } = axes.radialAxis!;
    const { min, max } = getLimitOnAxis(labels);
    const renderOptions = {
      categories,
      degree: 360 / categories.length,
      centerX,
      centerY,
      showArea: options?.series?.showArea ?? false,
      ratio: axisSize / (max - min),
    };

    const radarData = series.radar?.data;
    const seriesModels = this.renderPolygonModels(radarData, renderOptions);

    this.models.polygon = seriesModels;
    this.models.dot = options?.series?.showDot ? this.renderDotModels(seriesModels) : [];

    if (!this.drawModels) {
      this.drawModels = {
        polygon: seriesModels.map((m) => ({
          ...m,
          distances: m.distances!.map(() => 0),
          points: m.points.map(() => ({ x: centerX, y: centerY })),
        })),
        dot: this.models.dot.map((m) => ({
          ...m,
          x: centerX,
          y: centerY,
        })),
      };
    }

    const seriesCircleModel = this.renderCircleModel(seriesModels);

    const tooltipDataArr = this.makeTooltipModel(radarData, categories);

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
      color: getRGBA(m.color, 1),
    }));
  }

  renderCircleModel(seriesModels: PolygonModel[]): CircleModel[] {
    return seriesModels.flatMap(({ points, color, name }, seriesIndex) =>
      points.map((point, index) => ({
        type: 'circle',
        ...point,
        color,
        radius: this.theme.dot.radius!,
        seriesIndex,
        name,
        index,
      }))
    );
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  };

  makeTooltipModel(seriesData: RadarSeriesType[], categories: string[]): TooltipData[] {
    return seriesData.flatMap(({ data, name, color }) =>
      data.map(
        (value, dataIndex) =>
          ({
            label: name,
            color,
            value,
            category: categories[dataIndex],
          } as TooltipData)
      )
    );
  }

  getRespondersWithTheme(responders: CircleResponderModel[], type: RespondersThemeType) {
    const { radius, borderWidth, borderColor, color } = this.theme[type].dot!;

    return responders.map((responder) => ({
      ...responder,
      radius,
      color: color ?? responder.color,
      style: [{ lineWidth: borderWidth, strokeStyle: borderColor }],
    }));
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

  renderPolygonModels(seriesData: RadarSeriesType[], renderOptions: RenderOptions): PolygonModel[] {
    const { centerX, centerY, degree, ratio, showArea } = renderOptions;
    const { lineWidth, dashSegments } = this.theme;

    return seriesData.map(({ data, color: seriesColor, name }) => {
      const polygon = data.reduce<{ points: Point[]; distances: number[] }>(
        (acc, value, index) => {
          const distance = value * ratio;
          const point = getRadialPosition(
            centerX,
            centerY,
            distance,
            calculateDegreeToRadian(degree * index)
          );

          return {
            distances: [...acc.distances, distance],
            points: [...acc.points, point],
          };
        },
        { points: [], distances: [] }
      );

      return {
        type: 'polygon',
        lineWidth: lineWidth ?? radarDefault.LINE_WIDTH,
        name,
        ...polygon,
        ...this.getSeriesColor(showArea, seriesColor!, name),
        dashSegments,
      };
    });
  }

  renderDotModels(seriesModels: PolygonModel[]): CircleModel[] {
    const { radius, color: dotColor } = this.theme.dot as Required<DotTheme>;

    return seriesModels.flatMap(({ points, color, name }) =>
      points.map((point) => ({
        type: 'circle',
        ...point,
        radius,
        color: dotColor ?? color,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name,
      }))
    );
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

    return { color, fillColor: getRGBA(color, fillOpacity) };
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
