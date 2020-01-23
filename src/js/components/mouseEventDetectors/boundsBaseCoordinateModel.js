/**
 * @fileoverview BoundsBaseCoordinateModel is data model for mouse event detector of bounds type.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

/**
 * position
 * @typedef {{left: number, top: number}} position
 * @private
 */

/**
 * bound
 * @typedef {{
 *      dimension: {width: number, height: number},
 *      position: position
 *}} bound
 * @private
 */

/**
 * group bound
 *  @typedef {Array.<Array.<bound>>} groupBound
 * @private
 */

/**
 * group position
 *  @typedef {Array.<Array.<position>>} groupPosition
 * @private
 */

/**
 * series info
 * @typedef {{
 *      chartType: {string},
 *      data: {
 *          groupBounds: ?groupBound,
 *          groupValues: ?Array.<Array.<number>>,
 *          groupPositions: ?groupPosition
 *      }
 *}} seriesInfo
 * @private
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

class BoundsBaseCoordinateModel {
  /**
   * BoundsBaseCoordinateModel is data mode for mouse event detector of bounds type.
   * @constructs BoundsBaseCoordinateModel
   * @private
   * @param {Array} seriesItemBoundsData - series item bounds data
   */
  constructor(seriesItemBoundsData) {
    this.data = this._makeData(seriesItemBoundsData);
  }

  /**
   * @param {string} chartType - chart type
   * @param {object} indexes - index of SeriesDataModel
   * @param {boolean} allowNegativeTooltip - whether allow negative tooltip or not
   * @param {object} bound - coordinate data for rendering graph
   * @returns {object} - `sendData`: tooltip contents, `bound`: for detecting hovered or not
   * @private
   */
  _makeTooltipData(chartType, indexes, allowNegativeTooltip, bound) {
    return {
      sendData: {
        chartType,
        indexes,
        allowNegativeTooltip,
        bound
      },
      bound: {
        left: bound.left,
        top: bound.top,
        right: bound.left + bound.width,
        bottom: bound.top + bound.height
      }
    };
  }

  /**
   * Make position data for rect type graph
   * @param {groupBound} groupBounds group bounds
   * @param {string} chartType chart type
   * @returns {Array}
   * @private
   */
  _makeRectTypePositionData(groupBounds, chartType) {
    const allowNegativeTooltip = !predicate.isBoxTypeChart(chartType);

    return groupBounds.map((bounds, groupIndex) =>
      bounds.map((bound, index) => {
        if (!bound) {
          return null;
        }

        return this._makeTooltipData(
          chartType,
          {
            groupIndex,
            index
          },
          allowNegativeTooltip,
          bound.end || bound
        );
      })
    );
  }

  /**
   * Make position data for rect type graph
   * @param {groupBound} groupBounds group bounds
   * @param {string} chartType chart type
   * @param {object} resultData resultData
   * @private
   */
  _makeOutliersPositionDataForBoxplot(groupBounds, chartType, resultData) {
    const allowNegativeTooltip = !predicate.isBoxTypeChart(chartType);
    const _groupBounds = [...groupBounds];

    _groupBounds.forEach((bounds, groupIndex) => {
      bounds.forEach((bound, index) => {
        let outliers;

        if (bound.outliers && bound.outliers.length) {
          outliers = bound.outliers.map((outlier, outlierIndex) => {
            const outlierBound = {
              top: outlier.top - 3,
              left: outlier.left - 3,
              width: 6,
              height: 6
            };

            return this._makeTooltipData(
              chartType,
              {
                groupIndex,
                index,
                outlierIndex
              },
              allowNegativeTooltip,
              outlierBound
            );
          });

          resultData[groupIndex] = resultData[groupIndex].concat(outliers);
        }
      });
    });
  }

  /**
   * Make position data for dot type graph
   * @param {groupPositions} groupPositions group positions
   * @param {string} chartType chart type
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _makeDotTypePositionData(groupPositions, chartType) {
    if (!groupPositions) {
      return [];
    }

    return arrayUtil.pivot(groupPositions).map((positions, groupIndex) =>
      positions.map((position, index) => {
        if (!position) {
          return null;
        }

        return {
          sendData: {
            chartType,
            indexes: {
              groupIndex,
              index
            },
            bound: position
          },
          bound: {
            left: position.left - chartConst.DOT_RADIUS,
            top: position.top - chartConst.DOT_RADIUS,
            right: position.left + chartConst.DOT_RADIUS,
            bottom: position.top + chartConst.DOT_RADIUS
          }
        };
      })
    );
  }

  /**
   * Join data.
   * @param {Array.<Array.<Array.<object>>>} dataGroupSet data group set
   * @returns {Array.<Array.<object>>} joined data
   * @private
   */
  _joinData(dataGroupSet) {
    const results = [];
    dataGroupSet.forEach(dataGroup => {
      dataGroup.forEach((data, index) => {
        let additionalIndex;

        if (!results[index]) {
          results[index] = data;
        } else {
          additionalIndex = results[index].length;
          data.forEach(datum => {
            if (datum) {
              datum.sendData.indexes.legendIndex = datum.sendData.indexes.index + additionalIndex;
            }
          });
          results[index] = results[index].concat(data);
        }
      });
    });

    return results;
  }

  /**
   * Make data for detecting mouse event.
   * @param {Array} seriesItemBoundsData - series item bounds data
   * @returns {Array.<Array.<object>>} coordinate data
   * @private
   */
  _makeData(seriesItemBoundsData) {
    const data = seriesItemBoundsData.map(info => {
      let result;

      if (predicate.isLineTypeChart(info.chartType)) {
        result = this._makeDotTypePositionData(info.data.groupPositions, info.chartType);
      } else {
        result = this._makeRectTypePositionData(info.data.groupBounds, info.chartType);
      }

      if (predicate.isBoxplotChart(info.chartType)) {
        this._makeOutliersPositionDataForBoxplot(info.data.groupBounds, info.chartType, result);
      }

      return result;
    });

    return this._joinData(data);
  }

  /**
   * Find candidates.
   * @param {{bound: {left: number, top: number, right: number, bottom: number}}} data data *
   * @param {number} layerX layerX
   * @param {number} layerY layerY
   * @returns {Array.<{sendData: object}>} candidates
   * @private
   */
  _findCandidates(data, layerX, layerY) {
    return data.filter(datum => {
      const bound = datum && datum.bound;

      if (bound) {
        if (bound.top === bound.bottom) {
          bound.top -= chartConst.SERIES_EXTRA_EVENT_AREA_FOR_ZERO;
          bound.bottom += chartConst.SERIES_EXTRA_EVENT_AREA_FOR_ZERO;
        }
        if (bound.left === bound.right) {
          bound.left -= chartConst.SERIES_EXTRA_EVENT_AREA_FOR_ZERO;
          bound.right += chartConst.SERIES_EXTRA_EVENT_AREA_FOR_ZERO;
        }

        return this._isCandidateTarget(bound, {
          layerX,
          layerY
        });
      }

      return false;
    });
  }

  /**
   * Whether candidate target.
   * @param {{left: number, top: number, right: number, bottom: number}} bound bound info
   * @param {object} layout layout position
   *   @param {number} layout.layerX layerX
   *   @param {number} layout.layerY layerY
   * @returns {boolean} is target
   * @private
   */
  _isCandidateTarget(bound, { layerX, layerY }) {
    const includedX = bound.left <= layerX && bound.right >= layerX;
    const includedY = bound.top <= layerY && bound.bottom >= layerY;

    return includedX && includedY;
  }

  /**
   * Find data.
   * @param {number} groupIndex group index
   * @param {number} layerX mouse position x
   * @param {number} layerY mouse position y
   * @returns {object} tooltip data
   */
  findData(groupIndex, layerX, layerY) {
    let min = 10000;
    let result = null;

    if (groupIndex > -1 && this.data[groupIndex]) {
      // extract data containing layerX, layerY
      const candidates = this._findCandidates(this.data[groupIndex], layerX, layerY);

      // find nearest data to top position among extracted data
      candidates.forEach(data => {
        const diff = Math.abs(layerY - data.bound.top);

        if (min > diff) {
          min = diff;
          result = data.sendData;
        }
      });
    }

    return result;
  }

  /**
   * Find data by indexes.
   * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
   * @param {number} [indexes.outlierIndex] - index of outlier of boxplot series, it only exists in boxplot chart
   * @returns {object} tooltip data
   */
  findDataByIndexes(indexes) {
    const foundData = this.data[indexes.index][indexes.seriesIndex].sendData;

    if (snippet.isNumber(indexes.outlierIndex)) {
      return this._findOutlierDataByIndexes(indexes);
    }

    return foundData;
  }

  /**
   * find plot chart data by indexes
   * @param {{
   *  index: {number},
   *  seriesIndex: {number},
   *  outlierIndex: {number}
   * }} indexes - indexe of series item displaying a tooltip
   * @returns {object} - outlier tooltip data
   * @private
   */
  _findOutlierDataByIndexes(indexes) {
    let foundData = null;

    this.data[indexes.index].forEach(datum => {
      const datumIndexes = datum.sendData.indexes;
      const found =
        datumIndexes.index === indexes.seriesIndex &&
        datumIndexes.outlierIndex === indexes.outlierIndex;

      if (found) {
        foundData = datum.sendData;
      }

      return !found;
    });

    return foundData;
  }
}

export default BoundsBaseCoordinateModel;
