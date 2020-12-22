import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import ScatterSeries from '@src/component/scatterSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as scatterSeriesBrush from '@src/brushes/scatterSeries';

import {
  CoordinateDataType,
  ScatterChartOptions,
  ScatterSeriesData,
  ScatterSeriesType,
  ScatterSeriesInput,
} from '@t/options';

export interface ScatterChartProps {
  el: HTMLElement;
  options: ScatterChartOptions;
  data: ScatterSeriesData;
}

export default class ScatterChart extends Chart<ScatterChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor(props: ScatterChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        scatter: props.data.series as ScatterSeriesType[],
      },
      categories: props.data?.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(ScatterSeries);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      scatterSeriesBrush,
    ]);
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @api
   * @example
   * chart.addData([
   *   {x: 10, y: 20},
   *   {x: 30, y: 40}
   * ]);
   */
  public addData = (data: CoordinateDataType[]) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data });
  };

  /**
   * Add series.
   * @param {Object} data - Data to be added.
   * @param {string} data.name - Series name.
   * @param {Array} data.data - Array of data to be added.
   * @api
   * @example
   * chart.addSeries({
   *   name: 'newSeries',
   *   data: [
   *     {x: 10, y: 20},
   *     {x: 30, y: 40}
   *   ],
   * });
   */
  public addSeries(data: ScatterSeriesInput) {
    this.store.dispatch('addSeries', { data });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set.
   * @api
   * @example
   * chart.setData({
   *   series: [
   *     {
   *       name: 'name'
   *       data: [
   *         {x: 10, y: 20},
   *         {x: 30, y: 40}
   *       ]
   *     }
   *   ]
   * });
   */
  public setData(data: ScatterSeriesData) {
    const { categories, series } = data;
    this.store.dispatch('setData', { series: { scatter: series }, categories });
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
   *   },
   *   yAxis: {
   *     title: 'Energy (kWh)',
   *   },
   *   series: {
   *     selectable: true
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: ScatterChartOptions) => {
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
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public updateOptions = (options: ScatterChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.seriesIndex - Index of series.
   *      @param {number} seriesInfo.index - Index of data within series.
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2});
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
