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
var renderUtil = require('../../helpers/renderUtil');
var calculator = require('../../helpers/calculator');

var BarChartSeries = tui.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
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
        var startLeft = baseData.basePosition + barStartLeft + additionalLeft + chartConst.SERIES_EXPAND_SIZE;
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
            var baseTop = (groupIndex * baseData.groupSize) + chartConst.SERIES_EXPAND_SIZE;
            var iterationData = {
                baseTop: baseTop,
                top: baseTop,
                plusLeft: 0,
                minusLeft: 0,
                prevStack: null
            };
            var iteratee = tui.util.bind(self._makeBarChartBound, self, baseData, iterationData, isStacked);

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
    },

    /**
     * Make html of plus sum label.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var html = '';
        var sum, formatFunctions, formattedSum;

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            html = this._makeSeriesLabelHtml({
                left: bound.left + bound.width + chartConst.SERIES_LABEL_PADDING,
                top: this._calculateTopPositionOfSumLabel(bound, labelHeight)
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound, labelHeight) {
        var html = '';
        var sum, formatFunctions, formattedSum, labelWidth;

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
            html = this._makeSeriesLabelHtml({
                left: bound.left - labelWidth - chartConst.SERIES_LABEL_PADDING,
                top: this._calculateTopPositionOfSumLabel(bound, labelHeight)
            }, formattedSum, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;
