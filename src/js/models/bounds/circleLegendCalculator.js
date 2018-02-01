/**
 * @fileoverview Calculator for circle legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var renderUtil = require('../../helpers/renderUtil');

/**
 * Calculator for circle legend.
 * @module circleLegendCalculator
 * @private */
var circleLegendCalculator = {
    /**
     * Calculate step of pixel unit.
     * @param {{tickCount: number, isLabelAxis: boolean}} axisData - data for rendering axis
     * @param {number} size - width or height of series area
     * @returns {number}
     * @private
     */
    _calculatePixelStep: function(axisData, size) {
        var tickCount = axisData.tickCount;
        var pixelStep;

        if (axisData.isLabelAxis) {
            pixelStep = size / tickCount / 2;
        } else {
            pixelStep = size / (tickCount - 1);
        }

        return parseInt(pixelStep, 10);
    },

    /**
     * Calculate radius by axis data.
     * @param {{width: number, height: number}} seriesDimension - dimension for series
     * @param {{xAxis: object, yAxis: object}} axisDataMap - axis data map
     * @returns {number}
     * @private
     */
    _calculateRadiusByAxisData: function(seriesDimension, axisDataMap) {
        var yPixelStep = this._calculatePixelStep(axisDataMap.yAxis, seriesDimension.height);
        var xPixelStep = this._calculatePixelStep(axisDataMap.xAxis, seriesDimension.width);

        return Math.min(yPixelStep, xPixelStep);
    },

    /**
     * Get max width of label for CircleLegend.
     * @param {string} maxLabel - maximum label
     * @param {string} fontFamily - fontFamily for legend
     * @returns {number}
     * @private
     */
    _getCircleLegendLabelMaxWidth: function(maxLabel, fontFamily) {
        return renderUtil.getRenderedLabelWidth(maxLabel, {
            fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
            fontFamily: fontFamily
        });
    },

    /**
     * Calculate width for circle legend.
     * @param {{width: number, height: number}} seriesDimension - dimension for series
     * @param {{xAxis: object, yAxis: object}} axisDataMap - axis data map
     * @param {string} maxLabel - maximum label
     * @param {string} fontFamily - fontFamily for legend
     * @returns {number}
     * @private
     */
    calculateCircleLegendWidth: function(seriesDimension, axisDataMap, maxLabel, fontFamily) {
        var maxRadius = this._calculateRadiusByAxisData(seriesDimension, axisDataMap);
        var maxLabelWidth = this._getCircleLegendLabelMaxWidth(maxLabel, fontFamily);

        return Math.max((maxRadius * 2), maxLabelWidth) + chartConst.CIRCLE_LEGEND_PADDING;
    },

    /**
     * Calculate max radius.
     * @param {{series: {width: number, height: number}, circleLegend: {width: number}}} dimensionMap - dimension map
     * @param {{xAxis: object, yAxis: object}} axisDataMap - axis data map
     * @param {boolean} [circleLegendVisible] - circleLegend visible option
     * @returns {number}
     * @private
     */
    calculateMaxRadius: function(dimensionMap, axisDataMap, circleLegendVisible) {
        var maxRadius = this._calculateRadiusByAxisData(dimensionMap.series, axisDataMap);
        var circleLegendWidth = dimensionMap.circleLegend.width;

        if (!circleLegendVisible) {
            return maxRadius;
        }

        return Math.min((circleLegendWidth - chartConst.CIRCLE_LEGEND_PADDING) / 2, maxRadius);
    }
};

module.exports = circleLegendCalculator;
