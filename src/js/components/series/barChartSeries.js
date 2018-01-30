/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var BarTypeSeriesBase = require('./barTypeSeriesBase');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var snippet = require('tui-code-snippet');

var BarChartSeries = snippet.defineClass(Series, /** @lends BarChartSeries.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BarChartSeries
     * @private
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
     * Make bound of bar chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} top top position value
     * @param {number} startLeft start left position value
     * @param {number} endLeft end left position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, top, startLeft, endLeft) {
        return {
            start: {
                top: top,
                left: startLeft,
                width: 0,
                height: height
            },
            end: {
                top: top,
                left: endLeft,
                width: width,
                height: height
            }
        };
    },

    /**
     * Calculate additional left for divided option.
     * @param {number} value value
     * @returns {number}
     * @private
     */
    _calculateAdditionalLeft: function(value) {
        var additionalLeft = 0;

        if (this.options.divided && value > 0) {
            additionalLeft = this.dimensionMap.yAxis.width + chartConst.OVERLAPPING_WIDTH;
        }

        return additionalLeft;
    },

    /**
     * Make bar chart bound.
     * @param {{
     *      baseBarSize: number,
     *      groupSize: number,
     *      barSize: number,
     *      pointInterval: number,
     *      firstAdditionalPosition: number,
     *      basePosition: number
     * }} baseData base data for making bound
     * @param {{
     *      baseTop: number,
     *      top: number,
     *      plusLeft: number,
     *      minusLeft: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStackType whether stackType option or not.
     * @param {SeriesItem} seriesItem series item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeBarChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {
        var barWidth = baseData.baseBarSize * seriesItem.ratioDistance;
        var additionalLeft = this._calculateAdditionalLeft(seriesItem.value);
        var barStartLeft = baseData.baseBarSize * seriesItem.startRatio;
        var startLeft = baseData.basePosition + barStartLeft + additionalLeft;
        var changedStack = (seriesItem.stack !== iterationData.prevStack);
        var pointCount, endLeft, bound, boundTop;

        if (!isStackType || (!this.options.diverging && changedStack)) {
            pointCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
            iterationData.top = iterationData.baseTop + (baseData.pointInterval * pointCount);
            iterationData.plusLeft = 0;
            iterationData.minusLeft = 0;
        }

        if (seriesItem.value >= 0) {
            endLeft = startLeft + iterationData.plusLeft;
            iterationData.plusLeft += barWidth;
        } else {
            iterationData.minusLeft -= barWidth;
            endLeft = startLeft + iterationData.minusLeft;
        }

        iterationData.prevStack = seriesItem.stack;
        boundTop = iterationData.top + baseData.pointInterval - (baseData.barSize / 2);
        bound = this._makeBound(barWidth, baseData.barSize, boundTop, startLeft, endLeft);

        return bound;
    },

    /**
     * Make series bounds for rendering
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var isStacked = predicate.isValidStackOption(this.options.stackType);
        var dimension = this.layout.dimension;
        var baseData = this._makeBaseDataForMakingBound(dimension.height, dimension.width);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var baseTop = (groupIndex * baseData.groupSize) + self.layout.position.top;
            var iterationData = {
                baseTop: baseTop,
                top: baseTop,
                plusLeft: 0,
                minusLeft: 0,
                prevStack: null
            };
            var iteratee = snippet.bind(self._makeBarChartBound, self, baseData, iterationData, isStacked);

            return seriesGroup.map(iteratee);
        });
    },

    /**
     * Calculate top position of sum label.
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {number} top position value
     * @private
     */
    _calculateTopPositionOfSumLabel: function(bound, labelHeight) {
        return bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

function barSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'bar';
    params.chartBackground = chartTheme.chart.background;

    return new BarChartSeries(params);
}

// @todo let's find better way
barSeriesFactory.componentType = 'series';
barSeriesFactory.BarChartSeries = BarChartSeries;

module.exports = barSeriesFactory;
