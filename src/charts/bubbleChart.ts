import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import scale from '@src/store/scale';
import axes from '@src/store/axes';
import dataRange from '@src/store/dataRange';
import plot from '@src/store/plot';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import BubbleSeries from '@src/component/bubbleSeries';
import Axis from '@src/component/axis';
import CircleLegend from '@src/component/circleLegend';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as circleLegendBrush from '@src/brushes/circleLegend';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import {
  BubbleSeriesData,
  BaseOptions,
  BubbleSeriesType,
  BubbleSeriesDataType,
  BubbleSeriesInput,
  BubbleChartOptions,
} from '@t/options';

export interface BubbleChartProps {
  el: HTMLElement;
  options: BaseOptions;
  data: BubbleSeriesData;
}

export default class BubbleChart extends Chart<BaseOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor(props: BubbleChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        bubble: props.data.series as BubbleSeriesType[],
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BubbleSeries);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });
    this.componentManager.add(CircleLegend);

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      circleLegendBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
    ]);
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @api
   * @example
   * chart.addData([
   *   {x: 10, y: 20, r: 10, label: 'label1'},
   *   {x: 30, y: 40, r: 10, label: 'label2'}
   * ]);
   */
  public addData = (data: BubbleSeriesDataType[]) => {
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
   *     {x: 10, y: 20, r: 10, label: 'label1'},
   *     {x: 30, y: 40, r: 10, label: 'label2'}
   *   ],
   * });
   */
  public addSeries(data: BubbleSeriesInput) {
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
   *         {x: 10, y: 20, r: 10, label: 'label1'},
   *         {x: 30, y: 40, r: 10, label: 'label2'}
   *       ]
   *     }
   *   ]
   * });
   */
  public setData(data: BubbleSeriesData) {
    this.store.dispatch('setData', { series: { bubble: data.series } });
  }

  /**
   * Convert the chart options to new options.
   * @param {Object} options - Chart options.
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
   *     selectable: true
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: BubbleChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  /**
   * Update chart options.
   * @param {Object} options - Chart options.
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
  public updateOptions = (options: BubbleChartOptions) => {
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
