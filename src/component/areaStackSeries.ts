import AreaSeries from './areaSeries';
import { AreaChartOptions, AreaSeriesType, LineTypeSeriesOptions } from '@t/options';
import { ChartState, Legend, StackSeriesData, ValueEdge } from '@t/store/store';
import { deepCopyArray, range, sum } from '@src/helpers/utils';
import {
  BoundResponderModel,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
  PointModel,
} from '@t/components/series';
import { getRGBA } from '@src/helpers/color';
import { crispPixel, getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { LineModel } from '@t/components/axis';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  tickCount: number;
}

export default class AreaStackSeries extends AreaSeries {
  seriesCircleModel!: CircleModel[];

  tooltipCircleMap!: Record<number, CircleResponderModel[]>;

  getStackValue(areaStackSeries: StackSeriesData<'area'>, seriesIndex: number, index: number) {
    const { type } = areaStackSeries.stack;
    const { values, sum: sumValue } = areaStackSeries.stackData[index];
    const stackedValue = sum(values.slice(0, seriesIndex + 1));

    return type === 'percent' ? (stackedValue * 100) / sumValue : stackedValue;
  }

  getStackLinePointModel(
    series: AreaSeriesType,
    seriesIndex: number,
    areaStackSeries: StackSeriesData<'area'>,
    legend: Legend,
    limit: ValueEdge,
    renderOptions: RenderOptions
  ): LinePointsModel {
    const { pointOnColumn, options, tickDistance } = renderOptions;
    const { data, name, color: seriesColor } = series;
    const points: PointModel[] = [];
    const { active } = legend.data.find(({ label }) => label === name)!;
    const color = getRGBA(seriesColor, active ? 1 : 0.1);

    data.forEach((datum, idx) => {
      const value = datum as number;
      const stackValue = this.getStackValue(areaStackSeries, seriesIndex, idx);
      const valueRatio = getValueRatio(stackValue, limit);
      const x = tickDistance * idx + (pointOnColumn ? tickDistance / 2 : 0);
      const y = (1 - valueRatio) * this.rect.height;

      points.push({ x, y, value });
    });

    // @TODO: range spline 처리 필요
    if (options?.spline) {
      setSplineControlPoint(points);
    }

    return {
      type: 'linePoints',
      lineWidth: 6,
      color,
      points,
      seriesIndex,
    };
  }

  combineLinePointsModel() {
    const combinedLinePointsModel: LinePointsModel[] = [];
    const len = this.linePointsModel.length;

    for (let i = 0; i < len; i += 1) {
      combinedLinePointsModel.push({
        ...this.linePointsModel[i],
        points:
          i === 0
            ? this.addBottomPoints(this.linePointsModel[i].points, this.baseValueYPosition)
            : [
                ...this.linePointsModel[i - 1].points,
                ...[...this.linePointsModel[i].points].reverse(),
              ],
      });
    }

    return combinedLinePointsModel;
  }

  renderStackLinePointsModel(
    seriesRawData: AreaSeriesType[],
    areaStackSeries: StackSeriesData<'area'>,
    limit: ValueEdge,
    renderOptions: RenderOptions,
    legend: Legend
  ): LinePointsModel[] {
    return seriesRawData.map((series, seriesIndex) =>
      this.getStackLinePointModel(
        series,
        seriesIndex,
        areaStackSeries,
        legend,
        limit,
        renderOptions
      )
    );
  }

  makeBoundResponderModel(renderOptions: RenderOptions) {
    const { pointOnColumn, tickCount, tickDistance } = renderOptions;
    const { height, x, y } = this.rect;
    const halfDetectAreaIndex = pointOnColumn ? [] : [0, tickCount];

    const boundOptions = { type: 'bound', y, height };
    const halfWidth = tickDistance / 2;

    return range(0, tickCount).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? halfWidth : tickDistance;
      let startX = x;

      if (index !== 0) {
        startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
      }

      return { x: startX, width, index, ...boundOptions };
    });
  }

  public render(chartState: ChartState<AreaChartOptions>) {
    const {
      layout,
      series,
      scale,
      options,
      axes,
      legend,
      dataLabels,
      stackSeries,
      categories = [],
    } = chartState;

    if (!series.area) {
      throw new Error("There's no area data!");
    }

    if (!stackSeries.area) {
      return;
    }

    this.rect = layout.plot;
    const { limit } = scale.yAxis;
    this.baseValueYPosition = this.getBaseValueYPosition(limit);
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;
    const areaData = series.area.data;
    const areaStackSeries = stackSeries.area;
    const tooltipDataArr = this.makeTooltipData(areaData, categories);

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
      tickCount,
    };

    this.linePointsModel = this.renderStackLinePointsModel(
      areaData,
      areaStackSeries,
      limit,
      renderOptions,
      legend
    );
    this.seriesCircleModel = this.renderCircleModel();
    const areaSeriesModel = this.renderAreaPointsModel();

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: areaSeriesModel,
      hoveredSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(areaSeriesModel),
        hoveredSeries: [],
      };
    }

    if (dataLabels.visible) {
      this.store.dispatch('appendDataLabels', this.getDataLabels(areaSeriesModel));
    }

    this.tooltipCircleMap = this.seriesCircleModel.reduce<Record<string, CircleResponderModel[]>>(
      (acc, cur, dataIndex) => {
        const index = cur.index!;
        const tooltipModel = { ...cur, data: tooltipDataArr[dataIndex] };
        if (!acc[index]) {
          acc[index] = [];
        }
        acc[index].push(tooltipModel);

        return acc;
      },
      {}
    );

    this.responders = this.makeBoundResponderModel(renderOptions);
  }

  renderGuideLineModel(circleModels: CircleResponderModel[]): LineModel[] {
    const x = crispPixel(circleModels[0].x);

    return [
      {
        type: 'line',
        x,
        y: 0,
        x2: x,
        y2: this.rect.height,
        strokeStyle: '#ddd',
        lineWidth: 1,
      },
    ];
  }

  onMousemove({ responders }: { responders: BoundResponderModel[] }) {
    let circleModels: CircleResponderModel[] = [];
    let guideLine: LineModel[] = [];

    if (responders.length) {
      const index = responders[0].index!;
      circleModels = this.tooltipCircleMap[index];

      guideLine = this.renderGuideLineModel(circleModels);
    }

    this.drawModels.hoveredSeries = [...guideLine, ...circleModels];
    this.activatedResponders = circleModels;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }
}
