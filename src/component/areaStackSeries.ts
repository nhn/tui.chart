import AreaSeries from './areaSeries';
import { AreaChartOptions, LineTypeSeriesOptions } from '@t/options';
import { ChartState } from '@t/store/store';
import { deepCopyArray, first } from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  pairModel?: boolean;
}

export default class AreaStackSeries extends AreaSeries {
  public render(chartState: ChartState<AreaChartOptions>) {
    const {
      layout,
      series,
      scale,
      options,
      axes,
      categories = [],
      legend,
      dataLabels,
      stackSeries,
    } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;
    const areaData = series.area.data;
    const bottomYPoint = layout.xAxis.y - layout.xAxis.height + 10; // padding

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
    };

    this.rect = layout.plot;
    this.isRangeData = isRangeData(first(areaData)!.data);
    this.linePointsModel = this.renderLinePointsModel(areaData, yAxis.limit, renderOptions, legend);

    const areaSeriesModel = this.renderAreaPointsModel(bottomYPoint);
    const seriesCircleModel = this.renderCircleModel();
    const tooltipDataArr = this.makeTooltipData(areaData, categories);

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

    this.responders = seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex % tooltipDataArr.length],
    }));
  }
}
