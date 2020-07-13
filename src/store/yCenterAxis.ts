import { StoreModule, Options, ChartSeriesMap } from '@t/store/store';
import { BarTypeYAxisOptions, Rect } from '@t/options';
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
      rect: {} as Rect,
      xAxisHalfSize: 0,
      centerX: 0,
      secondStartX: 0,
    },
  }),
  action: {
    setYCenterAxis({ state }) {
      if (!state.yCenterAxis.visible) {
        return;
      }

      this.dispatch('setLayout');

      const { xAxis, yAxis } = state.layout;
      const xAxisHalfSize = (xAxis.width - yAxis.width) / 2;
      const centerX = xAxis.width / 2;
      const secondStartX = (xAxis.width + yAxis.width) / 2;

      extend(state.yCenterAxis, {
        rect: yAxis,
        xAxisHalfSize,
        centerX,
        secondStartX,
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
