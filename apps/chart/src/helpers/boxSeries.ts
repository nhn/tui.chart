import { Nullable } from '@t/components/series';

function limitNegative(value: number, min: number, max: number) {
  let result = value;

  if (result >= max) {
    return 0;
  }

  if (max < 0) {
    result = Math.min(value - max, 0);
  }

  if (value < min) {
    result -= value - min;
  }

  return result;
}

function limitPositive(value: number, min: number, max: number) {
  let result = value;

  if (min > 0) {
    result = Math.max(value - min, 0);
  }

  if (value > max) {
    result -= value - max;
  }

  return result;
}

export function calibrateDrawingValue(value: number, min: number, max: number) {
  return value < 0 ? limitNegative(value, min, max) : limitPositive(value, min, max);
}

export function sumValuesBeforeIndex(
  values: number[],
  targetIndex: number,
  includeTarget = false
): number {
  const target = values[targetIndex];

  return values.reduce((total, value, idx) => {
    const isBefore = includeTarget ? idx <= targetIndex : idx < targetIndex;
    const isSameSign = value * target >= 0;

    return isBefore && isSameSign ? total + value : total;
  }, 0);
}

export function outsideRange(
  values: number[],
  currentIndex: number,
  min: number,
  max: number
): boolean {
  const value = values[currentIndex];
  const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
  const positive = value >= 0;
  const negative = value < 0;

  return (
    (positive && totalOfIndexBefore >= max) ||
    (negative && totalOfIndexBefore <= min) ||
    (currentIndex === 0 && positive && value < min) ||
    (currentIndex === 0 && negative && value > max)
  );
}

export function calibrateBoxStackDrawingValue(
  values: number[],
  currentIndex: number,
  min: number,
  max: number
): Nullable<number> {
  const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
  const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);

  if (outsideRange(values, currentIndex, min, max)) {
    return null;
  }

  if (currentIndex === 0) {
    return calibrateDrawingValue(values[currentIndex], min, max);
  }

  if (totalOfIndexBefore < min && totalOfValues > max) {
    return max - min;
  }

  let result = values[currentIndex];

  if (totalOfValues > max) {
    result = max - totalOfIndexBefore;
  } else if (totalOfValues < min) {
    result = min - totalOfIndexBefore;
  } else if (totalOfIndexBefore < min) {
    result = totalOfValues - min;
  } else if (totalOfIndexBefore > max) {
    result = totalOfValues - max;
  }

  return result;
}
