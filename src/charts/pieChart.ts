import Chart from './chart';

import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import PieSeries from '@src/component/pieSeries';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as sectorBrush from '@src/brushes/sector';
import * as dataLabelBrush from '@src/brushes/dataLabel';

import { PieChartOptions, PieSeriesData } from '@t/options';

interface PieChartProps {
  el: Element;
  options: PieChartOptions;
  data: PieSeriesData;
}

export default class PieChart extends Chart<PieChartOptions> {
  constructor({ el, options, data }: PieChartProps) {
    super({
      el,
      options,
      series: {
        pie: data.series,
      },
      categories: data.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);
    this.componentManager.add(PieSeries);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      sectorBrush,
      dataLabelBrush,
    ]);
  }
}
