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
import { DEFAULT_LINE_SERIES_WIDTH } from './lineSeries';
import { getLimitOnAxis } from '@src/helpers/axes';

type RenderOptions = {
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  showArea: boolean;
  ratio: number;
};

const areaOpacity = {
  SHOW: 0.3,
  NONE: 0,
  INACTIVE: 0.05,
};

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

const DEFAULT_RADAR_SERIES_DOT_RADIUS = 3;
const DEFAULT_RADAR_SERIES_HOVER_DOT_RADIUS = DEFAULT_RADAR_SERIES_DOT_RADIUS + 1;

export default class RadarSeries extends Component {
  models: RadarSeriesModels = { polygon: [], dot: [] };

  drawModels!: RadarSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'radar';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, axes, series, legend, options } = state;

    if (!series.radar) {
      throw new Error("There's no radar data");
    }

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
        radius: DEFAULT_RADAR_SERIES_HOVER_DOT_RADIUS,
        color,
        style: ['default', 'hover'],
        seriesIndex,
        name,
        index,
      }))
    );
  }

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

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', { models: responders, name: this.name });
      this.eventBus.emit('needDraw');
    }
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.eventBus.emit('renderHoveredSeries', { models: responders, name: this.name });

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  renderPolygonModels(seriesData: RadarSeriesType[], renderOptions: RenderOptions): PolygonModel[] {
    const { centerX, centerY, degree, ratio, showArea } = renderOptions;

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
        lineWidth: DEFAULT_LINE_SERIES_WIDTH,
        name,
        ...polygon,
        ...this.getSeriesColor(showArea, seriesColor!, name),
      };
    });
  }

  renderDotModels(seriesModels: PolygonModel[]): CircleModel[] {
    return seriesModels.flatMap(({ points, color, name }) =>
      points.map((point) => ({
        type: 'circle',
        ...point,
        radius: DEFAULT_RADAR_SERIES_DOT_RADIUS,
        color,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name,
      }))
    );
  }

  getSeriesColor(showArea: boolean, seriesColor: string, name: string) {
    const fillOpacity = showArea ? areaOpacity.SHOW : areaOpacity.NONE;
    const active = this.activeSeriesMap![name];
    const color = getRGBA(seriesColor!, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);

    return { color, fillColor: getRGBA(color, active ? fillOpacity : areaOpacity.INACTIVE) };
  }
}
