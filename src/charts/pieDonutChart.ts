import Chart from './chart';

import nestedPieSeriesData from '@src/store/nestedPieSeriesData';

import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import PieDonutSeries from '@src/component/pieDonutSeries';
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

import { PieDonutChartOptions, PieDonutSeriesData } from '@t/options';

interface PieDonutChartProps {
  el: Element;
  options: PieDonutChartOptions;
  data: PieDonutSeriesData;
}

export default class PieDonutChart extends Chart<PieDonutChartOptions> {
  modules = [nestedPieSeriesData];

  constructor({ el, options, data: { series, categories } }: PieDonutChartProps) {
    super({
      el,
      options,
      series: { pieDonut: series },
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);
    this.componentManager.add(PieDonutSeries);
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
