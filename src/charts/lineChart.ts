import Chart from './chart';

import axes from '@src/store/axes';
import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import Axis from '@src/component/axis';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import * as plotBrushes from '@src/brushes/plot';
import { LineChartOptions, LineSeriesData } from '@t/options';

// 생성자를 따로 두기보다는 팩토리로 구현하는게 나을것 같다.
interface LineChartProps {
  el: Element;
  options: LineChartOptions;
  data: LineSeriesData;
}

export default class LineChart extends Chart<LineChartOptions> {
  constructor(props: LineChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        line: props.data.series
      },
      categories: props.data?.categories
    });
  }

  initialize() {
    super.initialize();

    this.store.setModule(axes);

    this.componentManager.add(LineSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Tooltip);
    this.componentManager.add(Plot);

    this.painter.addGroups([basicBrushes, axisBrushes, tooltipBrushes, plotBrushes]);
  }
}
