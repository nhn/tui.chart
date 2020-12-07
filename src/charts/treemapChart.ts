import Chart, { AddSeriesDataInfo } from './chart';

import colorValueScale from '@src/store/colorValueScale';
import treemapSeriesData from '@src/store/treemapSeriesData';

import Tooltip from '@src/component/tooltip';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import TreemapSeries from '@src/component/treemapSeries';
import SpectrumLegend from '@src/component/spectrumLegend';
import BackButton from '@src/component/backButton';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as spectrumLegendBrush from '@src/brushes/spectrumLegend';
import * as resetButtonBrush from '@src/brushes/resetButton';

import { TreemapChartOptions, TreemapSeriesData, TreemapSeriesType } from '@t/options';

export interface TreemapChartProps {
  el: Element;
  options: TreemapChartOptions;
  data: TreemapSeriesData;
}

export default class TreemapChart extends Chart<TreemapChartOptions> {
  modules = [treemapSeriesData, colorValueScale];

  constructor(props: TreemapChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        treemap: props.data.series as TreemapSeriesType[],
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(SpectrumLegend);
    this.componentManager.add(TreemapSeries);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });
    this.componentManager.add(BackButton);

    this.painter.addGroups([
      basicBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      spectrumLegendBrush,
      resetButtonBrush,
    ]);
  }

  public addSeries(data: TreemapSeriesType, dataInfo?: AddSeriesDataInfo) {
    this.store.dispatch('addTreemapSeries', { data, ...dataInfo });
  }

  public setData(data: TreemapSeriesData) {
    this.store.dispatch('setData', { series: { treemap: data.series } });
  }

  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

  public setOptions = (options: TreemapChartOptions) => {
    this.setResizeEventListeners(options);
    this.store.dispatch('initOptions', options);
  };

  public updateOptions = (options: TreemapChartOptions) => {
    this.setResizeEventListeners(options);
    this.store.dispatch('updateOptions', options);
  };
}
