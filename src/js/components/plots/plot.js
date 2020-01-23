/**
 * @fileoverview Plot component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import snippet from 'tui-code-snippet';

class Plot {
  /**
   * Plot component.
   * @constructs Plot
   * @private
   * @param {object} params parameters
   *      @param {number} params.vTickCount vertical tick count
   *      @param {number} params.hTickCount horizontal tick count
   *      @param {object} params.theme axis theme
   * @ignore
   */
  constructor(params) {
    /**
     * Plot view className
     * @type {string}
     */
    this.className = 'tui-chart-plot-area';

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
    this.options.showLine = snippet.isUndefined(this.options.showLine)
      ? true
      : this.options.showLine;
    this.options.lines = this.options.lines || [];
    this.options.bands = this.options.bands || [];

    /**
     * x axis type option
     * @type {?string}
     */
    this.xAxisTypeOption = params.xAxisTypeOption;

    /**
     * Theme
     * @type {object}
     */
    this.theme = params.theme || {};

    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * sub charts type
     * @type {Array.<string>}
     */
    this.chartTypes = params.chartTypes;

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
     */
    this.layout = null;

    /**
     * axis data map
     * @type {null|object}
     */
    this.axisDataMap = null;

    this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Preset components for setData
   * @param {object} theme theme object
   * @ignore
   */
  presetForChangeData(theme = this.theme) {
    this.theme = theme;
  }

  /**
   * Render plot area.
   * @param {object} paper paper object
   * @private
   */
  _renderPlotArea(paper) {
    const { dimension } = this.layout;

    if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {
      this._renderOptionalLines(paper, dimension);
    }

    if (this.options.showLine) {
      this._renderPlotLines(paper, dimension);
    }
  }

  /**
   * Set data for rendering.
   * @param {{
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      axisDataMap: object
   * }} data - bounds and scale data
   * @private
   */
  _setDataForRendering(data) {
    if (data) {
      this.layout = data.layout;
      this.dimensionMap = data.dimensionMap;
      this.axisDataMap = data.axisDataMap;
      this.paper = data.paper;
    }
  }

  /**
   * Render plot component.
   * @param {object} data - bounds and scale data
   */
  render(data) {
    const paper = (data && data.paper) || this.paper;
    this.plotSet = paper.set();
    this.additionalPlotSet = paper.set();

    this._setDataForRendering(data);
    this._renderPlotArea(this.paper);

    this.additionalPlotSet.toBack();
    this.plotSet.toBack();
    paper.pushDownBackgroundToBottom();
  }

  /**
   * Rerender.
   * @param {object} data - bounds and scale data
   */
  rerender(data) {
    this.additionalPlotSet.remove();
    this.plotSet.remove();
    this.render(data);
  }

  /**
   * Resize plot component.
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
   * Make template params for vertical line.
   * @param {object} additionalParams - additional params
   * @returns {object}
   * @private
   */
  _makeVerticalLineTemplateParams(additionalParams) {
    return snippet.extend(
      {
        className: 'vertical',
        positionType: 'left',
        width: '1px'
      },
      additionalParams
    );
  }

  /**
   * Make template params for horizontal line.
   * @param {object} additionalParams - additional params
   * @returns {object}
   * @private
   */
  _makeHorizontalLineTemplateParams(additionalParams) {
    return snippet.extend(
      {
        className: 'horizontal',
        positionType: 'bottom',
        height: '1px'
      },
      additionalParams
    );
  }

  /**
   * Render line
   * @param {number} offsetPosition - start percentage offsetPosition
   * @param {object} attributes - line attributes
   * @returns {object} path
   * @private
   */
  _renderLine(offsetPosition, attributes) {
    const {
      position: { top },
      dimension: { height }
    } = this.layout;
    const pathString = `M${offsetPosition},${top}V${top + height}`;
    const path = this.paper.path(pathString);

    path.attr({
      opacity: attributes.opacity || 1,
      stroke: attributes.color
    });

    this.additionalPlotSet.push(path);

    return path;
  }

  /**
   * Render band
   * @param {number} offsetPosition - start percentage offsetPosition
   * @param {number} plotWidth - plotWidth
   * @param {object} attributes - band attributes
   * @returns {object} band
   * @private
   */
  _renderBand(offsetPosition, plotWidth, attributes) {
    const { position, dimension } = this.layout;
    const remainingWidth = dimension.width - offsetPosition + position.left;
    const bandWidth = plotWidth < 0 ? remainingWidth : plotWidth;
    const rect = this.paper.rect(offsetPosition, position.top, bandWidth, dimension.height);

    rect.attr({
      fill: attributes.color,
      opacity: attributes.opacity || 1,
      stroke: attributes.color
    });

    this.additionalPlotSet.push(rect);

    return rect;
  }

  /**
   * Create value range for optional line.
   * @param {{range: ?Array.<number>, value: ?number}} optionalLineData - optional line data
   * @returns {Array.<number>}
   * @private
   */
  _createOptionalLineValueRange(optionalLineData) {
    let range = optionalLineData.range || [optionalLineData.value];

    if (predicate.isDatetimeType(this.xAxisTypeOption)) {
      range = range.map(value => {
        const date = new Date(value);

        return date.getTime() || value;
      });
    }

    return range;
  }

  /**
   * Create position for optional line, when value axis.
   * @param {{dataMin: number, distance: number}} xAxisData - x axis data
   * @param {number} width - width
   * @param {number} value - value
   * @returns {number|null}
   * @private
   */
  _createOptionalLinePosition({ dataMin, distance }, width, value) {
    const ratio = (value - dataMin) / distance;
    let position = ratio * width;

    if (ratio === 1) {
      position -= 1;
    }

    if (position < 0) {
      position = null;
    }

    return position;
  }

  /**
   * Calculate xAxis labelDistance
   * @param {number} width - width of xAxis
   * @param {object} xAxisData - x axis data
   * @returns {number}
   * @private
   */
  _calculateXAxisLabelDistance(width, xAxisData) {
    const { sizeRatio = 1, tickCount, remainLastBlockInterval } = xAxisData;
    const remainLastBlockIntervalPosition = remainLastBlockInterval ? width : 0;
    const tickPixelPositions = calculator.makeTickPixelPositions(
      width * sizeRatio,
      tickCount,
      0,
      remainLastBlockIntervalPosition
    );

    return tickPixelPositions[1] - tickPixelPositions[0];
  }

  /**
   * Create position for optional line, when label axis.
   * @param {number} width - width
   * @param {object} xAxisData - x axis data
   * @param {number} value - value
   * @returns {number|null}
   * @private
   */
  _createOptionalLinePositionWhenLabelAxis(width, xAxisData, value) {
    const { dataProcessor } = this;
    const isLineTypeChart = predicate.isLineTypeChart(
      dataProcessor.chartType,
      dataProcessor.seriesTypes
    );
    const isPointOnColumn = isLineTypeChart && xAxisData.options.pointOnColumn;
    const index = dataProcessor.findCategoryIndex(value);
    const halfLabelDistance = this._calculateXAxisLabelDistance(width, xAxisData) / 2;

    let position = null;
    let ratio;

    if (!snippet.isNull(index)) {
      const categoryCount = dataProcessor.getCategoryCount();
      const divCount = isPointOnColumn ? categoryCount : categoryCount - 1;

      ratio = index === 0 ? 0 : index / divCount;

      position = ratio * width;
      if (isPointOnColumn) {
        position += halfLabelDistance;
      }
    }

    if (ratio === 1) {
      position -= 1;
    }

    return position;
  }

  /**
   * Create position map for optional line.
   * @param {{range: ?Array.<number>, value: ?number}} optionalLineData - optional line data
   * @param {{isLabelAxis: boolean, dataMin: number, distance: number}} xAxisData - x axis data
   * @param {number} width - width
   * @returns {{start: number, end: number}}
   * @private
   */
  _createOptionalLinePositionMap(optionalLineData, xAxisData, width) {
    const categories = this.dataProcessor.getCategories();
    const categoriesLen = categories.length;
    const { linex: xAxisValues } = this.dataProcessor.valuesMap;
    const range = this._createOptionalLineValueRange(optionalLineData);
    let startPosition, endPosition;

    if (xAxisData.isLabelAxis) {
      startPosition = this._createOptionalLinePositionWhenLabelAxis(width, xAxisData, range[0]);
      endPosition = this._createOptionalLinePositionWhenLabelAxis(width, xAxisData, range[1]);
    } else {
      startPosition = this._createOptionalLinePosition(xAxisData, width, range[0]);
      endPosition = range[1] && this._createOptionalLinePosition(xAxisData, width, range[1]);
    }

    if (snippet.isNull(startPosition)) {
      const startValue = categoriesLen ? categories[0] : xAxisValues[0];
      startPosition = this._isBeforeVisibleValue(range[0], startValue) ? 0 : -1;
    }

    if (snippet.isNull(endPosition) || endPosition > width) {
      const endValue = categoriesLen
        ? categories[categoriesLen - 1]
        : xAxisValues[xAxisValues.length - 1];
      endPosition = this._isAfterVisibleValue(range[1], endValue) ? width : -1;
    }

    return {
      start: startPosition,
      end: endPosition
    };
  }

  /**
   * @param {string} value - value of starting point
   * @param {string} firstValue - first visible value data
   * @returns {boolean} - whether starting point value is at before first visible data or not
   * @private
   */
  _isBeforeVisibleValue(value, firstValue) {
    const { dataProcessor } = this;

    if (!snippet.isExisty(value)) {
      return false;
    }

    if (predicate.isDatetimeType(this.xAxisTypeOption)) {
      return value < firstValue;
    }

    const valueIndex = dataProcessor.findAbsoluteCategoryIndex(value);
    const firstValueIndex = dataProcessor.findAbsoluteCategoryIndex(firstValue);

    return valueIndex >= 0 && valueIndex < firstValueIndex;
  }

  /**
   * @param {string} value - value of end point
   * @param {string} lastValue - last visible value data
   * @returns {boolean} - whether end point value is at after last visible value data or not
   * @private
   */
  _isAfterVisibleValue(value, lastValue) {
    const { dataProcessor } = this;

    if (!snippet.isExisty(value)) {
      return false;
    }

    if (predicate.isDatetimeType(this.xAxisTypeOption)) {
      return value > lastValue;
    }

    const valueIndex = dataProcessor.findAbsoluteCategoryIndex(value);
    const lastValueIndex = dataProcessor.findAbsoluteCategoryIndex(lastValue);

    return valueIndex >= 0 && valueIndex > lastValueIndex;
  }

  /**
   * Render optional line.
   * @param {Array.<number>} xAxisData - positions
   * @param {number} width - standard width
   * @param {object} attributes - template parameters
   * @param {object} optionalLineData - optional line information
   * @returns {object}
   * @private
   */
  _renderOptionalLine(xAxisData, width, attributes, optionalLineData) {
    const positionMap = this._createOptionalLinePositionMap(optionalLineData, xAxisData, width);
    let line;

    if (positionMap.start >= 0 && positionMap.start <= width) {
      attributes.width = 1;

      attributes.color = optionalLineData.color || 'transparent';
      attributes.opacity = optionalLineData.opacity;

      line = this._renderLine(positionMap.start + this.layout.position.left, attributes);
    }

    return line;
  }

  /**
   * Render optional band.
   * @param {Array.<number>} xAxisData - positions
   * @param {number} width - standard width
   * @param {object} attributes - template parameters
   * @param {object} optionalLineData - optional line information
   * @returns {object}
   * @private
   */
  _makeOptionalBand(xAxisData, width, attributes, optionalLineData) {
    const { range } = optionalLineData;

    if (range && range.length) {
      this._makeRangeTo2DArray(optionalLineData);
    }

    let positionMaps = optionalLineData.range.map(rangeItem =>
      this._createOptionalLinePositionMap({ range: rangeItem }, xAxisData, width)
    );

    if (optionalLineData.mergeOverlappingRanges) {
      positionMaps.sort(compareByStartPosition);
      positionMaps = this._mergeOverlappingPositionMaps(positionMaps);
    }

    return positionMaps.map(positionMap => {
      const isStartPositionInsidePlotArea = positionMap.start >= 0 && positionMap.start <= width;
      let band;

      if (isStartPositionInsidePlotArea && positionMap.end >= 0) {
        attributes.color = optionalLineData.color || 'transparent';
        attributes.opacity = optionalLineData.opacity;

        const bandWidth = positionMap.end - positionMap.start;
        band = this._renderBand(
          positionMap.start + this.layout.position.left,
          bandWidth,
          attributes
        );
      }

      return band;
    }, this);
  }

  /**
   * Make optional lines html.
   * @param {Array.<object>} lines - optional lines
   * @param {{width: number, height: number}} dimension - dimension
   * @returns {string}
   * @private
   */
  _makeOptionalLines(lines, { width, height }) {
    const xAxisData = this.axisDataMap.xAxis;
    const templateParams = this._makeVerticalLineTemplateParams({
      height: `${height}px`
    });
    const makeOptionalLineHtml = this._renderOptionalLine.bind(
      this,
      xAxisData,
      width,
      templateParams
    );

    return lines.map(makeOptionalLineHtml);
  }

  /**
   * Make optional lines html.
   * @param {Array.<object>} lines - optional lines
   * @param {{width: number, height: number}} dimension - dimension
   * @returns {string}
   * @private
   */
  _makeOptionalBands(lines, { width, height }) {
    const xAxisData = this.axisDataMap.xAxis;
    const templateParams = this._makeVerticalLineTemplateParams({
      height: `${height}px`
    });
    const makeOptionalLineHtml = this._makeOptionalBand.bind(
      this,
      xAxisData,
      width,
      templateParams
    );

    return lines.map(makeOptionalLineHtml);
  }

  /**
   * Render optional lines and bands.
   * @param {object} paper - paper
   * @param {{width: number, height: number}} dimension - dimension
   * @private
   */
  _renderOptionalLines(paper, dimension) {
    this.optionalBands = this._makeOptionalBands(this.options.bands, dimension);
    this.optionalLines = this._makeOptionalLines(this.options.lines, dimension);
  }

  /**
   * Maker html for vertical lines
   * @param {{width: number, height: number}} dimension - dimension
   * @private
   */
  _renderVerticalLines({ width }) {
    const positions = this._makeHorizontalPositions(width);
    const {
      layout,
      theme: { lineColor }
    } = this;
    const {
      position: { top, left }
    } = layout;

    positions.forEach(position => {
      const pathString = `M${position + left},${top}V${top + layout.dimension.height}`;
      const path = this.paper.path(pathString);

      path.attr({
        stroke: lineColor,
        'stroke-width': 1,
        'stroke-opacity': 0.05
      });

      this.plotSet.push(path);
    });
  }

  /**
   * Maker html for horizontal lines.
   * @param {{width: number, height: number}} dimension - dimension
   * @private
   */
  _renderHorizontalLines({ height }) {
    const positions = this._makeVerticalPositions(height);
    const {
      layout,
      theme: { lineColor }
    } = this;
    const {
      position: { left, top }
    } = layout;
    const distance = positions.length > 1 ? positions[1] - positions[0] : 0;

    positions.forEach((position, index) => {
      const pathString = `M${left},${distance * index + top}H${left + layout.dimension.width}`;
      const path = this.paper.path(pathString);

      path.attr({
        stroke: lineColor,
        'stroke-width': 1,
        'stroke-opacity': 0.05
      });

      this.plotSet.push(path);
    });
  }

  /**
   * Render plot lines.
   * @param {HTMLElement} container - container element
   * @param {{width: number, height: number}} dimension plot area dimension
   * @private
   */
  _renderPlotLines(container, dimension) {
    if (!this.options.hideLine) {
      this._renderVerticalLines(dimension);
      this._renderHorizontalLines(dimension);
    }
  }

  /**
   * Make positions for vertical line.
   * @param {number} height plot height
   * @returns {Array.<number>} positions
   * @private
   */
  _makeVerticalPositions(height) {
    const { axisDataMap } = this;
    const yAxis = axisDataMap.yAxis || axisDataMap.rightYAxis;
    const positions = calculator.makeTickPixelPositions(height, yAxis.validTickCount);

    positions.shift();

    return positions;
  }

  /**
   * Make divided positions of plot.
   * @param {number} width - plot width
   * @param {number} tickCount - tick count
   * @returns {Array.<number>}
   * @private
   */
  _makeDividedPlotPositions(width, tickCount) {
    const yAxisWidth = this.dimensionMap.yAxis.width;

    tickCount = parseInt(tickCount / 2, 10) + 1;
    width -= yAxisWidth;

    const leftWidth = Math.round(width / 2);
    const rightWidth = width - leftWidth;
    const leftPositions = calculator.makeTickPixelPositions(leftWidth, tickCount);
    const rightPositions = calculator.makeTickPixelPositions(
      rightWidth,
      tickCount,
      leftWidth + yAxisWidth
    );

    leftPositions.pop();
    rightPositions.shift();

    return leftPositions.concat(rightPositions);
  }

  /**
   * Make positions for horizontal line.
   * @param {number} width plot width
   * @returns {Array.<number>} positions
   * @private
   */
  _makeHorizontalPositions(width) {
    const tickCount = this.axisDataMap.xAxis.validTickCount;
    let positions;

    if (this.options.divided) {
      positions = this._makeDividedPlotPositions(width, tickCount);
    } else {
      positions = calculator.makeTickPixelPositions(width, tickCount);
      positions.shift();
    }

    return positions;
  }

  /**
   * Add plot line.
   * @param {{index: number, color: string, id: string}} data - data
   */
  addPlotLine(data) {
    this.options.lines.push(data);
    this.rerender();
  }

  /**
   * Add plot band.
   * @param {{range: Array.<number>, color: string, id: string}} data - data
   */
  addPlotBand(data) {
    this.options.bands.push(data);
    this.rerender();
  }

  /**
   * Remove plot line.
   * @param {string} id - line id
   */
  removePlotLine(id) {
    this.options.lines = this.options.lines.filter(line => line.id !== id);
    this.rerender();
  }

  /**
   * Remove plot band.
   * @param {string} id - band id
   */
  removePlotBand(id) {
    this.options.bands = this.options.bands.filter(band => band.id !== id);
    this.rerender();
  }

  /**
   * Animate for adding data.
   * @param {{tickSize: number, shifting: boolean}} data - data for animation
   */
  animateForAddingData(data) {
    const optionLines = this.options.lines;
    const optionBands = this.options.bands;

    if (!this.dataProcessor.isCoordinateType()) {
      if (data.shifting) {
        this._animateItemForAddingData(this.optionalLines, data, itemIdx => {
          optionLines.splice(itemIdx, 1);
        });

        this.optionalBands.forEach((bandRanges, bandIdx) => {
          this._animateItemForAddingData(bandRanges, data, itemIdx => {
            optionBands[bandIdx].range.splice(itemIdx, 1);
          });
        });
      }
    }
  }

  /**
   * Animate Item for adding data.
   * @private
   * @param {Array.<object>} optionalItems - svg rect elements for animate
   * @param {{tickSize: number, shifting: boolean}} data - data for animation
   * @param {function} removePlotItem - function for optional plot delete
   */
  _animateItemForAddingData(optionalItems, data, removePlotItem) {
    optionalItems.forEach((item, lineIdx) => {
      const bbox = item.getBBox();

      if (bbox.x - data.tickSize < this.layout.position.left) {
        item.animate(
          {
            transform: `T-${data.tickSize},0`,
            opacity: 0
          },
          300,
          'linear',
          () => {
            removePlotItem(lineIdx);
            item.remove();
          }
        );
      } else {
        item.animate(
          {
            transform: `T-${data.tickSize},0`
          },
          300
        );
      }
    });
  }

  /**
   * Check if  optionalLineData has range property and range property is 2D array
   * @param {{range: ?Array.<number>}} optionalLineData - optional line data
   * @private
   */
  _makeRangeTo2DArray(optionalLineData) {
    const { range } = optionalLineData;
    const isOneDimensionArray =
      range && snippet.isArray(range) && (range.length === 0 || !snippet.isArray(range[0]));

    if (isOneDimensionArray) {
      optionalLineData.range = [range];
    }
  }

  /**
   * check if some areas are overlapped, and then merge overlapping area
   * @param {Array.<{start: number, end: number}>} positionMaps - original positionMaps
   * @returns {Array.<{start: number, end: number}>} - inspected positionMaps
   * @private
   */
  _mergeOverlappingPositionMaps(positionMaps) {
    const len = positionMaps.length;
    let processedMap, previous;

    if (len) {
      processedMap = [positionMaps[0]];
      [previous] = processedMap;
    }

    for (let i = 1; i < len; i += 1) {
      const current = positionMaps[i];

      if (current.start <= previous.end) {
        previous.end = Math.max(current.end, previous.end);
      } else {
        processedMap.push(current);
        previous = current;
      }
    }

    return processedMap;
  }
}

/**
 * Compare positionMap by it's start value
 * @param {{start: number, end: number}} previous - previouse plot band positionMap
 * @param {{start: number, end: number}} current - current plot band positionMap
 * @returns {number} - comparison of whether a is greater than b
 * @ignore
 */
function compareByStartPosition(previous, current) {
  return previous.start - current.start;
}

/**
 * Factory for Plot
 * @param {object} param parameter
 * @returns {object}
 * @ignore
 */
export default function plotFactory(param) {
  const {
    seriesTypes,
    chartOptions: {
      chartType,
      xAxis: { type: xAxisType }
    }
  } = param;

  // same among bar, chart, line, area charts
  param.chartType = chartType;
  param.chartTypes = seriesTypes;
  param.xAxisTypeOption = xAxisType;

  return new Plot(param);
}

plotFactory.componentType = 'plot';
plotFactory.Plot = Plot;
