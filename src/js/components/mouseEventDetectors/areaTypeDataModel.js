/**
 * @fileoverview AreaTypeDataModel is data model for mouse event detector of area type.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

class AreaTypeDataModel {
  /**
   * AreaTypeDataModel is data mode for mouse event detector of area type.
   * @constructs AreaTypeDataModel
   * @private
   * @param {Array} seriesItemBoundsData - series item bounds data
   */
  constructor(seriesItemBoundsData) {
    this.data = this._makeData(seriesItemBoundsData);

    /**
     * last group index
     * @type {number}
     */
    this.lastGroupIndex = 0;
  }

  /**
   * Make data for detecting mouse event.
   * @param {Array} seriesItemBoundsData - series item bounds data
   * @returns {Array}
   * @private
   */
  _makeData(seriesItemBoundsData) {
    const seriesItemBoundsLength = seriesItemBoundsData.length;
    let lastGroupIndex = 0;
    let data = seriesItemBoundsData.map((seriesDatum, seriesIndex) => {
      const { chartType, data: dotumData } = seriesDatum;
      let groupPositions = dotumData.groupPositions || dotumData.groupBounds;

      if (predicate.isLineTypeChart(chartType) || predicate.isRadialChart(chartType)) {
        groupPositions = arrayUtil.pivot(groupPositions);
      }

      lastGroupIndex = Math.max(groupPositions.length - 1, lastGroupIndex);

      const hasGroupPosition =
        groupPositions.length > 1 && groupPositions[1][0] && groupPositions[0][0];
      this.leftStepLength = hasGroupPosition
        ? groupPositions[1][0].left - groupPositions[0][0].left
        : 0;

      return groupPositions.map((positions, groupIndex) =>
        positions.map((position, index) => {
          let datum = null;

          if (position) {
            datum = {
              chartType,
              indexes: {
                groupIndex,
                index
              },
              bound: position
            };
          }

          // Add legendIndex to datum on making multi series chart data, especially for LineScatterComboChart.
          if (seriesItemBoundsLength > 1) {
            datum.indexes.legendIndex = seriesIndex;
          }

          return datum;
        })
      );
    });

    data = [].concat(...data);
    this.lastGroupIndex = lastGroupIndex;

    return [].concat(...data).filter(datum => !!datum);
  }

  /**
   * Find Data by layer position.
   * @param {{x: number, y: number}} layerPosition - layer position
   * @param {number} [selectLegendIndex] select legend sereis index
   * @param {object} [searchInfo] distance limitation to find data
   *   @param {number} searchInfo.distanceLimit distance limitation to find data
   *   @param {boolean} searchInfo.isCoordinateTypeChart whether coordinate type chart or not
   * @returns {object}
   */
  findData(layerPosition, selectLegendIndex, { distanceLimit, isCoordinateTypeChart } = {}) {
    const isLooseDistancePosition = distanceLimit && distanceLimit < this.leftStepLength;
    const useCoordinateDistanceSearch = isCoordinateTypeChart || isLooseDistancePosition;

    if (useCoordinateDistanceSearch) {
      return this._findDataForCoordinateDistance(layerPosition, distanceLimit, selectLegendIndex);
    }

    return this._findDataForFirstXPosition(layerPosition, selectLegendIndex);
  }

  /**
   * Find Data by layer position at dense area.
   * @param {{x: number, y: number}} layerPosition - layer position
   * @param {number} selectLegendIndex select legend sereis index
   * @returns {object}
   * @private
   */
  _findDataForFirstXPosition(layerPosition, selectLegendIndex) {
    const { xMinValue } = this.data.reduce(
      (findMinObj, datum) => {
        const xDiff = Math.abs(layerPosition.x - datum.bound.left);
        if (xDiff <= findMinObj.xMin) {
          findMinObj.xMin = xDiff;
          findMinObj.xMinValue = datum.bound.left;
        }

        return findMinObj;
      },
      {
        xMin: Number.MAX_VALUE,
        xMinValue: 0
      }
    );

    const { findFound } = this.data.reduce(
      (findResultObj, datum) => {
        const yDiff = Math.abs(layerPosition.y - datum.bound.top);
        let remakeFindObj = {};

        if (datum.bound.left !== xMinValue) {
          remakeFindObj = findResultObj;
        } else if (
          !snippet.isNull(selectLegendIndex) &&
          selectLegendIndex === datum.indexes.index
        ) {
          remakeFindObj.yMin = Number.MIN_VALUE;
          remakeFindObj.findFound = datum;
        } else if (yDiff <= findResultObj.yMin) {
          remakeFindObj.yMin = yDiff;
          remakeFindObj.findFound = datum;
        } else {
          remakeFindObj = findResultObj;
        }

        return remakeFindObj;
      },
      {
        yMin: Number.MAX_VALUE,
        findFound: null
      }
    );

    return findFound;
  }

  /**
   * Find Data by layer position at loose area.
   * @param {{x: number, y: number}} layerPosition - layer position
   * @param {number} [distanceLimit] distance limitation to find data
   * @param {number} selectLegendIndex select legend sereis index
   * @returns {object}
   * @private
   */
  _findDataForCoordinateDistance(layerPosition, distanceLimit, selectLegendIndex) {
    let min = 100000;
    let findFound;

    distanceLimit = distanceLimit || Number.MAX_VALUE;

    this.data.forEach(datum => {
      const xDiff = layerPosition.x - datum.bound.left;
      const yDiff = layerPosition.y - datum.bound.top;
      const distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

      if (distance > distanceLimit) {
        return;
      }

      if (!snippet.isNull(selectLegendIndex) && selectLegendIndex !== datum.indexes.index) {
        return;
      }

      if (distance <= min) {
        min = distance;
        findFound = datum;
      }
    });

    return findFound;
  }

  /**
   * Find data by indexes.
   * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
   * @returns {object}
   */
  findDataByIndexes({ index, seriesIndex }) {
    let foundData = null;

    this.data.forEach(datum => {
      if (datum.indexes.groupIndex === index && datum.indexes.index === seriesIndex) {
        foundData = datum;
      }

      return !foundData;
    });

    return foundData;
  }

  /**
   * Get first data.
   * @param {number} index - index
   * @returns {object}
   */
  getFirstData(index) {
    const indexes = {
      index: 0,
      seriesIndex: index
    };

    return this.findDataByIndexes(indexes);
  }

  /**
   * Get last data.
   * @param {number} index - index
   * @returns {object}
   */
  getLastData(index) {
    const indexes = {
      index: this.lastGroupIndex,
      seriesIndex: index
    };

    return this.findDataByIndexes(indexes);
  }
}

export default AreaTypeDataModel;
