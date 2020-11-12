import {
  LegendIconType,
  Options,
  RawSeries,
  StoreModule,
  ChartType,
  Series,
  Legend,
  CircleLegend,
} from '@t/store/store';
import { Align, BubbleChartOptions, TreemapChartSeriesOptions } from '@t/options';
import { isUndefined, sum, includes, deepMergedCopy } from '@src/helpers/utils';
import {
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_ITEM_MARGIN_X,
  LEGEND_MARGIN_X,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';
import { isVerticalAlign, padding } from '@src/store/layout';
import { spectrumLegendBar, spectrumLegendTooltip } from '@src/brushes/spectrumLegend';
import { hasNestedPieSeries } from '@src/helpers/pieSeries';
import { extend } from '@src/store/store';
import { getTitleFontString } from '@src/helpers/style';
import { defaultTheme } from '@src/helpers/theme';

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
    legendWidth = Math.max(getInitialWidth(options) / 4, labelAreaWidth);
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

function showLegend(options: Options, series: Series | RawSeries) {
  if (series.treemap && !(options.series as TreemapChartSeriesOptions)?.useColorValue) {
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

function getItemWidth(
  label: string,
  checkboxVisible: boolean,
  useSpectrumLegend: boolean,
  font: string
) {
  return (
    (useSpectrumLegend
      ? 0
      : (checkboxVisible ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
        LEGEND_ICON_SIZE +
        LEGEND_MARGIN_X) + getTextWidth(label, font)
  );
}

function getInitialWidth(options: Options) {
  return options.chart?.width ?? 0;
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options, series }) => {
    const checkboxVisible = showCheckbox(options);
    const useSpectrumLegend =
      (options?.series as TreemapChartSeriesOptions)?.useColorValue ?? !!series.heatmap;
    const useScatterChartIcon = !!series?.scatter;
    const font = getTitleFontString(
      deepMergedCopy(defaultTheme.legend.label, { ...options.theme?.legend?.label })
    );

    const legendLabels = hasNestedPieSeries(series)
      ? getNestedPieLegendLabels(series)
      : getLegendLabels(series);

    const data = legendLabels.map(({ label, type }) => ({
      label,
      active: true,
      checked: true,
      width: getItemWidth(label, checkboxVisible, useSpectrumLegend, font),
      iconType: getIconType(type),
      chartType: type,
    }));

    return {
      legend: { useSpectrumLegend, data, useScatterChartIcon } as Legend,
      circleLegend: {} as CircleLegend,
    };
  },
  action: {
    setLegendLayout({ state }) {
      const { legend: legendData, series, options } = state;

      const align = getAlign(options);
      const visible = showLegend(options, series);
      const checkboxVisible = showCheckbox(options);
      const initialWidth = Math.min(getInitialWidth(options) / 10, 150);
      const legendWidths = legendData.data.map(({ width }) => width);
      const legendWidth = calculateLegendWidth(initialWidth, legendWidths, options, align, visible);

      const circleLegendWidth = isVerticalAlign(align)
        ? initialWidth
        : Math.max(initialWidth, legendWidth);
      const circleLegendVisible = series.bubble
        ? showCircleLegend(options as BubbleChartOptions)
        : false;

      extend(state.legend, {
        visible,
        align,
        showCheckbox: checkboxVisible,
        width: legendWidth,
      });

      extend(state.circleLegend, {
        visible: circleLegendVisible,
        width: circleLegendVisible ? circleLegendWidth : 0,
        radius: circleLegendVisible ? Math.max((circleLegendWidth - LEGEND_MARGIN_X) / 2, 0) : 0,
      });
    },
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

  observe: {
    updateLegendLayout() {
      this.dispatch('setLegendLayout');
    },
  },
};

export default legend;
