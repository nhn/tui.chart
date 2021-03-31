import {
  StoreModule,
  InitAxisData,
  Scale,
  CircularAxisData,
  DefaultRadialAxisData,
  SolidData,
} from '@t/store/store';
import {
  getInitAxisIntervalData,
  getMaxLabelSize,
  isLabelAxisOnYAxis,
  makeTitleOption,
  getDefaultRadialAxisData,
} from '@src/helpers/axes';
import { GaugeChartOptions, GaugePlotBand, GaugeSolidOptions } from '@t/options';
import { makeLabelsFromLimit, getFontHeight } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';
import { CircularAxisTheme, GaugePlotTheme, GaugeChartSeriesTheme } from '@t/theme';
import { DEGREE_360, DEGREE_0 } from '@src/helpers/sector';
import { isObject, calculateSizeWithPercentString } from '@src/helpers/utils';
import { RadialAxisType } from './radialAxes';
import { isExistPlotId } from '@src/helpers/plot';

const DEFAULT_LABEL_PADDING = 15;
const RANGE_BAR_MARGIN = 10;
const CLOCK_HAND_MARGIN = 10;
export const DATA_LABEL_MARGIN = 30;

interface CircularAxisDataParam {
  labels: string[];
  intervalData: InitAxisData;
  defaultAxisData: DefaultRadialAxisData;
  circularAxisLabelMargin: number;
  circularAxisLabelFont: string;
  bandWidth: number;
  options?: GaugeChartOptions;
  solidBarWidth?: number | string;
}

function makeSolidData(
  outerRadius: number,
  barWidth: number | string,
  solidOptions?: boolean | Partial<GaugeSolidOptions>
): SolidData {
  const initialSolidOptions = solidOptions ?? false;
  const solidBarWidth = calculateSizeWithPercentString(outerRadius, barWidth);
  const defaultSolidOptions = {
    visible: true,
    radiusRange: {
      inner: outerRadius - solidBarWidth,
      outer: outerRadius,
    },
    barWidth: solidBarWidth,
    clockHand: false,
  };

  if (!initialSolidOptions) {
    return { ...defaultSolidOptions, visible: false };
  }

  return isObject(initialSolidOptions)
    ? { ...defaultSolidOptions, ...initialSolidOptions }
    : defaultSolidOptions;
}

function getCircularAxisData({
  labels,
  intervalData,
  circularAxisLabelMargin,
  circularAxisLabelFont,
  defaultAxisData,
  bandWidth,
  options,
  solidBarWidth,
}: CircularAxisDataParam): CircularAxisData {
  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    circularAxisLabelMargin,
    circularAxisLabelFont
  );
  const {
    totalAngle,
    axisSize,
    centerX,
    centerY,
    startAngle,
    endAngle,
    drawingStartAngle,
    clockwise,
  } = defaultAxisData;
  const { tickInterval, labelInterval } = intervalData;
  const outerRadius = axisSize - bandWidth - RANGE_BAR_MARGIN;
  const solidBarWidthValue = solidBarWidth ?? outerRadius * 0.1;
  const solidData = makeSolidData(
    outerRadius - circularAxisLabelMargin - maxLabelHeight - (circularAxisLabelMargin - 5),
    solidBarWidthValue,
    options?.series?.solid
  );
  const centralAngle = totalAngle / (labels.length + (totalAngle < DEGREE_360 ? -1 : DEGREE_0));
  const maxClockHandSize =
    outerRadius -
    circularAxisLabelMargin -
    maxLabelHeight -
    CLOCK_HAND_MARGIN +
    (solidData.visible ? -solidData.barWidth - CLOCK_HAND_MARGIN : 0);

  return {
    axisSize,
    centerX,
    centerY,
    label: {
      labels,
      interval: labelInterval,
      margin: circularAxisLabelMargin,
      maxWidth: maxLabelWidth,
      maxHeight: maxLabelHeight,
    },
    radius: {
      inner: 0,
      outer: outerRadius,
    },
    angle: {
      start: startAngle,
      end: endAngle,
      total: totalAngle,
      central: centralAngle,
      drawingStart: drawingStartAngle,
    },
    band: {
      width: bandWidth,
      margin: RANGE_BAR_MARGIN,
    },
    tickInterval,
    clockwise,
    maxClockHandSize,
    title: makeTitleOption(options?.circularAxis?.title),
    solidData,
  };
}

function makeLabels(options: GaugeChartOptions, rawLabels: string[], axisName: string) {
  const formatter = options[axisName]?.label?.formatter ?? ((value) => value);

  return rawLabels.map((label, index) => formatter(label, { index, labels: rawLabels, axisName }));
}

