/**
 * @fileoverview  renderingLabelHelper is helper for rendering of series label.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import renderUtil from '../../helpers/renderUtil';

const { MAX_HEIGHT_WORD, SERIES_LABEL_PADDING } = chartConst;

/**
 * renderingLabelHelper is helper for rendering of series label.
 * @module renderingLabelHelper
 * @private
 */
export default {
  /**
   * Calculate left position for center align of series label.
   * @param {{left: number, top: number, width:number, height: number}} bound - bound
   * @returns {number}
   * @private
   */
  _calculateLeftPositionForCenterAlign(bound) {
    return bound.left + bound.width / 2;
  },

  /**
   * Calculate top position for middle align of series label.
   * @param {{left: number, top: number, width:number, height: number}} bound - bound
   * @returns {number}
   * @private
   */
  _calculateTopPositionForMiddleAlign(bound) {
    return bound.top + bound.height / 2;
  },

  /**
   * Make position for type of bound for rendering label.
   * @param {{left: number, top: number, width:number, height: number}} bound - bound
   * @returns {{left: number, top: number}}
   * @private
   */
  _makePositionForBoundType(bound) {
    return {
      left: this._calculateLeftPositionForCenterAlign(bound),
      top: this._calculateTopPositionForMiddleAlign(bound)
    };
  },

  /**
   * Make position map for rendering label.
   * @param {SeriesItem} seriesItem - series item
   * @param {{left: number, top: number, width: number, height: number}} bound - bound
   * @param {number} labelHeight - label height
   * @param {object} theme - theme for series label
   * @param {function} makePosition - function for making position of label
   * @returns {{end: *}}
   * @private
   */
  _makePositionMap(seriesItem, bound, labelHeight, theme, makePosition) {
    const { value } = seriesItem;
    let isOppositeSide = value >= 0;

    const positionMap = {
      end: makePosition(
        bound,
        labelHeight,
        seriesItem.endLabel || seriesItem.label,
        theme,
        isOppositeSide
      )
    };

    if (seriesItem.isRange) {
      isOppositeSide = value < 0;
      positionMap.start = makePosition(
        bound,
        labelHeight,
        seriesItem.startLabel,
        theme,
        isOppositeSide
      );
    }

    return positionMap;
  },

  /**
   * Bounds to label positions.
   * @param {SeriesDataModel} seriesDataModel - series data model
   * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
   * @param {object} theme - theme for series label
   * @param {function} [makePosition] - function for making position of label
   * @param {boolean} [isPivot] - whether pivot or not
   * @returns {Array.<Object>}
   */
  boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePosition, isPivot) {
    const labelHeight = renderUtil.getRenderedLabelHeight(MAX_HEIGHT_WORD, theme);

    makePosition = makePosition || this._makePositionForBoundType.bind(this);
    isPivot = !!isPivot;

    return seriesDataModel.map((seriesGroup, groupIndex) => {
      const bounds = boundsSet[groupIndex];

      return seriesGroup.map((seriesItem, index) => {
        const bound = bounds[index].end;

        return this._makePositionMap(seriesItem, bound, labelHeight, theme, makePosition);
      });
    }, isPivot);
  },

  /**
   * Make label position for bar chart.
   * @param {{left: number, top: number, width:number, height: number}} bound - bound
   * @param {number} labelHeight - label height
   * @param {string} label - label
   * @param {object} theme - theme for series label
   * @param {boolean} isOppositeSide - whether opossite side or not
   * @returns {{left: number, top: number}}
   * @private
   */
  _makePositionForBarChart(bound, labelHeight, label, theme, isOppositeSide) {
    const labelWidth = renderUtil.getRenderedLabelWidth(label, theme);
    let { left } = bound;

    if (isOppositeSide) {
      left += bound.width + SERIES_LABEL_PADDING;
    } else {
      left -= labelWidth + SERIES_LABEL_PADDING;
    }

    return {
      left,
      top: this._calculateTopPositionForMiddleAlign(bound)
    };
  },

  /**
   * Bounds to label positions for bar chart.
   * @param {SeriesDataModel} seriesDataModel - series data model
   * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
   * @param {object} theme - theme for series label
   * @returns {*|Array.<Object>|Array}
   */
  boundsToLabelPositionsForBarChart(seriesDataModel, boundsSet, theme) {
    const makePositionFunction = this._makePositionForBarChart.bind(this);

    return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
  },

  /**
   * Make label position for column chart.
   * @param {{left: number, top: number, width:number, height: number}} bound - bound
   * @param {number} labelHeight - label height
   * @param {string} label - label
   * @param {object} theme - theme for series label
   * @param {boolean} isOppositeSide - whether opposite side or not
   * @returns {{left: number, top: number}}
   * @private
   */
  _makePositionForColumnChart(bound, labelHeight, label, theme, isOppositeSide) {
    let { top } = bound;

    if (isOppositeSide) {
      top -= labelHeight + SERIES_LABEL_PADDING;
    } else {
      top += bound.height + SERIES_LABEL_PADDING;
    }

    return {
      left: this._calculateLeftPositionForCenterAlign(bound),
      top
    };
  },

  /**
   * Bounds to label positions for column chart.
   * @param {SeriesDataModel} seriesDataModel - series data model
   * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
   * @param {object} theme - theme for series label
   * @returns {*|Array.<Object>|Array}
   */
  boundsToLabelPositionsForColumnChart(seriesDataModel, boundsSet, theme) {
    const makePositionFunction = this._makePositionForColumnChart.bind(this);

    return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
  },

  /**
   * Make labels html for treemap chart.
   * @param {Array.<SeriesItem>} seriesItems - seriesItems
   * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
   * @returns {string}
   */
  boundsToLabelPostionsForTreemap(seriesItems, boundMap) {
    const positions = seriesItems.map(seriesItem => {
      const bound = boundMap[seriesItem.id];
      let position;

      if (bound) {
        position = this._makePositionForBoundType(bound);
      }

      return position;
    });

    return positions;
  }
};
