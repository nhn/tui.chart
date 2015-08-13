/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('domHandler.js'),
    renderUtil = require('renderUtil.js'),
    chartConst = require('../const.js');

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
    make: function(data) {
        var chartOptions = data.options.chart || {};
        var chartDimension = {
            width: chartOptions.width || 500,
            height: chartOptions.height || 400
        };

        var convertData = data.convertData;
        var vAxisTitle = data.options.vAxis.title;
        var hAxisTitle = data.options.hAxis.title;
        var valueLabels = concat.apply([], convertData.formattedValues);
        var vLabels = data.isVertical ? valueLabels : convertData.labels;
        var hLabels = data.isVertical ? convertData.labels : valueLabels;
        var titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, data.theme.chart),
            vAxisWidth = this._getVerticalAxisWidth(vAxisTitle, vLabels, data.theme.vAxis),
            hAxisHeight = this._getHorizontalAxisHeight(hAxisTitle, hLabels, data.theme.hAxis),
            legendWidth = this.getLegendAreaWidth(convertData.legendLabels, data.theme.legend.label),
            plotWidth = chartDimension.width - (CHART_PADDING * 2) - vAxisWidth - legendWidth,
            plotHeight = chartDimension.height - (CHART_PADDING * 2) - titleHeight - hAxisHeight,
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
                vAxis: {
                    dimension: {width: vAxisWidth, height: plotHeight},
                    position: {top: top}
                },
                hAxis: {
                    dimension: {width: plotWidth, height: hAxisHeight},
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
                    position: {top: top, left: vAxisWidth + CHART_PADDING}
                }
            };
        return bounds;
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
     * @returns {number} width
     */
    _getVerticalAxisWidth: function(title, labels, theme) {
        var titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            width = this._getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth;
        return width;
    },

    /**
     * Get height of horizontal axis area.
     * @returns {number} height
     */
    _getHorizontalAxisHeight: function(title, labels, theme) {
        var titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + TITLE_ADD_PADDING,
            height = this._getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Get width of legend area.
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