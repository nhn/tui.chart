/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    Series = require('../series/lineChartSeries');

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
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
    }
});

axisTypeMixer.mixin(LineChart);
lineTypeMixer.mixin(LineChart);

module.exports = LineChart;
