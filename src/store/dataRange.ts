import { ValueEdge, StoreModule, ChartType, DataRange } from '@t/store/store';
import { getFirstValidValue } from '@src/helpers/utils';
import { isBoxSeries } from '@src/component/boxSeries';
import { extend } from '@src/store/store';
import { getAxisName, isLabelAxisOnYAxis } from '@src/helpers/axes';
import { getCoordinateYValue, isCoordinateSeries } from '@src/helpers/coordinate';
import { isRangeValue } from '@src/helpers/range';

export function getLimitSafely(baseValues: number[]): ValueEdge {
  const limit = {
    min: Math.min(...baseValues),
    max: Math.max(...baseValues),
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
    dataRange: {} as DataRange,
  }),
  action: {
    setDataRange({ state }) {
      const { series, disabledSeries, stackSeries, rawCategories, options } = state;
      const newDataRange = {} as DataRange;
      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
      const isDateValue = !!options.xAxis?.date;

      for (const seriesName in series) {
        if (!series.hasOwnProperty(seriesName)) {
          continue;
        }
        newDataRange[seriesName] = {};

        let values = series[seriesName].data.flatMap(({ data, name }) =>
          disabledSeries.includes(name) ? [] : data
        );

        const firstExistValue = getFirstValidValue(values);

        if (isCoordinateSeries(series)) {
          values = values.map((value) => getCoordinateYValue(value));

          const xAxisValues = rawCategories.map((value) =>
            isDateValue ? Number(new Date(value)) : Number(value)
          );

          newDataRange[seriesName][labelAxisName] = getLimitSafely([...xAxisValues]);
        } else if (isRangeValue(firstExistValue)) {
          values = values.reduce(
            (arr, value) => (Array.isArray(value) ? [...arr, ...value] : [...value]),
            []
          );
        } else if (stackSeries && stackSeries[seriesName]?.stack) {
          values = stackSeries[seriesName].dataRangeValues;
        } else if (isBoxSeries(seriesName as ChartType)) {
          values.push(0);
        }

        newDataRange[seriesName][valueAxisName] = getLimitSafely([...new Set(values)] as number[]);
      }
      extend(state.dataRange, newDataRange);
    },
  },
  observe: {
    updateDataRange() {
      this.dispatch('setDataRange');
    },
  },
};

export default dataRange;
