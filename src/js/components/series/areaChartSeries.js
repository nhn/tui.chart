/**
 * @fileoverview Area chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import LineTypeSeriesBase from './lineTypeSeriesBase';
import predicate from '../../helpers/predicate';

class AreaChartSeries extends Series {
  /**
   * Area chart series component.
   * @constructs AreaChartSeries
   * @private
   * @extends Series
   * @mixes LineTypeSeriesBase
   */
  constructor(...args) {
    super(...args);

    /**
     * object for requestAnimationFrame
     * @type {null | {id: number}}
     */
    this.movingAnimation = null;
  }

  /**
   * Make position top of zero point.
   * @returns {number} position top
   * @private
   */
  _makePositionTopOfZeroPoint() {
    const {
      dimension: { height },
      position: { top: baseTop }
    } = this.layout;

    const { limit } = this.axisDataMap.yAxis;
    let top = this._getLimitDistanceFromZeroPoint(height, limit).toMax + baseTop;

    if (limit.min >= 0 && !top) {
      top = height;
    }

    return top;
  }

  /**
   * Make positions, when has stackType option.
   * @param {Array.<Array.<{left: number, top: number}>>} groupPositions group positions
   * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
   * @private
   */
  _makeStackedPositions(groupPositions) {
    const {
      dimension: { height },
      position: { top: baseTop }
    } = this.layout;

    const firstStartTop = this._makePositionTopOfZeroPoint();
    const prevPositionTops = [];

    return groupPositions.map(positions =>
      positions.map((position, index) => {
        const prevTop = prevPositionTops[index] || firstStartTop;
        const positionTop = position ? position.top : 0;
        const stackedHeight = height - positionTop + baseTop;
        const top = position ? prevTop - stackedHeight : prevTop;

        if (position) {
          position.startTop = prevTop;
          position.top = top;
        }

        prevPositionTops[index] = top;

        return position;
      })
    );
  }

  /**
   * Make series positions.
   * @param {number} seriesWidth - width of series area
   * @returns {Array.<Array.<{left: number, top: number, startTop: number}>>} stackType positions
   * @private
   */
  _makePositions(seriesWidth) {
    let groupPositions = this._makeBasicPositions(seriesWidth);

    if (predicate.isValidStackOption(this.options.stackType)) {
      groupPositions = this._makeStackedPositions(groupPositions);
    }

    return groupPositions;
  }

  /**
   * Make series data.
   * @returns {object} series data
   * @private
   * @override
   */
  _makeSeriesData() {
    const {
      dimension: { height },
      position: { top: baseTop }
    } = this.layout;
    const zeroTop = this._getLimitDistanceFromZeroPoint(height, this.limit).toMax + baseTop;
    const groupPositions = this._makePositions();

    return {
      chartBackground: this.chartBackground,
      groupPositions,
      hasRangeData: this._getSeriesDataModel().hasRangeData(),
      zeroTop,
      isAvailable: () => groupPositions && groupPositions.length > 0
    };
  }

  /**
   * Rerender.
   * @param {object} data - data for re-rendering
   * @override
   */
  rerender(data) {
    this._cancelMovingAnimation();

    return Series.prototype.rerender.call(this, data);
  }
}

LineTypeSeriesBase.mixin(AreaChartSeries);

/**
 * areaSeriesFactory
 * @param {object} params chart options
 * @returns {object} areaChart series instance
 * @ignore
 */
export default function areaSeriesFactory(params) {
  const {
    chartTheme,
    chartOptions: { libType }
  } = params;

  params.libType = libType;
  params.chartType = 'area';
  params.chartBackground = chartTheme.chart.background;

  return new AreaChartSeries(params);
}

areaSeriesFactory.componentType = 'series';
areaSeriesFactory.AreaChartSeries = AreaChartSeries;
