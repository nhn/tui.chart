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
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  tickCount: number;
}

export default class AreaStackSeries extends AreaSeries {
  seriesCircleModel!: CircleModel[];

  getStackValue(areaStackSeries: StackSeriesData<'area'>, seriesIndex: number, index: number) {
    const { stackData } = areaStackSeries;

    return sum(stackData[index].values.slice(0, seriesIndex + 1));
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

    const boundOptions = {
      y,
      height,
      type: 'bound',
    };

    return range(0, tickCount).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? tickDistance / 2 : tickDistance;
      let xx = x;
      // @TODO: refactoring
      if (index !== 0 && !pointOnColumn) {
        xx += width / 2 + tickDistance * (index - 1);
      }

      return {
        x: xx,
        width,
        ...boundOptions,
        index,
      };
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
    const { yAxis } = scale;
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;
    const areaData = series.area.data;
    const areaStackSeries = stackSeries.area;
    const baseValueYPosition = this.getBaseValueYPosition(yAxis.limit);
    this.baseValueYPosition = baseValueYPosition;
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
      yAxis.limit,
      renderOptions,
      legend
    );
    this.seriesCircleModel = this.renderCircleModel();
    const areaSeriesModel = this.renderAreaPointsModel(baseValueYPosition);
    console.log(areaSeriesModel);

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

    // @TODO: 묶어서 정리 필요
    this.arr = this.seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex],
    }));

    this.responders = this.makeBoundResponderModel(renderOptions);
  }

  onMousemove({ responders }: { responders: BoundResponderModel[] }) {
    let circleModels: CircleResponderModel[] = [];

    if (responders.length) {
      const { index } = responders[0];
      // circlemodel 인덱스별로 만들면안되나? 매번 필터할거없이
      circleModels = this.arr.filter((model) => model.index === index);
      // render도 해야함
      // console.log(circleModels);
    }

    this.drawModels.hoveredSeries = [...circleModels];
    this.activatedResponders = circleModels;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }
}
