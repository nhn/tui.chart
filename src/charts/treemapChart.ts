import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import colorValueScale from '@src/store/colorValueScale';
import treemapSeriesData from '@src/store/treemapSeriesData';

import Tooltip from '@src/component/tooltip';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import TreemapSeries from '@src/component/treemapSeries';
import SpectrumLegend from '@src/component/spectrumLegend';
import BackButton from '@src/component/backButton';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as spectrumLegendBrush from '@src/brushes/spectrumLegend';
import * as resetButtonBrush from '@src/brushes/resetButton';

import { TreemapChartOptions, TreemapSeriesData, TreemapSeriesType } from '@t/options';

export interface TreemapChartProps {
  el: HTMLElement;
  options: TreemapChartOptions;
  data: TreemapSeriesData;
}

export default class TreemapChart extends Chart<TreemapChartOptions> {
  modules = [treemapSeriesData, colorValueScale];

  constructor(props: TreemapChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        treemap: props.data.series as TreemapSeriesType[],
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(SpectrumLegend);
    this.componentManager.add(TreemapSeries);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });
    this.componentManager.add(BackButton);

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      spectrumLegendBrush,
      resetButtonBrush,
    ]);
  }

  /**
   * Add series.
   * @param {Object} data - Data to be added.
   * @param {string} data.name - Series name.
   * @param {Array} data.data - Array of data to be added.
   * @api
   * @example
   * chart.addSeries({
   *   label: 'Documents',
   *   children: [
   *     {label: 'A', data: 20},
   *     {label: 'B', data: 40}
   *   ],
   * });
   */
  public addSeries(data: TreemapSeriesType, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addTreemapSeries', { data, ...dataInfo });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set.
   * @api
   * @example
   * chart.setData(
   *   series: [
   *     {
   *       label: 'Documents',
   *       children: [
   *         {label: 'A', data: 20},
   *         {label: 'B', data: 40}
   *       ],
   *     },
   *     {
   *       label: 'Documents',
   *       data: 30
   *     }
   *   ]
   * );
   */
  public setData(data: TreemapSeriesData) {
    this.store.dispatch('setData', { series: { treemap: data.series } });
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
   * @param {Object} options - Chart options
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
  public setOptions = (options: TreemapChartOptions) => {
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
  public updateOptions = (options: TreemapChartOptions) => {
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
