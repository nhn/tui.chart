import Chart from './chart';

import dataRange from '@src/store/dataRange';
import stackSeriesData from '@src/store/stackSeriesData';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';
import dataLabels from '@src/store/dataLabels';

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

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { BoxSeriesType, BoxSeriesDataType, BarChartOptions } from '@t/options';

interface BarChartProps {
  el: HTMLElement;
  options: BarChartOptions;
  data: {
    categories: string[];
    series: BoxSeriesType<BoxSeriesDataType>[];
  };
}

export default class BarChart extends Chart<BarChartOptions> {
  modules = [stackSeriesData, dataRange, scale, axes, plot, dataLabels];

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

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BoxSeries, { name: 'bar' });
    this.componentManager.add(BoxStackSeries, { name: 'bar' });
    this.componentManager.add(ZeroAxis);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AxisUsingCenterY, { name: 'yAxis' });
    this.componentManager.add(AxisUsingCenterY, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip);

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      tooltipBrushes,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
    ]);
  }
}
