import { ActionParams, Data, StoreModule } from '@t/store';
import { getNormalizedScale, getRoughScale } from '@src/helpers/scale';
import { extend, getLimitSafely } from '@toast-ui/shared';
import { isVerticalAlign } from '@src/helpers/legend';

function getScale(data: Data[], legendSize: number) {
  const values = [...new Set(data.map((datum) => datum.data))];
  const dataRange = getLimitSafely(values);
  const roughScale = getRoughScale(dataRange, legendSize);

  return getNormalizedScale(roughScale);
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {},
  }),
  action: {
    setScale({ state, initStoreState }: ActionParams) {
      const { align, width, height } = state.legend;
      const legendSize = isVerticalAlign(align) ? width : height;

      extend(state.scale, getScale(initStoreState.data, legendSize));
    },
  },
  observe: {
    updateScaleObserve() {
      this.dispatch('setScale');
    },
  },
};

export default scale;
