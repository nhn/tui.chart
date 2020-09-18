import Chart from './chart';

import axes from '@src/store/axes';
import heatmapSeriesData from '@src/store/heatmapSeriesData';
import dataLabels from '@src/store/dataLabels';
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

import * as basicBrush from '@src/brushes/basic';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as spectrumLegendBrush from '@src/brushes/spectrumLegend';
import * as axisBrush from '@src/brushes/axis';

import {
  BaseOptions,
  HeatmapCategoriesType,
  HeatmapSeriesData,
  HeatmapSeriesDataType,
} from '@t/options';

interface HeatmapChartProps {
  el: Element;
  options: BaseOptions;
  data: HeatmapSeriesData;
}

export default class HeatmapChart extends Chart<BaseOptions> {
  modules = [heatmapSeriesData, colorValueScale, axes, dataLabels];

  constructor(props: HeatmapChartProps) {
    super({
      el: props.el,
      categories: props.data.categories as HeatmapCategoriesType,
      options: props.options,
      series: {
        heatmap: props.data.series as HeatmapSeriesDataType[],
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
    this.componentManager.add(DataLabels);
    this.componentManager.add(HoveredSeries);
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
}
