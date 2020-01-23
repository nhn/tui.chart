/**

 * @fileoverview  Axis component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import pluginFactory from '../../factories/pluginFactory';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';
import raphaelRenderUtil from '../../plugins/raphaelRenderUtil';

const { AXIS_EDGE_RATIO, X_AXIS_LABEL_PADDING, COMPONENT_TYPE_RAPHAEL } = chartConst;

class Axis {
  /**
   * Axis component.
   * @constructs Axis
   * @private
   * @param {object} params parameters
   *      @param {object} params.bound axis bound
   *      @param {object} params.theme axis theme
   *      @param {object} params.options axis options
   *      @param {object} params.dataProcessor data processor of chart
   *      @param {object} params.seriesType series type
   *      @param {boolean} params.isYAxis boolean value for axis is vertical or not
   */
  constructor(params) {
    /**
     * Axis view className
     * @type {string}
     */
    this.className = 'tui-chart-axis-area';

    /**
     * Data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * Options
     * @type {object}
     */
    this.options = params.options || {};

    /**
     * Axis Theme
     * Use chart background theme object for render yAxis background on dynamicDataShifting chart
     * @type {object}
     */
    this.theme = snippet.extend({}, params.theme, {
      background: params.chartTheme.chart.background
    });

    /**
     * Whether label type axis or not.
     * @type {boolean}
     */
    this.isLabelAxis = false;

    /**
     * Whether vertical type or not.
     * @type {boolean}
     */
    this.isYAxis = params.isYAxis;

    /**
     * Whether data dynamic shifting or not.
     * @type {boolean}
     */
    this.shifting = params.shifting;

    /**
     * cached axis data
     * @type {object}
     */
    this.data = {};

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number, ?right:number}}}
     */
    this.layout = null;

    /**
     * dimension map for layout of chart
     * @type {null|object}
     */
    this.dimensionMap = null;

    /**
     * axis data map
     * @type {null|object}
     */
    this.axisDataMap = null;

    /**
     * Renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(COMPONENT_TYPE_RAPHAEL, 'axis');

    /**
     * Drawing type
     * @type {string}
     */
    this.drawingType = COMPONENT_TYPE_RAPHAEL;

    /**
     * Paper additional width
     * @type {number}
     */
    this.paperAdditionalWidth = 0;

    /** * Paper additional height
     * @type {number}
     */
    this.paperAdditionalHeight = 0;

    /**
     * Raphael Element for axis background
     * We should caching this for prevent making background multiply
     * @type {Raphael.Element}
     */
    this._elBg = null;

    this.isRightYAxis = params.name === 'rightYAxis';
  }

  /**
   * Render vertical axis background
   * @private
   */
  _renderBackground() {
    const dimension = Object.assign({}, this.layout.dimension);
    const position = Object.assign({}, this.layout.position);

    if (this._elBg) {
      this._elBg.remove();
    }

    this._elBg = this.graphRenderer.renderBackground(
      this.paper,
      position,
      dimension,
      this.theme.background
    );
  }

  /**
   * Render child containers like title area, label area and tick area.
   * @param {number} size xAxis width or yAxis height
   * @param {number} tickCount tick count
   * @param {Array.<number|string>} categories categories
   * @param {number} additionalWidth additional width
   * @private
   */
  _renderChildContainers(size, tickCount, categories, additionalWidth = 0) {
    const isYAxisLineType = this.isYAxis && this.data.aligned;
    const axisLimit = this.limitMap[this.dataProcessor.chartType];
    const isNegativeLimitChart = !this.data.limit && axisLimit && axisLimit.min < 0;
    const isBarChart = predicate.isBarTypeChart(this.dataProcessor.chartType);
    const seriesOption = this.dataProcessor.getOption('series') || {};
    const isDivergingOption = seriesOption.diverging;

    if (this.isYAxis && !this.data.isPositionRight && !this.options.isCenter && this.shifting) {
      this._renderBackground();
    }

    this._renderTitleArea(size, additionalWidth);

    if (this.options.showLabel !== false) {
      this._renderLabelArea(size, tickCount, categories, additionalWidth);
    }

    if (!isYAxisLineType) {
      this._renderTickArea(size, tickCount, additionalWidth);
    }
    if (isNegativeLimitChart && isBarChart && !isDivergingOption) {
      this._renderNegativeStandardsLine(size, additionalWidth, this.dimensionMap.series, axisLimit);
    }
  }

  /**
   * Render divided xAxis if yAxis rendered in the center.
   * @param {{width: number, height:number}} dimension axis area width and height
   * @private
   */
  _renderDividedAxis({ width }) {
    const { tickCount, labels: categories } = this.data;
    const lSideWidth = Math.round(width / 2);
    const rSideWidth = width - lSideWidth - 1;
    const halfTickCount = parseInt(tickCount / 2, 10) + 1;
    const lCategories = categories.slice(0, halfTickCount);
    const rCategories = categories.slice(halfTickCount - 1, tickCount);
    const tickInterval = lSideWidth / halfTickCount;
    const secondXAxisAdditionalPosition = lSideWidth + this.dimensionMap.yAxis.width - 1;

    this.paperAdditionalWidth = tickInterval;

    this._renderChildContainers(lSideWidth, halfTickCount, lCategories, 0);
    this._renderChildContainers(
      rSideWidth + 1,
      halfTickCount,
      rCategories,
      secondXAxisAdditionalPosition
    );
  }

  /**
   * Render single axis if not divided.
   * @param {{width: number, height: number}} dimension axis area dimension
   * @private
   */
  _renderNotDividedAxis({ width, height }) {
    const { positionRatio, tickCount, labels } = this.data;
    const { isYAxis } = this;
    const size = isYAxis ? height : width;
    let additionalSize = 0;

    if (positionRatio) {
      additionalSize = size * positionRatio;
    }

    this._renderChildContainers(size, tickCount, labels, additionalSize);
  }

  /**
   * Render axis area.
   * @private
   */
  _renderAxisArea() {
    const { dimension } = this.layout;
    const { isLabelAxis } = this.data;
    const { divided, isCenter } = this.options;
    let { width } = dimension;

    this.isLabelAxis = isLabelAxis;

    if (divided) {
      this.containerWidth = width + this.dimensionMap.yAxis.width;
      this._renderDividedAxis(dimension);
      width = this.containerWidth;
    } else {
      width += isCenter ? 1 : 0;
      this._renderNotDividedAxis(dimension);
    }
  }

  /**
   * Set data for rendering.
   * @param {{
   *      options: ?object,
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      dimensionMap: object,
   *      axisDataMap: object
   * }} data - bounds and scale data
   * @private
   */
  _setDataForRendering({ layout, dimensionMap, limitMap, axisDataMap }) {
    this.layout = layout;
    this.dimensionMap = dimensionMap;
    this.limitMap = limitMap;

    this.data = axisDataMap[this.componentName];
    this.options = this.data.options;
  }

  /**
   * @param {object} data - bounds and scale data
   */
  render(data) {
    const { paper } = data;
    this.paper = paper;
    this.axisSet = paper.set();

    this._setDataForRendering(data);
    this._renderAxisArea();
  }

  /**
   * Rerender axis component.
   * @param {object} data - bounds and scale data
   */
  rerender(data) {
    this.axisSet.remove();

    this.render(data);
  }

  /**
   * Resize axis component.
   * @param {object} data - bounds and scale data
   */
  resize(data) {
    this.rerender(data);
  }

  /**
   * Zoom.
   * @param {object} data - bounds and scale data
   */
  zoom(data) {
    this.rerender(data);
  }

  /**
   * get other side axis dimension
   * @returns {object}
   * @private
   */
  _getOtherSideDimension() {
    return this.dimensionMap[this.isYAxis ? 'xAxis' : 'yAxis'];
  }

  /**
   * Title area renderer
   * @param {number} size - area size
   * @param {number} additionalWidth - right side xAxis position
   * @private
   */
  _renderTitleArea(size, additionalWidth) {
    const { title = {} } = this.options;
    const xAxisOption = this.dataProcessor.getOption('xAxis');
    const yAxisOption = this.dataProcessor.getOption('yAxis');
    const seriesOption = this.dataProcessor.getOption('series') || {};

    if (title.text) {
      this.graphRenderer.renderTitle(this.paper, {
        text: title.text,
        offset: title.offset,
        theme: this.theme.title,
        rotationInfo: {
          isVertical: this.isYAxis,
          isPositionRight: this.data.isPositionRight,
          isCenter: this.options.isCenter,
          isColumnType: predicate.isColumnTypeChart(
            this.dataProcessor.chartType,
            this.dataProcessor.seriesTypes
          ),
          isDiverging: seriesOption.diverging,
          isYAxisCenter: yAxisOption && yAxisOption.align === 'center',
          isXAxisTitleLeft: xAxisOption && xAxisOption.title && xAxisOption.title.align === 'left'
        },
        layout: this.layout,
        areaSize: size,
        additionalWidth,
        otherSideDimension: this._getOtherSideDimension(),
        tickCount: this.data.tickCount,
        set: this.axisSet
      });
    }
  }

  /**
   * Render tick line.
   * @param {number} areaSize - width or height
   * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
   * @param {number} additionalSize - additional size
   * @private
   */
  _renderTickLine(areaSize, isNotDividedXAxis, additionalSize) {
    this.graphRenderer.renderTickLine({
      areaSize,
      additionalSize,
      additionalWidth: this.paperAdditionalWidth,
      additionalHeight: this.paperAdditionalHeight,
      isPositionRight: this.data.isPositionRight,
      isCenter: this.data.options.isCenter,
      isNotDividedXAxis,
      isVertical: this.isYAxis,
      tickColor: this.theme.tickColor,
      layout: this.layout,
      paper: this.paper,
      set: this.axisSet
    });
  }

  /**
   * Render ticks.
   * @param {number} size - width or height
   * @param {number} tickCount - tick count
   * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
   * @param {number} [additionalSize] - additional size
   * @private
   */
  _renderTicks(size, tickCount, isNotDividedXAxis, additionalSize) {
    const { tickColor } = this.theme;
    const {
      remainLastBlockInterval,
      sizeRatio = 1,
      tickCount: dataTickCount,
      isPositionRight
    } = this.data;
    const remainLastBlockIntervalPosition = remainLastBlockInterval ? size : 0;
    const { isYAxis } = this;
    const { isCenter, divided: isDivided } = this.data.options;
    const positions = calculator.makeTickPixelPositions(
      size * sizeRatio,
      tickCount,
      0,
      remainLastBlockIntervalPosition
    );
    const additionalHeight = this.paperAdditionalHeight + 1;
    const additionalWidth = this.paperAdditionalWidth;
    const positionLength = remainLastBlockIntervalPosition ? dataTickCount + 1 : dataTickCount;

    positions.length = positionLength;

    this.graphRenderer.renderTicks({
      paper: this.paper,
      layout: this.layout,
      positions,
      isVertical: isYAxis,
      isCenter,
      isDivided,
      additionalSize,
      additionalWidth,
      additionalHeight,
      otherSideDimension: this._getOtherSideDimension(),
      isPositionRight,
      tickColor,
      set: this.axisSet
    });
  }

  _renderNegativeStandardsLine(size, additionalSize, seriesDimension, axisLimit) {
    this.graphRenderer.renderStandardLine({
      areaSize: size,
      isVertical: this.isYAxis,
      layout: this.layout,
      paper: this.paper,
      set: this.axisSet,
      seriesDimension,
      axisLimit
    });
  }

  /**
   * Render tick area.
   * @param {number} size - width or height
   * @param {number} tickCount - tick count
   * @param {number} [additionalSize] - additional size (width or height)
   * @private
   */
  _renderTickArea(size, tickCount, additionalSize) {
    const isNotDividedXAxis = !this.isYAxis && !this.options.divided;

    this._renderTickLine(size, isNotDividedXAxis, additionalSize || 0);
    this._renderTicks(size, tickCount, isNotDividedXAxis, additionalSize || 0);
  }

  /**
   * Render label area.
   * @param {number} size label area size
   * @param {number} tickCount tick count
   * @param {Array.<string>} categories categories
   * @param {number} [additionalSize] additional size (width or height)
   * @private
   */
  _renderLabelArea(size, tickCount, categories, additionalSize) {
    const { sizeRatio = 1, remainLastBlockInterval } = this.data;
    const remainLastBlockIntervalPosition = remainLastBlockInterval ? size : 0;
    const tickPixelPositions = calculator.makeTickPixelPositions(
      size * sizeRatio,
      tickCount,
      0,
      remainLastBlockIntervalPosition
    );
    const labelDistance = tickPixelPositions[1] - tickPixelPositions[0];

    this._renderLabels(tickPixelPositions, categories, labelDistance, additionalSize || 0);
  }

  /**
   * Make html of rotation labels.
   * @param {Array.<object>} positions label position array
   * @param {string[]} categories categories
   * @param {number} labelSize label size
   * @param {number} additionalSize additional size
   * @private
   */
  _renderRotationLabels(positions, categories, labelSize, additionalSize) {
    const renderer = this.graphRenderer;
    const { isYAxis } = this;
    const theme = this.theme.label;
    const { degree } = this.data;
    const halfWidth = labelSize / 2;
    const edgeAlignWidth = labelSize / AXIS_EDGE_RATIO;
    const { top, left } = this.layout.position;
    const horizontalTop = top + X_AXIS_LABEL_PADDING;
    const baseLeft = left;
    const labelMargin = this.options.labelMargin || 0;

    positions.forEach((position, index) => {
      const labelPosition = position + (additionalSize || 0);
      const positionTopAndLeft = {};

      if (isYAxis) {
        positionTopAndLeft.top = labelPosition + halfWidth;
        positionTopAndLeft.left = labelSize + labelMargin;
      } else {
        positionTopAndLeft.top = horizontalTop + labelMargin;
        positionTopAndLeft.left = baseLeft + labelPosition + edgeAlignWidth;
      }

      renderer.renderRotatedLabel({
        degree,
        labelText: categories[index],
        paper: this.paper,
        positionTopAndLeft,
        set: this.axisSet,
        theme
      });
    }, this);
  }

  /**
   * Make html of normal labels.
   * @param {Array.<object>} positions label position array
   * @param {string[]} categories categories
   * @param {number} labelSize label size
   * @param {number} additionalSize additional size
   * @private
   */
  _renderNormalLabels(positions, categories, labelSize, additionalSize) {
    const renderer = this.graphRenderer;
    const { isYAxis, isLabelAxis: isCategoryLabel, dataProcessor, layout } = this;
    const { isPositionRight } = this.data;
    const theme = this.theme.label;
    const { labelMargin = 0, pointOnColumn, isCenter, maxWidth } = this.options;
    const isLineTypeChart = predicate.isLineTypeChart(
      dataProcessor.chartType,
      dataProcessor.seriesTypes
    );
    const isPointOnColumn = isLineTypeChart && pointOnColumn;
    const isAutoTickInterval = predicate.isAutoTickInterval(this.options.tickInterval);

    positions.forEach((position, index) => {
      const labelPosition = position + additionalSize;
      const halfLabelDistance = labelSize / 2;
      const isOverLapXAxisLabel = this._isOverLapXAxisLabel(
        categories[index],
        position,
        positions[index + 1]
      );
      let positionTopAndLeft = {};

      /*
       * to prevent printing `undefined` text, when category label is not set
       */
      if (labelPosition < 0 || (!isYAxis && isAutoTickInterval && isOverLapXAxisLabel)) {
        return;
      }

      if (isYAxis) {
        positionTopAndLeft = this._getYAxisLabelPosition(layout, {
          labelPosition,
          isCategoryLabel,
          halfLabelDistance,
          isPositionRight
        });
      } else {
        positionTopAndLeft = this._getXAxisLabelPosition(layout, {
          labelMargin,
          labelHeight: renderUtil.getRenderedLabelsMaxHeight(categories, theme),
          labelPosition,
          isCategoryLabel,
          isLineTypeChart,
          isPointOnColumn,
          halfLabelDistance
        });
      }

      positionTopAndLeft.top = Math.round(positionTopAndLeft.top);
      positionTopAndLeft.left = Math.round(positionTopAndLeft.left);

      let labelText = categories[index];
      if (maxWidth) {
        labelText = raphaelRenderUtil.getEllipsisText(categories[index], maxWidth, theme);
      }

      renderer.renderLabel({
        isPositionRight,
        isVertical: isYAxis,
        isCenter,
        labelSize,
        labelText,
        paper: this.paper,
        positionTopAndLeft,
        set: this.axisSet,
        theme
      });
    }, this);
  }

  /**
   * @param {string} labelText - axis label text
   * @param {number} position - current left position
   * @param {number} nextPosition - next  left position
   * @returns {boolean}
   */
  _isOverLapXAxisLabel(labelText, position, nextPosition) {
    const labelWidth = renderUtil.getRenderedLabelWidth(labelText);

    return !snippet.isUndefined(nextPosition) && nextPosition - position < labelWidth;
  }

  /**
   * @param {object} layout - axis dimension, position
   * @param {object} params - optional data needed to render axis labels
   * @returns {object} top, left positon of y axis
   */
  _getYAxisLabelPosition(layout, params) {
    let labelLeftPosition;
    let labelTopPosition = params.labelPosition;

    if (params.isCategoryLabel) {
      labelTopPosition += params.halfLabelDistance + layout.position.top;
    } else {
      labelTopPosition = layout.dimension.height + layout.position.top - labelTopPosition;
    }

    if (params.isPositionRight) {
      labelLeftPosition = layout.position.left + layout.dimension.width;
    } else if (this.options.isCenter) {
      labelLeftPosition = layout.position.left + layout.dimension.width / 2;
    } else {
      labelLeftPosition = layout.position.left;
    }

    return {
      top: labelTopPosition,
      left: labelLeftPosition
    };
  }

  /**
   * @param {object} layout - axis dimension, position
   * @param {object} params - optional data needed to render axis labels
   * @returns {object} top, left positon of y axis
   */
  _getXAxisLabelPosition(layout, params) {
    const labelTopPosition = calculator.sum([
      layout.position.top,
      X_AXIS_LABEL_PADDING,
      params.labelMargin,
      params.labelHeight / 2
    ]);
    let labelLeftPosition = params.labelPosition + layout.position.left;

    if (params.isCategoryLabel) {
      if (!params.isLineTypeChart || params.isPointOnColumn) {
        labelLeftPosition += params.halfLabelDistance;
      }
    }

    return {
      top: labelTopPosition,
      left: labelLeftPosition
    };
  }

  /**
   * Make labels html.
   * @param {Array.<object>} positions - positions for labels
   * @param {Array.<string>} categories - categories
   * @param {number} labelSize label size
   * @param {number} additionalSize additional size
   * @private
   */
  _renderLabels(positions, categories, labelSize, additionalSize) {
    const { rotateLabel, prefix, suffix } = this.options;
    const { degree, multilineLabels } = this.data;
    const isRotationlessXAxis = !this.isYAxis && this.isLabelAxis && rotateLabel === false;
    const hasRotatedXAxisLabel = this.componentName === 'xAxis' && degree;
    let axisLabels;

    if (isRotationlessXAxis) {
      axisLabels = multilineLabels;
    } else {
      axisLabels = categories;
    }

    if (axisLabels.length) {
      positions.length = axisLabels.length;
    }

    axisLabels = renderUtil.addPrefixSuffix(axisLabels, prefix, suffix);

    if (hasRotatedXAxisLabel) {
      this._renderRotationLabels(positions, axisLabels, labelSize, additionalSize);
    } else {
      this._renderNormalLabels(positions, axisLabels, labelSize, additionalSize);
    }
  }

  /**
   * Animate axis for adding data
   * @param {object} data rendering data
   */
  animateForAddingData(data) {
    if (!this.isYAxis) {
      this.graphRenderer.animateForAddingData(data.tickSize);
    }
  }
}

