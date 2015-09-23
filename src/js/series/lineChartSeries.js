/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase.js');

var LineChartSeries = ne.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {
            groupPositions: this.makePositions(this.bound.dimension)
        };
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;
