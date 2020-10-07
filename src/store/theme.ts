import { StoreModule } from '@t/store/store';
// import { extend } from '@src/store/store';
import { deepMergedCopy } from '@src/helpers/utils';

const defaultTheme = {
  series: {
    colors: [
      '#00a9ff',
      '#ffb840',
      '#ff5a46',
      '#00bd9f',
      '#785fff',
      '#f28b8c',
      '#989486',
      '#516f7d',
      '#29dbe3',
      '#dddddd',
      '#64e38b',
      '#e3b664',
      '#fB826e',
      '#64e3C2',
      '#f66efb',
      '#e3cd64',
      '#82e364',
      '#8570ff',
      '#e39e64',
      '#fa5643',
      '#7a4b46',
      '#81b1c7',
      '#257a6c',
      '#58527a',
      '#fbb0b0',
      '#c7c7c7',
    ],
    startColor: '#ffe98a',
    endColor: '#d74177',
  },
};

const theme: StoreModule = {
  name: 'heatmapSeriesData',
  state: ({ options }) => ({
    theme: deepMergedCopy(defaultTheme, options?.theme ?? {}),
  }),
  action: {
    setTheme({ state }) {},
    applyTheme({ state }) {},
  },
  observe: {
    updateTheme() {
      this.dispatch('setTheme');
    },
  },
};

export default theme;
