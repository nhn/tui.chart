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
import { DEFAULT_LINE_WIDTH } from './lineSeries';

type RenderOptions = {
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  showArea: boolean;
  ratio: number;
};

export default class RadarSeries extends Component {
  models: RadarSeriesModels = { polygon: [], dot: [] };

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'radarSeries';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, axes, series, legend, categories = [], options } = state;

    if (!series.radar) {
      throw new Error("There's no radar data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

    const { labels, axisSize, centerX, centerY } = axes.radialAxis!;
    const { max } = getLimitOnAxis(labels);
    const renderOptions = {
      categories,
      degree: 360 / categories.length,
      centerX,
      centerY,
      showArea: options?.series?.showArea ?? false,
      ratio: axisSize / max,
    };

    const radarData = series.radar?.data;
    const seriesModels = this.renderPolygonModels(radarData, renderOptions);

    this.models.polygon = seriesModels;

    if (options?.series?.showDot) {
      this.models.dot = this.renderDotModels(seriesModels);
    }

    const seriesCircleModel = this.renderCircleModel(seriesModels);

    const tooltipDataArr = this.makeTooltipModel(radarData, categories!);

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    }));
  }

  renderCircleModel(seriesModels: PolygonModel[]): CircleModel[] {
    return seriesModels.flatMap(({ points, color }, seriesIndex) =>
      points.map((point) => ({
        type: 'circle',
        ...point,
        radius: 6,
        color,
        style: ['default', 'hover'],
        seriesIndex,
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

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.eventBus.emit('renderHoveredSeries', responders);

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  renderPolygonModels(seriesData: RadarSeriesType[], renderOptions: RenderOptions): PolygonModel[] {
    const { degree, centerX, centerY, ratio, showArea } = renderOptions;
    const fillOpacity = showArea ? 0.2 : 0;

    return seriesData.map(({ data, color: seriesColor, name }) => {
      const points: Point[] = data.map((value, index) => {
        const radius = value * ratio;

        return getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index));
      });

      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor!, active ? 1 : 0.2);

      return {
        type: 'polygon',
        color,
        lineWidth: DEFAULT_LINE_WIDTH,
        points,
        fillColor: getRGBA(color, fillOpacity),
      };
    });
  }

  renderDotModels(seriesModels: PolygonModel[]): CircleModel[] {
    return seriesModels.flatMap(({ points, color }) =>
      points.map((point) => ({
        type: 'circle',
        ...point,
        radius: 5,
        color,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
      }))
    );
  }
}
