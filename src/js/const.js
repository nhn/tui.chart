/**
 * @fileoverview Chart const
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Chart const
 * @readonly
 * @enum {number|string}
 * @private
 */
var chartConst = {
    /** tui class names
     * @type {string}
     */
    CLASS_NAME_LEGEND_LABEL: 'tui-chart-legend-label',
    /** @type {string} */
    CLASS_NAME_LEGEND_CHECKBOX: 'tui-chart-legend-checkbox',
    /** @type {string} */
    CLASS_NAME_SERIES_LABEL: 'tui-chart-series-label',
    /** @type {string} */
    CLASS_NAME_SERIES_LEGEND: 'tui-chart-series-legend',
    /** @type {string} */
    CLASS_NAME_RESET_ZOOM_BTN: 'tui-chart-reset-zoom-btn',
    /** @type {string} */
    CLASS_NAME_CHART_EXPORT_MENU_AREA: 'tui-chart-chartExportMenu-area',
    /** @type {string} */
    CLASS_NAME_CHART_EXPORT_MENU_ITEM: 'tui-chart-chartExportMenu-item',
    /** @type {string} */
    CLASS_NAME_CHART_EXPORT_MENU_BUTTON: 'tui-chart-chartExportMenu-button',
    /** chart type
     * @type {string}
     */
    CHART_TYPE_BAR: 'bar',
    /** @type {string} */
    CHART_TYPE_COLUMN: 'column',
    /** @type {string} */
    CHART_TYPE_LINE: 'line',
    /** @type {string} */
    CHART_TYPE_AREA: 'area',
    /** @type {string} */
    CHART_TYPE_COMBO: 'combo',
    /** @type {string} */
    CHART_TYPE_COLUMN_LINE_COMBO: 'columnLineCombo',
    /** @type {string} */
    CHART_TYPE_LINE_SCATTER_COMBO: 'lineScatterCombo',
    /** @type {string} */
    CHART_TYPE_LINE_AREA_COMBO: 'lineAreaCombo',
    /** @type {string} */
    CHART_TYPE_PIE_DONUT_COMBO: 'pieDonutCombo',
    /** @type {string} */
    CHART_TYPE_PIE: 'pie',
    /** @type {string} */
    CHART_TYPE_BUBBLE: 'bubble',
    /** @type {string} */
    CHART_TYPE_SCATTER: 'scatter',
    /** @type {string} */
    CHART_TYPE_HEATMAP: 'heatmap',
    /** @type {string} */
    CHART_TYPE_TREEMAP: 'treemap',
    /** @type {string} */
    CHART_TYPE_MAP: 'map',
    /** @type {string} */
    CHART_TYPE_RADIAL: 'radial',
    /** @type {string} */
    CHART_TYPE_BOXPLOT: 'boxplot',
    /** @type {string} */
    CHART_TYPE_BULLET: 'bullet',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default height */
    CHART_DEFAULT_HEIGHT: 400,
    /** overlapping width of xAxis and yAxis */
    OVERLAPPING_WIDTH: 1,
    /** rendered text padding */
    TEXT_PADDING: 2,
    /** series expand size */
    SERIES_EXPAND_SIZE: 10,
    /** series label padding */
    SERIES_LABEL_PADDING: 5,
    /** default font size of title */
    DEFAULT_TITLE_FONT_SIZE: 14,
    /** default font size of axis title */
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    /** default font size of label */
    DEFAULT_LABEL_FONT_SIZE: 12,
    /** default font size of series label */
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    /** default graph plugin
     * @type {string}
     */
    DEFAULT_PLUGIN: 'Raphael',
    /** default tick color
     * @type {string}
     */
    DEFAULT_TICK_COLOR: 'black',
    /** default theme name
     * @type {string}
     */
    DEFAULT_THEME_NAME: 'default',
    MAX_HEIGHT_WORD: 'A',
    /** stack type
     * @type {string}
     */
    NORMAL_STACK_TYPE: 'normal',
    /** @type {string} */
    PERCENT_STACK_TYPE: 'percent',
    /** default stack
     * @type {string}
     */
    DEFAULT_STACK: '___DEFAULT___STACK___',
    /** dummy key
     * @type {string}
     */
    DUMMY_KEY: '___DUMMY___KEY___',
    /** root id of treemap
     * @type {string}
     */
    TREEMAP_ROOT_ID: '___TUI_TREEMAP_ROOT___',
    /** id prefix of treemap
     * @type {string}
     */
    TREEMAP_ID_PREFIX: '___TUI_TREEMAP_ID___',
    /** prefix for caching seriesItems
     * @type {string}
     */
    TREEMAP_DEPTH_KEY_PREFIX: '___TUI_TREEMAP_DEPTH___',
    /** @type {string} */
    TREEMAP_PARENT_KEY_PREFIX: '___TUI_TREEMAP_PARENT___',
    /** @type {string} */
    TREEMAP_LEAF_KEY_PREFIX: '___TUI_TREEMAP_LEAF___',
    /** @type {string} */
    TREEMAP_LIMIT_DEPTH_KEY_PREFIX: '___TUI_TREEMAP_LIMIT_DEPTH___',
    /** default border color for treemap chart
     * @type {string}
     */
    TREEMAP_DEFAULT_BORDER: '#ccc',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    RERENDER_TIME: 700,
    ADDING_DATA_ANIMATION_DURATION: 300,
    /** series label align outer
     * @type {string}
     */
    LABEL_ALIGN_OUTER: 'outer',
    /** @type {string} */
    LEGEND_ALIGN_TOP: 'top',
    /** @type {string} */
    LEGEND_ALIGN_BOTTOM: 'bottom',
    /** @type {string} */
    LEGEND_ALIGN_LEFT: 'left',
    /** @type {number} */
    LEGEND_PAGINATION_BUTTON_WIDTH: 10,
    /** @type {number} */
    LEGEND_PAGINATION_BUTTON_PADDING_LEFT: 5,
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default ratio for pie graph */
    PIE_GRAPH_DEFAULT_RATIO: 0.9,
    /** small ratio for pie graph */
    PIE_GRAPH_SMALL_RATIO: 0.75,
    /** tick count for spectrum legend */
    SPECTRUM_LEGEND_TICK_COUNT: 4,
    /** legend & lable concat separator */
    LABEL_SEPARATOR: '\n',
    /** default position ratio of map chart label
     * @type {object}
     */
    MAP_CHART_LABEL_DEFAULT_POSITION_RATIO: {
        x: 0.5,
        y: 0.5
    },
    /** dot radius */
    DOT_RADIUS: 4,
    /** radius for circle of scatter chart*/
    SCATTER_RADIUS: 5,
    /**
     * theme properties
     * @type {{yAxis: Array.<string>, series: Array.<string>}}
     */
    THEME_PROPS_MAP: {
        yAxis: ['tickColor', 'title', 'label'],
        series: ['label', 'colors', 'borderColor', 'borderWidth', 'selectionColor', 'startColor', 'endColor',
            'overColor', 'dot', 'ranges']
    },
    /** title area width padding */
    TITLE_AREA_WIDTH_PADDING: 20,
    /** top margin of x axis label */
    XAXIS_LABEL_TOP_MARGIN: 10,
    /** right padding of vertical label */
    V_LABEL_RIGHT_PADDING: 10,
    /** tooltip prefix
     * @type {string}
     */
    TOOLTIP_PREFIX: 'tui-chart-tooltip',
    /** tooltip z-index **/
    TOOLTIP_ZINDEX: 500,
    /** tooltip animation time */
    TOOLTIP_ANIMATION_TIME: 100,
    /** tooltip animation time for pie chart */
    TOOLTIP_PIE_ANIMATION_TIME: 50,
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 45,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 65,
    /** axis scale for percent stack option
     * @type {object}
     */
    PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: 0,
            max: 100
        },
        step: 25,
        labels: [0, 25, 50, 75, 100]
    },
    /** axis scale for minus percent stack option
     * @type {object}
     */
    MINUS_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 0
        },
        step: 25,
        labels: [0, -25, -50, -75, -100]
    },
    /** axis scale of dual percent stack option
     * @type {object}
     */
    DUAL_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 100
        },
        step: 25,
        labels: [-100, -75, -50, -25, 0, 25, 50, 75, 100]
    },
    /** axis scale of diverging percent stack option
     * @type {object}
     */
    DIVERGING_PERCENT_STACKED_AXIS_SCALE: {
        limit: {
            min: -100,
            max: 100
        },
        step: 25,
        labels: [100, 75, 50, 25, 0, 25, 50, 75, 100]
    },
    /**
     * datetime axis type
     * @type {string}
     */
    AXIS_TYPE_DATETIME: 'datetime',
    /**
     * default dateFormat
     * @type {string}
     */
    DEFAULT_DATE_FORMAT: 'YYYY.MM.DD hh:mm:dd',
    /**
     * date type
     * @type {string}
     */
    DATE_TYPE_YEAR: 'year',
    DATE_TYPE_MONTH: 'month',
    DATE_TYPE_WEEK: 'week',
    DATE_TYPE_DATE: 'date',
    DATE_TYPE_HOUR: 'hour',
    DATE_TYPE_MINUTE: 'minute',
    DATE_TYPE_SECOND: 'second',
    /** title add padding */
    TITLE_PADDING: 10,
    /** legend area padding */
    LEGEND_AREA_PADDING: 10,
    /** legend checkbox width */
    LEGEND_CHECKBOX_WIDTH: 10,
    LEGEND_ICON_WIDTH: 40,
    LEGEND_ICON_HEIGHT: 15,
    /** lgend label left padding */
    LEGEND_LABEL_LEFT_PADDING: 5,
    MIN_LEGEND_WIDTH: 100,
    /** map legend height */
    MAP_LEGEND_SIZE: 200,
    /** map legend graph size */
    MAP_LEGEND_GRAPH_SIZE: 25,
    /** map legend label padding */
    MAP_LEGEND_LABEL_PADDING: 10,
    CIRCLE_LEGEND_LABEL_FONT_SIZE: 9,
    CIRCLE_LEGEND_PADDING: 10,
    HALF_RATIO: 0.5,
    /** AXIS LABEL PADDING */
    AXIS_LABEL_PADDING: 7,
    /** rotations degree candidates */
    DEGREE_CANDIDATES: [25, 45, 65, 85],
    /**
     * auto tick interval
     * @type {string}
     */
    TICK_INTERVAL_AUTO: 'auto',
    /** yAxis align option
     * @type {string}
     */
    YAXIS_ALIGN_CENTER: 'center',
    /** xAxis label compare margin */
    XAXIS_LABEL_COMPARE_MARGIN: 20,
    /** xAxis label gutter */
    XAXIS_LABEL_GUTTER: 2,
    /**
     * Standard multiple nums of axis
     * @type {Array}
     */
    AXIS_STANDARD_MULTIPLE_NUMS: [1, 2, 5, 10, 20, 50, 100],
    /**
     * Last standard multiple num of axis
     */
    AXIS_LAST_STANDARD_MULTIPLE_NUM: 100,
    /** label padding top */
    LABEL_PADDING_TOP: 3,
    /** line margin top */
    LINE_MARGIN_TOP: 5,
    /** tooltip gap */
    TOOLTIP_GAP: 5,
    /** tooltip direction
     * @type {string}
     */
    TOOLTIP_DIRECTION_FORWARD: 'forword',
    /** @type {string} */
    TOOLTIP_DIRECTION_CENTER: 'center',
    /** @type {string} */
    TOOLTIP_DIRECTION_BACKWARD: 'backword',
    /** tooltip align options
     * @type {string}
     */
    TOOLTIP_DEFAULT_ALIGN_OPTION: 'center top',
    /** @type {string} */
    TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION: 'center bottom',
    /** hide delay */
    HIDE_DELAY: 200,
    OLD_BROWSER_OPACITY_100: 100,
    SERIES_LABEL_OPACITY: 0.3,
    WHEEL_TICK: 120,
    MAX_ZOOM_MAGN: 5,
    FF_WHEELDELTA_ADJUSTING_VALUE: -40,
    IE7_ROTATION_FILTER_STYLE_MAP: {
        25: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.9063077870366499, M12=0.42261826174069944, M21=-0.42261826174069944, M22=0.9063077870366499)"',
        45: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.7071067811865476, M12=0.7071067811865475, M21=-0.7071067811865475, M22=0.7071067811865476)"',
        65: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.42261826174069944, M12=0.9063077870366499, M21=-0.9063077870366499, M22=0.42261826174069944)"',
        85: ' style="filter: progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\',' +
                ' M11=0.08715574274765814, M12=0.9961946980917455, M21=-0.9961946980917455, M22=0.08715574274765814)"'
    },
    /** prefix for public event
     * @type {string}
     */
    PUBLIC_EVENT_PREFIX: 'public_',
    /** public event map
     * @type {object}
     */
    PUBLIC_EVENT_MAP: {
        load: true,
        selectLegend: true,
        selectSeries: true,
        unselectSeries: true,
        beforeShowTooltip: true,
        afterShowTooltip: true,
        beforeHideTooltip: true,
        zoom: true
    },
    /** for radial */
    RADIAL_PLOT_PADDING: 15, // Prevent cross paper boundaries by line width
    RADIAL_MARGIN_FOR_CATEGORY: 60,
    RADIAL_CATEGORY_PADDING: 20,

    COMPONENT_TYPE_DOM: 'DOM',
    COMPONENT_TYPE_RAPHAEL: 'Raphael',

    IMAGE_EXTENSIONS: ['png', 'jpeg'],
    DATA_EXTENSIONS: ['xls', 'csv'],

    GUIDE_AREACHART_AREAOPACITY_TYPE: 'areaOpacity should be a number between 0 and 1',

    /** for bullet */
    BULLET_TYPE_ACTUAL: 'Actual',
    BULLET_TYPE_RANGE: 'Ranges',
    BULLET_TYPE_MARKER: 'Markers',
    BULLET_MARKER_STROKE_TICK: 3,
    BULLET_MARKER_BUFFER_POSITION: 5,
    BULLET_RANGES_HEIGHT_RATIO: 0.7,
    BULLET_ACTUAL_HEIGHT_RATIO: 0.28,
    BULLET_MARKERS_HEIGHT_RATIO: 0.55,
    BULLET_MARKER_DETECT_PADDING: 3
};
module.exports = chartConst;
