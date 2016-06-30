/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var LineTypeSeriesBase = require('./lineTypeSeriesBase');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');

var AreaChartSeries = tui.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
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
     * Make position top of zero point.
     * @returns {number} position top
     * @private
     */
    _makePositionTopOfZeroPoint: function() {
        var dimension = this.boundsMaker.getDimension('series');
        var limit = this.boundsMaker.getAxesData().yAxis.limit;
        var top = this._getLimitDistanceFromZeroPoint(dimension.height, limit).toMax;

        if (limit.min >= 0 && !top) {
            top = dimension.height;
        }

        return top + chartConst.SERIES_EXPAND_SIZE;
    },

    /**
     * Make stackType positions.
     * @param {Array.<Array.<{left: number, top: number}>>} groupPositions group positions
     * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
     * @private
     */
    _makeStackedPositions: function(groupPositions) {
        var height = this.boundsMaker.getDimension('series').height + chartConst.SERIES_EXPAND_SIZE,
            firstStartTop = this._makePositionTopOfZeroPoint(),
            prevPositionTops = [];

        return tui.util.map(groupPositions, function(positions) {
            return tui.util.map(positions, function(position, index) {
                var prevTop = prevPositionTops[index] || firstStartTop;
                var stackedHeight = height - position.top;
                var top = prevTop - stackedHeight;

                position.startTop = prevTop;
                position.top = top;

                prevPositionTops[index] = top;
                return position;
            });
        });
    },

    /**
     * Make positions.
     * @param {number} seriesWidth - width of series area
     * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
     * @private
     */
    _makePositions: function(seriesWidth) {
        var groupPositions = this._makeBasicPositions(seriesWidth);

        if (predicate.isValidStackOption(this.options.stackType)) {
            groupPositions = this._makeStackedPositions(groupPositions);
        }

        return groupPositions;
    },

    /**
     * Make series data.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var dimension = this.boundsMaker.getDimension('series'),
            zeroTop = this._getLimitDistanceFromZeroPoint(dimension.height, this.data.limit).toMax;

        return {
            chartBackground: this.chartBackground,
            groupPositions: this._makePositions(),
            hasRangeData: this.dataProcessor.getSeriesDataModel(this.seriesName).hasRangeData(),
            zeroTop: zeroTop + chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Rerender.
     * @param {object} data - data for rerendering
     * @override
     */
    rerender: function(data) {
        this._cancelMovingAnimation();
        Series.prototype.rerender.call(this, data);
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;
