import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Axis from '@src/component/axis';
import BoxPlotSeries from '@src/component/boxPlotSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as BoxPlotBrush from '@src/brushes/boxPlot';
import { BoxPlotSeriesType, BoxPlotSeriesData, BoxPlotChartOptions } from '@t/options';

interface BoxPlotChartProps {
  el: Element;
  options: BoxPlotChartOptions;
  data: BoxPlotSeriesData;
}

export default class BoxPlotChart extends Chart<BoxPlotChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor({ el, options, data: { series, categories } }: BoxPlotChartProps) {
    super({
      el,
      options,
      series: {
        boxPlot: series as BoxPlotSeriesType[],
      },
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BoxPlotSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      BoxPlotBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
    ]);
  }
}
