/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * Make labels.
     * @param {Array.<string>} labels labels
     * @param {number} labelInterval label interval
     * @returns {Array.<string>} labels
     * @private
     */
    _makeLabels: function(labels, labelInterval) {
        var lastIndex;
        if (!labelInterval) {
            return labels;
        }

        lastIndex = labels.length - 1;
        return tui.util.map(labels, function(label, index) {
            if (index > 0 && index < lastIndex && (index % labelInterval) > 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }
            return label;
        });
    },

    /**
     * Make data about label axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {Array.<string>} params.labels chart labels
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.aligned whether align or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      isVertical: boolean
     * }} axis data
     */
    makeLabelAxisData: function(params) {
        var tickCount = params.labels.length,
            options = params.options || {},
            labels = this._makeLabels(params.labels, options.labelInterval);

        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: labels,
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: !!params.isVertical,
            aligned: !!params.aligned
        };
    },

    /**
     * Make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {AxisRange} params.axisRange chart values
     *      @param {boolean} params.isVertical whether vertical or not
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      limit: {min: number, max: number},
     *      isVertical: boolean
     * }} axis data
     */
    makeValueAxisData: function(params) {
        var axisRange = params.axisRange,
            rangeValues = axisRange.getFormattedRangeValues(),
            tickCount = rangeValues.length;

        return {
            labels: rangeValues,
            tickCount: tickCount,
            validTickCount: tickCount,
            limit: axisRange.getLimit(),
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };
    }
};

module.exports = axisDataMaker;
