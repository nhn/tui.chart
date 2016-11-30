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
        var padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,
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
        var padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_SIZE,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE + labelHeight + padding
        };
    }
};

module.exports = spectrumLegendCalculator;
