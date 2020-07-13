import { StoreModule, Options, ChartSeriesMap } from '@t/store/store';
import { BarTypeYAxisOptions } from '@t/options';
import { extend } from '@src/store/store';
import { pickProperty } from '@src/helpers/utils';

function enableYCenterAxis(series: Partial<ChartSeriesMap>, options: Options) {
  const diverging = !!pickProperty(options, ['series', 'diverging']);
  const alignCenter = (options.yAxis as BarTypeYAxisOptions)?.align === 'center';

  return !!series.bar && diverging && alignCenter;
}

const yCenterAxis: StoreModule = {
  name: 'yCenterAxis',
  state: ({ options, series }) => ({
    yCenterAxis: {
      visible: enableYCenterAxis(series, options),
    },
  }),
  action: {
    setYCenterAxis({ state }) {
      if (!state.yCenterAxis.visible) {
        return;
      }

      this.dispatch('setLayout');

      const { xAxis, yAxis } = state.layout;

      extend(state.yCenterAxis, {
        xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
        secondStartX: (xAxis.width + yAxis.width) / 2,
        yAxisLabelAnchorPoint: yAxis.width / 2,
        yAxisHeight: yAxis.height,
      });
    },
  },
  observe: {
    updateYCenterAxisObserve() {
      this.dispatch('setYCenterAxis');
    },
  },
};

export default yCenterAxis;
