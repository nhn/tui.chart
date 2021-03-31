import {
  StoreModule,
  Scale,
  Options,
  ChartState,
  Series,
  ChartOptionsUsingYAxis,
} from '@t/store/store';
import {
  getAxisName,
  getSizeKey,
  isLabelAxisOnYAxis,
  getYAxisOption,
  getValueAxisNames,
  isSeriesUsingRadialAxes,
} from '@src/helpers/axes';
import {
  calculateCoordinateScale,
  calculateXAxisScaleForCoordinateLineType,
  getStackScaleData,
} from '@src/scale/coordinateScaleCalculator';
import { calculateDatetimeScale } from '@src/scale/datetimeScaleCalculator';
import { isCoordinateSeries } from '@src/helpers/coordinate';
import { hasPercentStackSeries } from './stackSeriesData';
import { isExist } from '@src/helpers/utils';
import { LineChartOptions, Scale as ScaleOption } from '@t/options';

type ScaleOptions = {
  xAxis?: ScaleOption;
  yAxis?: ScaleOption;
  secondaryYAxis?: ScaleOption;
  circularAxis?: ScaleOption;
  verticalAxis?: ScaleOption;
};

const MIN_OFFSET_SIZE = 1;

function getLabelScaleData(
  state: ChartState<Options>,
  labelAxisOnYAxis: boolean,
  scaleOptions: ScaleOptions,
  labelAxisName: string
) {
  const { dataRange, layout, series, options } = state;
  const categories = state.categories as string[];
  const rawCategories = state.rawCategories as string[];
  const { labelSizeKey } = getSizeKey(labelAxisOnYAxis);
  const dateTypeLabel = isExist(options.xAxis?.date);
  const labelOptions = {
    dataRange: dataRange[labelAxisName],
    offsetSize: Math.max(layout.plot[labelSizeKey], MIN_OFFSET_SIZE),
    scaleOption: scaleOptions[labelAxisName],
    rawCategoriesSize: rawCategories.length,
  };

  let result;

  if (dataRange[labelAxisName]) {
    result = dateTypeLabel
      ? calculateDatetimeScale(labelOptions)
      : calculateCoordinateScale(labelOptions);
  }

  if (series.line && categories && !(options as LineChartOptions).xAxis?.pointOnColumn) {
    result = calculateXAxisScaleForCoordinateLineType(
      result,
      options as LineChartOptions,
      categories
    );
  }

  return result;
}

function getValueScaleData(
  state: ChartState<Options>,
  labelAxisOnYAxis: boolean,
  scaleOptions: ScaleOptions,
  valueAxisName: string,
  isCoordinateTypeChart: boolean
) {
  const { dataRange, layout, series, stackSeries } = state;
  const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
  let result;

  if (hasPercentStackSeries(stackSeries)) {
    Object.keys(series).forEach((seriesName) => {
      result = getStackScaleData(stackSeries[seriesName].scaleType);
    });
  } else if (isCoordinateTypeChart) {
    const valueOptions = {
      dataRange: dataRange[valueAxisName],
      offsetSize: Math.max(layout.plot[valueSizeKey], MIN_OFFSET_SIZE),
      scaleOption: scaleOptions[valueAxisName],
    };

    result = calculateCoordinateScale(valueOptions);
  } else {
    result = calculateCoordinateScale({
      dataRange: dataRange[valueAxisName],
      offsetSize: Math.max(layout.plot[valueSizeKey], MIN_OFFSET_SIZE),
      scaleOption: scaleOptions[valueAxisName],
    });
  }

  return result;
}

function getScaleOptions(options: Options, series: Series, valueAxisName: string) {
  const scaleOptions: ScaleOptions = {};

  if (isSeriesUsingRadialAxes(series)) {
    scaleOptions[valueAxisName] = options?.[valueAxisName]?.scale;
  } else {
    const { yAxis, secondaryYAxis } = getYAxisOption(options as ChartOptionsUsingYAxis);
    scaleOptions.xAxis = options?.xAxis?.scale;
    scaleOptions.yAxis = yAxis?.scale;

    if (secondaryYAxis) {
      scaleOptions.secondaryYAxis = secondaryYAxis?.scale;
    }
  }

  return scaleOptions;
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {} as Scale,
  }),
  action: {
    setScale({ state, initStoreState }) {
      const { series, options, categories } = state;
      const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options, categories });
      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);
      const scaleOptions = getScaleOptions(options, series, valueAxisName);
      const isCoordinateTypeChart = isCoordinateSeries(initStoreState.series);
      const scaleData = {};

      getValueAxisNames(options, valueAxisName).forEach((axisName) => {
        scaleData[axisName] = getValueScaleData(
          state,
          labelAxisOnYAxis,
          scaleOptions,
          axisName,
          isCoordinateTypeChart
        );
      });

      if (isCoordinateTypeChart) {
        scaleData[labelAxisName] = getLabelScaleData(
          state,
          labelAxisOnYAxis,
          scaleOptions,
          labelAxisName
        );
      }

      state.scale = scaleData;
    },
  },
  observe: {
    updateScale() {
      this.dispatch('setScale');
    },
  },
};

export default scale;
