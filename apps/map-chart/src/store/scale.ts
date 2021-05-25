import { Data, StoreModule } from '@t/store';
import { getNormalizedScale, getRoughScale } from '@src/helpers/scale';
import { extend, getLimitSafely } from '@toast-ui/shared';

function getScale(data: Data[], spectrumLegendWidth: number) {
  const values = [
    ...new Set(
      data.reduce<number[]>((acc, cur) => {
        return [...acc, cur.data];
      }, [])
    ),
  ];
  const dataRange = getLimitSafely(values);
  const roughScale = getRoughScale(dataRange, spectrumLegendWidth);

  return getNormalizedScale(roughScale);
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {},
  }),
  action: {
    setScale({ state, initStoreState }) {
      const { legend } = state;
      const { data } = initStoreState;

      extend(state.scale, getScale(data, legend.width));
    },
  },
  observe: {
    updateScaleObserve() {
      this.dispatch('setScale');
    },
  },
};

export default scale;
