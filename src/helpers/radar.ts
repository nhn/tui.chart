export function getRadialRadiusValues(labels: string[], size: number, deleteCount = 0): number[] {
  const result = labels.map((_, index) => ((index + 1) / labels.length) * size);

  if (deleteCount) {
    result.splice(result.length - deleteCount);
  }

  return result;
}
