import { ValueEdge, StoreModule, ChartType } from '@t/store/store';
import { isObject } from '@src/helpers/utils';
import { isBoxSeries } from '@src/component/boxSeries';
import { extend } from '@src/store/store';

function getLimitSafely(baseValues: number[]): ValueEdge {
  const limit = {
    min: Math.min(...baseValues),
    max: Math.max(...baseValues)
  };

  if (baseValues.length === 1) {
    const [firstValue] = baseValues;

    if (firstValue > 0) {
      limit.min = 0;
    } else if (firstValue === 0) {
      limit.max = 10;
    } else {
      limit.max = 0;
    }
  } else if (limit.min === 0 && limit.max === 0) {
    limit.max = 10;
  } else if (limit.min === limit.max) {
    limit.min -= limit.min / 10;
    limit.max += limit.max / 10;
  }

  return limit;
}

const dataRange: StoreModule = {
  name: 'dataRange',
  state: () => ({
    dataRange: {}
  }),
  action: {
    setDataRange({ state }) {
      const { series, disabledSeries, stackSeries } = state;
      const newDataRange: Record<string, ValueEdge> = {};

      for (const seriesName in series) {
        if (!series.hasOwnProperty(seriesName)) {
          continue;
        }

        let values = series[seriesName].flatMap(({ data, name }) => {
          return disabledSeries.includes(name) ? [] : data;
        });

        const tupleCoord = Array.isArray(values[0]);
        const objectCoord = isObject(values[0]);

        if (tupleCoord) {
          if (isBoxSeries(seriesName as ChartType)) {
            values = values.reduce(
              (arr, value) => (Array.isArray(value) ? [...arr, ...value] : value),
              []
            );
          } else {
            values = values.map(value => value[1]);
          }
        } else if (objectCoord) {
          values = values.map(value => value.y);
        } else if (stackSeries[seriesName]?.stack) {
          values = stackSeries[seriesName].dataValues;
        }

        newDataRange[seriesName] = getLimitSafely([...new Set(values)] as number[]);
      }

      extend(state.dataRange, newDataRange);
    }
  },
  observe: {
    updateDataRange() {
      this.dispatch('setDataRange');
    }
  }
};

export default dataRange;
