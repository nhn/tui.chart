/**
 * @fileoverview Bullet chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import renderUtil from '../../helpers/renderUtil';
import chartConst from '../../const';
const {
  BULLET_TYPE_ACTUAL,
  BULLET_ACTUAL_HEIGHT_RATIO,
  BULLET_TYPE_RANGE,
  BULLET_RANGES_HEIGHT_RATIO,
  BULLET_TYPE_MARKER,
  BULLET_MARKERS_HEIGHT_RATIO,
  BULLET_MARKER_DETECT_PADDING,
  MAX_HEIGHT_WORD
} = chartConst;

class BulletChartSeries extends Series {
  /**
   * Bullet chart series component.
   * @constructs BulletChartSeries
   * @private
   * @extends Series
   * @param {object} params series initialization data
   */
  constructor(params) {
    super(params);

    /**
     * true if graph stratches vertically
     * false if graph stratches horizontally
     * @type {boolean}
     */
    this.isVertical = params.isVertical;
  }

  /**
   * Create data for rendering series
   * @returns {object} - data for rendering series
   * @override
   * @private
   */
  _makeSeriesData() {
    const groupBounds = this._makeBounds();

    return {
      groupBounds,
      seriesDataModel: this._getSeriesDataModel(),
      isVertical: this.isVertical,
      isAvailable: () => groupBounds && groupBounds.length > 0
    };
  }

  /**
   * Create bounds data
   * @returns {Array.<Bound>} - bound data of bullet graph components
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();
    const baseData = this._makeBaseDataForMakingBound();
    const iterationData = {
      renderedItemCount: 0,
      top: baseData.categoryAxisTop,
      left: baseData.categoryAxisLeft
    };

    return seriesDataModel.map(seriesGroup => {
      const iteratee = this._makeBulletChartBound.bind(this, baseData, iterationData);
      const bounds = seriesGroup.map(iteratee);

      this._updateIterationData(iterationData, baseData.itemWidth);

      return bounds;
    });
  }

  /**
   * prepare a base data before making a bound
   * @returns {object} - base data
   * @private
   */
  _makeBaseDataForMakingBound() {
    const groupCount = this._getSeriesDataModel().getGroupCount();
    const {
      dimension: { width, height },
      position
    } = this.layout;
    const categoryAxisLeft = position.left;
    let categoryAxisTop = position.top;
    let categoryAxisWidth, valueAxisWidth;

    if (this.isVertical) {
      categoryAxisTop += height;
      categoryAxisWidth = width;
      valueAxisWidth = height;
    } else {
      categoryAxisWidth = height;
      valueAxisWidth = width;
    }

    const itemWidth = categoryAxisWidth / groupCount;

    return {
      categoryAxisTop,
      categoryAxisLeft,
      categoryAxisWidth,
      valueAxisWidth,
      itemWidth
    };
  }

  /**
   * Create a bullet chart bound before making a base data
   * @param {object} baseData - base data for making a tooltip
   * @param {object} iterationData - increasing data while generating a graph data: index of item, graph position
   * @param {object} item - series item
   * @returns {Bound} - bullet graph bound
   * @private
   */
  _makeBulletChartBound(baseData, iterationData, item) {
    const { type } = item;
    let bound;

    if (type === BULLET_TYPE_ACTUAL) {
      bound = this._makeBarBound(item, BULLET_ACTUAL_HEIGHT_RATIO, baseData, iterationData);
    } else if (type === BULLET_TYPE_RANGE) {
      bound = this._makeBarBound(item, BULLET_RANGES_HEIGHT_RATIO, baseData, iterationData);
    } else if (type === BULLET_TYPE_MARKER) {
      bound = this._makeLineBound(item, BULLET_MARKERS_HEIGHT_RATIO, baseData, iterationData);
    }

    bound.type = type;

    return bound;
  }

  /**
   * Create bar type bound data
   * @param {object} model - series item data
   * @param {number} widthRatio - thickness compare to graph area
   * @param {object} baseData - base data needed for making a bar bound
   * @param {object} iterationData - data for setting up position
   * @returns {object} - bar type bound data
   * @private
   */
  _makeBarBound({ ratioDistance, endRatio }, widthRatio, baseData, iterationData) {
    const barWidth = baseData.itemWidth * widthRatio;
    const barHeight = baseData.valueAxisWidth * ratioDistance;
    const barEndHeight = baseData.valueAxisWidth * endRatio;
    let bound;

    if (this.isVertical) {
      bound = this._makeVerticalBarBound(
        iterationData,
        baseData,
        barWidth,
        barHeight,
        barEndHeight
      );
    } else {
      bound = this._makeHorizontalBarBound(
        iterationData,
        baseData,
        barWidth,
        barHeight,
        barEndHeight
      );
    }

    return bound;
  }

  /**
   * create a bound of bar type component, when it is virtical chart
   * @param {object} iterationData - increasing data while generating a graph data: graph position
   * @param {object} baseData - base data
   * @param {number} barWidth - width of bar
   * @param {number} barHeight - bar size from start position to end position
   * @param {number} barEndHeight - bar size from axis start point to end position
   * @returns {object} - bound data
   * @private
   */
  _makeVerticalBarBound(iterationData, baseData, barWidth, barHeight, barEndHeight) {
    return {
      top: iterationData.top - barEndHeight,
      left: iterationData.left + (baseData.itemWidth - barWidth) / 2,
      width: barWidth,
      height: barHeight
    };
  }

  /**
   * create a bound of bar type component, when it is a horizontal chart
   * @param {object} iterationData - increasing data while generating a graph data: graph position
   * @param {object} baseData - base data
   * @param {number} barWidth - width of bar
   * @param {number} barHeight - bar size from start position to end position
   * @param {number} barEndHeight - bar size from axis start point to end position
   * @returns {object} - bound data
   * @private
   */
  _makeHorizontalBarBound(iterationData, baseData, barWidth, barHeight, barEndHeight) {
    return {
      top: iterationData.top + (baseData.itemWidth - barWidth) / 2,
      left: iterationData.left + barEndHeight - barHeight,
      width: barHeight,
      height: barWidth
    };
  }

  /**
   * Create line type bound data
   * @param {object} model - series item data
   * @param {number} widthRatio - graph thickness compare to graph area
   * @param {object} baseData - base data needed for making a line bound
   * @param {object} iterationData - data for setting up position
   * @returns {object} - line type bound data
   * @private
   */
  _makeLineBound(model, widthRatio, baseData, iterationData) {
    const { itemWidth, valueAxisWidth } = baseData;
    const lineWidth = itemWidth * widthRatio;
    const endHeight = valueAxisWidth * model.endRatio;
    let height = BULLET_MARKER_DETECT_PADDING;
    let width = BULLET_MARKER_DETECT_PADDING;
    let top, left;

    if (this.isVertical) {
      top = iterationData.top - endHeight;
      left = iterationData.left + (itemWidth - lineWidth) / 2;
      width = lineWidth;
    } else {
      top = iterationData.top + (itemWidth - lineWidth) / 2;
      left = iterationData.left + endHeight;
      height = lineWidth;
    }

    return {
      top,
      left,
      width,
      height,
      length: lineWidth
    };
  }

  /**
   * update iterationData after making a graph bound
   * @param {object} iterationData - iteration data
   * @param {number} itemWidth - size of category axis area
   * @private
   */
  _updateIterationData(iterationData, itemWidth) {
    iterationData.renderedItemCount += 1;

    if (this.isVertical) {
      iterationData.left += itemWidth;
    } else {
      iterationData.top += itemWidth;
    }
  }

  /**
   * Render series area.
   * @param {object} paper - raphael object
   * @param {function} funcRenderGraph - function for graph rendering
   * @private
   */
  _renderSeriesArea(paper, funcRenderGraph) {
    Series.prototype._renderSeriesArea.call(this, paper, funcRenderGraph);

    this.dataProcessor.setGraphColors(this.graphRenderer.getGraphColors());
  }

  /**
   * Render series labels
   * Series labels are shown only when `options.series.showLabel` is enabled
   * @param {object} paper paper
   * @returns {Array.<SVGElement>} - svg label sets
   * @override
   * @private
   */
  _renderSeriesLabel(paper) {
    const theme = this.theme.label;
    const seriesDataModel = this._getSeriesDataModel();
    const groupLabels = this._getLabelTexts(seriesDataModel);
    const positionsSet = this._calculateLabelPositions(seriesDataModel, theme);

    return this.graphRenderer.renderSeriesLabel(paper, positionsSet, groupLabels, theme);
  }

  /**
   * Get label texts needed for enabling `options.series.showLabel` option
   * @param {object} seriesDataModel - seriesDataModel
   * @returns {Array.<string>} - actual data and marker data label
   * @private
   */
  _getLabelTexts(seriesDataModel) {
    return seriesDataModel.map(seriesGroup => {
      const seriesLabels = [];

      seriesGroup.each(seriesDatum => {
        if (seriesDatum.type !== BULLET_TYPE_RANGE) {
          seriesLabels.push(this.decorateLabel(seriesDatum.endLabel));
        }
      });

      return seriesLabels;
    });
  }

  /**
   * calculate a label position
   * @param {object} seriesDataModel - bullet chart's series data model
   * @param {object} theme - style needed to calculate the size of the text
   * @returns {Array.<object>} - position of label text
   * @private
   */
  _calculateLabelPositions(seriesDataModel, theme) {
    const serieses = this.seriesData.groupBounds;
    const labelHeight = renderUtil.getRenderedLabelHeight(MAX_HEIGHT_WORD, theme);

    return serieses.map(series => {
      const bounds = [];

      series.forEach(item => {
        if (item.type !== BULLET_TYPE_RANGE) {
          bounds.push(this._makePositionByBound(item, labelHeight));
        }
      });

      return bounds;
    });
  }

  /**
   * make position top, left data using bound data and label height
   * @param {object} bound - bound data
   * @param {number} labelHeight - label's height
   * @returns {object} - position top, left
   * @private
   */
  _makePositionByBound(bound, labelHeight) {
    const boundTop = bound.top;
    const boundLeft = bound.left;
    const position = {};

    if (this.isVertical) {
      const width = bound.width || bound.length;
      position.top = boundTop - labelHeight;
      position.left = boundLeft + width / 2;
    } else {
      const width = bound.width || 0;
      const height = bound.height || bound.length;
      position.top = boundTop + height / 2;
      position.left = boundLeft + 5 + (width || 0);
    }

    return position;
  }
}

/**
 * BulletChartSeries factory function
 * @param {object} params - series initialization data
 * @returns {BulletChartSeries} - bullet chart series
 * private
 */
export default function bulletSeriesFactory(params) {
  params.chartType = 'bullet';
  params.libType = params.chartOptions.libType;
  params.chartBackground = params.chartTheme.chart.background;

  return new BulletChartSeries(params);
}

bulletSeriesFactory.componentType = 'series';
bulletSeriesFactory.BulletChartSeries = BulletChartSeries;
