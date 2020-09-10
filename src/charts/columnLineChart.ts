import Chart from './chart';
import { ColumnLineData, ColumnLineChartOptions, Point } from '@t/options';
import { RawSeries } from '@t/store/store';
import stackSeriesData from '@src/store/stackSeriesData';
import dataLabels from '@src/store/dataLabels';
import plot from '@src/store/plot';
import axes from '@src/store/axes';
import scale from '@src/store/scale';
import dataRange from '@src/store/dataRange';
import Legend from '@src/component/legend';
import BoxStackSeries from '@src/component/boxStackSeries';
import BoxSeries from '@src/component/boxSeries';
import LineSeries from '@src/component/lineSeries';
import Plot from '@src/component/plot';
import Title from '@src/component/title';
import ZeroAxis from '@src/component/zeroAxis';
import Axis from '@src/component/axis';
import AxisTitle from '@src/component/axisTitle';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import Tooltip from '@src/component/tooltip';

import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as lineSeriesBrush from '@src/brushes/lineSeries';

import { isExist } from '@src/helpers/utils';
import { RespondersModel } from '@t/components/series';

interface ColumnLineChartProps {
  el: Element;
  options: ColumnLineChartOptions;
  data: ColumnLineData;
}

function hasPointEventType(respondersModel: RespondersModel, name: string) {
  return respondersModel.find(
    ({ component }) =>
      component.name === name && (component as BoxSeries | LineSeries).eventDetectType === 'point'
  );
}
function hasColumnLineUsingPointEventType(respondersModel: RespondersModel) {
  return (
    isExist(hasPointEventType(respondersModel, 'column')) &&
    isExist(hasPointEventType(respondersModel, 'line'))
  );
}

export default class ColumnLineChart extends Chart<ColumnLineChartOptions> {
  modules = [stackSeriesData, dataRange, scale, axes, plot, dataLabels];

  constructor({ el, options, data: { series, categories } }: ColumnLineChartProps) {
    super({
      el,
      options,
      series: series as RawSeries,
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(BoxStackSeries, { name: 'column' });
    this.componentManager.add(BoxSeries, { name: 'column' });
    this.componentManager.add(LineSeries);
    this.componentManager.add(ZeroAxis);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'secondaryYAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'secondaryYAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      lineSeriesBrush,
    ]);
  }

  handleEventForAllResponders(
    event: MouseEvent,
    responderModels: RespondersModel,
    delegationMethod: string,
    mousePosition: Point
  ) {
    if (hasColumnLineUsingPointEventType(responderModels)) {
      const columnSeries = responderModels.find(({ component }) => component.name === 'column')!;

      columnSeries.component[delegationMethod]({ mousePosition, responders: [] }, event);
    }
  }
}
