import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import AreaSeries from '@src/component/areaSeries';
import Axis from '@src/component/axis';
import Title from '@src/component/title';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';

import * as lineSeriesBrushes from '@src/brushes/lineSeries';
import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import * as legendBrush from '@src/brushes/legend';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { AreaChartOptions, AreaSeriesData, AreaSeriesType } from '@t/options';
import Legend from '@src/component/legend';

interface AreaChartProps {
  el: Element;
  options: AreaChartOptions;
  data: AreaSeriesData;
}

export default class AreaChart extends Chart<AreaChartOptions> {
  modules = [dataRange, scale, axes];

  constructor(props: AreaChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        area: props.data.series as AreaSeriesType[],
      },
      categories: props.data.categories,
    });
  }

  initialize() {
    super.initialize();
    // @TODO: 배열로 넘겨서 처리하는 것 생각해보자
    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(AreaSeries);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(Tooltip);

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      tooltipBrushes,
      lineSeriesBrushes,
      legendBrush,
      exportMenuBrush,
    ]);
  }
}
