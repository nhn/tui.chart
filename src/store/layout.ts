import { StoreModule, Layout, Options, Series } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align, BubbleChartOptions } from '@t/options';
import { getTextWidth } from '@src/helpers/calculator';

const LEGEND_LABEL_FONT = 'normal 11px Arial';
const margin = { X: 10 };
const CHECKBOX_SIZE = 14;
const ICON_SIZE = 14;

export function showCircleLegend(options: BubbleChartOptions, isBubbleChart = false) {
  return isBubbleChart && options?.circleLegend?.visible;
}

function showLegend(options: Options, isBubbleChart = false) {
  return showCircleLegend(options, isBubbleChart) || options.legend?.visible;
}

function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getLongestNameWidth(series: Series) {
  const name = Object.keys(series).reduce((longestName, type) => {
    const seriesName = series[type].reduce((seriesLongestName, datum) => {
      return datum.name.length >= seriesLongestName.length ? datum.name : seriesLongestName;
    }, '');

    return longestName.length > seriesName.length ? longestName : seriesName;
  }, '');

  return getTextWidth(name, LEGEND_LABEL_FONT);
}

function calculateLegendWidth(width: number, series: Series, options: Options) {
  const legendOptions = options?.legend;
  let legendWidth = width / 10;

  if (legendOptions?.width) {
    return legendOptions.width;
  }

  if (!isVerticalAlign(legendOptions?.align)) {
    const labelAreaWidth = getLongestNameWidth(series) + CHECKBOX_SIZE + ICON_SIZE + margin.X * 2;
    legendWidth = Math.max(labelAreaWidth, legendWidth);
  }

  return legendWidth;
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const {
        chart: { height, width },
        series,
        options,
      } = state;

      const padding = 10;
      const yAxis = {
        width: 50,
        height: height - padding * 2 - 34,
        x: 0 + padding,
        y: 0 + padding,
      };

      const legendWidth = showLegend(options, !!series.bubble)
        ? calculateLegendWidth(width, series, options)
        : 0;

      const xAxis = {
        width: width - (yAxis.x + yAxis.width + legendWidth + padding * 2),
        height: 20,
        x: yAxis.x + yAxis.width,
        y: yAxis.y + yAxis.height,
      };

      const legend = {
        width: legendWidth,
        height: yAxis.height,
        x: xAxis.x + xAxis.width + padding,
        y: yAxis.y,
      };

      const plot = {
        width: xAxis.width,
        height: yAxis.height,
        x: xAxis.x,
        y: 0 + padding,
      };

      extend(state.layout, { yAxis, xAxis, plot, legend });
    },
  },
  observe: {
    updateLayoutObserve() {
      this.dispatch('setLayout');
    },
    // setLayout({chart}) {
    //   const yAxis = {
    //     width: 33,
    //     height: chart.height,
    //     x: 0,
    //     y: 0
    //   };
    //   const xAxis = {
    //     width: chart.width,
    //     height: 34,
    //     x: yAxis.x + yAxis.width,
    //     y: yAxis.y + yAxis.height
    //   };
    //   const plot = {
    //     width: chart.width - yAxis.width,
    //     height: chart.height - xAxis.height,
    //     x: yAxis.x + yAxis.width,
    //     y: 0
    //   };
    //   this.dispatch('setLayout', {
    //     plot,
    //     xAxis,
    //     yAxis
    //   });
    // }
  },
};

export default layout;
