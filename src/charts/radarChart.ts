import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Legend from '@src/component/legend';
import RadarSeries from '@src/component/radarSeries';
import RadarPlot from '@src/component/radarPlot';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import SelectedSeries from '@src/component/selectedSeries';
import HoveredSeries from '@src/component/hoveredSeries';
import Tooltip from '@src/component/tooltip';
import RadialAxis from '@src/component/radialAxis';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as polygonBrush from '@src/brushes/polygon';
import * as axisBrush from '@src/brushes/axis';

import { RadarChartOptions, RadarSeriesData } from '@t/options';

interface RadarChartProps {
  el: Element;
  options: RadarChartOptions;
  data: RadarSeriesData;
}

export default class RadarChart extends Chart<RadarChartOptions> {
  modules = [dataRange, scale, axes];

  constructor({ el, options, data }: RadarChartProps) {
    super({
      el,
      options,
      series: {
        radar: data.series,
      },
      categories: data.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);
    this.componentManager.add(RadarPlot);
    this.componentManager.add(RadialAxis);
    this.componentManager.add(RadarSeries);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      polygonBrush,
      axisBrush,
    ]);
  }
}
