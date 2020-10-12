import { LegendIconType, Options, RawSeries, StoreModule, ChartType, Series } from '@t/store/store';
import { Align, BubbleChartOptions, TreemapChartSeriesOptions } from '@t/options';
import { isUndefined, sum, includes } from '@src/helpers/utils';
import {
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_ITEM_MARGIN_X,
  LEGEND_LABEL_FONT,
  LEGEND_MARGIN_X,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';
import { isVerticalAlign, padding } from '@src/store/layout';
import { spectrumLegendBar, spectrumLegendTooltip } from '@src/brushes/spectrumLegend';
import { calibrateBoxStackDrawingValue } from '@src/helpers/boxSeriesCalculator';

type LegendLabels = {
  label: string;
  type: ChartType;
}[];

function calculateLegendWidth(
  defaultWidth: number,
  legendWidths: number[],
  options: Options,
  align: Align,
  visible: boolean
) {
  const verticalAlign = isVerticalAlign(align);
  const legendOptions = options?.legend;
  const useColorValue = (options?.series as TreemapChartSeriesOptions)?.useColorValue ?? false;
  let legendWidth = defaultWidth;

  if (!visible) {
    return 0;
  }

  if (legendOptions?.width) {
    return legendOptions.width;
  }

  if (useColorValue && verticalAlign) {
    const labelAreaWidth = sum(legendWidths);
    legendWidth = Math.max(options.chart!.width / 4, labelAreaWidth);
  } else if (useColorValue && !verticalAlign) {
    const spectrumAreaWidth =
      spectrumLegendTooltip.PADDING * 2 +
      spectrumLegendBar.PADDING * 2 +
      spectrumLegendTooltip.POINT_HEIGHT +
      spectrumLegendBar.HEIGHT +
      padding.X * 2;

    legendWidth = Math.max(...legendWidths) + spectrumAreaWidth;
  } else if (!useColorValue && verticalAlign) {
    legendWidth = sum(legendWidths) + LEGEND_ITEM_MARGIN_X * (legendWidths.length - 1);
  } else {
    const labelAreaWidth = Math.max(...legendWidths);
    legendWidth = Math.max(labelAreaWidth, legendWidth);
  }

  return legendWidth;
}

export function showCircleLegend(options: BubbleChartOptions) {
  return isUndefined(options?.circleLegend?.visible) ? true : !!options?.circleLegend?.visible;
}

function showLegend(options: Options, series: RawSeries) {
  if (series.treemap && !(options.series as TreemapChartSeriesOptions).useColorValue) {
    return false;
  }

  return isUndefined(options.legend?.visible) ? true : !!options.legend?.visible;
}

function showCheckbox(options: Options) {
  return isUndefined(options.legend?.showCheckbox) ? true : !!options.legend?.showCheckbox;
}

function getNestedPieLegendLabels(series: RawSeries) {
  const result: LegendLabels = [];

  series.pie!.forEach(({ data }) => {
    data.forEach(({ name, parentName }) => {
      if (!parentName) {
        result.push({
          label: name,
          type: 'pie',
        });
      }
    });
  });

  return result;
}

function getLegendLabels(series: RawSeries): LegendLabels {
  return Object.keys(series).flatMap((type) =>
    series[type].map(({ name, colorValue }) => ({
      label: colorValue ? colorValue : name,
      type,
    }))
  );
}

function useRectIcon(type: ChartType) {
  return includes(['bar', 'column', 'area', 'pie', 'boxPlot', 'bullet'], type);
}

function useCircleIcon(type: ChartType) {
  return includes(['bubble', 'scatter'], type);
}

function useLineIcon(type: ChartType) {
  return includes(['line', 'radar'], type);
}

function getIconType(type: ChartType): LegendIconType {
  let iconType: LegendIconType = 'spectrum';

  if (useCircleIcon(type)) {
    iconType = 'circle';
  } else if (useRectIcon(type)) {
    iconType = 'rect';
  } else if (useLineIcon(type)) {
    iconType = 'line';
  }

  return iconType;
}

function getAlign(options: Options) {
  return isUndefined(options.legend?.align) ? 'right' : (options.legend?.align as Align);
}

function getItemWidth(label: string, checkboxVisible: boolean, useSpectrumLegend: boolean) {
  return (
    (useSpectrumLegend
      ? 0
      : (checkboxVisible ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
        LEGEND_ICON_SIZE +
        LEGEND_MARGIN_X) + getTextWidth(label, LEGEND_LABEL_FONT)
  );
}

function hasNestedPieSeries(series: RawSeries) {
  return series.pie && Array.isArray(series.pie[0].data);
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options, series }) => {
    const align = getAlign(options);
    const visible = showLegend(options, series);
    const checkboxVisible = showCheckbox(options);
    const useSpectrumLegend =
      (options?.series as TreemapChartSeriesOptions)?.useColorValue ?? !!series.heatmap;

    const defaultWidth = Math.min(options.chart!.width / 10, 150);
    const legendLabels = hasNestedPieSeries(series)
      ? getNestedPieLegendLabels(series)
      : getLegendLabels(series);
    const data = legendLabels.map(({ label, type }) => ({
      label,
      active: true,
      checked: true,
      width: getItemWidth(label, checkboxVisible, useSpectrumLegend),
      iconType: getIconType(type),
    }));

    const legendWidths = data.map(({ width }) => width);
    const legendWidth = calculateLegendWidth(defaultWidth, legendWidths, options, align, visible);

    const circleLegendWidth = isVerticalAlign(align)
      ? defaultWidth
      : Math.max(defaultWidth, legendWidth);
    const circleLegendVisible = series.bubble
      ? showCircleLegend(options as BubbleChartOptions)
      : false;

    return {
      legend: {
        visible,
        useSpectrumLegend,
        showCheckbox: checkboxVisible,
        data,
        align,
        width: legendWidth,
      },
      circleLegend: {
        visible: circleLegendVisible,
        width: circleLegendVisible ? circleLegendWidth : 0,
        radius: circleLegendVisible ? (circleLegendWidth - LEGEND_MARGIN_X) / 2 : 0,
      },
    };
  },
  action: {
    setLegendActiveState({ state }, { name, active }) {
      const { data } = state.legend;
      const model = data.find(({ label }) => label === name)!;
      model.active = active;
      this.notify(state, 'legend');
    },
    setAllLegendActiveState({ state }, active: boolean) {
      state.legend.data.forEach((datum) => {
        datum.active = active;
      });
      this.notify(state, 'legend');
    },
    setLegendCheckedState({ state }, { name, checked }) {
      const model = state.legend.data.find(({ label }) => label === name)!;
      model.checked = checked;
      this.notify(state, 'legend');
    },
  },
};

export default legend;
