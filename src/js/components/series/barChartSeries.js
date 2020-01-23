/**
 * @fileoverview Bar chart series component.

 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import Series from './series';
import BarTypeSeriesBase from './barTypeSeriesBase';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';

const { OVERLAPPING_WIDTH, TEXT_PADDING } = chartConst;

class BarChartSeries extends Series {
  /**
   * Bar chart series component.
   * @constructs BarChartSeries
   * @private
   * @extends Series
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */

  /**
   * Make bound of bar chart.
   * @param {number} width width
   * @param {number} height height
   * @param {number} top top position value
   * @param {number} startLeft start left position value
   * @param {number} endLeft end left position value
   * @returns {{
   *      start: {left: number, top: number, width: number, height: number},
   *      end: {left: number, top: number, width: number, height: number}
   * }} column chart bound
   * @private
   */
  _makeBound(width, height, top, startLeft, endLeft) {
    return {
      start: {
        top,
        left: startLeft,
        width: 0,
        height
      },
      end: {
        top,
        left: endLeft,
        width,
        height
      }
    };
  }

  /**
   * Calculate additional left for divided option.
   * @param {number} value value
   * @returns {number}
   * @private
   */
  _calculateAdditionalLeft(value) {
    let additionalLeft = 0;

    if (this.options.divided && value > 0) {
      additionalLeft = this.dimensionMap.yAxis.width + OVERLAPPING_WIDTH;
    }

    return additionalLeft;
  }

  /**
   * Make bar chart bound.
   * @param {{
   *      baseBarSize: number,
   *      groupSize: number,
   *      barSize: number,
   *      pointInterval: number,
   *      firstAdditionalPosition: number,
   *      basePosition: number
   * }} baseData base data for making bound
   * @param {{
   *      baseTop: number,
   *      top: number,
   *      plusLeft: number,
   *      minusLeft: number,
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
  _makeBarChartBound(baseData, iterationData, isStackType, seriesItem, index) {
    const { baseBarSize, basePosition, barSize, itemCount, groupSize, pointInterval } = baseData;
    const { ratioDistance, value, startRatio, stack } = seriesItem;

    const barWidth = baseBarSize * ratioDistance;
    const additionalLeft = this._calculateAdditionalLeft(value);
    const barStartLeft = baseBarSize * startRatio;
    const startLeft = basePosition + barStartLeft + additionalLeft;
    const changedStack = stack !== iterationData.prevStack;
    const isOverLapBar = barSize * itemCount > groupSize;
    const barInterval = isOverLapBar ? pointInterval : barSize;
    let endLeft;

    if (!isStackType || (!this.options.diverging && changedStack)) {
      const pointCount = isStackType ? this.dataProcessor.findStackIndex(stack) : index;
      iterationData.top = iterationData.baseTop + barInterval * pointCount;
      iterationData.plusLeft = 0;
      iterationData.minusLeft = 0;
    }

    if (value >= 0) {
      endLeft = startLeft + iterationData.plusLeft;
      iterationData.plusLeft += barWidth;
    } else {
      iterationData.minusLeft -= barWidth;
      endLeft = startLeft + iterationData.minusLeft;
    }

    iterationData.prevStack = stack;

    let boundTop = iterationData.top + pointInterval - barSize / 2;
    if (!isOverLapBar) {
      boundTop += ((pointInterval - barSize) / 2) * (itemCount - 1);
    }

    return this._makeBound(barWidth, barSize, boundTop, startLeft, endLeft);
  }

  /**
   * Make series bounds for rendering
   * @returns {Array.<Array.<object>>} bounds
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();
    const isStacked = predicate.isValidStackOption(this.options.stackType);
    const {
      dimension: { width, height },
      position: { top }
    } = this.layout;
    const baseData = this._makeBaseDataForMakingBound(height, width);

    return seriesDataModel.map((seriesGroup, groupIndex) => {
      const baseTop = groupIndex * baseData.groupSize + top;
      const iterationData = {
        baseTop,
        top: baseTop,
        plusLeft: 0,
        minusLeft: 0,
        prevStack: null
      };
      const iteratee = this._makeBarChartBound.bind(this, baseData, iterationData, isStacked);

      return seriesGroup.map(iteratee);
    });
  }

  /**
   * Calculate top position of sum label.
   * @param {{left: number, top: number}} bound bound
   * @param {number} labelHeight label height
   * @returns {number} top position value
   * @private
   */
  _calculateTopPositionOfSumLabel(bound, labelHeight) {
    return bound.top + (bound.height - labelHeight + TEXT_PADDING) / 2;
  }
}

BarTypeSeriesBase.mixin(BarChartSeries);

/**
 * barSeriesFactory
 * @param {object} params chart options
 * @returns {object} bar series instance
 * @ignore
 */
export default function barSeriesFactory(params) {
  const {
    chartTheme,
    chartOptions: { libType }
  } = params;

  params.libType = libType;
  params.chartType = 'bar';
  params.chartBackground = chartTheme.chart.background;

  return new BarChartSeries(params);
}

// @todo let's find better way
barSeriesFactory.componentType = 'series';
barSeriesFactory.BarChartSeries = BarChartSeries;