/**
 * Factory for Axis
 * @param {object} axisParam parameter
 * @returns {object}
 * @ignore
 */
export default function axisFactory(axisParam) {
  const { chartOptions, name, theme, seriesTypes } = axisParam;
  const { chartType, series } = chartOptions;

  axisParam.isYAxis = name === 'yAxis' || name === 'rightYAxis';
  axisParam.shifting = series.shifting;

  // In combo chart, the theme is divided into series name considering two YAxis(yAxis and rightYAxis)
  // @todo change theme structure so that access theme by axis type, not considering chart type
  //     like theme.xAxis, theme.yAxis, theme.rightYAxis
  if (chartType === 'combo') {
    if (axisParam.isYAxis) {
      axisParam.theme = theme[seriesTypes[0]];
    } else if (name === 'rightYAxis') {
      axisParam.componentType = 'yAxis';
      axisParam.theme = theme[seriesTypes[1]];
      axisParam.index = 1;
    }
    // @todo I do not know why the single type chart with yAxis branches once again as the chart name inside it. I feel inconsistent
  } else if (axisParam.isYAxis) {
    axisParam.theme = theme[chartType];
    // single chart, xAxis
  } else {
    axisParam.theme = theme;
  }

  return new Axis(axisParam);
}

axisFactory.componentType = 'axis';
axisFactory.Axis = Axis;
