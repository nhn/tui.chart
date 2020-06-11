import Chart from './chart';

import scale from '@src/store/scale';
import axes from '@src/store/axes';
import dataRange from '@src/store/dataRange';
import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import BubbleSeries from '@src/component/bubbleSeries';
import Axis from '@src/component/axis';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import { BubbleSeriesData, BaseOptions } from '@t/options';

interface BubbleChartProps {
  el: Element;
  options: BaseOptions;
  data: BubbleSeriesData;
}

export default class BubbleChart extends Chart<BaseOptions> {
  modules = [dataRange, scale, axes];

  constructor(props: BubbleChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        bubble: props.data.series,
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(BubbleSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Tooltip);
    this.componentManager.add(Plot);

    this.painter.addGroups([basicBrushes, axisBrushes, tooltipBrushes]);
  }
}
