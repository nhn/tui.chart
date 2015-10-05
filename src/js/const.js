/**
 * @fileoverview chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

module.exports = {
    CHART_DEFAULT_WIDTH: 500,
    CHART_DEFAULT_HEIGHT: 400,
    HIDDEN_WIDTH: 1,
    TEXT_PADDING: 2,
    SERIES_EXPAND_SIZE: 10,
    SERIES_LABEL_PADDING: 5,
    DEFAULT_TITLE_FONT_SIZE: 14,
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    DEFAULT_LABEL_FONT_SIZE: 12,
    DEFAULT_PLUGIN: 'raphael',
    DEFAULT_TICK_COLOR: 'black',
    DEFAULT_THEME_NAME: 'default',
    STACKED_NORMAL_TYPE: 'normal',
    STACKED_PERCENT_TYPE: 'percent',
    ANGLE_360: 360,
    RAD: Math.PI / 180,
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    SERIES_LEGEND_TYPE_OUTER: 'outer',
    SERIES_OUTER_LABEL_PADDING: 20,
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    PIE_GRAPH_SMALL_RATE: 0.65,
    CHART_TYPE_BAR: 'bar',
    CHART_TYPE_COLUMN: 'column',
    CHART_TYPE_LINE: 'line',
    CHART_TYPE_AREA: 'area',
    CHART_TYPE_COMBO: 'combo',
    CHART_TYPE_PIE: 'pie',
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors'] // series theme의 속성 - chart type filtering할 때 사용됨
};
