export const message = {
    SELECT_SERIES_API_SELECTABLE_ERROR: 'It works only when the selectable option is true.',
    SELECT_SERIES_API_INDEX_ERROR: 'The index value is invalid.',
    ALREADY_OBSERVABLE_ERROR: 'Source object is observable already',
    CIRCLE_LEGEND_RENDER_ERROR: 'circleLegend is only possible when bubble series is present',
    noDataError: (chartName) => `There's no ${chartName} data!`,
    noBrushError: (brushName) => `Brush don't exist in painter: ${brushName}`,
    DASH_SEGMENTS_UNAVAILABLE_ERROR: 'DashSegments option is available from IE11 and above.',
    SERIES_INDEX_ERROR: 'The seriesIndex value is invalid',
    AUTO_LAYOUT_CONTAINER_SIZE_ERROR: 'To use auto layout, the width or height of the container must be specified as a value such as "%" or "vh", "vw".',
};
