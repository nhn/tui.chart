import { StoreModule } from '@t/store';
import { LegendOptions } from '@t/options';

function getLegendDefaultOptions(options: LegendOptions) {
  return {
    align: options?.align ?? 'bottom',
  };
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options }) => ({
    ...getLegendDefaultOptions(options.legend),
  }),
  action: {},
  observe: {},
};

export default legend;
