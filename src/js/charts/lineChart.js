/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var autoTickMixer = require('./autoTickMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var Series = require('../series/lineChartSeries');

var LineChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-line-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Line chart.
     * @constructs LineChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
        this._initForAutoTickInterval();
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
    },

    /**
     * Resize.
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     * @override
     */
    resize: function(dimension) {
        this._initForAutoTickInterval();
        ChartBase.prototype.resize.call(this, dimension);
    }
});

tui.util.extend(LineChart.prototype,
    axisTypeMixer, lineTypeMixer, autoTickMixer, zoomMixer, addingDynamicDataMixer);

module.exports = LineChart;
