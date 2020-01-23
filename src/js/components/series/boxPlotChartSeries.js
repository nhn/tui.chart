/**
 * @fileoverview Boxplot chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import BarTypeSeriesBase from './barTypeSeriesBase';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';
const { SERIES_EXPAND_SIZE, TEXT_PADDING } = chartConst;

class BoxplotChartSeries extends Series {
  /**
   * Boxplot chart series component.
   * @constructs BoxplotChartSeries
   * @private
   * @extends Series
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */
  constructor(...args) {
    super(...args);

    /**
     * whether series label is supported
     * @type {boolean}
     */
    this.supportSeriesLable = false;
  }

  /**
   * Make boxplot chart bound.
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
  _makeBoxplotChartBound(baseData, iterationData, isStackType, seriesItem, index) {
    const { pointInterval, barSize, baseBarSize, basePosition } = baseData;
    const boxHeight = Math.abs(baseBarSize * seriesItem.ratioDistance);
    const boxStartTop = baseBarSize * (1 - seriesItem.lqRatio);
    const startTop = basePosition + boxStartTop + SERIES_EXPAND_SIZE;
    const baseTopPosition = basePosition + SERIES_EXPAND_SIZE;
    const pointCount = index;
    let endTop;

    iterationData.left = iterationData.baseLeft + pointInterval * pointCount;
    iterationData.plusTop = 0;
    iterationData.minusTop = 0;

    if (seriesItem.value >= 0) {
      iterationData.plusTop -= boxHeight;
      endTop = startTop + iterationData.plusTop;
    } else {
      endTop = startTop + iterationData.minusTop;
      iterationData.minusTop += boxHeight;
    }

    const boundLeft = iterationData.left + pointInterval - barSize / 2;
    const outliers = (seriesItem.outliers || []).map(outlier => ({
      top: baseBarSize * (1 - outlier.ratio) + baseTopPosition,
      left: boundLeft + barSize / 2
    }));

    return {
      start: {
        top: startTop,
        left: boundLeft,
        width: barSize,
        height: 0
      },
      end: {
        top: endTop,
        left: boundLeft,
        width: barSize,
        height: boxHeight
      },
      min: {
        top: baseBarSize * (1 - seriesItem.minRatio) + baseTopPosition,
        left: boundLeft,
        width: barSize,
        height: 0
      },
      max: {
        top: baseBarSize * (1 - seriesItem.maxRatio) + baseTopPosition,
        left: boundLeft,
        width: barSize,
        height: 0
      },
      median: {
        top: baseBarSize * (1 - seriesItem.medianRatio) + baseTopPosition,
        left: boundLeft,
        width: barSize,
        height: 0
      },
      outliers
    };
  }

  /**
   * Make bounds of boxplot chart.
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
      const iteratee = this._makeBoxplotChartBound.bind(this, baseData, iterationData, isStackType);

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

    return left + (width - labelWidth + TEXT_PADDING) / 2;
  }
}

BarTypeSeriesBase.mixin(BoxplotChartSeries);

/**
 * boxplotSeriesFactory
 * @param {object} params chart options
 * @returns {object} box plot series instance
 * @ignore
 */
export default function boxplotSeriesFactory(params) {
  const {
    chartOptions: { libType },
    chartTheme
  } = params;

  params.libType = libType;
  params.chartType = 'boxplot';
  params.chartBackground = chartTheme.chart.background;

  return new BoxplotChartSeries(params);
}

boxplotSeriesFactory.componentType = 'series';
boxplotSeriesFactory.BoxplotChartSeries = BoxplotChartSeries;
