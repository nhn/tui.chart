import { getPercentageValue, isString, isNull } from './utils';
import { PieSeriesType, NestedPieSeriesType, PieDataLabels } from '@t/options';
import { TooltipData } from '@t/components/tooltip';
import { RawSeries, OptionsWithDataLabels } from '@t/store/store';
import {
  DEGREE_NEGATIVE_90,
  DEGREE_90,
  DEGREE_180,
  DEGREE_NEGATIVE_180,
  DEGREE_360,
  DEGREE_0,
} from './sector';

const semiCircleCenterYRatio = {
  COUNTER_CLOCKWISE: 0.1,
  CLOCKWISE: 1,
};

export function hasClockwiseSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    clockwise &&
    ((startAngle >= DEGREE_NEGATIVE_90 && endAngle <= DEGREE_90) ||
      (startAngle >= DEGREE_90 && endAngle <= DEGREE_180))
  );
}

export function hasCounterClockwiseSemiCircle(
  clockwise: boolean,
  startAngle: number,
  endAngle: number
) {
  return (
    !clockwise &&
    ((startAngle >= DEGREE_NEGATIVE_180 && endAngle <= DEGREE_90) ||
      (startAngle <= DEGREE_90 && endAngle >= DEGREE_NEGATIVE_90))
  );
}

export function getRadius(defaultRadius: number, radius: string | number): number {
  return isString(radius)
    ? Number(((defaultRadius * getPercentageValue(radius)) / 100).toFixed(2))
    : radius;
}

export function getTotalAngle(clockwise: boolean, startAngle: number, endAngle: number) {
  const diffAngle = endAngle - startAngle;
  const absDiff = Math.abs(diffAngle);
  const needSubstractAngle =
    (diffAngle > DEGREE_0 && absDiff !== DEGREE_360 && !clockwise) ||
    (diffAngle < DEGREE_0 && absDiff !== DEGREE_360 && clockwise);

  return needSubstractAngle ? DEGREE_360 - absDiff : absDiff;
}

export function isSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    getTotalAngle(clockwise, startAngle, endAngle) <= DEGREE_180 &&
    (hasClockwiseSemiCircle(clockwise, startAngle, endAngle) ||
      hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle))
  );
}

export function getSemiCircleCenterY(rectHeight: number, clockwise: boolean) {
  return clockwise
    ? rectHeight * semiCircleCenterYRatio.CLOCKWISE
    : rectHeight * semiCircleCenterYRatio.COUNTER_CLOCKWISE;
}

export function makePieTooltipData(seriesRawData: PieSeriesType[], category = ''): TooltipData[] {
  return seriesRawData
    .filter(({ data }) => !isNull(data))
    .map<TooltipData>(({ data, name, color, rootParentName }) => ({
      label: name,
      color: color!,
      value: data!,
      category,
      rootParentName,
      templateType: 'pie',
    }));
}

export function hasNestedPieSeries(series: RawSeries) {
  return !!(series.pie && Array.isArray(series.pie[0]?.data));
}

export function getNestedPieChartAliasNames(series: RawSeries) {
  return (series.pie as NestedPieSeriesType[]).map(({ name }) => name);
}

export function pieTooltipLabelFormatter(percentValue: number) {
  const percentageString = percentValue.toFixed(2);
  const percent = parseFloat(percentageString);
  const needSlice = percentageString.length > 5;

  return `${needSlice ? parseFloat(percentageString.substr(0, 4)) : String(percent)}%`;
}

export function hasOuterDataLabel(options: OptionsWithDataLabels, series: RawSeries) {
  return !!series.pie && (options?.series?.dataLabels as PieDataLabels)?.anchor === 'outer';
}

export function hasOuterPieSeriesName(options: OptionsWithDataLabels, series: RawSeries) {
  return (
    !!series.pie &&
    (options?.series?.dataLabels as PieDataLabels)?.pieSeriesName?.anchor === 'outer'
  );
}
