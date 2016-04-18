/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');

var BubbleChartSeries = tui.util.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs BubbleChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bounds of bubble chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        return [];
    }
});


module.exports = BubbleChartSeries;
