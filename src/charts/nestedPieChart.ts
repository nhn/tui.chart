import Chart, { AddSeriesDataInfo } from './chart';

import nestedPieSeriesData from '@src/store/nestedPieSeriesData';

import Tooltip from '@src/component/tooltip';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as sectorBrush from '@src/brushes/sector';
import * as dataLabelBrush from '@src/brushes/dataLabel';

import { NestedPieChartOptions, NestedPieSeriesData, NestedPieSeriesType } from '@t/options';
import PieSeries from '@src/component/pieSeries';

export interface NestedPieChartProps {
  el: HTMLElement;
  options: NestedPieChartOptions;
  data: NestedPieSeriesData;
}

export default class NestedPieChart extends Chart<NestedPieChartOptions> {
  modules = [nestedPieSeriesData];

  constructor({ el, options, data: { series, categories } }: NestedPieChartProps) {
    super({
      el,
      options,
      series: { pie: series },
      categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Legend);

    (this.store.initStoreState.series.pie ?? []).forEach(({ name }) => {
      this.componentManager.add(PieSeries, { alias: name });
    });

    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
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

  public addSeries(data: NestedPieSeriesType, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addSeries', { data, ...dataInfo });
    this.componentManager.add(PieSeries, { alias: data.name });
  }

  public setData(data: NestedPieSeriesData) {
    this.componentManager.remove(PieSeries);
    this.store.dispatch('setData', { series: { pie: data.series } });

    (this.store.initStoreState.series.pie ?? []).forEach(({ name }) => {
      this.componentManager.add(PieSeries, { alias: name });
    });
  }

  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

  public setOptions = (options: NestedPieChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  public updateOptions = (options: NestedPieChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };
}
