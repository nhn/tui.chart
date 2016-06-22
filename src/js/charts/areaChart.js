/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var axisTypeMixer = require('./axisTypeMixer');
var rawDataHandler = require('../helpers/rawDataHandler');
var Series = require('../series/areaChartSeries');

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
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        rawDataHandler.removeSeriesStack(rawData.series);
        this._lineTypeInit(rawData, theme, options);
    }
});

axisTypeMixer.mixin(AreaChart);
lineTypeMixer.mixin(AreaChart);

module.exports = AreaChart;
