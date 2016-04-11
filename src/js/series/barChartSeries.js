/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    calculator = require('../helpers/calculator');

var BarChartSeries = tui.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BarChartSeries
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
            additionalLeft = this.boundsMaker.getDimension('yAxis').width + chartConst.OVERLAPPING_WIDTH;
        }

        return additionalLeft;
    },

    /**
     * Make bar chart bound.
     * @param {{
     *      baseSize: number,
     *      basePosition: number,
     *      step: number,
     *      additionalPosition: ?number,
     *      barSize: number
     * }} baseData base data for making bound
     * @param {{
     *      baseTop: number,
     *      top: number,
     *      plusLeft: number,
     *      minusLeft: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStacked whether stacked option or not.
     * @param {SeriesItem} seriesItem series item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeBarChartBound: function(baseData, iterationData, isStacked, seriesItem, index) {
        var barWidth = baseData.baseBarSize * seriesItem.ratioDistance,
            additionalLeft = this._calculateAdditionalLeft(seriesItem.value),
            barStartLeft = baseData.baseBarSize * seriesItem.startRatio,
            startLeft = baseData.basePosition + barStartLeft + additionalLeft + chartConst.SERIES_EXPAND_SIZE,
            changedStack = (seriesItem.stack !== iterationData.prevStack),
            stepCount, endLeft, bound;

        if (!isStacked || (!this.options.diverging && changedStack)) {
            stepCount = isStacked ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
            iterationData.top = (baseData.step * stepCount) + iterationData.baseTop + baseData.additionalPosition;
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

        bound = this._makeBound(barWidth, baseData.barSize, iterationData.top, startLeft, endLeft);

        return bound;
    },

    /**
     * Make bounds of bar chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this,
            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),
            isStacked = predicate.isValidStackedOption(this.options.stacked),
            dimension = this.boundsMaker.getDimension('series'),
            baseData = this._makeBaseDataForMakingBound(dimension.height, dimension.width);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var baseTop = (groupIndex * baseData.groupSize) + baseData.firstAdditionalPosition
                        + chartConst.SERIES_EXPAND_SIZE,
                iterationData = {
                    baseTop: baseTop,
                    top: baseTop,
                    plusLeft: 0,
                    minusLeft: 0,
                    prevStack: null
                },
                iteratee = tui.util.bind(self._makeBarChartBound, self, baseData, iterationData, isStacked);

            return seriesGroup.map(iteratee);
        });
    },

    /**
     * Make series rendering position
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {number} value - value
     * @param {string} formattedValue - formatted value
     * @param {?boolean} isStart - whether start or not
     * @returns {{left: number, top: number}} - rendering position
     * @private
     */
    _makeSeriesRenderingPosition: function(bound, labelHeight, value, formattedValue, isStart) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
            left = bound.left,
            top = bound.top + (bound.height - labelHeight + chartConst.TEXT_PADDING) / 2;

        if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
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
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
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
        var sum, formattedSum, labelWidth,
            html = '';

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
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
