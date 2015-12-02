/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var AreaChartSeries = tui.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
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
     * Make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {object} series data
     */
    makeSeriesData: function(bound) {
        var dimension = bound.dimension,
            limitDistance = this.getLimitDistanceFromZeroPoint(dimension.height, this.data.limit),
            zeroTop = limitDistance.toMax;

        if (this.data.limit.min >= 0 && !zeroTop) {
            zeroTop = dimension.height;
        }

        return {
            groupPositions: this.makePositions(dimension),
            zeroTop: zeroTop
        };
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;
