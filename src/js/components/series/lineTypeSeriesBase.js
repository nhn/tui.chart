/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import arrayUtil from '../../helpers/arrayUtil';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';
const {
  SERIES_EXPAND_SIZE,
  SERIES_LABEL_PADDING,
  MAX_HEIGHT_WORD,
  ADDING_DATA_ANIMATION_DURATION
} = chartConst;

/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @private
 * @mixin
 * @private */
class LineTypeSeriesBase {
  /**
   * Make positions for default data type.
   * @param {number} [seriesWidth] - width of series area
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _makePositionsForDefaultType(seriesWidth) {
    const {
      dimension: { height, width: dimensionWidth }
    } = this.layout;
    const seriesDataModel = this._getSeriesDataModel();
    const width = seriesWidth || dimensionWidth || 0;
    const len = seriesDataModel.getGroupCount();
    const baseTop = this.layout.position.top;
    let baseLeft = this.layout.position.left;
    let step;

    if (this.aligned) {
      step = width / (len > 1 ? len - 1 : len);
    } else {
      step = width / len;
      baseLeft += step / 2;
    }

    return seriesDataModel.map(
      seriesGroup =>
        seriesGroup.map((seriesItem, index) => {
          let position;

          if (!snippet.isNull(seriesItem.end)) {
            position = {
              left: baseLeft + step * index,
              top: baseTop + height - seriesItem.ratio * height
            };

            if (snippet.isExisty(seriesItem.startRatio)) {
              position.startTop = baseTop + height - seriesItem.startRatio * height;
            }
          }

          return position;
        }),
      true
    );
  }

  /**
   * Make positions for coordinate data type.
   * @param {number} [seriesWidth] - width of series area
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _makePositionForCoordinateType(seriesWidth) {
    const { dimension } = this.layout;
    const seriesDataModel = this._getSeriesDataModel();
    const { height } = dimension;
    const { xAxis } = this.axisDataMap;
    const baseTop = this.layout.position.top;
    const baseLeft = this.layout.position.left;
    let width = seriesWidth || dimension.width || 0;
    let additionalLeft = 0;

    if (xAxis.sizeRatio) {
      additionalLeft = calculator.multiply(width, xAxis.positionRatio);
      width = calculator.multiply(width, xAxis.sizeRatio);
    }

    return seriesDataModel.map(
      seriesGroup =>
        seriesGroup.map(seriesItem => {
          let position;

          if (!snippet.isNull(seriesItem.end)) {
            position = {
              left: baseLeft + seriesItem.ratioMap.x * width + additionalLeft,
              top: baseTop + height - seriesItem.ratioMap.y * height
            };

            if (snippet.isExisty(seriesItem.ratioMap.start)) {
              position.startTop =
                height - seriesItem.ratioMap.start * height + chartConst.SERIES_EXPAND_SIZE;
            }
          }

          return position;
        }),
      true
    );
  }

  /**
   * Make basic positions for rendering line graph.
   * @param {number} [seriesWidth] - width of series area
   * @returns {Array.<Array.<object>>}
   * @private
   */
  _makeBasicPositions(seriesWidth) {
    if (this.dataProcessor.isCoordinateType()) {
      return this._makePositionForCoordinateType(seriesWidth);
    }

    return this._makePositionsForDefaultType(seriesWidth);
  }

  /**
   * Calculate label position top.
   * @param {{top: number, startTop: number}} basePosition - base position
   * @param {number} value - value of seriesItem
   * @param {number} labelHeight - label height
   * @param {boolean} [isStart] - whether start value of seriesItem or not
   * @returns {number} position top
   * @private
   */
  _calculateLabelPositionTop(basePosition, value, labelHeight, isStart) {
    const baseTop = basePosition.top;
    let top;

    if (predicate.isValidStackOption(this.options.stackType)) {
      top = (basePosition.startTop + baseTop - labelHeight) / 2 + 1;
    } else if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
      top = baseTop - labelHeight - SERIES_LABEL_PADDING;
    } else {
      top = baseTop + SERIES_LABEL_PADDING;
    }

