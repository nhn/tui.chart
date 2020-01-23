/**
 * @fileoverview squarifier create squarified bounds for rendering graph of treemap chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import calculator from '../../helpers/calculator';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

export default {
  /**
   * bound map
   * @type {object.<string, {width: number, height: number, left: number, top: number}>}
   */
  boundMap: {},

  /**
     * Make base bound for calculating bounds.

     * @param {{width: number, height: number, left: number, top: number}} layout - layout
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
  _makeBaseBound(layout) {
    return snippet.extend({}, layout);
  },

  /**
   * Calculate scale for calculating weight.
   * @param {Array.<number>} values - values
   * @param {number} width - width of series area
   * @param {number} height - height of series area
   * @returns {number}
   * @private
   */
  _calculateScale(values, width, height) {
    return (width * height) / calculator.sum(values);
  },

  /**
   * Make base data for creating squarified bounds.
   * @param {Array.<SeriesItem>} seriesItems - SeriesItems
   * @param {number} width - width of series area
   * @param {number} height - height of series area
   * @returns {Array.<{itme: SeriesItem, weight: number}>}
   * @private
   */
  _makeBaseData(seriesItems, width, height) {
    const scale = this._calculateScale(snippet.pluck(seriesItems, 'value'), width, height);
    const data = seriesItems
      .map(seriesItem => ({
        id: seriesItem.id,
        weight: seriesItem.value * scale
      }))
      .sort((a, b) => b.weight - a.weight);

    return data;
  },

  /**
   * Calculate worst aspect ratio.
   * Referred function worst() in https://www.win.tue.nl/~vanwijk/stm.pdf
   * @param {number} sum - sum for weights
   * @param {number} min - minimum weight
   * @param {number} max - maximum weight
   * @param {number} baseSize - base size (width or height)
   * @returns {number}
   * @private
   */
  _worst(sum, min, max, baseSize) {
    const sumSquare = sum * sum;
    const sizeSquare = baseSize * baseSize;

    return Math.max((sizeSquare * max) / sumSquare, sumSquare / (sizeSquare * min));
  },

  /**
   * Whether changed stack direction or not.
   * @param {number} sum - sum for weights
   * @param {Array.<number>} weights - weights
   * @param {number} baseSize - base size
   * @param {number} newWeight - new weight
   * @returns {boolean}
   * @private
   */
  _changedStackDirection(sum, weights, baseSize, newWeight) {
    const min = arrayUtil.min(weights);
    const max = arrayUtil.max(weights);
    const beforeWorst = this._worst(sum, min, max, baseSize);
    const newWorst = this._worst(
      sum + newWeight,
      Math.min(min, newWeight),
      Math.max(max, newWeight),
      baseSize
    );

    return newWorst >= beforeWorst;
  },

  /**
   * Whether type of vertical stack or not.
   * @param {{width: number, height: number}} baseBound - base bound
   * @returns {boolean}
   * @private
   */
  _isVerticalStack(baseBound) {
    return baseBound.height < baseBound.width;
  },

  /**
   * Select base size from baseBound.
   * @param {{width: number, height: number}} baseBound - base bound
   * @returns {number}
   * @private
   */
  _selectBaseSize(baseBound) {
    return this._isVerticalStack(baseBound) ? baseBound.height : baseBound.width;
  },

  /**
   * Calculate fixed size.
   * @param {number} baseSize - base size
   * @param {number} sum - sum for weights
   * @param {Array.<{weight: number}>} row - row
   * @returns {number}
   * @private
   */
  _calculateFixedSize(baseSize, sum, row) {
    if (!sum) {
      const weights = snippet.pluck(row, 'weight');
      sum = calculator.sum(weights);
    }

    return sum / baseSize;
  },

  /**
   * Add bounds.
   * @param {number} startPosition - start position
   * @param {Array.<{weight: number}>} row - row
   * @param {number} fixedSize - fixed size
   * @param {function} callback - callback function
   * @private
   */
  _addBounds(startPosition, row, fixedSize, callback) {
    [startPosition].concat(row).reduce((storedPosition, rowDatum) => {
      const dynamicSize = rowDatum.weight / fixedSize;

      callback(dynamicSize, storedPosition, rowDatum.id);

      return storedPosition + dynamicSize;
    });
  },

  /**
   * Add bound.
   * @param {number} left - left position
   * @param {number} top - top position
   * @param {number} width - width
   * @param {number} height - height
   * @param {string | number} id - id of seriesItem
   * @private
   */
  _addBound(left, top, width, height, id) {
    this.boundMap[id] = {
      left,
      top,
      width,
      height
    };
  },

  /**
   * Add bounds for type of vertical stack.
   * @param {Array.<{weight: number}>} row - row
   * @param {{left: number, top: number, width: number, height: number}} baseBound - base bound
   * @param {number} baseSize - base size
   * @param {number} sum - sum for weights of row
   * @private
   */
  _addBoundsForVerticalStack(row, baseBound, baseSize, sum) {
    const fixedWidth = this._calculateFixedSize(baseSize, sum, row);

    this._addBounds(baseBound.top, row, fixedWidth, (dynamicHeight, storedTop, id) => {
      this._addBound(baseBound.left, storedTop, fixedWidth, dynamicHeight, id);
    });

    baseBound.left += fixedWidth;
    baseBound.width -= fixedWidth;
  },

  /**
   * Add bounds for type of horizontal stack.
   * @param {Array.<{weight: number}>} row - row
   * @param {{left: number, top: number, width: number, height: number}} baseBound - base bound
   * @param {number} baseSize - base size
   * @param {number} sum - sum for weights of row
   * @private
   */
  _addBoundsForHorizontalStack(row, baseBound, baseSize, sum) {
    const fixedHeight = this._calculateFixedSize(baseSize, sum, row);

    this._addBounds(baseBound.left, row, fixedHeight, (dynamicWidth, storedLeft, id) => {
      this._addBound(storedLeft, baseBound.top, dynamicWidth, fixedHeight, id);
    });

    baseBound.top += fixedHeight;
    baseBound.height -= fixedHeight;
  },

  /**
   * Get adding bounds function.
   * @param {{width: number, height: number}} baseBound - base bound
   * @returns {*}
   * @private
   */
  _getAddingBoundsFunction(baseBound) {
    if (this._isVerticalStack(baseBound)) {
      return snippet.bind(this._addBoundsForVerticalStack, this);
    }

    return this._addBoundsForHorizontalStack.bind(this);
  },

  /**
   * Create squarified bound map for graph rendering.
   * @param {object} layout - series area layout
   * @param {Array.<SeriesItem>} seriesItems - seriesItems
   * @returns {object.<string, {width: number, height: number, left: number, top: number}>}
   */
  squarify(layout, seriesItems) {
    const baseBound = this._makeBaseBound(layout);
    const baseData = this._makeBaseData(seriesItems, baseBound.width, baseBound.height);
    let row = [];
    let baseSize, addBounds;

    this.boundMap = {};

    baseData.forEach(datum => {
      const weights = snippet.pluck(row, 'weight');
      const sum = calculator.sum(weights);

      if (row.length && this._changedStackDirection(sum, weights, baseSize, datum.weight)) {
        addBounds(row, baseBound, baseSize, sum);
        row = [];
      }

      if (!row.length) {
        baseSize = this._selectBaseSize(baseBound);
        addBounds = this._getAddingBoundsFunction(baseBound);
      }

      row.push(datum);
    });

    if (row.length) {
      addBounds(row, baseBound, baseSize);
    }

    return this.boundMap;
  }
};
