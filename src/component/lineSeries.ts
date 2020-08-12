import Component from './component';
import {
  CircleModel,
  CircleResponderModel,
  PointModel,
  LineSeriesModels,
} from '@t/components/series';
import { LineChartOptions, LineTypeSeriesOptions, CoordinateDataType } from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
}

export const DEFAULT_LINE_WIDTH = 3;

type DatumType = CoordinateDataType | number;

export default class LineSeries extends Component {
  models: LineSeriesModels = { rect: [], series: [], dot: [], selectedSeries: [] };

  drawModels!: LineSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  startIndex!: number;

  initialize() {
    this.type = 'series';
    this.name = 'lineSeries';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  render(chartState: ChartState<LineChartOptions>) {
    const {
      layout,
      series,
      scale,
      options,
      axes,
      categories = [],
      legend,
      dataLabels,
      zoomRange,
    } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;
    const lineSeriesData = series.line.data;

    const renderLineOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
    };

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = zoomRange ? zoomRange[0] : 0;
    this.selectable = this.getSelectableOption(options);

    const lineSeriesModel = this.renderLinePointsModel(
      lineSeriesData,
      yAxis.limit,
      renderLineOptions,
      categories
    );

    const seriesCircleModel = this.renderCircleModel(lineSeriesModel);

    const tooltipDataArr = lineSeriesData.flatMap(({ rawData, name, color }) => {
      const tooltipData: TooltipData[] = [];

      rawData.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color,
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx, this.startIndex)],
        });
      });

      return tooltipData;
    });

    const dotSeriesModel = this.renderDotSeriesModel(seriesCircleModel, renderLineOptions);

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: lineSeriesModel,
      dot: dotSeriesModel,
      selectedSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
        dot: deepCopyArray(dotSeriesModel),
        selectedSeries: [],
      };
    }

    if (dataLabels.visible) {
      this.store.dispatch('appendDataLabels', this.getDataLabels(lineSeriesModel));
    }

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    }));
  }

  renderDotSeriesModel(
    seriesCircleModel: CircleModel[],
    { options }: RenderOptions
  ): CircleModel[] {
    return options?.showDot
      ? seriesCircleModel.map((m) => ({
          ...m,
          radius: 6,
          style: ['default'],
        }))
      : [];
  }

  renderClipRectAreaModel(isDrawModel?: boolean): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: isDrawModel ? 0 : this.rect.width,
      height: this.rect.height,
    };
  }

  renderLinePointsModel(
    seriesRawData: LineSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderOptions,
    categories: string[]
  ): LinePointsModel[] {
    const { pointOnColumn, options, tickDistance } = renderOptions;
    const { spline, lineWidth } = options;

    return seriesRawData.map(({ rawData, name, color: seriesColor }, seriesIndex) => {
      const points: PointModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 1 : 0.3);

      rawData.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx, this.startIndex);
        const valueRatio = getValueRatio(value, limit);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y, value });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return {
        type: 'linePoints',
        lineWidth: lineWidth ?? DEFAULT_LINE_WIDTH,
        color,
        points,
        seriesIndex,
        name,
        id: `line-series-${name}`,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color, name }, seriesIndex) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
        id: `line-dot-${name}`,
      }))
    );
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.eventBus.emit('renderHoveredSeries', responders);

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: LinePointsModel[]): PointModel[] {
    return seriesModels.flatMap(({ points }) =>
      points.map((point) => ({ type: 'point', ...point }))
    );
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.drawModels.selectedSeries = responders;
      this.eventBus.emit('needDraw');
    }
  }
}
