import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';
import Axis from '@src/component/axis';
import BulletSeries from '@src/component/bulletSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import { BulletChartOptions, BulletSeriesType, BulletSeriesData } from '@t/options';

export interface BulletChartProps {
  el: Element;
  options: BulletChartOptions;
  data: BulletSeriesData;
}

export default class BulletChart extends Chart<BulletChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor({ el, options, data: { series } }: BulletChartProps) {
    super({
      el,
      options,
      series: {
        bullet: series as BulletSeriesType[],
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BulletSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrushes,
      axisBrushes,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
    ]);
  }
}
