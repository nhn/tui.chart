/**
 * @fileoverview Calculator for spectrum legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var renderUtil = require('../../helpers/renderUtil');

/**
 * Calculator for spectrum legend.
 * @module spectrumLegendCalculator
 * @private */
var spectrumLegendCalculator = {
    /**
     * Make vertical dimension.
     * @param {string} maxValue - formatted max value
     * @param {string} minValue - formatted min value
     * @param {object} labelTheme - theme for label
     * @returns {{width: number, height: number}}
     * @private
     */
    _makeVerticalDimension: function(maxValue, minValue, labelTheme) {
        var maxValueLabelWidth = renderUtil.getRenderedLabelWidth(maxValue, labelTheme);
        var minValueLabelWidth = renderUtil.getRenderedLabelWidth(minValue, labelTheme);
        var labelWidth = renderUtil.getRenderedLabelWidth(maxValue, labelTheme);
        var tooltipWidth = (chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2)
            + labelWidth + chartConst.MAP_LEGEND_WEDGE_SIZE;

        return {
            width: chartConst.MAP_LEGEND_AREA_PADDING_WIDE
                + tooltipWidth
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE
                + chartConst.MAP_LEGEND_GRAPH_SIZE
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + Math.max(maxValueLabelWidth, minValueLabelWidth),
            height: chartConst.VERTICAL_MAP_LEGEND_HEIGHT
        };
    },

    /**
     * Make horizontal dimension.
     * @param {string} maxValue - formatted max value
     * @param {object} labelTheme - theme for label
     * @param {boolean} isBoxType - whether use narrow padding or not
     * @param {boolean} isTopLegend - whether use top legend or not
     * @returns {{width: number, height: number}}
     * @private
     */
    _makeHorizontalDimension: function(maxValue, labelTheme, isBoxType, isTopLegend) {
        var labelHeight = renderUtil.getRenderedLabelHeight(maxValue, labelTheme);
        var tooltipHeight = (chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2)
            + labelHeight + chartConst.MAP_LEGEND_WEDGE_SIZE;
        var padding = isBoxType ?
            chartConst.MAP_LEGEND_AREA_PADDING_NARROW :
            chartConst.MAP_LEGEND_AREA_PADDING_WIDE;
        var additionalTopPadding = isTopLegend ? chartConst.MAP_LEGEND_AREA_PADDING_WIDE : 0;

        return {
            width: chartConst.HORIZONTAL_MAP_LEGEND_WIDTH,
            height: padding
                + tooltipHeight
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE
                + chartConst.MAP_LEGEND_GRAPH_SIZE
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + labelHeight
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + additionalTopPadding
        };
    }
};

module.exports = spectrumLegendCalculator;
