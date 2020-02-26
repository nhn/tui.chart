import Chart, { ChartSetting } from './chart';

import seriesData from '@src/seriesData';
import scale from '@src/scale';
import axes from '@src/axes';
import tooltip from '@src/component/tooltip';

import LineSeries from '@src/component/lineSeries';
import Axis from '@src/component/axis';

import * as basicBrushes from '@src/brushes/basic';
import * as lineBrushes from '@src/brushes/lineSeries';
import * as axisBrushes from '@src/brushes/axis';
import * as tooltipBrushes from '@src/brushes/tooltip';

// 생성자를 따로 두기보다는 팩토리로 구현하는게 나을것 같다.

export default class LineChart extends Chart {
  constructor(settings: ChartSetting) {
    const lineSeries = settings.data.series;

    delete settings.data.series;

    settings.data.series = {
      line: lineSeries
    };

    super(settings);
  }

  initialize() {
    super.initialize();

    this.store.setModule(seriesData);
    this.store.setModule(scale);
    this.store.setModule(axes);

    this.componentManager.add(LineSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(tooltip);

    this.painter.addGroups([basicBrushes, lineBrushes, axisBrushes, tooltipBrushes]);
  }
}
