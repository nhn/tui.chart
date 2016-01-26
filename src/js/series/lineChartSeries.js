/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var LineChartSeries = tui.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
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
     * Make positions.
     * @returns {Array.<Array.<{left: number, top: number}>>} positions
     * @private
     */
    _makePositions: function() {
        return this._makeBasicPositions();
    },

    /**
     * Make series data.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            groupPositions: this._makePositions()
        };
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;
