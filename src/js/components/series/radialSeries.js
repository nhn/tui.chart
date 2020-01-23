/**
 * @fileoverview Radial chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import chartConst from '../../const';
import calculator from '../../helpers/calculator';
import geom from '../../helpers/geometric';
import snippet from 'tui-code-snippet';
const { COMPONENT_TYPE_RAPHAEL, RADIAL_PLOT_PADDING, RADIAL_MARGIN_FOR_CATEGORY } = chartConst;

class RadialChartSeries extends Series {
  /**
   * Line chart series component.
   * @constructs RadialChartSeries
   * @private
   * @extends Series
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */
  constructor(...args) {
    super(...args);

    this.options = Object.assign(
      {
        showDot: false,
        showArea: false
      },
      this.options
    );

    /**
     * object for requestAnimationFrame
     * @type {null | {id: number}}
     */
    this.movingAnimation = null;

    this.drawingType = COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Make positions data for radial series
   * @param {Array.<Array>} seriesGroups series data per category
   * @param {number} groupCount category count
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _makePositionsForRadial(seriesGroups, groupCount) {
    const {
      dimension,
      position: { top, left }
    } = this.layout;
    const width = dimension.width - RADIAL_PLOT_PADDING - RADIAL_MARGIN_FOR_CATEGORY;
    const height = dimension.height - RADIAL_PLOT_PADDING - RADIAL_MARGIN_FOR_CATEGORY;
    const centerX = calculator.sum([
      width / 2,
      RADIAL_PLOT_PADDING / 2,
      RADIAL_MARGIN_FOR_CATEGORY / 2,
      left
    ]);
    const centerY = calculator.sum([
      height / 2,
      -(RADIAL_PLOT_PADDING / 2),
      -(RADIAL_MARGIN_FOR_CATEGORY / 2),
      -top
    ]);

    const stepAngle = 360 / groupCount;

    const radius = Math.min(width, height) / 2;

    return seriesGroups.map(seriesGroup => {
      const positions = seriesGroup.map((seriesItem, index) => {
        let position;

        if (!snippet.isNull(seriesItem.end)) {
          const valueSize = seriesItem.ratio * radius;

          // center y + real vaule size
          const y = centerY + valueSize;

          // turn angle to clockwise
          const angle = 360 - stepAngle * index;

          const point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, y, angle);

          position = {
            left: point.x,
            top: height - point.y // convert y coordinate to top
          };
        }

        return position;
      });

      positions.push(positions[0]);

      return positions;
    });
  }

  /**
   * Get pivoted seriesGroups
   * @returns {Array.<Array>} series group
   * @private
   */
  _getSeriesGroups() {
    const seriesDataModel = this._getSeriesDataModel();

    return seriesDataModel.map(group => group.map(item => item), true);
  }

  /**
   * Make series data for rendering graph and sending to mouse event detector.
   * @returns {object} series data
   * @private
   * @override
   */
  _makeSeriesData() {
    const groups = this._getSeriesGroups();
    const groupPositions = this._makePositionsForRadial(
      groups,
      this._getSeriesDataModel().getGroupCount()
    );

    return {
      groupPositions,
      isAvailable: () => groupPositions && groupPositions.length > 0
    };
  }

  /**
   * Rerender.
   * @param {object} data - data for re-rendering
   * @returns {Raphael.Paper} raphael paper
   * @override
   */
  rerender(data) {
    return Series.prototype.rerender.call(this, data);
  }
}

/**
 * radialSeriesFactory
 * @param {object} params chart options
 * @returns {object} radial series instance
 * @ignore
 */
export default function radialSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = params.chartOptions.chartType;
  params.chartBackground = params.chartTheme.background;

  return new RadialChartSeries(params);
}

radialSeriesFactory.componentType = 'series';
radialSeriesFactory.RadialChartSeries = RadialChartSeries;
