import Chart from './chart';

import nestedPieSeriesData from '@src/store/nestedPieSeriesData';

import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import NestedPieSeries from '@src/component/NestedPieSeries';
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

import { NestedPieChartOptions, NestedPieSeriesData } from '@t/options';

interface NestedPieChartProps {
  el: Element;
  options: NestedPieChartOptions;
  data: NestedPieSeriesData;
}

export default class NestedPieChart extends Chart<NestedPieChartOptions> {
  modules = [nestedPieSeriesData];

  constructor({ el, options, data: { series, categories } }: NestedPieChartProps) {
    super({
      el,
      options,
      series: { nestedPie: series },
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);
    this.componentManager.add(NestedPieSeries);
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
