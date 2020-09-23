import Component from './component';
import { HeatmapChartOptions, Size } from '@t/options';
import { ChartState, HeatmapSeriesData, ScaleData, Theme } from '@t/store/store';
import {
  HeatmapRectModel,
  HeatmapRectModels,
  HeatmapRectResponderModel,
} from '@t/components/series';
import { hexToRGB } from '@src/helpers/color';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getColorRatio, getSpectrumColor, makeDistances, RGB } from '@src/helpers/colorSpectrum';
import { BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';
import { SeriesDataLabelType } from '@t/components/dataLabels';
import { isClickSameSeries } from '@src/helpers/responders';

export default class HeatmapSeries extends Component {
  models!: HeatmapRectModels;

  responders!: HeatmapRectResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'heatmap';
  }

  render(chartState: ChartState<HeatmapChartOptions>) {
    const { layout, heatmapSeries, axes, theme, colorValueScale, options } = chartState;

    if (!heatmapSeries.length) {
      throw new Error("There's no heatmap data");
    }

    this.selectable = this.getSelectableOption(options);
    this.rect = layout.plot;
    const cellSize = {
      height: axes.yAxis.tickDistance,
      width: axes.xAxis.tickDistance,
    };
    this.models = {
      series: this.renderHeatmapSeries(heatmapSeries, cellSize, theme, colorValueScale),
      selectedSeries: [],
    };

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.makeDataLabels());
    }

    this.responders = this.makeHeatmapSeriesResponder();
  }

  makeDataLabels(): SeriesDataLabelType {
    return this.models.series.map((m) => ({
      ...m,
      type: 'treemapSeriesName',
      value: m.colorValue,
      direction: 'left',
      plot: { x: 0, y: 0, size: 0 },
    }));
  }

  makeHeatmapSeriesResponder() {
    return this.models.series.map<HeatmapRectResponderModel>((model) => ({
      ...model,
      data: {
        ...model,
        label: model.name,
        value: model.colorValue,
      },
      thickness: BOX_HOVER_THICKNESS,
      style: ['shadow'],
    }));
  }

  renderHeatmapSeries(
    seriesData: HeatmapSeriesData[],
    cellSize: Size,
    theme: Theme,
    colorValueScale: ScaleData
  ): HeatmapRectModel[] {
    const { startColor, endColor } = theme.series;
    const startRGB = hexToRGB(startColor) as RGB;
    const distances = makeDistances(startRGB, hexToRGB(endColor) as RGB);
    const { height, width } = cellSize;

    return seriesData.flatMap((data) => {
      return data.flatMap((datum) => {
        const { indexes, colorValue, category } = datum;
        const name = `${category.x}, ${category.y}`;
        const [xIndex, yIndex] = indexes;

        const colorRatio = getColorRatio(colorValueScale.limit, colorValue)!;
        const thickness = 0; // @TODO: theme.series.borderWidth 로 처리되어 있음. 이후 개발 필요

        return {
          type: 'rect',
          name,
          width: width - thickness * 2,
          height: height - thickness * 2,
          x: width * xIndex + thickness,
          y: height * yIndex + thickness,
          colorValue,
          colorRatio,
          color: getSpectrumColor(colorRatio, distances, startRGB),
          thickness,
        };
      });
    });
  }

  onClick({ responders }: { responders: HeatmapRectResponderModel[] }) {
    let selectedSeries = responders;
    if (this.selectable) {
      if (isClickSameSeries<HeatmapRectResponderModel>(responders, this.models.selectedSeries)) {
        selectedSeries = [];
      }
      this.models.selectedSeries = selectedSeries as HeatmapRectResponderModel[];
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.emitMouseEvent([]);
  }

  onMousemove({ responders }) {
    this.activatedResponders = responders;
    this.emitMouseEvent(responders);
  }

  emitMouseEvent(responders: HeatmapRectResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('seriesPointHovered', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('renderSpectrumTooltip', responders);
    this.eventBus.emit('needDraw');
  }
}
