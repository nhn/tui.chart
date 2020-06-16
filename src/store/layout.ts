import { StoreModule, Layout, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align } from '@t/options';
import { getTextWidth } from '@src/helpers/calculator';
import { LEGEND_LABEL_FONT, CHECKBOX_SIZE, ICON_SIZE, margin } from '@src/brushes/legend';

function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getLongestNameWidth(names: string[]) {
  const longestName = names.reduce((acc, cur) => {
    return acc.length > cur.length ? acc : cur;
  }, '');

  return getTextWidth(longestName, LEGEND_LABEL_FONT);
}

function calculateLegendWidth(width: number, names: string[], options: Options) {
  const legendOptions = options?.legend;
  let legendWidth = width / 10;

  if (legendOptions?.width) {
    return legendOptions.width;
  }

  if (!isVerticalAlign(legendOptions?.align)) {
    const labelAreaWidth = getLongestNameWidth(names) + CHECKBOX_SIZE + ICON_SIZE + margin.X * 2;
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
        legend: { visible, names },
      } = state;

      const padding = 10;
      const yAxis = {
        width: 50,
        height: height - padding * 2 - 34,
        x: 0 + padding,
        y: 0 + padding,
      };

      const legendWidth = visible ? calculateLegendWidth(width, names, options) : 0;

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
