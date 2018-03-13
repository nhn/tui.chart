/**
 * @fileoverview Boxplot chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var BarTypeSeriesBase = require('./barTypeSeriesBase');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var BoxplotChartSeries = snippet.defineClass(Series, /** @lends BoxplotChartSeries.prototype */ {
    /**
     * Boxplot chart series component.
     * @constructs BoxplotChartSeries
     * @private
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);

        /**
         * whether series label is supported
         * @type {boolean}
         */
        this.supportSeriesLable = false;
    },

    /**
     * Make boxplot chart bound.
     * @param {{
     *      baseBarSize: number,
     *      groupSize: number,
     *      barSize: number,
     *      pointInterval: number,
     *      firstAdditionalPosition: number,
     *      basePosition: number
     * }} baseData base data for making bound
     * @param {{
     *      baseLeft: number,
     *      left: number,
     *      plusTop: number,
     *      minusTop: number,
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
    _makeBoxplotChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {
        var boxHeight = Math.abs(baseData.baseBarSize * seriesItem.ratioDistance);
        var boxStartTop = baseData.baseBarSize * (1 - seriesItem.lqRatio);
        var startTop = baseData.basePosition + boxStartTop + chartConst.SERIES_EXPAND_SIZE;
        var baseTopPosition = baseData.basePosition + chartConst.SERIES_EXPAND_SIZE;
        var pointCount, endTop, boundLeft, outliers;

        pointCount = index;
        iterationData.left = iterationData.baseLeft + (baseData.pointInterval * pointCount);
        iterationData.plusTop = 0;
        iterationData.minusTop = 0;

        if (seriesItem.value >= 0) {
            iterationData.plusTop -= boxHeight;
            endTop = startTop + iterationData.plusTop;
        } else {
            endTop = startTop + iterationData.minusTop;
            iterationData.minusTop += boxHeight;
        }

        boundLeft = iterationData.left + baseData.pointInterval - (baseData.barSize / 2);

        outliers = snippet.map(seriesItem.outliers, function(outlier) {
            return {
                top: (baseData.baseBarSize * (1 - outlier.ratio)) + baseTopPosition,
                left: boundLeft + (baseData.barSize / 2)
            };
        });

        return {
            start: {
                top: startTop,
                left: boundLeft,
                width: baseData.barSize,
                height: 0
            },
            end: {
                top: endTop,
                left: boundLeft,
                width: baseData.barSize,
                height: boxHeight
            },
            min: {
                top: (baseData.baseBarSize * (1 - seriesItem.minRatio)) + baseTopPosition,
                left: boundLeft,
                width: baseData.barSize,
                height: 0
            },
            max: {
                top: (baseData.baseBarSize * (1 - seriesItem.maxRatio)) + baseTopPosition,
                left: boundLeft,
                width: baseData.barSize,
                height: 0
            },
            median: {
                top: (baseData.baseBarSize * (1 - seriesItem.medianRatio)) + baseTopPosition,
                left: boundLeft,
                width: baseData.barSize,
                height: 0
            },
            outliers: outliers
        };
    },

    /**
     * Make bounds of boxplot chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var isStackType = predicate.isValidStackOption(this.options.stackType);
        var dimension = this.layout.dimension;
        var baseData = this._makeBaseDataForMakingBound(dimension.width, dimension.height);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var baseLeft = (groupIndex * baseData.groupSize) + self.layout.position.left;
            var iterationData = {
                baseLeft: baseLeft,
                left: baseLeft,
                plusTop: 0,
                minusTop: 0,
                prevStack: null
            };
            var iteratee = snippet.bind(self._makeBoxplotChartBound, self, baseData, iterationData, isStackType);

            return seriesGroup.map(iteratee);
        });
    },

    /**
     * Calculate left position of sum label.
     * @param {{left: number, top: number}} bound bound
     * @param {string} formattedSum formatted sum.
     * @returns {number} left position value
     * @private
     */
    _calculateLeftPositionOfSumLabel: function(bound, formattedSum) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);

        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
    }
});

BarTypeSeriesBase.mixin(BoxplotChartSeries);

function boxplotSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'boxplot';
    params.chartBackground = chartTheme.chart.background;

    return new BoxplotChartSeries(params);
}

boxplotSeriesFactory.componentType = 'series';
boxplotSeriesFactory.BoxplotChartSeries = BoxplotChartSeries;

module.exports = boxplotSeriesFactory;
