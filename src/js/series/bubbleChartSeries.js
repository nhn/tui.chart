/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');

var BubbleChartSeries = tui.util.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BubbleChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bounds of bar chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        return [];
    }
});


module.exports = BubbleChartSeries;
