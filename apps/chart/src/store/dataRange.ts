import {
  ValueEdge,
  StoreModule,
  ChartType,
  DataRange,
  ChartSeriesMap,
  Options,
} from '@t/store/store';
import { getFirstValidValue, isNull } from '@src/helpers/utils';
import { isBoxSeries } from '@src/component/boxSeries';
import { extend } from '@src/store/store';
import {
  getAxisName,
  isLabelAxisOnYAxis,
  getValueAxisNames,
  getYAxisOption,
  hasSecondaryYAxis,
} from '@src/helpers/axes';
import { getCoordinateYValue, isCoordinateSeries } from '@src/helpers/coordinate';
import { isRangeValue } from '@src/helpers/range';
import { isBulletSeries } from '@src/component/bulletSeries';

type SeriesDataRange = {
  [key in keyof ChartSeriesMap]: DataRange;
};

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

function getTotalDataRange(seriesDataRange: SeriesDataRange) {
  const defaultDataRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };

  return Object.values(seriesDataRange).reduce<DataRange>((acc, cur) => {
    if (cur.xAxis) {
      acc.xAxis = {
        min: Math.min(cur.xAxis.min, acc.xAxis?.min ?? defaultDataRange.min),
        max: Math.max(cur.xAxis.max, acc.xAxis?.max ?? defaultDataRange.max),
      };
    }
    if (cur.yAxis) {
      acc.yAxis = {
        min: Math.min(cur.yAxis.min, acc.yAxis?.min ?? defaultDataRange.min),
        max: Math.max(cur.yAxis.max, acc.yAxis?.max ?? defaultDataRange.max),
      };
    }
    if (cur.secondaryYAxis) {
      acc.secondaryYAxis = {
        min: Math.min(cur.secondaryYAxis.min, acc.secondaryYAxis?.min ?? defaultDataRange.min),
        max: Math.max(cur.secondaryYAxis.max, acc.secondaryYAxis?.max ?? defaultDataRange.max),
      };
    }

    return acc;
  }, {});
}

function setSeriesDataRange(
  options: Options,
  seriesName: string,
  values: number[],
  valueAxisName: string,
  seriesDataRange: SeriesDataRange
) {
  const { secondaryYAxis } = getYAxisOption(options);

  const axisNames =
    hasSecondaryYAxis(options) && secondaryYAxis?.chartType
      ? [secondaryYAxis.chartType === seriesName ? 'secondaryYAxis' : 'yAxis']
      : getValueAxisNames(options, valueAxisName);

  axisNames.forEach((axisName) => {
    seriesDataRange[seriesName][axisName] = getLimitSafely([...new Set(values)] as number[]);
  });

  return seriesDataRange;
}

const dataRange: StoreModule = {
  name: 'dataRange',
  state: () => ({
    dataRange: {} as DataRange,
  }),
  action: {
    setDataRange({ state }) {
      const { series, disabledSeries, stackSeries, categories, options } = state;
      const seriesDataRange = {} as SeriesDataRange;
      const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);

      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
      const hasDateValue = !!options.xAxis?.date;

      for (const seriesName in series) {
        if (!series.hasOwnProperty(seriesName)) {
          continue;
        }
        seriesDataRange[seriesName] = {};

        let values = series[seriesName].data.flatMap(({ data, name }) =>
          disabledSeries.includes(name) ? [] : data
        );

        const firstExistValue = getFirstValidValue(values);

        if (isCoordinateSeries(series)) {
          values = values
            .filter((value) => !isNull(value))
            .map((value) => getCoordinateYValue(value));

          const xAxisValues = (categories as string[]).map((value) =>
            hasDateValue ? Number(new Date(value)) : Number(value)
          );

          seriesDataRange[seriesName][labelAxisName] = getLimitSafely([...xAxisValues]);
        } else if (isRangeValue(firstExistValue)) {
          values = values.reduce((arr, value) => {
            if (isNull(value)) {
              return arr;
            }

            return Array.isArray(value) ? [...arr, ...value] : [...value];
          }, []);
        } else if (stackSeries && stackSeries[seriesName]?.stack) {
          values = stackSeries[seriesName].dataRangeValues;
        } else if (isBoxSeries(seriesName as ChartType)) {
          values.push(0);
        } else if (seriesName === 'boxPlot') {
          values = series[seriesName]!.data.flatMap(({ data, outliers = [] }) => [
            ...(data ?? []).flatMap((datum) => datum),
            ...(outliers ?? []).flatMap((datum) => datum),
          ]);
        } else if (isBulletSeries(seriesName)) {
          values = series[seriesName].data.flatMap(({ data, markers, ranges }) => [
            data,
            ...(markers ?? []).flatMap((datum) => datum),
            ...(ranges ?? []).flatMap((range) => range),
          ]);
        }

        setSeriesDataRange(options, seriesName, values, valueAxisName, seriesDataRange);
      }

      const newDataRange = getTotalDataRange(seriesDataRange);
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
