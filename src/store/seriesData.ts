import { StoreModule } from '@t/store/store';
import { StackType, StackDataType, stackOption } from '@src/component/boxSeries';
import { isObject } from '@src/helpers/utils';

// seriesDataModel 이 했던것 일부 여기로
const seriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    series: {}
  }),
  action: {
    setSeriesData({ state }) {
      const { series: seriesRaw, disabledSeries, ops } = state;
      const stack = stackOption(ops);
      const newSeriesData = {};

      Object.keys(seriesRaw).forEach(seriesName => {
        const seriesRawData = seriesRaw[seriesName];
        const seriesCount = seriesRawData.length;
        let seriesGroupCount = seriesRawData[0].data.length;
        const data = seriesRawData.filter(({ name }: any) => !disabledSeries.includes(name));

        if (stack && isObject(stack) && stack.type === StackType.NORMAL) {
          const groupCountLengths = seriesRawData.map(
            ({ data: seriesDatas }) => seriesDatas.length
          );
          seriesGroupCount = Math.max(...groupCountLengths);
          const stackData: StackDataType = [];

          for (let i = 0; i < seriesGroupCount; i += 1) {
            const stackValues: number[] = [];

            for (let j = 0; j < seriesCount; j += 1) {
              stackValues.push(seriesRaw[seriesName][j].data[i] || 0);
            }

            stackData[i] = {
              values: stackValues,
              sum: stackValues.reduce((a, b) => a + b, 0)
            };
          }

          newSeriesData[seriesName] = {
            seriesCount,
            seriesGroupCount,
            data,
            stackData
          };
        } else {
          newSeriesData[seriesName] = {
            seriesCount,
            seriesGroupCount,
            data
          };
        }
      });

      this.extend(state.series, newSeriesData);
    },
    disableSeries({ state }, name: string) {
      state.disabledSeries.push(name);
      this.notify(state, 'disabledSeries');
    },
    enableSeries({ state }, name: string) {
      const index = state.disabledSeries.findIndex(disabled => disabled === name);
      state.disabledSeries.splice(index, 1);
      this.notify(state, 'disabledSeries');
    }
  },
  observe: {
    updateSeriesData() {
      this.dispatch('setSeriesData');
    }
  }
};

export default seriesData;
