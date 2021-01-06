export const message = {
  SELECT_SERIES_API_SELECTABLE_ERROR: 'It works only when the selectable option is true.',
  SELECT_SERIES_API_INDEX_ERROR: 'The index value is invalid.',
  ALREADY_OBSERVABLE_ERROR: 'Source object is observable already',
  CIRCLE_LEGEND_RENDER_ERROR: 'circleLegend is only possible when bubble series is present',
  noDataError: (chartName: string) => `There's no ${chartName} data!`,
  noBrushError: (brushName: string) => `Brush don't exist in painter: ${brushName}`,
};
