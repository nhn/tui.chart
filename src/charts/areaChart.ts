import Chart from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import AreaSeries from '@src/component/areaSeries';
import Axis from '@src/component/axis';
import * as lineSeriesBrushes from '@src/brushes/lineSeries';
import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';
import { AreaChartOptions, AreaSeriesData } from '@t/options';

interface AreaChartProps {
  el: Element;
  options: AreaChartOptions;
  data: AreaSeriesData;
}

export default class AreaChart extends Chart<AreaChartOptions> {
  constructor(props: AreaChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        area: props.data.series
      },
      categories: props.data.categories
    });
  }

  initialize() {
    super.initialize();

    this.store.setModule(dataRange);
    this.store.setModule(scale);
    this.store.setModule(axes);

    this.componentManager.add(Plot);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AreaSeries);
    this.componentManager.add(Tooltip);

    this.painter.addGroups([basicBrushes, axisBrushes, tooltipBrushes, lineSeriesBrushes]);
  }
}
