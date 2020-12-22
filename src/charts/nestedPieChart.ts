import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import nestedPieSeriesData from '@src/store/nestedPieSeriesData';

import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as sectorBrush from '@src/brushes/sector';
import * as dataLabelBrush from '@src/brushes/dataLabel';

import { NestedPieChartOptions, NestedPieSeriesData, NestedPieSeriesType } from '@t/options';
import PieSeries from '@src/component/pieSeries';

export interface NestedPieChartProps {
  el: HTMLElement;
  options: NestedPieChartOptions;
  data: NestedPieSeriesData;
}

export default class NestedPieChart extends Chart<NestedPieChartOptions> {
  modules = [nestedPieSeriesData];

  constructor({ el, options, data: { series, categories } }: NestedPieChartProps) {
    super({
      el,
      options,
      series: { pie: series },
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);

    (this.store.initStoreState.series.pie ?? []).forEach(({ name }) => {
      this.componentManager.add(PieSeries, { alias: name });
    });

    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      sectorBrush,
      dataLabelBrush,
    ]);
  }

  /**
   * Add series.
   * @param {Object} data - Data to be added.
   * @param {string} data.name - Series name.
   * @param {Array} data.data - Array of data to be added.
   * @param {Object} dataInfo - Which alias of chart to add.
   * @param {Object} dataInfo.alias - Chart alias.
   * @api
   * @example
   * chart.addSeries(
   *   {
   *     name: 'newSeries',
   *     data: [
   *       { name: 'A', data: 10 },
   *       { name: 'B', data: 20 },
   *     ],
   *   },
   *   {
   *     alias: 'alias1'
   *   });
   */
  public addSeries(data: NestedPieSeriesType, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addSeries', { data, ...dataInfo });
    this.componentManager.add(PieSeries, { alias: data.name });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set
   * @api
   * @example
   * chart.setData({
   *   categories: ['A', 'B'],
   *   series: [
   *     {
   *       name: 'browsers',
   *       data: [
   *         {
   *           name: 'Chrome',
   *           data: 50,
   *         },
   *         {
   *           name: 'Safari',
   *           data: 20,
   *         },
   *       ]
   *     },
   *     {
   *       name: 'versions',
   *       data: [
   *         {
   *           name: '1',
   *           data: 50,
   *         },
   *         {
   *           name: '2',
   *           data: 20,
   *         },
   *       ]
   *     }
   *   ]
   * });
   */
  public setData(data: NestedPieSeriesData) {
    this.componentManager.remove(PieSeries);
    this.store.dispatch('setData', { series: { pie: data.series } });

    (this.store.initStoreState.series.pie ?? []).forEach(({ name }) => {
      this.componentManager.add(PieSeries, { alias: name });
    });
  }

  /**
   * Hide series data label.
   * @api
   * @example
   * chart.hideSeriesLabel();
   */
  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  /**
   * Show series data label.
   * @api
   * @example
   * chart.showSeriesLabel();
   */
  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

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
   *   series: {
   *     alias2: {
   *       radiusRange: [20%, 50%]
   *     },
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: NestedPieChartOptions) => {
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
   *   series: {
   *     alias1: {
   *       showDot: true
   *     },
   *   },
   * });
   */
  public updateOptions = (options: NestedPieChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.seriesIndex - Index of series.
   *      @param {number} seriesInfo.alias - alias name.
   * @api
   * @example
   * chart.showTooltip({seriesIndex: 1, alias: 'name'});
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
