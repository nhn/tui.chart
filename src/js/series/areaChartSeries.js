/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase'),
    chartConst = require('../const');

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
     * Make position top of zero point.
     * @param {{height: number}} dimension dimension
     * @returns {number} position top
     * @private
     */
    _makePositionTopOfZeroPoint: function() {
        var dimension = this.bound.dimension,
            limit = this.data.limit,
            limitDistance = this._getLimitDistanceFromZeroPoint(dimension.height, limit),
            top = limitDistance.toMax;

        if (limit.min >= 0 && !top) {
            top = dimension.height;
        }

        return top + chartConst.SERIES_EXPAND_SIZE;
    },

    /**
     * Make stacked positions.
     * @param {array.<array.<{left: number, top: number}>>} groupPositions group positions
     * @returns {array.<array.<{left: number, top: number, startTop: number}>>} stacked positions
     * @private
     */
    _makeStackedPositions: function(groupPositions) {
        var height = this.bound.dimension.height + chartConst.SERIES_EXPAND_SIZE,
            firstStartTop = this._makePositionTopOfZeroPoint(),
            prevPositionTops = [];

        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position, index) {
                var prevTop = prevPositionTops[index] || firstStartTop,
                    stackedHeight = height - position.top,
                    top = prevTop - stackedHeight;

                position.startTop = prevTop;
                position.top = top;

                prevPositionTops[index] = top;
                return position;
            });
        });
    },

    /**
     * Make normal positions.
     * @param {array.<array.<{left: number, top: number}>>} groupPositions group positions
     * @returns {array.<array.<{left: number, top: number, startTop: number}>>} stacked positions
     * @private
     */
    _makeNormalPositions: function(groupPositions) {
        var startTop = this._makePositionTopOfZeroPoint();

        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position) {
                position.startTop = startTop;
                return position;
            });
        });
    },

    /**
     * Make positions.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {array.<array.<{left: number, top: number, startTop: number}>>} stacked positions
     * @private
     */
    _makePositions: function(dimension) {
        var groupPositions = this._makeBasicPositions(dimension);

        if (this.options.stacked) {
            groupPositions = this._makeStackedPositions(groupPositions);
        } else {
            groupPositions = this._makeNormalPositions(groupPositions);
        }

        return groupPositions;
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
        var zeroTop = this._getLimitDistanceFromZeroPoint(bound.dimension.height, this.data.limit).toMax;

        return {
            groupPositions: this._makePositions(bound.dimension),
            zeroTop: zeroTop + chartConst.SERIES_EXPAND_SIZE
        };
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;
