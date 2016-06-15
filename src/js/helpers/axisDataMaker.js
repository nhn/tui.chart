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
     * Makes label interval by labelInterval option.
     * @param {Array.<string>} labels labels
     * @param {number} labelInterval label interval
     * @returns {Array.<string>} labels
     * @private
     */
    _makeLabelInterval: function(labels, labelInterval) {
        var lastIndex;

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
        var tickCount = params.labels.length;
        var options = params.options || {};
        var labels = params.labels;

        if (options.labelInterval && !params.useLargeData) {
            labels = this._makeLabelInterval(params.labels, options.labelInterval);
        }

        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: labels,
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            options: options,
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * Make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {AxisScaleMaker} params.axisScaleMaker chart values
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
        var axisScaleMaker = params.axisScaleMaker,
            rangeValues = axisScaleMaker.getFormattedScaleValues(),
            tickCount = rangeValues.length;

        return {
            labels: rangeValues,
            tickCount: tickCount,
            validTickCount: tickCount,
            limit: axisScaleMaker.getLimit(),
            step: axisScaleMaker.getStep(),
            options: params.options,
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * Calculate new axis block information for adjust tick count.
     * @param {number} curBlockCount - current block count
     * @param {number} seriesWidth - series width
     * @returns {{newBlockCount: number, remainBlockCount: number, interval: number}}
     * @private
     */
    _calculateNewBlockInfo: function(curBlockCount, seriesWidth) {
        var tickSizeRange = tui.util.range(60, 91, 5); // [60, 65, 70, 75, 80, 85, 90]
        var candidates = tui.util.map(tickSizeRange, function(blockWidth) {
            var blockCount = parseInt(seriesWidth / blockWidth, 10);
            var interval = parseInt(curBlockCount / blockCount, 10);
            var remainCount = curBlockCount - (interval * blockCount);
            if (remainCount >= interval) {
                blockCount += parseInt(remainCount / interval, 0);
                remainCount = remainCount % interval;
            }

            return {
                blockCount: blockCount,
                beforeRemainBlockCount: remainCount,
                interval: interval
            };
        });

        return tui.util.min(candidates, function(candidate) {
            return candidate.newBlockCount;
        });
    },

    /**
     * Update label type axisData for adjusting tick count.
     * @param {object} axisData - axisData
     * @param {number} seriesWidth - series width
     */
    updateLabelAxisDataForAdjustingTickCount: function(axisData, seriesWidth) {
        var beforeBlockCount = axisData.tickCount - 1;
        var newBlockInfo = this._calculateNewBlockInfo(beforeBlockCount, seriesWidth);
        var newBlockCount, interval, beforeRemainBlockCount, startIndex;

        if (!newBlockInfo) {
            return;
        }

        newBlockCount = newBlockInfo.blockCount;
        interval = newBlockInfo.interval;

        if ((newBlockCount < beforeBlockCount) && (interval > 1)) {
            beforeRemainBlockCount = newBlockInfo.beforeRemainBlockCount;
            axisData.eventTickCount = axisData.tickCount;
            startIndex = Math.round(beforeRemainBlockCount / 2);

            axisData.labels = tui.util.filter(axisData.labels.slice(startIndex), function(label, index) {
                return index % interval === 0;
            });

            axisData.tickCount = newBlockCount + 1;
            axisData.positionRatio = startIndex / beforeBlockCount;
            axisData.sizeRatio = 1 - (beforeRemainBlockCount / beforeBlockCount);
            axisData.lineWidth = seriesWidth + chartConst.OVERLAPPING_WIDTH;
        }
    }
};

module.exports = axisDataMaker;
