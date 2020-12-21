import Chart, { AddSeriesDataInfo, SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';
import stackSeriesData from '@src/store/stackSeriesData';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import AreaSeries from '@src/component/areaSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import Zoom from '@src/component/zoom';
import ResetButton from '@src/component/resetButton';

import * as lineSeriesBrush from '@src/brushes/lineSeries';
import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as resetButtonBrush from '@src/brushes/resetButton';

import {
  AreaSeriesDataType,
  AreaSeriesInput,
  LineAreaChartOptions,
  LineAreaData,
  LineSeriesDataType,
  LineSeriesInput,
  PlotBand,
  PlotLine,
} from '@t/options';
import { RawSeries } from '@t/store/store';

export interface LineAreaChartProps {
  el: HTMLElement;
  options: LineAreaChartOptions;
  data: LineAreaData;
}

export default class LineAreaChart extends Chart<LineAreaChartOptions> {
  modules = [stackSeriesData, dataRange, scale, axes, plot];

  constructor(props: LineAreaChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: props.data.series as RawSeries,
      categories: props.data.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(AreaSeries);
    this.componentManager.add(LineSeries);
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
    this.componentManager.add(ResetButton);

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      lineSeriesBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      resetButtonBrush,
    ]);
  }

  public addData = (
    data: LineSeriesDataType[] | AreaSeriesDataType[],
    category: string,
    chartType: 'line' | 'area'
  ) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, category, chartType });
  };

  public addSeries = (
    data: LineSeriesInput | AreaSeriesInput,
    addSeriesDataInfo: AddSeriesDataInfo
  ) => {
    this.store.dispatch('addSeries', { data, ...addSeriesDataInfo });
  };

  public setData(data: LineAreaData) {
    this.store.dispatch('setData', data);
  }

  public addPlotLine(data: PlotLine) {
    this.store.dispatch('addPlotLine', { data });
  }

  public removePlotLine(id: string) {
    this.store.dispatch('removePlotLine', { id });
  }

  public addPlotBand(data: PlotBand) {
    this.store.dispatch('addPlotBand', { data });
  }

  public removePlotBand(id: string) {
    this.store.dispatch('removePlotBand', { id });
  }

  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

  public setOptions = (options: LineAreaChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  public updateOptions = (options: LineAreaChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.index - Index of series.
   *      @param {number} seriesInfo.seriesIndex - Index of data within series.
   *      @param {string} seriesInfo.chartType - specify which chart to select.
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2, chartType: 'line'});
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
