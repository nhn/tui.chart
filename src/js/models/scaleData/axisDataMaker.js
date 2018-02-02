/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var geomatric = require('../../helpers/geometric');
var renderUtil = require('../../helpers/renderUtil');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

/**
 * Axis data maker.
 * @module axisDataMaker
 * @private */
var axisDataMaker = {
    /**
     * Makes labels by labelInterval option.
     * @param {Array.<string>} labels - labels
     * @param {number} labelInterval - label interval option
     * @param {number} [addedDataCount] - added data count
     * @returns {Array.<string>} labels
     * @private
     */
    _makeLabelsByIntervalOption: function(labels, labelInterval, addedDataCount) {
        addedDataCount = addedDataCount || 0;
        labels = snippet.map(labels, function(label, index) {
            if (((index + addedDataCount) % labelInterval) !== 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }

            return label;
        });

        return labels;
    },

    /**
     * Make axis data for label type.
     * @memberOf module:axisDataMaker
     * @param {object} params - parameters
     *      @param {Array.<string>} params.labels - chart labels
     *      @param {boolean} params.isVertical - whether vertical or not
     *      @param {boolean} params.aligned - whether align or not
     *      @param {?boolean} params.addedDataCount - added data count
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      options: object,
     *      isVertical: boolean,
     *      isPositionRight: boolean,
     *      aligned: boolean
     * }}
     */
    makeLabelAxisData: function(params) {
        var tickCount = params.labels.length;
        var options = params.options || {};
        var labels = params.labels;

        if (predicate.isValidLabelInterval(options.labelInterval, options.tickInterval)
                && params.labels.length > options.labelInterval) {
            labels = this._makeLabelsByIntervalOption(params.labels, options.labelInterval, params.addedDataCount);
        }

        if (predicate.isDatetimeType(options.type)) {
            labels = renderUtil.formatDates(labels, options.dateFormat);
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
     * Make data for value type axis.
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
        var labels = params.labels;
        var tickCount = params.tickCount;
        var limit = params.limit;
        var axisData = {
            labels: labels,
            tickCount: tickCount,
            validTickCount: tickCount,
            limit: limit,
            dataMin: limit.min,
            distance: limit.max - limit.min,
            step: params.step,
            options: params.options,
            isVertical: !!params.isVertical,
            isPositionRight: !!params.isPositionRight,
            aligned: !!params.aligned
        };

        return axisData;
    },

    /**
     * Make additional data for coordinate line type chart.
     * @param {Array.<string>} labels - labels
     * @param {Array.<number>} values - values
     * @param {{min: number, max: number}} limit - limit
     * @param {number} step - step
     * @param {number} tickCount = tickCount
     * @returns {{
     *      labels: Array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      limit: {min: number, max: number},
     *      positionRatio: number,
     *      sizeRatio: number
     * }}
     */
    makeAdditionalDataForCoordinateLineType: function(labels, values, limit, step, tickCount) {
        var sizeRatio = 1;
        var positionRatio = 0;
        var min = arrayUtil.min(values);
        var max = arrayUtil.max(values);
        var distance;

        distance = max - min;

        if (distance) {
            if (limit.min < min) {
                limit.min += step;
                positionRatio = (limit.min - min) / distance;
                sizeRatio -= positionRatio;
                tickCount -= 1;
                labels.shift();
            }

            if (limit.max > max) {
                limit.max -= step;
                sizeRatio -= (max - limit.max) / distance;
                tickCount -= 1;
                labels.pop();
            }
        }

        return {
            labels: labels,
            tickCount: tickCount,
            validTickCount: tickCount,
            limit: limit,
            dataMin: min,
            distance: distance,
            positionRatio: positionRatio,
            sizeRatio: sizeRatio
        };
    },

    /**
     * Make adjusting tick interval information.
     * @param {number} beforeBlockCount - before block count
     * @param {number} seriesWidth - width of series area
     * @param {number} blockSize - block size
     * @returns {null | {blockCount: number, beforeRemainBlockCount: number, interval: number}}
     * @private
     */
    _makeAdjustingIntervalInfo: function(beforeBlockCount, seriesWidth, blockSize) {
        var newBlockCount = parseInt(seriesWidth / blockSize, 10);
        // interval : number of previous blocks in a new block(spaces between tick and tick)
        var interval = parseInt(beforeBlockCount / newBlockCount, 10);
        var intervalInfo = null;
        var remainCount;

        if (interval > 1) {
            // remainCount : remaining block count after filling new blocks
            // | | | | | | | | | | | |  - previous block interval
            // |     |     |     |      - new block interval
            //                   |*|*|  - remaining block
            remainCount = beforeBlockCount - (interval * newBlockCount);

            if (remainCount >= interval) {
                newBlockCount += parseInt(remainCount / interval, 0);
                remainCount = remainCount % interval;
            }

            intervalInfo = {
                blockCount: newBlockCount,
                beforeRemainBlockCount: remainCount,
                interval: interval
            };
        }

        return intervalInfo;
    },

    /**
     * Make candidate for adjusting tick interval.
     * @param {number} beforeBlockCount - before block count
     * @param {number} seriesWidth - width of series area
     * @returns {Array.<{newBlockCount: number, remainBlockCount: number, interval: number}>}
     * @private
     */
    _makeCandidatesForAdjustingInterval: function(beforeBlockCount, seriesWidth) {
        var self = this;
        var blockSizeRange = snippet.range(90, 121, 5); // [90, 95, 100, 105, 110, 115, 120]
        var candidates = snippet.map(blockSizeRange, function(blockSize) {
            return self._makeAdjustingIntervalInfo(beforeBlockCount, seriesWidth, blockSize);
        });

        return snippet.filter(candidates, function(info) {
            return !!info;
        });
    },

    /**
     * Calculate adjusting interval information for auto tick interval option.
     * @param {number} curBlockCount - current block count
     * @param {number} seriesWidth - series width
     * @returns {{newBlockCount: number, remainBlockCount: number, interval: number}}
     * @private
     */
    _calculateAdjustingIntervalInfo: function(curBlockCount, seriesWidth) {
        var candidates = this._makeCandidatesForAdjustingInterval(curBlockCount, seriesWidth);
        var intervalInfo = null;

        if (candidates.length) {
            intervalInfo = arrayUtil.min(candidates, function(candidate) {
                return candidate.blockCount;
            });
        }

        return intervalInfo;
    },

    /**
     * Make filtered labels by interval.
     * @param {Array.<string>} labels - labels
     * @param {number} startIndex - start index
     * @param {number} interval - interval
     * @returns {Array.<string>}
     * @private
     */
    _makeFilteredLabelsByInterval: function(labels, startIndex, interval) {
        return snippet.filter(labels.slice(startIndex), function(label, index) {
            return index % interval === 0;
        });
    },

    /**
     * Update label type axisData for auto tick interval option.
     * @param {object} axisData - axisData
     * @param {number} seriesWidth - series width
     * @param {?number} addedDataCount - added data count
     * @param {?boolean} addingDataMode - whether adding data mode or not
     */
    updateLabelAxisDataForAutoTickInterval: function(axisData, seriesWidth, addedDataCount, addingDataMode) {
        var beforeBlockCount, intervalInfo;
        var adjustingBlockCount, interval, beforeRemainBlockCount, startIndex;

        if (addingDataMode) {
            axisData.tickCount -= 1;
            axisData.labels.pop();
        }

        beforeBlockCount = axisData.tickCount - 1;
        intervalInfo = this._calculateAdjustingIntervalInfo(beforeBlockCount, seriesWidth);

        if (!intervalInfo) {
            return;
        }

        adjustingBlockCount = intervalInfo.blockCount;
        interval = intervalInfo.interval;
        beforeRemainBlockCount = intervalInfo.beforeRemainBlockCount;
        axisData.eventTickCount = axisData.tickCount;

        // startIndex: (remaing block count / 2) - current moved tick index
        // |     |     |     |*|*|*|    - * remaing block
        // |*|*|O    |     |     |*|    - tick is not moved (O startIndex = 2)
        // |*|O    |     |     |*|*|    - tick moved 1 (O startIndex = 1)
        startIndex = Math.round(beforeRemainBlockCount / 2) - (addedDataCount % interval);

        if (startIndex < 0) {
            startIndex += interval;
        }

        axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);

        snippet.extend(axisData, {
            startIndex: startIndex,
            tickCount: adjustingBlockCount + 1,
            positionRatio: (startIndex / beforeBlockCount),
            sizeRatio: 1 - (beforeRemainBlockCount / beforeBlockCount),
            interval: interval
        });
    },

    /**
     * Update label type axisData for stacking dynamic data.
     * @param {object} axisData - axis data
     * @param {object} prevUpdatedData - previous updated axisData
     * @param {number} firstTickCount - calculated first tick count
     */
    updateLabelAxisDataForStackingDynamicData: function(axisData, prevUpdatedData, firstTickCount) {
        var interval = prevUpdatedData.interval;
        var startIndex = prevUpdatedData.startIndex;
        var beforeBlockCount = axisData.tickCount - 1;
        var newBlockCount = beforeBlockCount / interval;
        var firstBlockCount = firstTickCount ? firstTickCount - 1 : 0;
        var beforeRemainBlockCount;

        // twice interval, if new block count is greater than twice of new block count
        if (firstBlockCount && ((firstBlockCount * 2) <= newBlockCount)) {
            interval *= 2;
        }

        axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);
        newBlockCount = axisData.labels.length - 1;
        beforeRemainBlockCount = beforeBlockCount - (interval * newBlockCount);

        snippet.extend(axisData, {
            startIndex: startIndex,
            eventTickCount: axisData.tickCount,
            tickCount: axisData.labels.length,
            positionRatio: startIndex / beforeBlockCount,
            sizeRatio: 1 - (beforeRemainBlockCount / beforeBlockCount),
            interval: interval
        });
    },

    /**
     * Calculate width for label area for x axis.
     * @param {boolean} isLabelAxis - whether label type axis or not
     * @param {number} seriesWidth - series width
     * @param {number} labelCount - label count
     * @returns {number} limit width
     * @private
     */
    _calculateXAxisLabelAreaWidth: function(isLabelAxis, seriesWidth, labelCount) {
        if (!isLabelAxis) {
            labelCount -= 1;
        }

        return seriesWidth / labelCount;
    },

    /**
     * Create multiline label.
     * @param {string} label - label
     * @param {number} limitWidth - limit width
     * @param {object} theme - label theme
     * @returns {string}
     * @private
     */
    _createMultilineLabel: function(label, limitWidth, theme) {
        var words = String(label).split(/\s+/);
        var lineWords = words[0];
        var lines = [];

        snippet.forEachArray(words.slice(1), function(word) {
            var width = renderUtil.getRenderedLabelWidth(lineWords + ' ' + word, theme);

            if (width > limitWidth) {
                lines.push(lineWords);
                lineWords = word;
            } else {
                lineWords += ' ' + word;
            }
        });

        if (lineWords) {
            lines.push(lineWords);
        }

        return lines.join('<br>');
    },

    /**
     * Create multiline labels.
     * @param {Array.<string>} labels - labels
     * @param {object} labelTheme - theme for label
     * @param {number} labelAreaWidth - label area width
     * @returns {Array}
     * @private
     */
    _createMultilineLabels: function(labels, labelTheme, labelAreaWidth) {
        var _createMultilineLabel = this._createMultilineLabel;

        return snippet.map(labels, function(label) {
            return _createMultilineLabel(label, labelAreaWidth, labelTheme);
        });
    },

    /**
     * Calculate multiline height.
     * @param {Array.string} multilineLabels - multiline labels
     * @param {object} labelTheme - theme for label
     * @param {number} labelAreaWidth - width for label area
     * @returns {number}
     * @private
     */
    _calculateMultilineHeight: function(multilineLabels, labelTheme, labelAreaWidth) {
        return renderUtil.getRenderedLabelsMaxHeight(multilineLabels, snippet.extend({
            cssText: 'line-height:1.2;width:' + labelAreaWidth + 'px'
        }, labelTheme));
    },

    /**
     * Calculate height difference between origin category and multiline category.
     * @param {Array.<string>} labels - labels
     * @param {Array.<string>} validLabelCount - valid label count
     * @param {object} labelTheme - theme for label
     * @param {boolean} isLabelAxis - whether label type axis or not
     * @param {{series: {width: number}, yAxis: {width: number}}} dimensionMap - dimension map
     * @returns {number}
     */
    makeAdditionalDataForMultilineLabels: function(labels, validLabelCount, labelTheme, isLabelAxis, dimensionMap) {
        var seriesWidth = dimensionMap.series.width;
        var labelAreaWidth = this._calculateXAxisLabelAreaWidth(isLabelAxis, seriesWidth, validLabelCount);
        var multilineLabels = this._createMultilineLabels(labels, labelTheme, seriesWidth);
        var multilineHeight = this._calculateMultilineHeight(multilineLabels, labelTheme, labelAreaWidth);
        var labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme);

        return {
            multilineLabels: multilineLabels,
            overflowHeight: multilineHeight - labelHeight,
            overflowLeft: (labelAreaWidth / 2) - dimensionMap.yAxis.width
        };
    },

    /**
     * Find rotation degree.
     * @param {number} labelAreaWidth - limit width
     * @param {number} labelWidth - label width
     * @param {number} labelHeight - label height
     * @returns {number}
     * @private
     */
    _findRotationDegree: function(labelAreaWidth, labelWidth, labelHeight) {
        var foundDegree = null;

        snippet.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {
            var compareWidth = geomatric.calculateRotatedWidth(degree, labelWidth, labelHeight);

            foundDegree = degree;

            if (compareWidth <= labelAreaWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }

            return true;
        });

        return foundDegree;
    },

    /**
     * Calculate rotated width.
     * @param {number} degree - degree for label of x axis
     * @param {string} firstLabel - first label
     * @param {number} labelHeight - labelHeight
     * @param {object} labelTheme - theme for label
     * @returns {number}
     * @private
     */
    _calculateRotatedWidth: function(degree, firstLabel, labelHeight, labelTheme) {
        var firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, labelTheme);
        var newLabelWidth = geomatric.calculateRotatedWidth(degree, firstLabelWidth, labelHeight);

        // when checking overflow, calculation should be based on right top angle
        newLabelWidth -= geomatric.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2);

        return newLabelWidth;
    },

    /**
     * Calculate limit width for label
     * @param {number} yAxisWidth - y axis width
     * @param {boolean} isLabelAxis - aligned tick and label
     * @param {number} labelAreaWidth - width for label area
     * @returns {number}
     * @private
     */
    _calculateLimitWidth: function(yAxisWidth, isLabelAxis, labelAreaWidth) {
        var limitWidth = yAxisWidth;

        if (isLabelAxis) {
            limitWidth += (labelAreaWidth / 2);
        }

        return limitWidth;
    },

    /**
     * Make additional data for rotated labels.
     * The label size is larger than the specified area, creating data to handle the area beyond the border.
     * @param {Array.<string>} validLabels - valid labels
     * @param {Array.<string>} validLabelCount - valid label count
     * @param {object} labelTheme - theme for label
     * @param {boolean} isLabelAxis - whether label type axis or not
     * @param {{series: {width: number}, yAxis: {width: number}}} dimensionMap - dimension map
     * @returns {{degree: number, overflowHeight: number, overflowLeft: number}}
     */
    makeAdditionalDataForRotatedLabels: function(validLabels, validLabelCount, labelTheme, isLabelAxis, dimensionMap) {
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(validLabels, labelTheme);
        var seriesWidth = dimensionMap.series.width;
        var labelAreaWidth = this._calculateXAxisLabelAreaWidth(isLabelAxis, seriesWidth, validLabelCount);
        var additionalData = null;
        var degree, labelHeight, rotatedHeight, limitWidth, rotatedWidth;
        var contentWidth = chartConst.CHART_PADDING + dimensionMap.yAxis.width + seriesWidth;

        if (labelAreaWidth < maxLabelWidth) {
            labelHeight = renderUtil.getRenderedLabelsMaxHeight(validLabels, labelTheme);
            degree = this._findRotationDegree(labelAreaWidth, maxLabelWidth, labelHeight);
            rotatedHeight = geomatric.calculateRotatedHeight(degree, maxLabelWidth, labelHeight);
            rotatedWidth = this._calculateRotatedWidth(degree, validLabels[0], labelHeight, labelTheme);
            limitWidth = this._calculateLimitWidth(dimensionMap.yAxis.width, isLabelAxis, labelAreaWidth);
            contentWidth += rotatedWidth; // add spaces to render maybe one label

            additionalData = {
                degree: degree,
                overflowHeight: rotatedHeight - labelHeight,
                overflowLeft: rotatedWidth - limitWidth,
                overflowRight: contentWidth - dimensionMap.chart.width
            };
        } else {
            contentWidth += maxLabelWidth;

            labelAreaWidth = renderUtil.getRenderedLabelWidth(validLabels[0], labelTheme) / 2;
            additionalData = {
                overflowLeft: labelAreaWidth - dimensionMap.yAxis.width,
                overflowRight: contentWidth - dimensionMap.chart.width
            };
        }

        return additionalData;
    }
};

module.exports = axisDataMaker;
