import Chart, { AddSeriesDataInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import Zoom from '@src/component/zoom';
import ResetButton from '@src/component/resetButton';
import SelectedSeries from '@src/component/selectedSeries';

import * as lineSeriesBrush from '@src/brushes/lineSeries';
import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as resetButtonBrush from '@src/brushes/resetButton';

import {
  LineChartOptions,
  LineSeriesData,
  LineSeriesDataType,
  LineSeriesType,
  LineSeriesInput,
  PlotLine,
  PlotBand,
} from '@t/options';

export interface LineChartProps {
  el: Element;
  options: LineChartOptions;
  data: LineSeriesData;
}

export default class LineChart extends Chart<LineChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor(props: LineChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        line: props.data.series as LineSeriesType[],
      },
      categories: props.data?.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
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

  public addData = (data: LineSeriesDataType[], category?: string) => {
    this.store.dispatch('addData', { data, category });
  };

  public addSeries(data: LineSeriesInput, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addSeries', { data, ...dataInfo });
  }

  public setData(data: LineSeriesData) {
    const { categories, series } = data;
    this.store.dispatch('setData', { series: { line: series }, categories });
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
}
