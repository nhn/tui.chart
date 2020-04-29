import { ValueEdge, StoreModule } from '@t/store/store';
import { isObject } from '@src/helpers/utils';
import { STACK_TYPES } from '@src/component/boxSeries';

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

function getStackDataValues(stackData, stackType) {
  if (stackType === STACK_TYPES.PERCENT) {
    return [0, 100];
  }

  return [0, ...stackData.map(({ sum }) => sum)];
}

function isBoxSeries(series) {
  return series.bar || series.column;
}

const dataRange: StoreModule = {
  name: 'dataRange',
  state: () => ({
    dataRange: {}
  }),
  action: {
    setDataRange({ state }) {
      const { series, disabledSeries } = state;
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
          if (isBoxSeries(series)) {
            values = values.reduce(
              (arr, value) => (Array.isArray(value) ? arr.concat(...value) : value),
              []
            );
          } else {
            values = values.map(value => value[1]);
          }
        } else if (objectCoord) {
          values = values.map(value => value.y);
        } else if (series[seriesName].stack) {
          const { stackData } = series[seriesName];

          values = getStackDataValues(stackData, series[seriesName].stack.type);
        }

        newDataRange[seriesName] = getLimitSafely([...new Set(values)] as number[]);
      }

      this.extend(state.dataRange, newDataRange);
    }
  },
  observe: {
    updateDataRange() {
      this.dispatch('setDataRange');
    }
  }
};

export default dataRange;
