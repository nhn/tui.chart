import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import stackSeriesData from '@src/store/stackSeriesData';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Axis from '@src/component/axis';
import BoxSeries from '@src/component/boxSeries';
import BoxStackSeries from '@src/component/boxStackSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import ZeroAxis from '@src/component/zeroAxis';
import AxisUsingCenterY from '@src/component/axisUsingCenterY';
import HoveredSeries from '@src/component/hoveredSeries';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { BoxSeriesDataType, BarChartOptions, BoxSeriesInput, BoxSeriesData } from '@t/options';

export interface BarChartProps {
  el: HTMLElement;
  options: BarChartOptions;
  data: BoxSeriesData;
}

export default class BarChart extends Chart<BarChartOptions> {
  modules = [stackSeriesData, dataRange, scale, axes, plot];

  constructor({ el, options, data }: BarChartProps) {
    super({
      el,
      options,
      series: {
        bar: data.series,
      },
      categories: data.categories,
    });
  }

  initialize() {
    super.initialize();
    const stackChart = !!this.store.initStoreState.options.series?.stack;

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BoxSeries, { name: 'bar', stackChart });
    this.componentManager.add(BoxStackSeries, { name: 'bar', stackChart });
    this.componentManager.add(ZeroAxis);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'secondaryYAxis' });
    this.componentManager.add(AxisUsingCenterY, { name: 'yAxis' });
    this.componentManager.add(AxisUsingCenterY, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'secondaryYAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
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
    ]);
  }

  public addData = (data: BoxSeriesDataType[], category: string) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, category });
  };

  public addSeries(data: BoxSeriesInput<BoxSeriesDataType>, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addSeries', { data, ...dataInfo });
  }

  public setData(data: BoxSeriesData) {
    const { categories, series } = data;
    this.store.dispatch('setData', { series: { bar: series }, categories });
  }

  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

  public setOptions = (options: BarChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  public updateOptions = (options: BarChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed. If eventType is 'grouped', only seriesIndex is needed.
   *      @param {number} seriesInfo.seriesIndex - Index of data within series.If eventType is 'grouped', only seriesIndex is needed.
   *      @param {number} [seriesInfo.index] - Index of series
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2});
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
