import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Legend from '@src/component/legend';
import RadarSeries from '@src/component/radarSeries';
import RadarPlot from '@src/component/radarPlot';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import Tooltip from '@src/component/tooltip';
import RadarAxis from '@src/component/radarAxis';

import * as basicBrushes from '@src/brushes/basic';
import * as tooltipBrush from '@src/brushes/tooltip';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as polygonBrush from '@src/brushes/polygon';
import * as lineSeriesBrushes from '@src/brushes/lineSeries';

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
    this.componentManager.add(RadarSeries);
    this.componentManager.add(RadarAxis);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(Tooltip);

    this.painter.addGroups([
      basicBrushes,
      tooltipBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      polygonBrush,
      lineSeriesBrushes,
    ]);
  }
}
