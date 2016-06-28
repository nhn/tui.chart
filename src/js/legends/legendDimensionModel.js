/**
 * @fileoverview LegendDimensionModel is model for calculating dimension of legend.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var LegendDimensionModel = tui.util.defineClass(/** @lends LegendDimensionModel.prototype */ {
    /**
     * LegendDimensionModel is model for calculating dimension of legend.
     * @constructs LegendDimensionModel
     * @param {object} params parameters
     *      @param {string} params.chartType - type of chart
     *      @param {object} params.options - legend options
     *      @param {object} params.theme - legend theme
     *      @param {Array.<string | number>} params.legendLabels - legend labels
     */
    init: function(params) {
        this.chartType = params.chartType;

        this.options = params.options;

        this.theme = params.theme;

        this.legendLabels = params.legendLabels;

        this.legendCheckboxWidth = this.options.showCheckbox === false ? 0 : chartConst.LEGEND_CHECKBOX_WIDTH;
    },

    /**
     * Make legend width.
     * @param {number} labelWidth label width
     * @returns {number}
     * @private
     */
    _makeLegendWidth: function(labelWidth) {
        return labelWidth + this.legendCheckboxWidth + chartConst.LEGEND_RECT_WIDTH +
            chartConst.LEGEND_LABEL_LEFT_PADDING + chartConst.LEGEND_AREA_PADDING;
    },

    /**
     * Calculate sum of legends width.
     * @param {Array.<string>} labels legend labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {number}
     * @private
     */
    _calculateLegendsWidthSum: function(labels, labelTheme) {
        var self = this;

        return tui.util.sum(tui.util.map(labels, function(label) {
            return self._makeLegendWidth(renderUtil.getRenderedLabelWidth(label, labelTheme));
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
        var limitCount = Math.round(labels.length / count),
            results = [],
            temp = [];

        tui.util.forEachArray(labels, function(label) {
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
     * @returns {number}
     * @private
     */
    _getMaxLineWidth: function(dividedLabels, labelTheme) {
        var self = this;
        var lineWidths = tui.util.map(dividedLabels, function(_labels) {
            return self._calculateLegendsWidthSum(_labels, labelTheme);
        });

        return tui.util.max(lineWidths);
    },

    /**
     * Make division labels and max line width.
     * @param {Array.<string>} labels legend labels
     * @param {number} chartWidth chart width
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {{dividedLabels: Array.<Array.<string>>, maxLineWidth: number}}
     * @private
     */
    _makeDividedLabelsAndMaxLineWidth: function(labels, chartWidth, labelTheme) {
        var divideCount = 1,
            maxLineWidth = 0,
            prevMaxWidth = 0,
            dividedLabels, prevLabels;

        do {
            dividedLabels = this._divideLegendLabels(labels, divideCount);
            maxLineWidth = this._getMaxLineWidth(dividedLabels, labelTheme);

            if (prevMaxWidth === maxLineWidth) {
                dividedLabels = prevLabels;
                break;
            }

            prevMaxWidth = maxLineWidth;
            prevLabels = dividedLabels;
            divideCount += 1;
        } while (maxLineWidth >= chartWidth);

        return {
            dividedLabels: dividedLabels,
            maxLineWidth: maxLineWidth
        };
    },

    /**
     * Calculate height of horizontal legend.
     * @param {Array.<Array.<string>>} dividedLabels divided labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @returns {number}
     * @private
     */
    _calculateHorizontalLegendHeight: function(dividedLabels, labelTheme) {
        return tui.util.sum(tui.util.map(dividedLabels, function(labels) {
            return renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme);
        }));
    },

    /**
     * Make dimension of horizontal legend.
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: (number)}}
     * @private
     */
    _makeHorizontalDimension: function(chartWidth) {
        var labelTheme = this.theme.label,
            labelsAndMaxWidth = this._makeDividedLabelsAndMaxLineWidth(this.legendLabels, chartWidth, labelTheme),
            horizontalLegendHeight = this._calculateHorizontalLegendHeight(labelsAndMaxWidth.dividedLabels, labelTheme),
            legendHeight = horizontalLegendHeight + (chartConst.LEGEND_AREA_PADDING * 2);

        return {
            width: Math.max(labelsAndMaxWidth.maxLineWidth, chartConst.MIN_LEGEND_WIDTH),
            height: legendHeight
        };
    },

    /**
     * Make dimension of vertical legend.
     * @returns {{width: (number)}}
     * @private
     */
    _makeVerticalDimension: function() {
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(this.legendLabels, this.theme.label),
            legendWidth = this._makeLegendWidth(maxLabelWidth);
        return {
            width: legendWidth,
            height: 0
        };
    },

    /**
     * Make legend dimension.
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: number}}
     */
    makeDimension: function(chartWidth) {
        var dimension = {};

        if (!this.options.visible) {
            dimension.width = 0;
        } else if (predicate.isHorizontalLegend(this.options.align)) {
            dimension = this._makeHorizontalDimension(chartWidth);
        } else {
            dimension = this._makeVerticalDimension();
        }

        return dimension;
    }
});

module.exports = LegendDimensionModel;
