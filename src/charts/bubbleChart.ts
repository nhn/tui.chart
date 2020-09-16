import Chart from './chart';

import scale from '@src/store/scale';
import axes from '@src/store/axes';
import dataRange from '@src/store/dataRange';
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
import plot from '@src/store/plot';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as circleLegendBrush from '@src/brushes/circleLegend';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { BubbleSeriesData, BaseOptions, BubbleSeriesType } from '@t/options';

interface BubbleChartProps {
  el: Element;
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
}
