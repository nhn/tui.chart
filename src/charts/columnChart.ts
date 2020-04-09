import Chart from './chart';

import seriesData from '@src/store/seriesData';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Axis from '@src/component/axis';
import BoxSeries from '@src/component/boxSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as boxBrushes from '@src/brushes/boxSeries';
import * as plotBrushes from '@src/brushes/plot';
import * as tooltipBrushes from '@src/brushes/tooltip';

import { ColumnChartOptions, BoxSeriesData } from '@t/options';

interface BarChartProps {
  el: HTMLElement;
  options: ColumnChartOptions;
  data: BoxSeriesData;
}

export default class BarChart extends Chart<ColumnChartOptions> {
  constructor({ el, options, data }: BarChartProps) {
    super({
      el,
      options,
      series: {
        column: data.series
      },
      categories: data.categories
    });
  }

  initialize() {
    super.initialize();

    this.store.setModule(seriesData);
    this.store.setModule(scale);
    this.store.setModule(axes);

    this.componentManager.add(Plot);
    this.componentManager.add(BoxSeries, { name: 'column' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Tooltip);

    this.painter.addGroups([basicBrushes, plotBrushes, axisBrushes, boxBrushes, tooltipBrushes]);
  }
}
