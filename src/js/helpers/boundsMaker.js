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
        var options = params.options,
            theme = params.theme,
            yAxisChartTypes = params.yAxisChartTypes,
            chartOptions = options.chart || {},
            chartDimension = {
                width: chartOptions.width || 500,
                height: chartOptions.height || 400
            },
            convertData = params.convertData,
            yAxisTitle = options.yAxis && options.yAxis.title,
            xAxisTitle = options.xAxis && options.xAxis.title,
            maxLabel = this._getValueAxisMaxLabel(convertData, yAxisChartTypes),
            vLabels = params.isVertical ? [maxLabel] : convertData.labels,
            hLabels = params.isVertical ? convertData.labels : [maxLabel],
            titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, theme.title) + TITLE_ADD_PADDING,
            yAxisWidth = this._getVerticalAxisWidth(yAxisTitle, vLabels, theme.yAxis),
            xAxisHeight = this._getHorizontalAxisHeight(xAxisTitle, hLabels, theme.xAxis),
            legendWidth = this._getLegendAreaWidth(convertData.joinLegendLabels, theme.legend.label),
            yrAxisWidth = this._getYRAxisWidth(convertData, yAxisChartTypes, theme, options),
            rightAreaWidth = legendWidth + yrAxisWidth,
            plotWidth = chartDimension.width - (CHART_PADDING * 2) - yAxisWidth - rightAreaWidth,
            plotHeight = chartDimension.height - (CHART_PADDING * 2) - titleHeight - xAxisHeight,
            top = titleHeight + CHART_PADDING,
            right = rightAreaWidth + CHART_PADDING,
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
                    position: {top: top, left: CHART_PADDING + HIDDEN_WIDTH}
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
                    position: {top: titleHeight, left: yAxisWidth + plotWidth + yrAxisWidth + CHART_PADDING}
                },
                tooltip: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, left: yAxisWidth + CHART_PADDING}
                }
            };
        if (yAxisChartTypes && yAxisChartTypes.length) {
            bounds.yrAxis = {
                dimension: {width: yrAxisWidth, height: plotHeight},
                position: {top: top, right: legendWidth + CHART_PADDING + HIDDEN_WIDTH}
            };
        }
        return bounds;
    },

    /**
     * Get max label of value axis.
     * @param {object} convertData convert data
     * @param {array.<string>} chartTypes chart types
     * @param {number} index chart type index
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(convertData, chartTypes, index) {
        var chartType = chartTypes && chartTypes[index || 0] || '',
            values = chartType ? convertData.values[chartType] : convertData.joinValues,
            formatFunctions = convertData.formatFunctions,
            flattenValues = concat.apply([], values),
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
     * @private
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
     * @private
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
     * @private
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
     * @private
     */
    _getLegendAreaWidth: function(joinLegendLabels, labelTheme) {
        var legendLabels = ne.util.map(joinLegendLabels, function(item) {
                return item.label;
            }),
            maxLabelWidth = this._getRenderedLabelsMaxWidth(legendLabels, labelTheme),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        return legendWidth;
    },

    /**
     * Get width about y right axis
     * @param {object} convertData converted data
     * @param {array.<string>} yAxisChartTypes chart types
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @returns {number} y right axis width
     * @private
     */
    _getYRAxisWidth: function(convertData, yAxisChartTypes, theme, options) {
        var yAxisTheme = ne.util.isArray(theme.yAxis) ? theme.yAxis : [theme.yAxis],
            yAxisOptions = ne.util.isArray(options.yAxis) ? options.yAxis : [options.yAxis],
            rightYAxisWidth = 0,
            index, labels, title;
        yAxisChartTypes = yAxisChartTypes || [];
        index = yAxisChartTypes.length - 1;
        if (index > -1) {
            title = yAxisOptions[index] && yAxisOptions[index].title;
            labels = [this._getValueAxisMaxLabel(convertData, yAxisChartTypes, index)];
            rightYAxisWidth = this._getVerticalAxisWidth(title, labels, yAxisTheme.length === 1 ? yAxisTheme[0] : yAxisTheme[index]);
        }
        return rightYAxisWidth;
    }
};

module.exports = boundsMaker;