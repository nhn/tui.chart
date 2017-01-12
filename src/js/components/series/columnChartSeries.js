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
var calculator = require('../../helpers/calculator');

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
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
        var startTop = baseData.basePosition - barStartTop + chartConst.SERIES_EXPAND_SIZE;
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
            var baseLeft = (groupIndex * baseData.groupSize) + chartConst.SERIES_EXPAND_SIZE;
            var iterationData = {
                baseLeft: baseLeft,
                left: baseLeft,
                plusTop: 0,
                minusTop: 0,
                prevStack: null
            };
            var iteratee = tui.util.bind(self._makeColumnChartBound, self, baseData, iterationData, isStackType);

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
    },

    /**
     * Make plus sum label html.
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
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound) {
        var html = '';
        var sum, formatFunctions, formattedSum;

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formatFunctions = this.dataProcessor.getFormatFunctions();
            formattedSum = renderUtil.formatValue(sum, formatFunctions, this.chartType, 'series');
            html = this._makeSeriesLabelHtml({
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     * @override
     */
    render: function(data) {
        var result;

        delete data.paper;
        result = Series.prototype.render.call(this, data);
        delete result.paper;

        return result;
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

function columnChartSeriesFactory(params) {
    var chartType = params.chartOptions.chartType;
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = chartType;
    params.chartBackground = chartTheme.background;

    return new ColumnChartSeries(params);
}

columnChartSeriesFactory.componentType = 'series';

module.exports = columnChartSeriesFactory;
