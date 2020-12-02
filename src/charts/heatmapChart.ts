import Chart, { AddSeriesDataInfo } from './chart';

import heatmapAxes from '@src/store/heatmapAxes';
import heatmapSeriesData from '@src/store/heatmapSeriesData';
import colorValueScale from '@src/store/colorValueScale';

import Tooltip from '@src/component/tooltip';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import DataLabels from '@src/component/dataLabels';
import SpectrumLegend from '@src/component/spectrumLegend';
import HeatmapSeries from '@src/component/heatmapSeries';
import AxisTitle from '@src/component/axisTitle';
import Axis from '@src/component/axis';
import SelectedSeries from '@src/component/selectedSeries';

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as spectrumLegendBrush from '@src/brushes/spectrumLegend';
import * as axisBrush from '@src/brushes/axis';

import {
  HeatmapCategoriesType,
  HeatmapChartOptions,
  HeatmapSeriesData,
  HeatmapSeriesDataType,
} from '@t/options';

export interface HeatmapChartProps {
  el: Element;
  options: HeatmapChartOptions;
  data: HeatmapSeriesData;
}

function getSeriesWithYCategory(
  series: HeatmapSeriesDataType[],
  categories: HeatmapCategoriesType
) {
  return series
    .map((rowSeries, y) => ({
      data: rowSeries,
      yCategory: categories.y[y],
    }))
    .reverse();
}

export default class HeatmapChart extends Chart<HeatmapChartOptions> {
  modules = [heatmapSeriesData, colorValueScale, heatmapAxes];

  constructor(props: HeatmapChartProps) {
    super({
      el: props.el,
      categories: props.data.categories as HeatmapCategoriesType,
      options: props.options,
      series: {
        heatmap: getSeriesWithYCategory(props.data.series, props.data.categories),
      },
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(SpectrumLegend);
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HeatmapSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(DataLabels);
    this.componentManager.add(Tooltip, { chartEl: this.el });

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      spectrumLegendBrush,
    ]);
  }

  public addData = (data: HeatmapSeriesDataType, category: string) => {
    this.animationControlFlag.updating = true;
    this.store.dispatch('addData', { data, category });
  };

  public addSeries = (data: HeatmapSeriesDataType, dataInfo: AddSeriesDataInfo) => {
    this.store.dispatch('addHeatmapSeries', { data, ...dataInfo });
  };
}