    return top;
  }

  /**
   * Make label position for rendering label of series area.
   * @param {{left: number, top: number, startTop: ?number}} basePosition - base position for calculating
   * @param {number} labelHeight - label height
   * @param {(string | number)} label - label of seriesItem
   * @param {number} value - value of seriesItem
   * @param {boolean} [isStart] - whether start label position or not
   * @returns {{left: number, top: number}}
   * @private
   */
  _makeLabelPosition(basePosition, labelHeight, label, value, isStart) {
    return {
      left: basePosition.left,
      top: this._calculateLabelPositionTop(basePosition, value, labelHeight / 2, isStart)
    };
  }

  /**
   * Get label positions for line type chart
   * @param {object} seriesDataModel series data model
   * @param {object} theme label theme
   * @returns {object}
   * @private
   */
  _getLabelPositions(seriesDataModel, theme) {
    const basePositions = arrayUtil.pivot(this.seriesData.groupPositions);
    const labelHeight = renderUtil.getRenderedLabelHeight(MAX_HEIGHT_WORD, theme);

    return seriesDataModel.map((seriesGroup, groupIndex) =>
      seriesGroup.map((seriesItem, index) => {
        const basePosition = basePositions[groupIndex][index];
        const end = this._makeLabelPosition(
          basePosition,
          labelHeight,
          seriesItem.endLabel,
          seriesItem.end
        );
        const position = { end };

        if (seriesItem.isRange) {
          basePosition.top = basePosition.startTop;
          position.start = this._makeLabelPosition(
            basePosition,
            labelHeight,
            seriesItem.startLabel,
            seriesItem.start
          );
        }

        return position;
      })
    );
  }

  /**
   * Get label texts
   * @param {object} seriesDataModel sereis data model
   * @returns {Array.<string>}
   * @private
   */
  _getLabelTexts(seriesDataModel) {
    return seriesDataModel.map(seriesGroup =>
      seriesGroup.map(({ endLabel, isRange, startLabel }) => {
        const label = {
          end: this.decorateLabel(endLabel)
        };

        if (isRange) {
          label.start = this.decorateLabel(startLabel);
        }

        return label;
      })
    );
  }

  /**
   * Render series label.
   * @param {object} paper paper
   * @returns {Array.<object>}
   * @private
   */
  _renderSeriesLabel(paper) {
    const theme = this.theme.label;
    const seriesDataModel = this._getSeriesDataModel();
    const groupLabels = this._getLabelTexts(seriesDataModel);
    const positionsSet = this._getLabelPositions(seriesDataModel, theme);

    return this.graphRenderer.renderSeriesLabel(paper, positionsSet, groupLabels, theme);
  }

  /**
   * To call showGroupTooltipLine function of graphRenderer.
   * @param {{
   *      dimension: {width: number, height: number},
   *      position: {left: number, top: number}
   * }} bound bound
   */
  onShowGroupTooltipLine(bound) {
    if (!this.graphRenderer.showGroupTooltipLine) {
      return;
    }

    this.graphRenderer.showGroupTooltipLine(bound, this.layout);
  }

  /**
   * To call hideGroupTooltipLine function of graphRenderer.
   */
  onHideGroupTooltipLine() {
    if (!this.isAvailableSeriesData() || !this.graphRenderer.hideGroupTooltipLine) {
      return;
    }
    this.graphRenderer.hideGroupTooltipLine();
  }

  /**
   * Zoom by mouse drag.
   * @param {object} data - data
   */
  zoom(data) {
    this._cancelMovingAnimation();
    this._clearSeriesContainer(data.paper);
    this._setDataForRendering(data);
    this._renderSeriesArea(data.paper, snippet.bind(this._renderGraph, this));

    if (!snippet.isNull(this.selectedLegendIndex)) {
      this.graphRenderer.selectLegend(this.selectedLegendIndex);
    }
  }

  /**
   * Whether changed or not.
   * @param {{min: number, max: number}} before - before limit
   * @param {{min: number, max: number}} after - after limit
   * @returns {boolean}
   * @private
   */
  _isChangedLimit(before, after) {
    return before.min !== after.min || before.max !== after.max;
  }

  /**
   * Whether changed axis limit(min, max) or not.
   * @returns {boolean}
   * @private
   */
  _isChangedAxisLimit() {
    const { beforeAxisDataMap, axisDataMap } = this;
    let changed = true;

    if (beforeAxisDataMap) {
      changed = this._isChangedLimit(beforeAxisDataMap.yAxis.limit, axisDataMap.yAxis.limit);

      if (axisDataMap.xAxis.limit) {
        changed =
          changed || this._isChangedLimit(beforeAxisDataMap.xAxis.limit, axisDataMap.xAxis.limit);
      }
    }

    this.beforeAxisDataMap = axisDataMap;

    return changed;
  }

  /**
   * Animate for motion of series area.
   * @param {function} callback - callback function
   * @private
   */
  _animate(callback) {
    const duration = ADDING_DATA_ANIMATION_DURATION;
    const changedLimit = this._isChangedAxisLimit();

    if (changedLimit && this.seriesLabelContainer) {
      this.seriesLabelContainer.innerHTML = '';
    }

    if (!callback) {
      return;
    }

    this.movingAnimation = renderUtil.startAnimation(duration, callback, () => {
      this.movingAnimation = null;
    });
  }

  /**
   * Make top of zero point for adding data.
   * @returns {number}
   * @private
   * @override
   */
  _makeZeroTopForAddingData() {
    const seriesHeight = this.layout.dimension.height;
    const { limit } = this.axisDataMap.yAxis;

    return this._getLimitDistanceFromZeroPoint(seriesHeight, limit).toMax + SERIES_EXPAND_SIZE;
  }

  /**
   * Animate for adding data.
   * @param {{tickSize: number}} data - parameters for adding data.
   */
  animateForAddingData({ tickSize, limitMap, axisDataMap }) {
    const dimension = this.dimensionMap.extendedSeries;
    const shiftingOption = this.options.shifting;
    let seriesWidth = this.layout.dimension.width;

    this.limit = limitMap[this.chartType];
    this.axisDataMap = axisDataMap;

    const seriesData = this._makeSeriesData();
    const paramsForRendering = this._makeParamsForGraphRendering(dimension, seriesData);

    if (shiftingOption) {
      seriesWidth += tickSize;
    }

    const groupPositions = this._makePositions(seriesWidth);
    const zeroTop = this._makeZeroTopForAddingData();

    this.graphRenderer.animateForAddingData(
      paramsForRendering,
      tickSize,
      groupPositions,
      shiftingOption,
      zeroTop
    );
  }

  /**
   * Cancel moving animation.
   * @private
   */
  _cancelMovingAnimation() {
    if (this.movingAnimation) {
      cancelAnimationFrame(this.movingAnimation.id);
      this.movingAnimation = null;
    }
  }
}

LineTypeSeriesBase.mixin = function(func) {
  snippet.extend(func.prototype, LineTypeSeriesBase.prototype);
};

export default LineTypeSeriesBase;
