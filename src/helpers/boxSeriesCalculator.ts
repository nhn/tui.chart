function limitNegative(value: number, min: number, max: number) {
  if (value >= max) {
    return 0;
  }

  let result = value;

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
  currentIndex: number,
  includedCurrentIndex = false
) {
  const curValue = values[currentIndex];

  return values.reduce((total, value, idx) => {
    const isBefore = includedCurrentIndex ? idx <= currentIndex : idx < currentIndex;
    const isSameSign = value * curValue >= 0;

    if (isBefore && isSameSign) {
      return total + value;
    }

    return total;
  }, 0);
}

export function outsideRange(values: number[], currentIndex: number, min: number, max: number) {
  const value = values[currentIndex];
  const totalOfBeforeValues = sumValuesBeforeIndex(values, currentIndex, false);
  const positive = value >= 0;
  const negative = value < 0;

  return (
    (positive && totalOfBeforeValues >= max) ||
    (negative && totalOfBeforeValues <= min) ||
    (currentIndex === 0 && positive && value < min) ||
    (currentIndex === 0 && negative && value > max)
  );
}

export function calibrateBoxStackDrawingValue(
  values: number[],
  currentIndex: number,
  min: number,
  max: number
) {
  const totalOfBeforeValues = sumValuesBeforeIndex(values, currentIndex, false);
  const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);

  if (outsideRange(values, currentIndex, min, max)) {
    return null;
  }

  if (currentIndex === 0) {
    return calibrateDrawingValue(values[currentIndex], min, max);
  }

  if (totalOfBeforeValues < min && totalOfValues > max) {
    return max - min;
  }

  let result = values[currentIndex];

  if (totalOfValues > max) {
    result = max - totalOfBeforeValues;
  } else if (totalOfValues < min) {
    result = min - totalOfBeforeValues;
  } else if (totalOfBeforeValues < min) {
    result = totalOfValues - min;
  } else if (totalOfBeforeValues > max) {
    result = totalOfValues - max;
  }

  return result;
}
