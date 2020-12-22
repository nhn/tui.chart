import Chart, { SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';
import Axis from '@src/component/axis';
import BulletSeries from '@src/component/bulletSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import { BulletChartOptions, BulletSeriesType, BulletSeriesData } from '@t/options';

export interface BulletChartProps {
  el: HTMLElement;
  options: BulletChartOptions;
  data: BulletSeriesData;
}

export default class BulletChart extends Chart<BulletChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor({ el, options, data: { series } }: BulletChartProps) {
    super({
      el,
      options,
      series: {
        bullet: series as BulletSeriesType[],
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BulletSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
    ]);
  }

  /**
   * Add series.
   * @param {Object} data - Data to be added
   * @param {string} data.name - Series name
   * @param {Array} data.data - Array of data to be added
   * @api
   * @example
   * chart.addSeries({
   *   name: 'newSeries',
   *   data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
   * });
   */
  public addSeries(data: BulletSeriesType) {
    this.store.dispatch('addSeries', { data });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set
   * @api
   * @example
   * chart.setData({
   *   categories: ['1','2','3'],
   *   series: [
   *     {
   *       name: 'new series',
   *       data: [1, 2, 3],
   *     },
   *     {
   *       name: 'new series2',
   *       data: [4, 5, 6],
   *     }
   *   ]
   * });
   */
  public setData(data: BulletSeriesData) {
    this.store.dispatch('setData', { series: { bullet: data.series } });
  }

  /**
   * Hide series data label.
   * @api
   * @example
   * chart.hideSeriesLabel();
   */
  public hideSeriesLabel = () => {
    // @TODO: Should be implemented
  };

  /**
   * Show series data label.
   * @api
   * @example
   * chart.showSeriesLabel();
   */
  public showSeriesLabel = () => {
    // @TODO: Should be implemented
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
  public setOptions = (options: BulletChartOptions) => {
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
  public updateOptions = (options: BulletChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.seriesIndex - Index of series.
   * @api
   * @example
   * chart.showTooltip({seriesIndex: 1});
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
