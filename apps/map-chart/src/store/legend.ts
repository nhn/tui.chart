import { StoreModule } from '@t/store';
import { Options } from '@t/options';
import { getLegendAlign, isVerticalAlign } from '@src/helpers/legend';

function getLegendDefaultOptions(options: Options) {
  // @TODO: Need to add logic for calculating width and height after adding data
  const align = getLegendAlign(options);
  let width = 50;
  let height = 50;
  if (isVerticalAlign(align)) {
    width = 150;
  } else {
    height = 150;
  }

  return { align, width, height };
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options }) => ({
    legend: getLegendDefaultOptions(options),
  }),
  action: {},
  observe: {},
};

export default legend;
