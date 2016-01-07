/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    Series = require('../series/areaChartSeries');

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
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
    }
});

axisTypeMixer.mixin(AreaChart);
lineTypeMixer.mixin(AreaChart);

module.exports = AreaChart;
