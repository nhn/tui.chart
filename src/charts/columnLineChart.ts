import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';
import {
  ColumnLineData,
  ColumnLineChartOptions,
  Point,
  LineSeriesDataType,
  BoxSeriesDataType,
  PlotBand,
  PlotLine,
} from '@t/options';
import { RawSeries } from '@t/store/store';
import stackSeriesData from '@src/store/stackSeriesData';
import plot from '@src/store/plot';
import axes from '@src/store/axes';
import scale from '@src/store/scale';
import dataRange from '@src/store/dataRange';

import Legend from '@src/component/legend';
import BoxStackSeries from '@src/component/boxStackSeries';
import BoxSeries from '@src/component/boxSeries';
import LineSeries from '@src/component/lineSeries';
import Plot from '@src/component/plot';
import Title from '@src/component/title';
import ZeroAxis from '@src/component/zeroAxis';
import Axis from '@src/component/axis';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import Tooltip from '@src/component/tooltip';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as lineSeriesBrush from '@src/brushes/lineSeries';

import { isExist } from '@src/helpers/utils';
import { RespondersModel } from '@t/components/series';

export interface ColumnLineChartProps {
  el: HTMLElement;
  options: ColumnLineChartOptions;
  data: ColumnLineData;
}

function hasPointEventType(respondersModel: RespondersModel, name: string) {
  return respondersModel.find(
    ({ component }) =>
      component.name === name && (component as BoxSeries | LineSeries).eventDetectType === 'point'
  );
}
function hasColumnLineUsingPointEventType(respondersModel: RespondersModel) {
  return (
    isExist(hasPointEventType(respondersModel, 'column')) &&
    isExist(hasPointEventType(respondersModel, 'line'))
  );
}

export default class ColumnLineChart extends Chart<ColumnLineChartOptions> {
  modules = [stackSeriesData, dataRange, scale, axes, plot];

  constructor({ el, options, data: { series, categories } }: ColumnLineChartProps) {
    super({
      el,
      options,
      series: series as RawSeries,
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BoxStackSeries, { name: 'column' });
    this.componentManager.add(BoxSeries, { name: 'column' });
    this.componentManager.add(LineSeries);
    this.componentManager.add(ZeroAxis);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'secondaryYAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'secondaryYAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      lineSeriesBrush,
    ]);
  }

  handleEventForAllResponders(
    event: MouseEvent,
    responderModels: RespondersModel,
    delegationMethod: string,
    mousePosition: Point
  ) {
    if (hasColumnLineUsingPointEventType(responderModels)) {
      const columnSeries = responderModels.find(({ component }) => component.name === 'column')!;

      columnSeries.component[delegationMethod]({ mousePosition, responders: [] }, event);
    }
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @param {string} category - Category to be added.
   * @param {string} chartType - Which type of chart to add.
   * @api
   * @example
   * chart.addData([10, 20], '6', 'line');
   */
  public addData = (
    data: BoxSeriesDataType[] | LineSeriesDataType[],
    category: string,
    chartType: 'line' | 'column'
  ) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, category, chartType });
  };

  /**
   * Add series.
   * @param {Object} data - Data to be added.
   * @param {string} data.name - Series name.
   * @param {Array} data.data - Array of data to be added.
   * @param {Object} dataInfo - Which type of chart to add.
   * @param {Object} dataInfo.chartType - Chart type.
   * @api
   * @example
   * chart.addSeries(
   *   {
   *     name: 'newSeries',
   *     data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
   *   },
   *   {
   *     chartType: 'line'
   *   });
   */
  public addSeries(data, dataInfo: AddSeriesDataInfo) {
    this.store.dispatch('addSeries', { data, ...dataInfo });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set
   * @api
   * @example
   * chart.setData({
   *   categories: ['1','2','3'],
   *   series: {
   *     column: [
   *       {
   *         name: 'A',
   *         data: [1, 2, 3]
   *       }
   *     ],
   *     line: [
   *       {
   *         name: 'B',
   *         data: [4, 5, 6]
   *       }
   *     ]
   *   }
   * });
   */
  public setData(data: ColumnLineData) {
    this.store.dispatch('setData', data);
  }

  /**
   * Add plot line.
   * @param {Object} data - Plot info.
   * @param {string|number} data.value - The value where the plot line will be drawn.
   * @param {string} data.color - Plot line color.
   * @param {string} [data.id] - Plot id. The value on which the removePlotLine is based.
   * @api
   * @example
   * chart.addPlotLine({
   *   value: 2,
   *   color: '#00ff22',
   *   id: 'plot-1'
   * });
   */
  public addPlotLine(data: PlotLine) {
    this.store.dispatch('addPlotLine', { data });
  }

  /**
   * Remove plot line with id.
   * @param {string} id - Id of the plot line to be removed
   * @api
   * @example
   * chart.removePlotLine('plot-1');
   */
  public removePlotLine(id: string) {
    this.store.dispatch('removePlotLine', { id });
  }

  /**
   * Add plot band.
   * @param {Object} data - plot info
   * @param {Array<string|number>} data.range - The range to be drawn
   * @param {string} data.color - Plot band color
   * @param {string} [data.id] - Plot id. The value on which the removePlotBand is based
   * @api
   * @example
   * chart.addPlotBand({
   *   value: [2, 4],
   *   color: '#00ff22',
   *   id: 'plot-1'
   * });
   */
  public addPlotBand(data: PlotBand) {
    this.store.dispatch('addPlotBand', { data });
  }

  /**
   * Remove plot band with id.
   * @param {string} id - id of the plot band to be removed
   * @api
   * @example
   * chart.removePlotBand('plot-1');
   */
  public removePlotBand(id: string) {
    this.store.dispatch('removePlotBand', { id });
  }

  /**
   * Hide series data label.
   * @api
   * @example
   * chart.hideSeriesLabel();
   */
  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', {
      series: { dataLabels: { visible: false } },
    });
  };

  /**
   * Show series data label.
   * @api
   * @example
   * chart.showSeriesLabel();
   */
  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', {
      series: { dataLabels: { visible: true } },
    });
  };

  /**
   * Convert the chart options to new options.
   * @param {Object} options - Chart options
   * @api
   * @example
   * chart.setOptions({
   *   chart: {
   *     width: 500,
   *     height: 'auto',
   *     title: 'Energy Usage',
   *   },
   *   xAxis: {
   *     title: 'Month',
   *     date: { format: 'yy/MM' },
   *   },
   *   yAxis: {
   *     title: 'Energy (kWh)',
   *   },
   *   series: {
   *     line: {
   *       showDot: true
   *     },
   *     selectable: true
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: ColumnLineChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  /**
   * Update chart options.
   * @param {Object} options - Chart options
   * @api
   * @example
   * chart.updateOptions({
   *   chart: {
   *     height: 'auto',
   *     title: 'Energy Usage',
   *   },
   *   series: {
   *     line: {
   *       showDot: true
   *     },
   *   },
   * });
   */
  public updateOptions = (options: ColumnLineChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.seriesIndex - Index of series.
   *      @param {number} seriesInfo.index - Index of data within series.
   *      @param {string} seriesInfo.chartType - specify which chart to select.
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2, chartType: 'column'});
   */
  public showTooltip = (seriesInfo: SelectSeriesInfo) => {
    this.eventBus.emit('showTooltip', { ...seriesInfo });
  };

  /**
   * Hide tooltip.
   * @api
   * @example
   * chart.hideTooltip();
   */
  public hideTooltip = () => {
    this.eventBus.emit('hideTooltip');
  };
}