function getAxisLabels(
  isLabelOnVerticalAxis: boolean,
  options: GaugeChartOptions,
  categories: string[],
  scale: Scale
) {
  const valueAxisName: RadialAxisType = isLabelOnVerticalAxis
    ? RadialAxisType.CIRCULAR
    : RadialAxisType.VERTICAL;
  const { limit, stepSize } = scale[valueAxisName]!;
  const valueLabels = makeLabels(options, makeLabelsFromLimit(limit, stepSize), valueAxisName);
  const categoryLabels = makeLabels(
    options,
    categories,
    isLabelOnVerticalAxis ? RadialAxisType.VERTICAL : RadialAxisType.CIRCULAR
  );

  return isLabelOnVerticalAxis ? valueLabels : categoryLabels;
}

function getAxisLabelMargin(options: GaugeChartOptions) {
  return options?.circularAxis?.label?.margin ?? DEFAULT_LABEL_PADDING;
}

function hasAxesLayoutChanged(previousAxes: CircularAxisData, currentAxes: CircularAxisData) {
  const prevMaxWidth = previousAxes?.label?.maxWidth;
  const prevMaxHeight = previousAxes?.label?.maxHeight;
  const curMaxWidth = currentAxes.label.maxWidth;
  const curMaxHeight = currentAxes.label.maxHeight;

  return prevMaxHeight !== curMaxHeight || prevMaxWidth !== curMaxWidth;
}

const axes: StoreModule = {
  name: 'gaugeAxes',
  state: () => ({
    radialAxes: {
      circularAxis: {} as CircularAxisData,
    },
  }),
  action: {
    setCircularAxisData({ state }) {
      const { series, layout, scale } = state;
      const categories = state.categories as string[];
      const { plot } = layout;
      const isLabelOnVerticalAxis = isLabelAxisOnYAxis({ series, categories });
      const options = state.options as GaugeChartOptions;
      const theme = state.theme;

      const circularAxisLabelFont = getTitleFontString(
        (theme.circularAxis as Required<CircularAxisTheme>).label
      );

      const circularAxisLabelMargin = getAxisLabelMargin(options);

      const circularAxisLabels = getAxisLabels(isLabelOnVerticalAxis, options, categories, scale);

      const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
        circularAxisLabels,
        circularAxisLabelMargin,
        circularAxisLabelFont
      );

      const defaultAxisData = getDefaultRadialAxisData(
        options,
        plot,
        maxLabelWidth,
        maxLabelHeight,
        isLabelOnVerticalAxis
      );
      const dataLabelHeight = getFontHeight(
        getTitleFontString((theme.series.gauge as GaugeChartSeriesTheme).dataLabels!)
      );
      const dataLabelOffsetY = options?.series?.dataLabels?.offsetY ?? DATA_LABEL_MARGIN;

      if (defaultAxisData.isSemiCircular) {
        defaultAxisData.centerY =
          defaultAxisData.centerY - (dataLabelOffsetY > 0 ? dataLabelOffsetY + dataLabelHeight : 0);
        const diffHeight = defaultAxisData.centerY - defaultAxisData.axisSize;
        defaultAxisData.axisSize += diffHeight < 0 ? diffHeight : 0;
      }

      const defualtBandWidth = (options as GaugeChartOptions)?.plot?.bands?.length
        ? defaultAxisData.axisSize / 2 - RANGE_BAR_MARGIN
        : 0;
      const bandWidth = (theme.plot as GaugePlotTheme)?.bands?.barWidth ?? defualtBandWidth;

      const circularAxisData = getCircularAxisData({
        labels: circularAxisLabels,
        intervalData: getInitAxisIntervalData(true, {
          axis: options.circularAxis,
          categories,
          layout,
        }),
        defaultAxisData,
        circularAxisLabelMargin,
        circularAxisLabelFont,
        bandWidth,
        options,
        solidBarWidth: theme.series.gauge?.solid?.barWidth,
      });

      if (hasAxesLayoutChanged(state.radialAxes?.circularAxis, circularAxisData)) {
        this.notify(state, 'layout');
      }

      state.radialAxes = {
        circularAxis: circularAxisData,
      };
    },
    addGaugePlotBand({ state }, { data }: { data: GaugePlotBand }) {
      const bands = (state.options as GaugeChartOptions)?.plot?.bands ?? [];

      if (!isExistPlotId(bands, data)) {
        this.dispatch('updateOptions', { options: { plot: { bands: [...bands, data] } } });
      }
    },
    removeGaugePlotBand({ state }, { id }: { id: string }) {
      const bands = ((state.options as GaugeChartOptions)?.plot?.bands ?? []).filter(
        ({ id: bandId }) => bandId !== id
      );

      this.dispatch('updateOptions', { options: { plot: { bands } } });
    },
  },
  observe: {
    updateRadialAxes() {
      this.dispatch('setCircularAxisData');
    },
  },
};

export default axes;
