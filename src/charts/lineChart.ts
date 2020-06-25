import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import dataLabels from '@src/store/dataLabels';
import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';

import * as lineSeriesBrushes from '@src/brushes/lineSeries';
import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import * as legendBrush from '@src/brushes/legend';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import { LineChartOptions, LineSeriesData, LineSeriesType } from '@t/options';

// 생성자를 따로 두기보다는 팩토리로 구현하는게 나을것 같다.
interface LineChartProps {
  el: Element;
  options: LineChartOptions;
  data: LineSeriesData;
}

export default class LineChart extends Chart<LineChartOptions> {
  modules = [dataRange, scale, axes, dataLabels];

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

    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(LineSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip);

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      tooltipBrushes,
      lineSeriesBrushes,
      legendBrush,
      dataLabelBrush,
    ]);
  }
}
