import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import ScatterSeries from '@src/component/scatterSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import Zoom from '@src/component/zoom';

import * as lineSeriesBrush from '@src/brushes/lineSeries';
import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as resetButtonBrush from '@src/brushes/resetButton';
import * as scatterSeriesBrush from '@src/brushes/scatterSeries';

import {
  CoordinateDataType,
  LineScatterChartOptions,
  LineScatterData,
  ScatterSeriesInput,
} from '@t/options';
import { RawSeries } from '@t/store/store';

export interface LineScatterChartProps {
  el: HTMLElement;
  options: LineScatterChartOptions;
  data: LineScatterData;
}

export default class LineScatterChart extends Chart<LineScatterChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor(props: LineScatterChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: props.data.series as RawSeries,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(LineSeries);
    this.componentManager.add(ScatterSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'secondaryYAxis' });
    this.componentManager.add(DataLabels);
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'secondaryYAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });
    this.componentManager.add(Zoom);

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      lineSeriesBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      resetButtonBrush,
      scatterSeriesBrush,
    ]);
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @param {string} chartType - Which type of chart to add.
   * @api
   * @example
   * chart.addData([{x: 10, y: 20}, {x: 30, y: 40}], 'line');
   */
  public addData = (data: CoordinateDataType[], chartType: 'line' | 'scatter') => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, chartType });
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
   *     data: [{x: 10, y: 20}, {x: 30, y: 40}],
   *   },
   *   {
   *     chartType: 'line'
   *   });
   */
  public addSeries = (data: ScatterSeriesInput, dataInfo: AddSeriesDataInfo) => {
    this.store.dispatch('addSeries', { data, ...dataInfo });
  };

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set
   * @api
   * @example
   * chart.setData({
   *   series: {
   *     line: [
   *       {
   *         name: 'A',
   *         data: [{x: 10, y: 20}, {x: 30, y: 40}]
   *       }
   *     ],
   *     scatter: [
   *       {
   *         name: 'B',
   *         data: [{x: 30, y: 20}, {x: 40, y: 40}]
   *       }
   *     ]
   *   }
   * });
   */
  public setData(data: LineScatterData) {
    this.store.dispatch('setData', data);
  }

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
  public setOptions = (options: LineScatterChartOptions) => {
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
  public updateOptions = (options: LineScatterChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed
   *      @param {number} seriesInfo.seriesIndex - Index of series
   *      @param {number} seriesInfo.index - Index of data within series
   *      @param {string} seriesInfo.chartType - specify which chart to select.
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2, chartType: 'scatter'});
   */
  public showTooltip = (seriesInfo: SelectSeriesInfo) => {
    this.eventBus.emit('showTooltip', { ...seriesInfo, state: this.store.state });
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
