/**
 * @fileoverview Column chart series component.
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

var ColumnChartSeries = snippet.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
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
     * Make bound of column chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} left top position value
     * @param {number} startTop start top position value
     * @param {number} endTop end top position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, left, startTop, endTop) {
        return {
            start: {
                top: startTop,
                left: left,
                width: width,
                height: 0
            },
            end: {
                top: endTop,
                left: left,
                width: width,
                height: height
            }
        };
    },

    /**
     * Make column chart bound.
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
    _makeColumnChartBound: function(baseData, iterationData, isStackType, seriesItem, index) {
        var barHeight = Math.abs(baseData.baseBarSize * seriesItem.ratioDistance);
        var barStartTop = baseData.baseBarSize * seriesItem.startRatio;
        var startTop = baseData.basePosition + barStartTop + chartConst.SERIES_EXPAND_SIZE;
        var changedStack = (seriesItem.stack !== iterationData.prevStack);
        var pointCount, endTop, bound, boundLeft;

        if (!isStackType || (!this.options.diverging && changedStack)) {
            pointCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
            iterationData.left = iterationData.baseLeft + (baseData.pointInterval * pointCount);
            iterationData.plusTop = 0;
            iterationData.minusTop = 0;
        }

        if (seriesItem.value >= 0) {
            iterationData.plusTop -= barHeight;
            endTop = startTop + iterationData.plusTop;
        } else {
            endTop = startTop + iterationData.minusTop;
            iterationData.minusTop += barHeight;
        }

        iterationData.prevStack = seriesItem.stack;
        boundLeft = iterationData.left + baseData.pointInterval - (baseData.barSize / 2);
        bound = this._makeBound(baseData.barSize, barHeight, boundLeft, startTop, endTop);

        return bound;
    },

    /**
     * Make bounds of column chart.
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
            var iteratee = snippet.bind(self._makeColumnChartBound, self, baseData, iterationData, isStackType);

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

BarTypeSeriesBase.mixin(ColumnChartSeries);

function columnSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'column';
    params.chartBackground = chartTheme.chart.background;

    return new ColumnChartSeries(params);
}

columnSeriesFactory.componentType = 'series';
columnSeriesFactory.ColumnChartSeries = ColumnChartSeries;

module.exports = columnSeriesFactory;
