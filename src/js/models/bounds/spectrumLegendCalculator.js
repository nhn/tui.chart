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
     * @param {object} labelTheme - theme for label
     * @returns {{width: number, height: number}}
     * @private
     */
    _makeVerticalDimension: function(maxValue, labelTheme) {
        var labelWidth = renderUtil.getRenderedLabelWidth(maxValue, labelTheme);
        var tooltipWidth = (chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2)
            + labelWidth + chartConst.MAP_LEGEND_WEDGE_SIZE;

        return {
            width: chartConst.MAP_LEGEND_AREA_PADDING
                + tooltipWidth
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE
                + chartConst.MAP_LEGEND_GRAPH_SIZE
                + chartConst.MAP_LEGEND_LABEL_PADDING
                + labelWidth,
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
