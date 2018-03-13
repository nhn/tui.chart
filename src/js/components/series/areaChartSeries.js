/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var LineTypeSeriesBase = require('./lineTypeSeriesBase');
var predicate = require('../../helpers/predicate');
var snippet = require('tui-code-snippet');

var AreaChartSeries = snippet.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
     * @private
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
        var dimension = this.layout.dimension;
        var limit = this.axisDataMap.yAxis.limit;
        var baseTop = this.layout.position.top;
        var top = this._getLimitDistanceFromZeroPoint(dimension.height, limit).toMax + baseTop;

        if (limit.min >= 0 && !top) {
            top = dimension.height;
        }

        return top;
    },

    /**
     * Make positions, when has stackType option.
     * @param {Array.<Array.<{left: number, top: number}>>} groupPositions group positions
     * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
     * @private
     */
    _makeStackedPositions: function(groupPositions) {
        var height = this.layout.dimension.height;
        var baseTop = this.layout.position.top;
        var firstStartTop = this._makePositionTopOfZeroPoint();
        var prevPositionTops = [];

        return snippet.map(groupPositions, function(positions) {
            return snippet.map(positions, function(position, index) {
                var prevTop = prevPositionTops[index] || firstStartTop;
                var positionTop = position ? position.top : 0;
                var stackedHeight = height - positionTop + baseTop;
                var top = position ? prevTop - stackedHeight : prevTop;

                if (position) {
                    position.startTop = prevTop;
                    position.top = top;
                }

                prevPositionTops[index] = top;

                return position;
            });
        });
    },

    /**
     * Make series positions.
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
        var dimension = this.layout.dimension;
        var baseTop = this.layout.position.top;
        var zeroTop = this._getLimitDistanceFromZeroPoint(dimension.height, this.limit).toMax + baseTop;
        var groupPositions = this._makePositions();

        return {
            chartBackground: this.chartBackground,
            groupPositions: groupPositions,
            hasRangeData: this._getSeriesDataModel().hasRangeData(),
            zeroTop: zeroTop,
            isAvailable: function() {
                return groupPositions && groupPositions.length > 0;
            }
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

LineTypeSeriesBase.mixin(AreaChartSeries);

function areaSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'area';
    params.chartBackground = chartTheme.chart.background;

    return new AreaChartSeries(params);
}

areaSeriesFactory.componentType = 'series';
areaSeriesFactory.AreaChartSeries = AreaChartSeries;

module.exports = areaSeriesFactory;
