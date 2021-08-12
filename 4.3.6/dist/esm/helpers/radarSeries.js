export function getRadialRadiusValues(labels, size, deleteCount = 0) {
    const result = labels.map((_, index) => (index / (labels.length - 1)) * size);
    if (deleteCount) {
        result.splice(result.length - deleteCount);
    }
    return result;
}
