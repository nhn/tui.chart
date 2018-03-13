/**
 * @fileoverview Calculator for dimension of axis.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');

/**
 * Calculator for dimension of axis.
 * @module axisCalculator
 * @private */
var axisCalculator = {
    /**
     * Calculate height for x axis.
     * @param {{title: string, labelMargin: number}} options - title and label margin option for x axis
     * @param {{title: object, label: object}} theme - theme for x axis
     * @returns {*}
     */
    calculateXAxisHeight: function(options, theme) {
        var title = options.title;
        var titleHeight = title ? renderUtil.getRenderedLabelHeight(title.text, theme.title) : 0;
        var titleAreaHeight = titleHeight ? (titleHeight + chartConst.X_AXIS_TITLE_PADDING) : 0;
        var labelMargin = options.labelMargin || 0;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme.label);
        var height = titleAreaHeight + chartConst.X_AXIS_LABEL_PADDING;

        if (labelMargin > 0) {
            height += labelMargin;
        }

        if (options.showLabel !== false) {
            height += labelHeight;
        }

        return height;
    },

    /**
     * Calculate width for y axis.
     * @param {Array.<string | number>} labels labels
     * @param {{title: ?string, isCenter: ?boolean}} options - options
     * @param {{title: object, label: object}} theme - theme for y axis calculate
     * @param {Array} yAxisLabels - yAxis labels for y axis calculate
     * @param {boolean} isDiverging - whether is diverging chart or not
     * @returns {number}
     */
    calculateYAxisWidth: function(labels, options, theme, yAxisLabels, isDiverging) {
        var labelMargin = options.labelMargin;
        var width = 0;
        var titleWidth = 0;
        var maxLabelWidth = 0;

        labels = renderUtil.addPrefixSuffix(labels, options.prefix, options.suffix);
        yAxisLabels = renderUtil.addPrefixSuffix(yAxisLabels, options.prefix, options.suffix);

        if (options.isCenter) {
            width += chartConst.Y_AXIS_LABEL_PADDING;
        }

        if (predicate.isDatetimeType(options.type)) {
            labels = renderUtil.formatDates(labels, options.dateFormat);
            yAxisLabels = renderUtil.formatDates(yAxisLabels, options.dateFormat);
        }
        if (labelMargin && labelMargin > 0) {
            width += labelMargin;
        }
        labels = yAxisLabels.length ? yAxisLabels : labels;
        if (options.showLabel !== false) {
            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme.label);
        }
        if (options.title) {
            titleWidth = renderUtil.getRenderedLabelWidth(options.title.text, theme.title);
        }

        width += ((isDiverging ? Math.max(maxLabelWidth, titleWidth) : maxLabelWidth) +
            chartConst.Y_AXIS_LABEL_PADDING);

        return width;
    }
};

module.exports = axisCalculator;
