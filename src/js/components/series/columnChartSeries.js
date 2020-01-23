/**
 * @fileoverview Column chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import BarTypeSeriesBase from './barTypeSeriesBase';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';

class ColumnChartSeries extends Series {
  /**
   * Column chart series component.
   * @constructs ColumnChartSeries
   * @private
   * @extends Series
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */

  /**
   * Make bound of column chart.
   * @param {number} width width
   * @param {number} height height
   * @param {number} left top position value
   * @param {number} startTop start top position value
   * @param {number} endTop end top position value
   * @returns {{
   *      start: {left: number, top: number, width: number, height: number},
   *      end: {left: number, top: number, width: number, height: number}
   * }} column chart bound
   * @private
   */
  _makeBound(width, height, left, startTop, endTop) {
    return {
      start: {
        top: startTop,
        left,
        width,
        height: 0
      },
      end: {
        top: endTop,
        left,
        width,
        height
      }
    };
  }

  /**
   * Make column chart bound.
   * @param {{
   *      baseBarSize: number,
   *      groupSize: number,
   *      barSize: number,
   *      pointInterval: number,
   *      firstAdditionalPosition: number,
   *      basePosition: number
   * }} baseData base data for making bound
   * @param {{
   *      baseLeft: number,
   *      left: number,
   *      plusTop: number,
   *      minusTop: number,
   *      prevStack: ?string
   * }} iterationData iteration data
   * @param {?boolean} isStackType whether stackType option or not.
   * @param {SeriesItem} seriesItem series item
   * @param {number} index index
   * @returns {{
   *      start: {left: number, top: number, width: number, height: number},
   *      end: {left: number, top: number, width: number, height: number}
   * }}
   * @private
   */
  _makeColumnChartBound(baseData, iterationData, isStackType, seriesItem, index) {
    const { baseBarSize, basePosition, barSize, itemCount, groupSize, pointInterval } = baseData;
    const barHeight = Math.abs(baseBarSize * seriesItem.ratioDistance);
    const barStartTop = baseBarSize * seriesItem.startRatio;
    const startTop = basePosition + barStartTop + chartConst.SERIES_EXPAND_SIZE;
    const changedStack = seriesItem.stack !== iterationData.prevStack;
    const isOverLapBar = barSize * itemCount > groupSize;
    const columnInterval = isOverLapBar ? pointInterval : barSize;
    let endTop, boundLeft;

    if (!isStackType || (!this.options.diverging && changedStack)) {
      const pointCount = isStackType ? this.dataProcessor.findStackIndex(seriesItem.stack) : index;
      iterationData.left = iterationData.baseLeft + columnInterval * pointCount;
      iterationData.plusTop = 0;
      iterationData.minusTop = 0;
    }

    if (seriesItem.value >= 0) {
      iterationData.plusTop -= barHeight;
      endTop = startTop + iterationData.plusTop;
    } else {
      endTop = startTop + iterationData.minusTop;
      iterationData.minusTop += barHeight;
    }

    iterationData.prevStack = seriesItem.stack;

    if (isOverLapBar) {
      boundLeft = iterationData.left + pointInterval - barSize / 2;
    } else {
      boundLeft =
        iterationData.left +
        pointInterval -
        barSize / 2 +
        ((pointInterval - barSize) / 2) * (itemCount - 1);
    }

    return this._makeBound(barSize, barHeight, boundLeft, startTop, endTop);
  }

  /**
   * Make bounds of column chart.
   * @returns {Array.<Array.<object>>} bounds
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();
    const isStackType = predicate.isValidStackOption(this.options.stackType);
    const { width, height } = this.layout.dimension;
    const baseData = this._makeBaseDataForMakingBound(width, height);

    return seriesDataModel.map((seriesGroup, groupIndex) => {
      const baseLeft = groupIndex * baseData.groupSize + this.layout.position.left;
      const iterationData = {
        baseLeft,
        left: baseLeft,
        plusTop: 0,
        minusTop: 0,
        prevStack: null
      };
      const iteratee = this._makeColumnChartBound.bind(this, baseData, iterationData, isStackType);

      return seriesGroup.map(iteratee);
    });
  }

  /**
   * Calculate left position of sum label.
   * @param {{left: number, top: number}} bound bound
   * @param {string} formattedSum formatted sum.
   * @returns {number} left position value
   * @private
   */
  _calculateLeftPositionOfSumLabel({ left, width }, formattedSum) {
    const labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);

    return left + (width - labelWidth + chartConst.TEXT_PADDING) / 2;
  }
}

BarTypeSeriesBase.mixin(ColumnChartSeries);

/**
 * columnSeriesFactory
 * @param {object} params chart options
 * @returns {object} column series instance
 * @ignore
 */
export default function columnSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = 'column';
  params.chartBackground = params.chartTheme.chart.background;

  return new ColumnChartSeries(params);
}

columnSeriesFactory.componentType = 'series';
columnSeriesFactory.ColumnChartSeries = ColumnChartSeries;
