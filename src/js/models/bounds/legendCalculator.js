/**
 * @fileoverview Calculator for dimension of legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var arrayUtil = require('../../helpers/arrayUtil');

var LEGEND_CHECKBOX_WIDTH = chartConst.LEGEND_CHECKBOX_WIDTH;
var LEGEND_ICON_WIDTH = chartConst.LEGEND_ICON_WIDTH;
var LEGEND_ICON_HEIGHT = chartConst.LEGEND_ICON_HEIGHT;
var LEGEND_LABEL_LEFT_PADDING = chartConst.LEGEND_LABEL_LEFT_PADDING;
var LEGEND_AREA_PADDING = chartConst.LEGEND_AREA_PADDING;

/**
 * Calculator for dimension of legend.
 * @module legendCalculator
 * @private */
var legendCalculator = {
    /**
     * Legend margin.
     * @type {number}
     */
    legendMargin: LEGEND_LABEL_LEFT_PADDING + LEGEND_AREA_PADDING,

    /**
     * Calculate sum of legends width.
     * @param {Array.<string>} labels - legend labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme - legend label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {number}
     * @private
     */
    _calculateLegendsWidthSum: function(labels, labelTheme, checkboxWidth, maxWidth) {
        var restWidth = LEGEND_AREA_PADDING + checkboxWidth +
            LEGEND_ICON_WIDTH + LEGEND_LABEL_LEFT_PADDING;
        var legendMargin = this.legendMargin;

        return calculator.sum(snippet.map(labels, function(label) {
            var labelWidth = renderUtil.getRenderedLabelWidth(label, labelTheme);

            if (maxWidth && labelWidth > maxWidth) {
                labelWidth = maxWidth;
            }
            labelWidth += restWidth;

            return labelWidth + legendMargin;
        }));
    },

    /**
     * Divide legend labels.
     * @param {Array.<string>} labels legend labels
     * @param {number} count division count
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _divideLegendLabels: function(labels, count) {
        var limitCount = Math.round(labels.length / count);
        var results = [];
        var temp = [];

        snippet.forEachArray(labels, function(label) {
            if (temp.length < limitCount) {
                temp.push(label);
            } else {
                results.push(temp);
                temp = [label];
            }
        });

        if (temp.length) {
            results.push(temp);
        }

        return results;
    },

    /**
     * Get max line width.
     * @param {Array.<string>} dividedLabels - divided labels
     * @param {{fontFamily: ?string, fontSize: ?string}} labelTheme - label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {number}
     * @private
     */
    _getMaxLineWidth: function(dividedLabels, labelTheme, checkboxWidth, maxWidth) {
        var self = this;
        var lineWidths = snippet.map(dividedLabels, function(labels) {
            return self._calculateLegendsWidthSum(labels, labelTheme, checkboxWidth, maxWidth);
        });

        return arrayUtil.max(lineWidths);
    },

    /**
     * Make divided labels and max line width.
     * @param {Array.<string>} labels legend labels
     * @param {number} chartWidth chart width
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{dividedLabels: Array.<Array.<string>>, maxLineWidth: number}}
     * @private
     */
    _makeDividedLabelsAndMaxLineWidth: function(labels, chartWidth, labelTheme, checkboxWidth, maxWidth) {
        var divideCount = 1;
        var maxLineWidth = 0;
        var prevMaxWidth = 0;
        var dividedLabels, prevLabels;

        do {
            dividedLabels = this._divideLegendLabels(labels, divideCount);
            maxLineWidth = this._getMaxLineWidth(dividedLabels, labelTheme, checkboxWidth, maxWidth);

            if (prevMaxWidth === maxLineWidth) {
                dividedLabels = prevLabels;
                break;
            }

            prevMaxWidth = maxLineWidth;
            prevLabels = dividedLabels;
            divideCount += 1;
        } while (maxLineWidth >= chartWidth);

        return {
            labels: dividedLabels,
            maxLineWidth: maxLineWidth
        };
    },

    /**
     * Calculate height of horizontal legend.
     * @param {Array.<Array.<string>>} dividedLabels - divided labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @returns {number}
     * @private
     */
    _calculateHorizontalLegendHeight: function(dividedLabels, labelTheme) {
        var heightByLabel = Math.max.apply(null, snippet.map(dividedLabels, function(labels) {
            return renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme);
        }));
        var labelItemHeightWithPaddingTop = Math.max(LEGEND_ICON_HEIGHT, heightByLabel) + chartConst.LINE_MARGIN_TOP;
        var legendHeight = (labelItemHeightWithPaddingTop * dividedLabels.length) - chartConst.LINE_MARGIN_TOP;

        return legendHeight;
    },

    /**
     * Make dimension of horizontal legend.
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} chartWidth - chart width
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{width: number, height: (number)}}
     * @private
     */
    _makeHorizontalDimension: function(labelTheme, legendLabels, chartWidth, checkboxWidth, maxWidth) {
        var dividedInfo = this._makeDividedLabelsAndMaxLineWidth(
            legendLabels, chartWidth, labelTheme, checkboxWidth, maxWidth
        );
        var horizontalLegendHeight = this._calculateHorizontalLegendHeight(dividedInfo.labels, labelTheme);
        var legendHeight = horizontalLegendHeight + (LEGEND_AREA_PADDING * 2);

        return {
            width: Math.max(dividedInfo.maxLineWidth, chartConst.MIN_LEGEND_WIDTH),
            height: legendHeight
        };
    },

    /**
     * Make dimension of vertical legend.
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{width: (number)}}
     * @private
     */
    _makeVerticalDimension: function(labelTheme, legendLabels, checkboxWidth, maxWidth) {
        var labelWidth = renderUtil.getRenderedLabelsMaxWidth(legendLabels, labelTheme);
        if (maxWidth && labelWidth > maxWidth) {
            labelWidth = maxWidth;
        }
        labelWidth += LEGEND_AREA_PADDING + checkboxWidth + LEGEND_ICON_WIDTH + LEGEND_LABEL_LEFT_PADDING;

        return {
            width: labelWidth + this.legendMargin,
            height: 0
        };
    },

    /**
     * Calculate legend dimension.
     * @param {{showCheckbox: boolean, visible: boolean, align: string}} options - options for legend
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: number}}
     */
    calculate: function(options, labelTheme, legendLabels, chartWidth) {
        var checkboxWidth = options.showCheckbox === false ? 0 : LEGEND_CHECKBOX_WIDTH + LEGEND_LABEL_LEFT_PADDING;
        var maxWidth = options.maxWidth;
        var dimension = {};

        if (!options.visible) {
            dimension.width = 0;
        } else if (predicate.isHorizontalLegend(options.align)) {
            dimension = this._makeHorizontalDimension(
                labelTheme, legendLabels, chartWidth, checkboxWidth, maxWidth
            );
        } else {
            dimension = this._makeVerticalDimension(labelTheme, legendLabels, checkboxWidth, maxWidth);
        }

        return dimension;
    }
};

module.exports = legendCalculator;
