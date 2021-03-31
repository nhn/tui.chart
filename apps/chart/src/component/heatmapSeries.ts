import Component from './component';
import { HeatmapChartOptions, Size } from '@t/options';
import { ChartState, HeatmapSeriesData, ScaleData } from '@t/store/store';
import {
  HeatmapRectModel,
  HeatmapRectModels,
  HeatmapRectResponderModel,
} from '@t/components/series';
import { hexToRGB } from '@src/helpers/color';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getColorRatio, getSpectrumColor, makeDistances, RGB } from '@src/helpers/colorSpectrum';
import { SeriesDataLabels } from '@t/components/dataLabels';
import { RespondersThemeType } from '@src/helpers/responders';
import { deepMergedCopy, isNull, isNumber } from '@src/helpers/utils';
import { HeatmapChartSeriesTheme } from '@t/theme';
import { boxDefault } from '@src/helpers/theme';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';

export default class HeatmapSeries extends Component {
  models!: HeatmapRectModels;

  responders!: HeatmapRectResponderModel[];

  theme!: Required<HeatmapChartSeriesTheme>;

  activatedResponders: HeatmapRectResponderModel[] = [];

  initialize() {
    this.type = 'series';
    this.name = 'heatmap';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  render(chartState: ChartState<HeatmapChartOptions>) {
    const { layout, heatmapSeries, axes, theme, colorValueScale, options } = chartState;

    if (!heatmapSeries) {
      throw new Error(message.noDataError(this.name));
    }

    this.theme = theme.series.heatmap as Required<HeatmapChartSeriesTheme>;
    this.selectable = this.getSelectableOption(options);
    this.rect = layout.plot;
    const cellSize = {
      height: axes.yAxis.tickDistance,
      width: axes.xAxis.tickDistance,
    };
    this.models = {
      series: this.renderHeatmapSeries(heatmapSeries, cellSize, colorValueScale),
    };

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.makeDataLabels());
    }

    this.responders = this.makeHeatmapSeriesResponder();
  }

  makeDataLabels(): SeriesDataLabels {
    const dataLabelTheme = this.theme.dataLabels;

    return this.models.series.reduce<SeriesDataLabels>((acc, m) => {
      return isNull(m.colorValue)
        ? acc
        : [
            ...acc,
            {
              ...m,
              type: 'treemapSeriesName',
              value: m.colorValue,
              direction: 'left',
              plot: { x: 0, y: 0, size: 0 },
              theme: {
                ...dataLabelTheme,
                color: dataLabelTheme.useSeriesColor ? m.color : dataLabelTheme.color,
              },
            },
          ];
    }, []);
  }

  makeHeatmapSeriesResponder() {
    return this.models.series.reduce<HeatmapRectResponderModel[]>((acc, model) => {
      return isNull(model.colorValue)
        ? acc
        : [
            ...acc,
            {
              ...model,
              data: {
                ...model,
                label: model.name,
                value: model.colorValue,
                templateType: 'heatmap',
              },
              thickness: boxDefault.HOVER_THICKNESS,
              style: ['shadow'],
            },
          ];
    }, []);
  }

  renderHeatmapSeries(
    seriesData: HeatmapSeriesData[],
    cellSize: Size,
    colorValueScale: ScaleData
  ): HeatmapRectModel[] {
    const { startColor, endColor, borderColor, borderWidth } = this.theme;
    const startRGB = hexToRGB(startColor) as RGB;
    const distances = makeDistances(startRGB, hexToRGB(endColor) as RGB);
    const { height, width } = cellSize;

    return seriesData.flatMap((data) => {
      return data.flatMap((datum) => {
        const { indexes, colorValue, category } = datum;
        const name = `${category.x}, ${category.y}`;
        const [xIndex, yIndex] = indexes;

        const colorRatio = getColorRatio(colorValueScale.limit, colorValue)!;
        const color = isNull(colorValue)
          ? 'rgba(0, 0, 0, 0)'
          : getSpectrumColor(colorRatio, distances, startRGB);
        const thickness = borderWidth;

        return {
          type: 'rect',
          name,
          width: width - thickness * 2,
          height: height - thickness * 2,
          x: width * xIndex + thickness,
          y: height * yIndex + thickness,
          colorValue,
          colorRatio,
          color,
          thickness,
          borderColor,
        };
      });
    });
  }

  getRespondersWithTheme(responders: HeatmapRectResponderModel[], type: RespondersThemeType) {
    return responders.map((responder) =>
      deepMergedCopy(responder, { ...this.theme[type], style: ['shadow'] })
    );
  }

  onClick({ responders }: { responders: HeatmapRectResponderModel[] }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: this.getRespondersWithTheme(responders, 'select'),
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent = () => {
    this.emitMouseEvent([]);
  };

  onMousemove({ responders }) {
    this.activatedResponders = responders;
    this.emitMouseEvent(responders);
  }

  emitMouseEvent(responders: HeatmapRectResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme(responders, 'hover'),
      name: this.name,
    });
    this.eventBus.emit('seriesPointHovered', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('renderSpectrumTooltip', responders);
    this.eventBus.emit('needDraw');
  }

  selectSeries = ({
    index,
    seriesIndex,
    state,
  }: SelectSeriesHandlerParams<HeatmapChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const dataSize = state.series.heatmap?.[0].data.length;
    const responderIndex = seriesIndex * dataSize + index;
    const model = this.responders[responderIndex];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme([model], 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ index, seriesIndex, state }: SelectSeriesHandlerParams<HeatmapChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const dataSize = state.series.heatmap?.[0].data.length;
    const responderIndex = seriesIndex * dataSize + index;
    const model = this.responders[responderIndex];

    if (model) {
      this.emitMouseEvent([model]);
    }
  };
}
