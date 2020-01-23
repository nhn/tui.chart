/**
 * @fileoverview TickBaseDataModel is tick base data model.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

class TickBaseDataModel {
  /**
   * TickBaseDataModel is tick base data model.
   * @param {{
   *     dimension: {
   *         width: number,
   *         height: number
   *     }, position: {
   *         left: number,
   *         top: number
   *     }
   * }} layout layout
   * @param {number} tickCount tick count
   * @param {string} chartType chart type
   * @param {boolean} isVertical whether vertical or not
   * @param {Array.<string>} [chartTypes] - chart types of combo chart
   * @constructs TickBaseDataModel
   * @private
   */
  constructor(layout, tickCount, chartType, isVertical, chartTypes) {
    /**
     * whether line type or not
     * @type {boolean}
     */
    this.isLineType = predicate.isLineTypeChart(chartType, chartTypes);

    this.data = this._makeData(layout, tickCount, isVertical);
  }

  /**
   * Get each tick ranges
   * @param {number} tickCount tick count
   * @param {number} firstPosition first position value
   * @param {number} tickInterval tick distance
   * @returns {Array.<object>}
   * @private
   */
  _getRanges(tickCount, firstPosition, tickInterval) {
    let prev = firstPosition;
    const halfInterval = tickInterval / 2;

    return snippet.range(0, tickCount).map(() => {
      const limit = {
        min: prev - halfInterval,
        max: prev + halfInterval
      };

      prev += tickInterval;

      return limit;
    });
  }

  /**
   * Make tick base data about line type chart.
   * @param {number} width width
   * @param {number} tickCount tick count
   * @param {number} firstPosition firstPosition of group
   * @returns {Array} tick base data
   * @private
   */
  _makeLineTypeData(width, tickCount, firstPosition) {
    const tickInterval = (width + 1) / (tickCount - 1);
    const ranges = this._getRanges(tickCount, firstPosition || 0, tickInterval);

    ranges[tickCount - 1].max -= 1;

    return ranges;
  }

  /**
   * Make tick base data about non line type chart.
   * @param {number} size width or height
   * @param {number} tickCount tick count
   * @param {number} firstPosition firstPosition of group
   * @returns {Array} tick base data
   * @private
   */
  _makeNormalData(size, tickCount, firstPosition) {
    const len = tickCount - 1;
    const tickInterval = size / len;
    let prev = firstPosition || 0;

    return snippet.range(0, len).map(() => {
      const max = arrayUtil.min([size + prev, tickInterval + prev]);
      const limit = {
        min: prev,
        max
      };
      prev = max;

      return limit;
    });
  }

  /**
   * Make tick base data for mouse event detector.
   * @param {{dimension: object, position: object}} layout layout
   * @param {number} tickCount tick count
   * @param {boolean} isVertical whether vertical or not
   * @returns {Array.<object>} tick base data
   * @private
   */
  _makeData(layout, tickCount, isVertical) {
    const sizeType = isVertical ? 'width' : 'height';
    const positionType = isVertical ? 'left' : 'top';

    if (this.isLineType) {
      return this._makeLineTypeData(
        layout.dimension[sizeType],
        tickCount,
        layout.position[positionType]
      );
    }

    return this._makeNormalData(
      layout.dimension[sizeType],
      tickCount,
      layout.position[positionType]
    );
  }

  /**
   * Find index.
   * @param {number} pointValue mouse position point value
   * @returns {number} group index
   */
  findIndex(pointValue) {
    let foundIndex = -1;

    this.data.forEach((limit, index) => {
      if (limit.min < pointValue && limit.max >= pointValue) {
        foundIndex = index;

        return false;
      }

      return true;
    });

    return foundIndex;
  }

  /**
   * Get last index.
   * @returns {number}
   */
  getLastIndex() {
    return this.data.length - 1;
  }

  /**
   * Make range of tooltip position.
   * @param {number} index index
   * @param {number} positionValue positionValue
   * @returns {{start: number, end: number}} range type value
   * @private
   */
  makeRange(index, positionValue) {
    const limit = this.data[index];
    let range, center;

    if (this.isLineType) {
      center = parseInt(limit.max - (limit.max - limit.min) / 2, 10);
      range = {
        start: center,
        end: center
      };
    } else {
      range = {
        start: limit.min - (positionValue || 0),
        end: limit.max - (positionValue || 0)
      };
    }

    return range;
  }
}

export default TickBaseDataModel;
