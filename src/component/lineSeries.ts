import Component from './component';
import {
  CircleModel,
  CircleResponderModel,
  PointModel,
  LineSeriesModels,
} from '@t/components/series';
import {
  LineChartOptions,
  LineTypeSeriesOptions,
  CoordinateDataType,
  RangeDataType,
} from '@t/options';
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
  zoomRange?: RangeDataType;
}

type DatumType = CoordinateDataType | number;

export default class LineSeries extends Component {
  models: LineSeriesModels = { rect: [], series: [] };

  drawModels!: LineSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

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
      zoomRange,
    };

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

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
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });

    this.models = { rect: [this.renderClipRectAreaModel()], series: lineSeriesModel };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
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
    const { pointOnColumn, options, tickDistance, zoomRange } = renderOptions;
    const { spline } = options;

    return seriesRawData.map(({ rawData, name, color: seriesColor }, seriesIndex) => {
      const points: PointModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 1 : 0.3);

      rawData.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx, zoomRange);
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
        lineWidth: 6,
        color,
        points,
        seriesIndex,
        name,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }, seriesIndex) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
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
}
