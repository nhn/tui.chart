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

    _makeStackedPositions: function(groupPositions) {
        var firstStartTop = this._makeZeroTop(this.bound.dimension),
            prevPositionTops = [];

        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position, index) {
                var startTop = prevPositionTops[index] || firstStartTop,
                    stackedHeight = firstStartTop - startTop;

                position.startTop = startTop;

                if (position.top > firstStartTop) {
                    position.top = startTop;
                } else {
                    position.top -= stackedHeight;
                }

                prevPositionTops[index] = position.top;
                return position;
            });
        });
    },

    _makeNormalPositions: function(groupPositions) {
        var zeroTop = this._makeZeroTop(this.bound.dimension);
        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position, index) {
                position.startTop = zeroTop;
                return position;
            });
        });
    },

    _makePositions: function(dimension) {
        var groupPositions = this._makeBasicPositions(dimension);

        if (this.options.stacked) {
            groupPositions = this._makeStackedPositions(groupPositions);
        } else {
            groupPositions = this._makeNormalPositions(groupPositions);
        }

        return groupPositions;
    },

    _makeZeroTop: function(dimension) {
        var limit = this.data.limit,
            limitDistance = this.getLimitDistanceFromZeroPoint(dimension.height, limit),
            zeroTop = limitDistance.toMax;

        if (limit.min >= 0 && !zeroTop) {
            zeroTop = dimension.height;
        }

        return zeroTop;
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
        return {
            groupPositions: this._makePositions(bound.dimension)
        };
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;
