import { StoreModule } from '@t/store/store';
import { pickProperty, isObject } from '@src/helpers/utils';
import { StackInfo } from '@t/options';

const stackData: StoreModule = {
  name: 'stack',
  state: () => ({
    stack: {
      use: false,
      option: {}
    }
  }),
  action: {
    setStack({ state }) {
      const { options, stack } = state;
      const stackOption = pickProperty(options, ['series', 'stack']);
      const defaultOption = {
        type: 'normal',
        connector: false
      } as StackInfo;
      const use = !!stackOption;
      let option: Partial<StackInfo> = isObject(stackOption)
        ? Object.assign({}, defaultOption, stackOption)
        : defaultOption;

      option = use ? option : {};

      this.extend(stack, {
        use,
        option
      });
    }
  },
  observe: {
    updateStack() {
      this.dispatch('setStack');
    }
  }
};

export default stackData;
