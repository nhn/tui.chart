import Chart, { SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Legend from '@src/component/legend';
import RadarSeries from '@src/component/radarSeries';
import RadarPlot from '@src/component/radarPlot';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import Tooltip from '@src/component/tooltip';
import RadialAxis from '@src/component/radialAxis';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as polygonBrush from '@src/brushes/polygon';
import * as axisBrush from '@src/brushes/axis';

import { RadarChartOptions, RadarSeriesData, RadarSeriesInput } from '@t/options';

export interface RadarChartProps {
  el: HTMLElement;
  options: RadarChartOptions;
  data: RadarSeriesData;
}

export default class RadarChart extends Chart<RadarChartOptions> {
  modules = [dataRange, scale, axes];

  constructor({ el, options, data }: RadarChartProps) {
    super({
      el,
      options,
      series: {
        radar: data.series,
      },
      categories: data.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);
    this.componentManager.add(RadarPlot);
    this.componentManager.add(RadialAxis);
    this.componentManager.add(RadarSeries);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      polygonBrush,
      axisBrush,
    ]);
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @param {string} category - Category to be added.
   * @api
   * @example
   * chart.addData([10, 20], '6');
   */
  public addData = (data: number[], category: string) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, category });
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
   *   data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
   * });
   */
  public addSeries(data: RadarSeriesInput) {
    this.store.dispatch('addSeries', { data });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set.
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
  public setData(data: RadarSeriesData) {
    const { categories, series } = data;
    this.store.dispatch('setData', { series: { radar: series }, categories });
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
   *   series: {
   *     selectable: true
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: RadarChartOptions) => {
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
  public updateOptions = (options: RadarChartOptions) => {
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
