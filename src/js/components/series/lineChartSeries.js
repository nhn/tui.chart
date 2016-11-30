/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var LineChartSeries = tui.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @private
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);

        /**
         * object for requestAnimationFrame
         * @type {null | {id: number}}
         */
        this.movingAnimation = null;
    },

    /**
     * Make positions for rendering graph and sending to mouse event detector.
     * @param {number} [seriesWidth] - series width
     * @returns {Array.<Array.<{left: number, top: number}>>} positions
     * @private
     */
    _makePositions: function(seriesWidth) {
        return this._makeBasicPositions(seriesWidth);
    },

    /**
     * Make series data for rendering graph and sending to mouse event detector.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            chartBackground: this.chartBackground,
            groupPositions: this._makePositions()
        };
    },

    /**
     * Rerender.
     * @param {object} data - data for rerendering
     * @override
     */
    rerender: function(data) {
        var paper;

        this._cancelMovingAnimation();

        paper = Series.prototype.rerender.call(this, data);

        return paper;
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;
