/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var rawDataHandler = require('../models/data/rawDataHandler');
var Series = require('../components/series/areaChartSeries');

var AreaChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-area-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Area chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        rawDataHandler.removeSeriesStack(rawData.series);
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
        this._initForAddingData();
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._changeCheckedLegends(checkedLegends, rawData, boundsParams);
    }
});

tui.util.extend(AreaChart.prototype,
    axisTypeMixer, lineTypeMixer, zoomMixer, addingDynamicDataMixer);

module.exports = AreaChart;
