import {
  ValueEdge,
  StoreModule,
  DataRange,
  ChartSeriesMap,
  Options,
  ChartOptionsUsingYAxis,
  Series,
} from '@t/store/store';
import { getFirstValidValue, isNull, includes } from '@src/helpers/utils';
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
import { CoordinateDataType } from '@t/options';
import { AxisType } from '@src/component/axis';

type SeriesDataRange = {
  [key in keyof ChartSeriesMap]: DataRange;
};

export function getLimitSafely(baseValues: number[], isXAxis = false): ValueEdge {
  const limit = {
    min: Math.min(...baseValues),
    max: Math.max(...baseValues),
  };

  if (baseValues.length === 1) {
    const [firstValue] = baseValues;

    if (isXAxis) {
      limit.min = firstValue;
      limit.max = firstValue;
    } else if (firstValue > 0) {
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

function initDataRange(
  accDataRangeValue: DataRange,
  curDataRangeValue: DataRange,
  axisName: 'xAxis' | 'yAxis' | 'secondaryYAxis' | 'circularAxis' | 'verticalAxis'
) {
  const defaultDataRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };

  return {
    min: Math.min(
      curDataRangeValue[axisName]!.min,
      accDataRangeValue[axisName]?.min ?? defaultDataRange.min
    ),
    max: Math.max(
      curDataRangeValue[axisName]!.max,
      accDataRangeValue[axisName]?.max ?? defaultDataRange.max
    ),
  };
}

function getTotalDataRange(seriesDataRange: SeriesDataRange) {
  return Object.values(seriesDataRange).reduce<DataRange>((acc, cur) => {
    if (cur.xAxis) {
      acc.xAxis = initDataRange(acc, cur, 'xAxis');
    }
    if (cur.yAxis) {
      acc.yAxis = initDataRange(acc, cur, 'yAxis');
    }
    if (cur.secondaryYAxis) {
      acc.secondaryYAxis = initDataRange(acc, cur, 'secondaryYAxis');
    }
    if (cur.circularAxis) {
      acc.circularAxis = initDataRange(acc, cur, 'circularAxis');
    }
    if (cur.verticalAxis) {
      acc.verticalAxis = initDataRange(acc, cur, 'verticalAxis');
    }

    return acc;
  }, {});
}

function setSeriesDataRange({
  options,
  seriesName,
  values,
  valueAxisName,
  seriesDataRange,
}: {
  options: Options;
  seriesName: string;
  values: number[];
  valueAxisName: string;
  seriesDataRange: SeriesDataRange;
}) {
  let axisNames: string[];

  if (includes([AxisType.X, AxisType.CIRCULAR, AxisType.VERTICAL], valueAxisName)) {
    axisNames = [valueAxisName];
  } else {
    const optionsUsingYAxis = options as ChartOptionsUsingYAxis;
    const { secondaryYAxis } = getYAxisOption(optionsUsingYAxis);

    axisNames =
      hasSecondaryYAxis(optionsUsingYAxis) && secondaryYAxis?.chartType
        ? [secondaryYAxis.chartType === seriesName ? 'secondaryYAxis' : 'yAxis']
        : getValueAxisNames(optionsUsingYAxis, valueAxisName);
  }

  axisNames.forEach((axisName) => {
    seriesDataRange[seriesName][axisName] = getLimitSafely([...new Set(values)] as number[]);
  });

  return seriesDataRange;
}

function getBoxPlotValues(series: Series, seriesName: string) {
  return series[seriesName]!.data.flatMap(({ data, outliers = [] }) => [
    ...(data ?? []).flatMap((datum) => datum),
    ...(outliers ?? []).flatMap((datum) => datum),
  ]);
}

function getBulletValues(series: Series, seriesName: string) {
  return series[seriesName]!.data.flatMap(({ data, markers, ranges }) => [
    data,
    ...(markers ?? []).flatMap((datum) => datum),
    ...(ranges ?? []).flatMap((range) => range),
  ]);
}

function getCoordinateDataValues(
  values: CoordinateDataType[],
  categories: string[],
  hasDateValue: boolean
) {
  const yAxisValues = values
    .filter((value) => !isNull(value))
    .map((value) => getCoordinateYValue(value));

  const xAxisValues = (categories as string[]).map((value) =>
    hasDateValue ? Number(new Date(value)) : Number(value)
  );

  return { xAxisValues, yAxisValues };
}

const dataRange: StoreModule = {
  name: 'dataRange',
  state: () => ({
    dataRange: {} as DataRange,
  }),
  action: {
    setDataRange({ state, initStoreState }) {
      const { series, disabledSeries, stackSeries, categories, options } = state;
      const seriesDataRange = {} as SeriesDataRange;
      const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options, categories });

      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);

      Object.keys(series).forEach((seriesName) => {
        seriesDataRange[seriesName] = {};

        let values = series[seriesName].data.flatMap(({ data, name }) =>
          disabledSeries.includes(name) ? [] : data
        );

        const firstExistValue = getFirstValidValue(values);

        if (isCoordinateSeries(initStoreState.series)) {
          const hasDateValue = !!options.xAxis?.date;
          const { yAxisValues, xAxisValues } = getCoordinateDataValues(
            values,
            categories as string[],
            hasDateValue
          );
          values = yAxisValues;

          seriesDataRange[seriesName][labelAxisName] = getLimitSafely([...xAxisValues], true);
        } else if (!series[seriesName].data.length) {
          values = [];
        } else if (isRangeValue(firstExistValue)) {
          values = values.reduce((arr, value) => {
            if (isNull(value)) {
              return arr;
            }

            return Array.isArray(value) ? [...arr, ...value] : [...value];
          }, []);
        } else if (stackSeries && stackSeries[seriesName]?.stack) {
          values = stackSeries[seriesName].dataRangeValues;
        } else if (seriesName === 'boxPlot') {
          values = getBoxPlotValues(series, seriesName);
        } else if (seriesName === 'bullet') {
          values = getBulletValues(series, seriesName);
        }

        if (includes(['bar', 'column', 'radar', 'bullet'], seriesName)) {
          values.push(0);
        }

        setSeriesDataRange({
          options,
          seriesName,
          values,
          valueAxisName,
          seriesDataRange,
        });
      });

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
