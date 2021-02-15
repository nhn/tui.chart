import {
  LegendIconType,
  Options,
  RawSeries,
  StoreModule,
  ChartType,
  Series,
  Legend,
  CircleLegend,
  LegendDataList,
} from '@t/store/store';
import { Align, BubbleChartOptions, Size, TreemapChartSeriesOptions } from '@t/options';
import { isUndefined, sum, includes, deepMergedCopy, range } from '@src/helpers/utils';

import {
  getLegendItemHeight,
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
import { makeDefaultTheme } from '@src/helpers/theme';

type LegendLabels = {
  label: string;
  type: ChartType;
}[];

type LegendSizeParam = {
  initialWidth: number;
  legendWidths: number[];
  useSpectrumLegend: boolean;
  options: Options;
  verticalAlign: boolean;
  visible: boolean;
  checkbox: boolean;
  itemHeight: number;
  circleLegendVisible: boolean;
  chart: Size;
};

const INITIAL_LEGEND_WIDTH = 100;
const INITIAL_CIRCLE_LEGEND_WIDTH = 150;

function recalculateLegendWhenHeightOverflows(params: LegendSizeParam, legendHeight: number) {
  const { legendWidths, itemHeight } = params;
  const totalHeight = legendWidths.length * itemHeight;
  const columnCount = Math.ceil(totalHeight / legendHeight);
  const rowCount = legendWidths.length / columnCount;
  let legendWidth = 0;

  range(0, columnCount).forEach((count) => {
    legendWidth += Math.max(...legendWidths.slice(count * rowCount, (count + 1) * rowCount));
  });

  legendWidth += LEGEND_ITEM_MARGIN_X * (columnCount - 1);

  return { legendWidth, legendHeight: rowCount * itemHeight + padding.Y, columnCount, rowCount };
}

function recalculateLegendWhenWidthOverflows(params: LegendSizeParam, prevLegendWidth: number) {
  const { legendWidths, itemHeight } = params;
  let columnCount = 0;
  let legendWidth = 0;

  const { rowCount } = legendWidths.reduce(
    (acc, width) => {
      const widthWithMargin = LEGEND_ITEM_MARGIN_X + width;

      if (acc.totalWidth + width > prevLegendWidth) {
        acc.totalWidth = widthWithMargin;
        acc.rowCount += 1;
        acc.columnCount = 1;
        columnCount = Math.max(columnCount, acc.columnCount);
      } else {
        acc.totalWidth += widthWithMargin;
        acc.columnCount += 1;
      }

      legendWidth = Math.max(legendWidth, acc.totalWidth);

      return acc;
    },
    { totalWidth: 0, rowCount: 1, columnCount: 0 }
  );

  return { legendHeight: itemHeight * rowCount, rowCount, columnCount, legendWidth };
}

function calculateLegendSize(params: LegendSizeParam) {
  if (!params.visible) {
    return { legendWidth: 0, legendHeight: 0, rowCount: 0, columnCount: 0 };
  }

  const { chart, verticalAlign, legendWidths } = params;
  const { legendWidth, isOverflow: widthOverflow } = calculateLegendWidth(params);
  const { legendHeight, isOverflow: heightOverflow } = calculateLegendHeight(params);
  const columnCount = verticalAlign ? legendWidths.length : 1;
  const rowCount = verticalAlign ? Math.ceil(legendWidth / chart.width) : legendWidths.length;

  if (widthOverflow) {
    return recalculateLegendWhenWidthOverflows(params, legendWidth / rowCount);
  }

  if (heightOverflow) {
    return recalculateLegendWhenHeightOverflows(params, legendHeight);
  }

  return { legendWidth, legendHeight, columnCount, rowCount };
}

function calculateLegendHeight(params: LegendSizeParam) {
  const { verticalAlign, itemHeight, legendWidths } = params;
  const { height: chartHeight } = getDefaultLegendSize(params);
  let legendHeight;
  let isOverflow = false;

  if (verticalAlign) {
    legendHeight = chartHeight;
  } else {
    const totalHeight = legendWidths.length * (padding.Y + itemHeight);
    isOverflow = chartHeight < totalHeight;
    legendHeight = isOverflow ? chartHeight : totalHeight;
  }

  return { legendHeight, isOverflow };
}

function getSpectrumLegendWidth(params: LegendSizeParam, verticalAlign: boolean) {
  const { legendWidths, chart } = params;
  let legendWidth;

  if (verticalAlign) {
    const labelAreaWidth = sum(legendWidths);

    legendWidth = Math.max(chart.width / 4, labelAreaWidth);
  } else {
    const spectrumAreaWidth =
      spectrumLegendTooltip.PADDING * 2 +
      spectrumLegendBar.PADDING * 2 +
      spectrumLegendTooltip.POINT_HEIGHT +
      spectrumLegendBar.HEIGHT +
      padding.X * 2;

    legendWidth = Math.max(...legendWidths) + spectrumAreaWidth;
  }

  return { isOverflow: false, legendWidth };
}

function getNormalLegendWidth(params: LegendSizeParam, verticalAlign: boolean) {
  const { initialWidth, legendWidths, checkbox } = params;
  let isOverflow = false;
  let legendWidth;

  if (verticalAlign) {
    const { width: chartWidth } = getDefaultLegendSize(params);
    const totalWidth = sum(legendWidths) + LEGEND_ITEM_MARGIN_X * (legendWidths.length - 1);
    isOverflow = totalWidth > chartWidth;
    legendWidth = totalWidth;
  } else {
    const labelAreaWidth = Math.max(...legendWidths);

    legendWidth =
      (checkbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
      LEGEND_ICON_SIZE +
      LEGEND_MARGIN_X +
      Math.max(labelAreaWidth, initialWidth);
  }

  return { legendWidth, isOverflow };
}

function calculateLegendWidth(params: LegendSizeParam) {
  const { useSpectrumLegend, options, verticalAlign, visible } = params;
  const legendOptions = options?.legend;

  if (!visible) {
    return { legendWidth: 0, isOverflow: false };
  }

  if (legendOptions?.width) {
    return { legendWidth: legendOptions.width, isOverflow: false };
  }

  return useSpectrumLegend
    ? getSpectrumLegendWidth(params, verticalAlign)
    : getNormalLegendWidth(params, verticalAlign);
}

function getDefaultLegendSize(params: LegendSizeParam) {
  const { verticalAlign, chart, itemHeight, initialWidth, circleLegendVisible } = params;
  const COMPONENT_HEIGHT_EXCEPT_Y_AXIS = 100;
  const restAreaHeight =
    COMPONENT_HEIGHT_EXCEPT_Y_AXIS + (circleLegendVisible ? INITIAL_CIRCLE_LEGEND_WIDTH : 0); // rest area temporary value (yAxisTitle.height + xAxis.height + circleLegend.height)

  return verticalAlign
    ? { width: chart.width - padding.X * 2, height: itemHeight }
    : {
        width: initialWidth,
        height: chart.height - restAreaHeight,
      };
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

function getLegendDataAppliedTheme(data: LegendDataList, series: Series) {
  const colors = Object.values(series).reduce<string[]>(
    (acc, cur) => (cur && cur.colors ? [...acc, ...cur.colors] : acc),
    []
  );

  return data.map((datum, idx) => ({
    ...datum,
    color: colors[idx],
  }));
}

function getLegendState(options: Options, series: RawSeries): Legend {
  const checkboxVisible = showCheckbox(options);
  const useSpectrumLegend =
    (options?.series as TreemapChartSeriesOptions)?.useColorValue ?? !!series.heatmap;
  const useScatterChartIcon = !!series?.scatter;
  const defaultTheme = makeDefaultTheme(options?.theme?.chart?.fontFamily);
  const font = getTitleFontString(
    deepMergedCopy(defaultTheme.legend.label!, { ...options.theme?.legend?.label })
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
    rowIndex: 0,
    columnIndex: 0,
  }));

  return {
    useSpectrumLegend,
    useScatterChartIcon,
    data,
  } as Legend;
}

function getNextColumnRowIndex(params: {
  rowCount: number;
  columnCount: number;
  verticalAlign: boolean;
  legendCount: number;
  rowIndex: number;
  columnIndex: number;
}) {
  const { verticalAlign, columnCount, rowCount, legendCount } = params;
  let { rowIndex, columnIndex } = params;

  if (verticalAlign) {
    const maxLen = legendCount / rowCount;
    if (maxLen - 1 > columnIndex) {
      columnIndex += 1;
    } else {
      rowIndex += 1;
      columnIndex = 0;
    }
  } else {
    const maxLen = legendCount / columnCount;
    if (maxLen - 1 > rowIndex) {
      rowIndex += 1;
    } else {
      columnIndex += 1;
      rowIndex = 0;
    }
  }

  return [rowIndex, columnIndex];
}

function setIndexToLegendData(
  legendData: LegendDataList,
  rowCount: number,
  columnCount: number,
  legendCount: number,
  verticalAlign: boolean
) {
  let columnIndex = 0;
  let rowIndex = 0;

  legendData.forEach((datum) => {
    datum.rowIndex = rowIndex;
    datum.columnIndex = columnIndex;

    [rowIndex, columnIndex] = getNextColumnRowIndex({
      rowCount,
      columnCount,
      verticalAlign,
      legendCount,
      rowIndex,
      columnIndex,
    });
  });
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options, series }) => {
    return {
      legend: getLegendState(options, series) as Legend,
      circleLegend: {} as CircleLegend,
    };
  },
  action: {
    initLegendState({ state, initStoreState }) {
      extend(state.legend, getLegendState(initStoreState.options, initStoreState.series));
    },
    setLegendLayout({ state, initStoreState }) {
      const {
        legend: { data: legendData, useSpectrumLegend },
        series,
        options,
        chart,
        theme,
      } = state;
      const align = getAlign(options);
      const visible = showLegend(options, series);
      const checkbox = showCheckbox(options);
      const initialWidth = Math.min(chart.width / 5, INITIAL_LEGEND_WIDTH);
      const verticalAlign = isVerticalAlign(align);
      const circleLegendVisible = series.bubble
        ? showCircleLegend(options as BubbleChartOptions)
        : false;

      const legendWidths = legendData.map(({ width }) => width);
      const itemHeight = getLegendItemHeight(theme.legend.label!.fontSize!);
      const { legendWidth, legendHeight, rowCount, columnCount } = calculateLegendSize({
        initialWidth,
        legendWidths,
        useSpectrumLegend,
        options,
        verticalAlign,
        visible,
        checkbox,
        chart,
        itemHeight,
        circleLegendVisible,
      });

      const isNestedPieChart = hasNestedPieSeries(initStoreState.series);
      const isScatterChart = !!series.scatter;

      const circleLegendWidth =
        legendWidth === 0
          ? INITIAL_CIRCLE_LEGEND_WIDTH
          : Math.min(legendWidth, INITIAL_CIRCLE_LEGEND_WIDTH);

      setIndexToLegendData(legendData, rowCount, columnCount, legendWidths.length, verticalAlign);

      extend(state.legend, {
        visible,
        align,
        showCheckbox: checkbox,
        width: legendWidth,
        height: legendHeight,
      });

      extend(state.circleLegend, {
        visible: circleLegendVisible,
        width: circleLegendVisible ? circleLegendWidth : 0,
        radius: circleLegendVisible ? Math.max((circleLegendWidth - LEGEND_MARGIN_X) / 2, 0) : 0,
      });

      if (!isNestedPieChart) {
        this.dispatch('updateLegendColor');
      }
      if (isScatterChart) {
        this.dispatch('updateLegendIcon');
      }
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
    updateLegendColor({ state }) {
      const { legend: legendData, series, options } = state;
      const useSpectrumLegend =
        (options?.series as TreemapChartSeriesOptions)?.useColorValue ?? !!series.heatmap;

      const data = useSpectrumLegend
        ? legendData.data
        : getLegendDataAppliedTheme(legendData.data, series);
      extend(state.legend, { data });
    },
    updateLegendIcon({ state }) {
      const { legend: legendData, series } = state;

      const data = legendData.data.reduce<LegendDataList>((acc, cur) => {
        if (cur.chartType === 'scatter' && series.scatter?.data) {
          const model = series.scatter.data.find(({ name }) => name === cur.label);
          const iconType = model ? model.iconType : cur.iconType;

          return [...acc, { ...cur, iconType }];
        }

        return [...acc, cur];
      }, []);

      extend(state.legend, { data });
    },
    updateNestedPieChartLegend({ state }) {
      const { legend: legendData, nestedPieSeries } = state;
      extend(state.legend, {
        data: getLegendDataAppliedTheme(legendData.data, nestedPieSeries),
      });
    },
  },
  observe: {
    updateLegendLayout() {
      this.dispatch('setLegendLayout');
    },
  },
};

export default legend;
