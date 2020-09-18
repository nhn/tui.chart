import Component from './component';
import { BaseOptions, Size } from '@t/options';
import { ChartState, HeatmapSeriesData, ScaleData, Theme } from '@t/store/store';
import { HeatmapRectModel, HeatmapRectResponderModel } from '@t/components/series';
import { hexToRGB } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getColorRatio, getSpectrumColor, makeDistances, RGB } from '@src/helpers/colorSpectrum';
import { BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';
import { SeriesDataLabelType } from '@t/components/dataLabels';

export default class HeatmapSeries extends Component {
  models: HeatmapRectModel[] = [];

  responders!: HeatmapRectResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'heatmap';
  }

  render(chartState: ChartState<BaseOptions>) {
    const { layout, heatmapSeries, axes, theme, colorValueScale, options } = chartState;

    if (!heatmapSeries.length) {
      throw new Error("There's no heatmap data");
    }

    this.rect = layout.plot;
    const cellSize = {
      height: axes.yAxis.tickDistance,
      width: axes.xAxis.tickDistance,
    };
    this.models = this.renderHeatmapSeries(heatmapSeries, cellSize, theme, colorValueScale);

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.makeDataLabels());
    }

    this.responders = this.makeHeatmapSeriesResponder();
  }

  makeDataLabels(): SeriesDataLabelType {
    return this.models.map((m) => ({
      ...m,
      type: 'treemapSeriesName',
      value: m.colorValue,
      direction: 'left',
      plot: { x: 0, y: 0, size: 0 },
    }));
  }

  makeHeatmapSeriesResponder() {
    const tooltipData = this.makeTooltipData();

    return this.models.map<HeatmapRectResponderModel>((model, idx) => ({
      ...model,
      data: tooltipData[idx],
      thickness: BOX_HOVER_THICKNESS,
      style: ['shadow'],
    }));
  }

  private makeTooltipData(): TooltipData[] {
    return this.models.map<TooltipData>((m) => ({
      ...m,
      label: m.name!,
      value: m.colorValue!,
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
