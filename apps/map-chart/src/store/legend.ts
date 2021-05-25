import { StoreModule } from '@t/store';
import { Options } from '@t/options';
import { getLegendAlign, getLegendVisible, isVerticalAlign } from '@src/helpers/legend';

function getLegendDefaultOptions(options: Options) {
  // @TODO: Need to add logic for calculating width and height after adding data
  const visible = getLegendVisible(options);
  let align, width, height;
  if (visible) {
    align = getLegendAlign(options);
    width = 50;
    height = 50;
    if (isVerticalAlign(align)) {
      width = 150;
    } else {
      height = 150;
    }
  }

  return { align, width, height, visible };
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
