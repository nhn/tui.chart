import Chart from './chart';

import layout from '@src/store/layout';
import dataRange from '@src/store/dataRange';
import seriesData from '@src/store/seriesData';
import stackSeriesData, { pickStackOption } from '@src/store/stackSeriesData';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Axis from '@src/component/axis';
import BoxSeries from '@src/component/boxSeries';
import BoxStackSeries from '@src/component/boxStackSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as boxBrushes from '@src/brushes/boxSeries';
import * as plotBrushes from '@src/brushes/plot';
import * as tooltipBrushes from '@src/brushes/tooltip';

import { BarChartOptions, BoxSeriesData } from '@t/options';

interface BarChartProps {
  el: HTMLElement;
  options: BarChartOptions;
  data: BoxSeriesData;
}

export default class BarChart extends Chart<BarChartOptions> {
  constructor({ el, options, data }: BarChartProps) {
    super({
      el,
      options,
      series: {
        bar: data.series
      },
      categories: data.categories
    });
  }

  initialize() {
    const stackOption = pickStackOption(this.store.options);

    this.store.setModule(layout);
    this.store.setModule(seriesData);

    if (stackOption) {
      this.store.setModule(stackSeriesData);
    }

    this.store.setModule(dataRange);
    this.store.setModule(scale);
    this.store.setModule(axes);

    this.componentManager.add(Plot);
    this.componentManager.add(Axis, { name: 'yAxis' });

    if (stackOption) {
      this.componentManager.add(BoxStackSeries, { name: 'bar' });
    } else {
      this.componentManager.add(BoxSeries, { name: 'bar' });
    }

    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Tooltip);

    this.painter.addGroups([basicBrushes, plotBrushes, axisBrushes, boxBrushes, tooltipBrushes]);
  }
}
