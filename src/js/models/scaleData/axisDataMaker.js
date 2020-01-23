/**
 * @fileoverview Axis Data Maker
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import geomatric from '../../helpers/geometric';
import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';
const AUTO_INTERVAL_MIN_WIDTH = 90;
const AUTO_INTERVAL_MAX_WIDTH = 121;
const AUTO_INTERVAL_RANGE_STEP = 5;

/**
 * Axis data maker.
 * @module axisDataMaker
 * @private */
const axisDataMaker = {
  /**
   * Makes labels by labelInterval option.
   * @param {Array.<string>} labels - labels
   * @param {number} labelInterval - label interval option
   * @param {number} [addedDataCount] - added data count
   * @returns {Array.<string>} labels
   * @private
   */
  _makeLabelsByIntervalOption(labels, labelInterval, addedDataCount) {
    addedDataCount = addedDataCount || 0;
    labels = labels.map((label, index) => {
      if ((index + addedDataCount) % labelInterval !== 0) {
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
  makeLabelAxisData(params) {
    const { options = {} } = params;
    let tickCount = params.labels.length;
    let { labels } = params;

    if (
      predicate.isValidLabelInterval(options.labelInterval, options.tickInterval) &&
      params.labels.length > options.labelInterval
    ) {
      labels = this._makeLabelsByIntervalOption(
        params.labels,
        options.labelInterval,
        params.addedDataCount
      );
    }

    if (predicate.isDatetimeType(options.type)) {
      labels = renderUtil.formatDates(labels, options.dateFormat);
    }

    if (!params.aligned) {
      tickCount += 1;
    }

    return {
      labels,
      tickCount,
      validTickCount: tickCount,
      isLabelAxis: true,
      options,
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
  makeValueAxisData(params) {
    const { labels, tickCount, limit } = params;
    const { step, options, isVertical, isPositionRight, aligned } = params;

    const axisData = {
      labels,
      tickCount,
      limit,
      step,
      options,
      validTickCount: tickCount,
      dataMin: limit.min,
      distance: limit.max - limit.min,
      isVertical: !!isVertical,
      isPositionRight: !!isPositionRight,
      aligned: !!aligned
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
  makeAdditionalDataForCoordinateLineType(labels, values, limit, step, tickCount) {
    const min = arrayUtil.min(values);
    const max = arrayUtil.max(values);
    const distance = max - min;
    let positionRatio = 0;
    let sizeRatio = 1;

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
      labels,
      tickCount,
      limit,
      distance,
      positionRatio,
      sizeRatio,
      validTickCount: tickCount,
      dataMin: min
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
  _makeAdjustingIntervalInfo(beforeBlockCount, seriesWidth, blockSize) {
    let remainCount;
    let newBlockCount = parseInt(seriesWidth / blockSize, 10);
    let intervalInfo = null;
    // interval : number of previous blocks in a new block(spaces between tick and tick)
    const interval = parseInt(beforeBlockCount / newBlockCount, 10);

    if (interval > 1) {
      // remainCount : remaining block count after filling new blocks
      // | | | | | | | | | | | |  - previous block interval
      // |     |     |     |      - new block interval
      //                   |*|*|  - remaining block
      remainCount = beforeBlockCount - interval * newBlockCount;

      if (remainCount >= interval) {
        newBlockCount += parseInt(remainCount / interval, 0);
        remainCount = remainCount % interval;
      }

      intervalInfo = {
        blockCount: newBlockCount,
        beforeRemainBlockCount: remainCount,
        interval
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
  _makeCandidatesForAdjustingInterval(beforeBlockCount, seriesWidth) {
    let candidates = [];
    const candidateInterval = calculator.divisors(beforeBlockCount);
    candidateInterval.forEach(interval => {
      const intervalWidth = (interval / beforeBlockCount) * seriesWidth;
      if (intervalWidth >= AUTO_INTERVAL_MIN_WIDTH && intervalWidth <= AUTO_INTERVAL_MAX_WIDTH) {
        candidates.push({
          interval,
          blockCount: beforeBlockCount / interval,
          beforeRemainBlockCount: 0
        });
      }
    });

    if (candidates.length === 0) {
      const blockSizeRange = snippet.range(
        AUTO_INTERVAL_MIN_WIDTH,
        AUTO_INTERVAL_MAX_WIDTH,
        AUTO_INTERVAL_RANGE_STEP
      );
      candidates = blockSizeRange.map(blockSize =>
        this._makeAdjustingIntervalInfo(beforeBlockCount, seriesWidth, blockSize)
      );
    }

    return candidates.filter(info => !!info);
  },

  /**
   * Calculate adjusting interval information for auto tick interval option.
   * @param {number} curBlockCount - current block count
   * @param {number} seriesWidth - series width
   * @returns {{newBlockCount: number, remainBlockCount: number, interval: number}}
   * @private
   */
  _calculateAdjustingIntervalInfo(curBlockCount, seriesWidth) {
    const candidates = this._makeCandidatesForAdjustingInterval(curBlockCount, seriesWidth);
    let intervalInfo = null;

    if (candidates.length) {
      intervalInfo = arrayUtil.max(candidates, candidate => candidate.blockCount);
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
  _makeFilteredLabelsByInterval(labels, startIndex, interval) {
    return labels.slice(startIndex).filter((label, index) => index % interval === 0);
  },

  /**
   * Update label type axisData for auto tick interval option.
   * @param {object} axisData - axisData
   * @param {number} seriesWidth - series width
   * @param {?number} addedDataCount - added data count
   * @param {?boolean} addingDataMode - whether adding data mode or not
   */
  updateLabelAxisDataForAutoTickInterval(axisData, seriesWidth, addedDataCount, addingDataMode) {
    if (addingDataMode) {
      axisData.tickCount -= 1;
      axisData.labels.pop();
    }

    const beforeBlockCount = axisData.tickCount - 1;
    const intervalInfo = this._calculateAdjustingIntervalInfo(beforeBlockCount, seriesWidth);

    if (!intervalInfo) {
      return;
    }

    // startIndex: (remaing block count / 2) - current moved tick index
    // |     |     |     |*|*|*|    - * remaing block
    // |*|*|O    |     |     |*|    - tick is not moved (O startIndex = 2)
    // |*|O    |     |     |*|*|    - tick moved 1 (O startIndex = 1)
    // startIndex = Math.round(beforeRemainBlockCount / 2) - (addedDataCount % interval);
    // if (startIndex < 0) {
    //     startIndex += interval;
    // }
    // Fixed to 0 due to issues. (https://github.com/nhn/tui.chart/issues/56)

    axisData.eventTickCount = axisData.tickCount;

    const adjustingBlockCount = intervalInfo.blockCount;
    const { beforeRemainBlockCount, interval } = intervalInfo;
    const tickCount = adjustingBlockCount + 1;
    const startIndex = 0;
    const lastLabelValue = axisData.labels[axisData.labels.length - 1];
    axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);

    if (beforeRemainBlockCount > 0) {
      axisData.labels.push(lastLabelValue);
    }

    snippet.extend(axisData, {
      startIndex,
      tickCount,
      interval,
      positionRatio: startIndex / beforeBlockCount,
      sizeRatio: 1 - beforeRemainBlockCount / beforeBlockCount,
      remainLastBlockInterval: beforeRemainBlockCount
    });
  },

  /**
   * Update label type axisData for stacking dynamic data.
   * @param {object} axisData - axis data
   * @param {object} prevUpdatedData - previous updated axisData
   * @param {number} firstTickCount - calculated first tick count
   */
  updateLabelAxisDataForStackingDynamicData(axisData, prevUpdatedData, firstTickCount) {
    let { interval } = prevUpdatedData;
    const { startIndex } = prevUpdatedData;
    const beforeBlockCount = axisData.tickCount - 1;
    const firstBlockCount = firstTickCount ? firstTickCount - 1 : 0;
    let newBlockCount = beforeBlockCount / interval;

    // twice interval, if new block count is greater than twice of new block count
    if (firstBlockCount && firstBlockCount * 2 <= newBlockCount) {
      interval *= 2;
    }

    axisData.labels = this._makeFilteredLabelsByInterval(axisData.labels, startIndex, interval);
    newBlockCount = axisData.labels.length - 1;
    const beforeRemainBlockCount = beforeBlockCount - interval * newBlockCount;

    snippet.extend(axisData, {
      startIndex,
      interval,
      eventTickCount: axisData.tickCount,
      tickCount: axisData.labels.length,
      positionRatio: startIndex / beforeBlockCount,
      sizeRatio: 1 - beforeRemainBlockCount / beforeBlockCount
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
  _calculateXAxisLabelAreaWidth(isLabelAxis, seriesWidth, labelCount) {
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
  _createMultilineLabel(label, limitWidth, theme) {
    const words = String(label).split(' ');
    const lines = [];
    let [lineWords] = words;

    words.slice(1).forEach(word => {
      const width = renderUtil.getRenderedLabelWidth(`${lineWords} ${word}`, theme);

      if (width > limitWidth) {
        lines.push(lineWords);
        lineWords = word;
      } else {
        lineWords += ` ${word}`;
      }
    });

    if (lineWords) {
      lines.push(lineWords);
    }

    return lines.join('\n');
  },

  /**
   * Create multiline labels.
   * @param {Array.<string>} labels - labels
   * @param {object} labelTheme - theme for label
   * @param {number} labelAreaWidth - label area width
   * @returns {Array}
   * @private
   */
  _createMultilineLabels(labels, labelTheme, labelAreaWidth) {
    const { _createMultilineLabel } = this;

    return labels.map(label => _createMultilineLabel(label, labelAreaWidth, labelTheme));
  },

  /**
   * Calculate multiline height.
   * @param {Array.string} multilineLabels - multiline labels
   * @param {object} labelTheme - theme for label
   * @param {number} labelAreaWidth - width for label area
   * @returns {number}
   * @private
   */
  _calculateMultilineHeight(multilineLabels, labelTheme, labelAreaWidth) {
    return renderUtil.getRenderedLabelsMaxHeight(
      multilineLabels,
      Object.assign(
        {
          cssText: `line-height:1.2;width:${labelAreaWidth}px`
        },
        labelTheme
      )
    );
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
  makeAdditionalDataForMultilineLabels(
    labels,
    validLabelCount,
    labelTheme,
    isLabelAxis,
    dimensionMap
  ) {
    const seriesWidth = dimensionMap.series.width;
    const labelAreaWidth = this._calculateXAxisLabelAreaWidth(
      isLabelAxis,
      seriesWidth,
      validLabelCount
    );
    const multilineLabels = this._createMultilineLabels(labels, labelTheme, labelAreaWidth);
    const multilineHeight = this._calculateMultilineHeight(
      multilineLabels,
      labelTheme,
      labelAreaWidth
    );
    const labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme);

    return {
      multilineLabels,
      overflowHeight: multilineHeight - labelHeight,
      overflowLeft: 0
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
  _findRotationDegree(labelAreaWidth, labelWidth, labelHeight) {
    let foundDegree = null;

    chartConst.DEGREE_CANDIDATES.every(degree => {
      const compareWidth = geomatric.calculateRotatedWidth(degree, labelWidth, labelHeight);
      foundDegree = degree;

      if (compareWidth <= labelAreaWidth) {
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
  _calculateRotatedWidth(degree, firstLabel, labelHeight, labelTheme) {
    const firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, labelTheme);
    let newLabelWidth = geomatric.calculateRotatedWidth(degree, firstLabelWidth, labelHeight);

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
  _calculateLimitWidth(yAxisWidth, isLabelAxis, labelAreaWidth) {
    let limitWidth = yAxisWidth;

    if (isLabelAxis) {
      limitWidth += labelAreaWidth / 2;
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
  makeAdditionalDataForRotatedLabels(
    validLabels,
    validLabelCount,
    labelTheme,
    isLabelAxis,
    dimensionMap
  ) {
    const maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(validLabels, labelTheme);
    const seriesWidth = dimensionMap.series.width;
    const yAxisAreaWidth =
      dimensionMap.yAxis.width + (dimensionMap.rightYAxis ? dimensionMap.rightYAxis.width : 0);

    let labelAreaWidth = this._calculateXAxisLabelAreaWidth(
      isLabelAxis,
      seriesWidth,
      validLabelCount
    );
    let additionalData = null;
    let contentWidth = chartConst.CHART_PADDING * 2 + yAxisAreaWidth + seriesWidth;

    if (labelAreaWidth < maxLabelWidth) {
      const labelHeight = renderUtil.getRenderedLabelsMaxHeight(validLabels, labelTheme);
      const degree = this._findRotationDegree(labelAreaWidth, maxLabelWidth, labelHeight);
      const rotatedHeight = geomatric.calculateRotatedHeight(degree, maxLabelWidth, labelHeight);
      const rotatedWidth = this._calculateRotatedWidth(
        degree,
        validLabels[0],
        labelHeight,
        labelTheme
      );
      const limitWidth = this._calculateLimitWidth(
        dimensionMap.yAxis.width,
        isLabelAxis,
        labelAreaWidth
      );
      contentWidth += rotatedWidth; // add spaces to render maybe one label

      additionalData = {
        degree,
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

export default axisDataMaker;
