/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('./calculator.js'),
    renderUtil = require('./renderUtil.js');

var CHART_PADDING = 10,
    TITLE_ADD_PADDING = 20,
    LEGEND_AREA_PADDING = 10,
    LEGEND_RECT_WIDTH = 12,
    LABEL_PADDING_LEFT = 5,
    HIDDEN_WIDTH = 1;

var concat = Array.prototype.concat;

/**
 * Bounds maker.
 * @module boundsMaker
 */
var boundsMaker = {
    /**
     * To make bounds about chart components.
     * @param {object} params parameters
     *      @param {object} convertData converted data
     *      @param {object} theme chart theme
     *      @param {boolean} isVertical whether vertical or not
     *      @param {object} options chart options
     * @returns {{
     *   plot: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   yAxis: {
     *     dimension: {width: (number), height: number},
     *     position: {top: number}
     *   },
     *   xAxis: {
     *     dimension: {width: number, height: (number)},
     *     position: {right: number}
     *   },
     *   series: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   legend: {
     *     position: {top: number}
     *   },
     *   tooltip: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, left: number}
     *   }
     * }} bounds
     */
    make: function(params) {
        var chartOptions = params.options.chart || {},
            chartDimension = {
                width: chartOptions.width || 500,
                height: chartOptions.height || 400
            },
            convertData = params.convertData,
            yAxisTitle = params.options.yAxis && params.options.yAxis.title,
            xAxisTitle = params.options.xAxis && params.options.xAxis.title,
            maxLabel = this._getValueAxisMaxLabel(convertData.values, convertData.formatFunctions),
            vLabels = params.isVertical ? [maxLabel] : convertData.labels,
            hLabels = params.isVertical ? convertData.labels : [maxLabel],
            titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, params.theme.title) + TITLE_ADD_PADDING,
            yAxisWidth = this._getVerticalAxisWidth(yAxisTitle, vLabels, params.theme.yAxis),
            xAxisHeight = this._getHorizontalAxisHeight(xAxisTitle, hLabels, params.theme.xAxis),
            legendWidth = this.getLegendAreaWidth(convertData.legendLabels, params.theme.legend.label),
            plotWidth = chartDimension.width - (CHART_PADDING * 2) - yAxisWidth - legendWidth,
            plotHeight = chartDimension.height - (CHART_PADDING * 2) - titleHeight - xAxisHeight,
            top = titleHeight + CHART_PADDING,
            right = legendWidth + CHART_PADDING,
            bounds = {
                chart: {
                    dimension: chartDimension
                },
                plot: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, right: right}
                },
                yAxis: {
                    dimension: {width: yAxisWidth, height: plotHeight},
                    position: {top: top}
                },
                xAxis: {
                    dimension: {width: plotWidth, height: xAxisHeight},
                    position: {top: top + plotHeight - HIDDEN_WIDTH, right: right}
                },
                series: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, right: right}
                },
                legend: {
                    position: {top: titleHeight, right: CHART_PADDING}
                },
                tooltip: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, left: yAxisWidth + CHART_PADDING}
                }
            };
        return bounds;
    },

    /**
     * Get max label of value axis.
     * @param {array.<number>} values axis values
     * @param {array.<function>} formatFunctions format functions
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(values, formatFunctions) {
        var flattenValues = concat.apply([], values),
            min = ne.util.min(flattenValues),
            max = ne.util.max(flattenValues),
            scale = calculator.calculateScale(min, max),
            minLabel = calculator.normalizeAxisNumber(scale.min),
            maxLabel = calculator.normalizeAxisNumber(scale.max),
            fns = formatFunctions && formatFunctions.slice() || [];

        maxLabel = (minLabel + '').length > (maxLabel + '').length ? minLabel : maxLabel;
        fns.unshift(maxLabel);
        maxLabel = ne.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });

        return maxLabel;
    },

    /**
     * Get Rendered Labels Max Size(width or height)
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = ne.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = ne.util.max(sizes);
        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     */
    _getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = ne.util.bind(renderUtil.getRenderedLabelWidth, renderUtil),
            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    _getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = ne.util.bind(renderUtil.getRenderedLabelHeight, renderUtil),
            result = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return result;
    },

    /**
     * Get width of vertical axis area.
     * @param {string} title axis title,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} width
     */
    _getVerticalAxisWidth: function(title, labels, theme) {
        var titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            width = this._getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth;
        return width;
    },

    /**
     * Get height of horizontal axis area.
     * @param {string} title axis title,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} height
     */
    _getHorizontalAxisHeight: function(title, labels, theme) {
        var titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            height = this._getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Get width of legend area.
     * @param {array.<string>} legendLabels legend labels
     * @param {object} labelTheme label theme
     * @returns {number} width
     */
    getLegendAreaWidth: function(legendLabels, labelTheme) {
        var maxLabelWidth = this._getRenderedLabelsMaxWidth(legendLabels, labelTheme),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        return legendWidth;
    }
};

module.exports = boundsMaker;