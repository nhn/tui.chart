import { LegendIconType, Options, RawSeries, StoreModule } from '@t/store/store';
import { Align, BubbleChartOptions } from '@t/options';
import { isUndefined, sum } from '@src/helpers/utils';
import {
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_ITEM_MARGIN_X,
  LEGEND_LABEL_FONT,
  LEGEND_MARGIN_X,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';
import { isVerticalAlign } from '@src/store/layout';

function calculateLegendWidth(
  defaultWidth: number,
  legendWidths: number[],
  options: Options,
  align: Align,
  visible: boolean
) {
  const verticalAlign = isVerticalAlign(align);
  const legendOptions = options?.legend;
  let legendWidth = defaultWidth;

  if (!visible) {
    return 0;
  }

  if (legendOptions?.width) {
    return legendOptions.width;
  }

  if (!verticalAlign) {
    const labelAreaWidth = Math.max(...legendWidths);
    legendWidth = Math.max(labelAreaWidth, legendWidth);
  } else {
    legendWidth = sum(legendWidths) + LEGEND_ITEM_MARGIN_X * (legendWidths.length - 1);
  }

  return legendWidth;
}

export function showCircleLegend(options: BubbleChartOptions) {
  return isUndefined(options?.circleLegend?.visible) ? true : !!options?.circleLegend?.visible;
}

function showLegend(options: Options) {
  return isUndefined(options.legend?.visible) ? true : !!options.legend?.visible;
}

function showCheckbox(options: Options) {
  return isUndefined(options.legend?.showCheckbox) ? true : !!options.legend?.showCheckbox;
}

function getLegendLabels(series: RawSeries) {
  return Object.keys(series).reduce<string[]>((acc, type) => {
    const seriesName = series[type].map(({ name }) => name);

    return [...acc, ...seriesName];
  }, []);
}

function getIconType(series: RawSeries): LegendIconType {
  if (series.bubble || series.scatter) {
    return 'circle';
  }

  // @TODO: ADD bullet chart
  if (series.bar || series.column || series.area || series.pie) {
    return 'rect';
  }

  if (series.line || series.radar) {
    return 'line';
  }

  return 'spectrum';
}

function getAlign(options: Options) {
  return isUndefined(options.legend?.align) ? 'right' : (options.legend?.align as Align);
}

function getItemWidth(label: string, checkboxVisible: boolean) {
  return (
    (checkboxVisible ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
    LEGEND_ICON_SIZE +
    LEGEND_MARGIN_X +
    getTextWidth(label, LEGEND_LABEL_FONT)
  );
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options, series }) => {
    const defaultWidth = Math.min(options.chart!.width / 10, 150);
    const align = getAlign(options);
    const visible = showLegend(options);
    const checkboxVisible = showCheckbox(options);
    const data = getLegendLabels(series).map((label) => ({
      label,
      active: true,
      checked: true,
      width: getItemWidth(label, checkboxVisible),
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
        showCheckbox: checkboxVisible,
        iconType: getIconType(series),
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
