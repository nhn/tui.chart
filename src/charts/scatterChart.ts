import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import ScatterSeries from '@src/component/scatterSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';

import { ScatterChartOptions, ScatterSeriesData, ScatterSeriesType } from '@t/options';

interface ScatterChartProps {
  el: Element;
  options: ScatterChartOptions;
  data: ScatterSeriesData;
}

export default class ScatterChart extends Chart<ScatterChartOptions> {
  modules = [dataRange, scale, axes];

  constructor(props: ScatterChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        scatter: props.data.series as ScatterSeriesType[],
      },
      categories: props.data?.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(ScatterSeries);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([basicBrush, axisBrush, legendBrush, labelBrush, exportMenuBrush]);
  }
}
