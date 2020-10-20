export function getRadialRadiusValues(labels: string[], size: number, deleteCount = 0): number[] {
  const result = labels.map((_, index) => (index / (labels.length - 1)) * size);

  if (deleteCount) {
    result.splice(result.length - deleteCount);
  }

  return result;
}
