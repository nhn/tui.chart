export function getRadarRadiusValues(
  labels: string[],
  size: number,
  deletedCountFromEndOfArray = 0
): number[] {
  const result = labels.map((_, index) => ((index + 1) / labels.length) * size);

  if (deletedCountFromEndOfArray) {
    result.splice(result.length - deletedCountFromEndOfArray);
  }

  return result;
}
