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

        return {
            width: chartConst.MAP_LEGEND_AREA_PADDING
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE
                + chartConst.MAP_LEGEND_GRAPH_SIZE
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + Math.max(maxValueLabelWidth, minValueLabelWidth),
            height: chartConst.MAP_LEGEND_SIZE
        };
    },

    /**
     * Make horizontal dimension.
     * @param {string} maxValue - formatted max value
     * @param {object} labelTheme - theme for label
     * @returns {{width: number, height: number}}
     * @private
     */
    _makeHorizontalDimension: function(maxValue, labelTheme) {
        var labelHeight = renderUtil.getRenderedLabelHeight(maxValue, labelTheme);
        var tooltipHeight = (chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2)
            + labelHeight + chartConst.MAP_LEGEND_WEDGE_SIZE;

        return {
            width: chartConst.MAP_LEGEND_SIZE,
            height: chartConst.MAP_LEGEND_AREA_PADDING
                + tooltipHeight
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE
                + chartConst.MAP_LEGEND_GRAPH_SIZE
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + labelHeight
        };
    }
};

module.exports = spectrumLegendCalculator;
