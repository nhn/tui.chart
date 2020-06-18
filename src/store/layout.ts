import { StoreModule, Layout, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align } from '@t/options';
import { getTextWidth } from '@src/helpers/calculator';
import {
  LEGEND_LABEL_FONT,
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_MARGIN_X,
} from '@src/brushes/legend';

function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getLongestLabelWidth(names: string[]) {
  const longestLabel = names.reduce((acc, cur) => {
    return acc.length > cur.length ? acc : cur;
  }, '');

  return getTextWidth(longestLabel, LEGEND_LABEL_FONT);
}

function calculateLegendWidth(
  width: number,
  names: string[],
  options: Options,
  showCheckbox: boolean
) {
  const legendOptions = options?.legend;
  let legendWidth = width / 10;

  if (legendOptions?.width) {
    return legendOptions.width;
  }

  if (!isVerticalAlign(legendOptions?.align)) {
    const labelAreaWidth =
      getLongestLabelWidth(names) +
      (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
      LEGEND_ICON_SIZE +
      LEGEND_MARGIN_X;
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
        options,
        legend: { visible, data, showCheckbox },
      } = state;

      const padding = 10;
      const yAxis = {
        width: 50,
        height: height - padding * 2 - 34,
        x: 0 + padding,
        y: 0 + padding,
      };

      const legendLabels = data.map(({ label }) => label);
      const legendWidth = visible
        ? calculateLegendWidth(width, legendLabels, options, showCheckbox)
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
