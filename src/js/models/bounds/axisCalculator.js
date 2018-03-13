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
        var titleAreaHeight = titleHeight ? (titleHeight + chartConst.TITLE_PADDING) : 0;
        var labelMargin = options.labelMargin || 0;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme.label);
        var height = titleAreaHeight + chartConst.CHART_PADDING;

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
     * @param {{title: ?string, isCenter: ?boolean, rotateTitle: ?boolean}} options - options
     * @param {{title: object, label: object}} theme - them for y axis
     * @returns {number}
     * @private
     */
    calculateYAxisWidth: function(labels, options, theme) {
        var title = options.title || '';
        var titleAreaWidth = 0;
        var labelMargin = options.labelMargin || 0;
        var width = 0;

        labels = renderUtil.addPrefixSuffix(labels, options.prefix, options.suffix);

        if (options.isCenter) {
            width += chartConst.AXIS_LABEL_PADDING;
        } else if (options.rotateTitle === false) {
            titleAreaWidth = renderUtil.getRenderedLabelWidth(title.text, theme.title) + chartConst.TITLE_PADDING;
        } else {
            titleAreaWidth = renderUtil.getRenderedLabelHeight(title.text, theme.title) + chartConst.TITLE_PADDING;
        }

        if (predicate.isDatetimeType(options.type)) {
            labels = renderUtil.formatDates(labels, options.dateFormat);
        }
        if (labelMargin > 0) {
            width += labelMargin;
        }

        if (options.showLabel !== false) {
            width += renderUtil.getRenderedLabelsMaxWidth(labels, theme.label);
        }

        width += titleAreaWidth + chartConst.AXIS_LABEL_PADDING;

        return width;
    }
};

module.exports = axisCalculator;
