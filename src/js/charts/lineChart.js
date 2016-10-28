/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var Series = require('../components/series/lineChartSeries');

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
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     * @constructs LineChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
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
        this._initForAddingData();
        this._changeCheckedLegends(checkedLegends, rawData, boundsParams);
    }
});

tui.util.extend(LineChart.prototype,
    axisTypeMixer, lineTypeMixer, zoomMixer, addingDynamicDataMixer);

module.exports = LineChart;
