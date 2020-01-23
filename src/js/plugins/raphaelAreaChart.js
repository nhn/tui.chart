/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import RaphaelLineBase from './raphaelLineTypeBase';
import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';
import chartConst from '../const';
import consoleUtil from '../helpers/consoleUtil';
const { GUIDE_AREACHART_AREAOPACITY_TYPE, CLASS_NAME_SVG_AUTOSHAPE } = chartConst;
const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;

class RaphaelAreaChart extends RaphaelLineBase {
  /**
   * RaphaelAreaChart is graph renderer for area chart.
   * @constructs RaphaelAreaChart
   * @private
   * @private
   * @extends RaphaelLineTypeBase
   */
  constructor() {
    super();

    /**
     * selected legend index
     * @type {?number}
     */
    this.selectedLegendIndex = null;

    /**
     * type of chart
     * @type {string}
     */
    this.chartType = 'area';

    /**
     * Line width
     * @type {number}
     */
    this.lineWidth = 0;
  }

  /**
   * Render function of area chart.
   * @param {object} paper - raphael paper
   * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
   * @returns {object}
   */
  render(paper, data) {
    const {
      dimension,
      groupPositions,
      theme = {},
      position,
      zeroTop,
      hasRangeData,
      options
    } = data;
    const { dot: dotTheme = {}, colors } = theme;
    const {
      spline,
      allowSelect,
      connectNulls,
      pointWidth,
      showDot,
      areaOpacity: areaOpacityOptions
    } = options;
    const areaOpacity = this._isAreaOpacityNumber(areaOpacityOptions) ? areaOpacityOptions : 1;
    const dotOpacity = showDot ? 1 : 0;
    const borderStyle = this.makeBorderStyle(
      dotTheme.strokeColor,
      dotOpacity,
      dotTheme.strokeWidth
    );
    const outDotStyle = this.makeOutDotStyle(dotOpacity, borderStyle);
    const lineWidth = (this.lineWidth = snippet.isNumber(pointWidth) ? pointWidth : this.lineWidth);

    this.paper = paper;
    this.theme = theme;
    this.isSpline = spline;
    this.dimension = dimension;
    this.position = position;
    this.zeroTop = zeroTop;
    this.hasRangeData = hasRangeData;
    this.animationDuration = data.options.animationDuration;

    paper.setStart();

    this.groupPaths = this._getAreaChartPath(groupPositions, null, connectNulls);
    this.groupAreas = this._renderAreas(paper, this.groupPaths, colors, lineWidth, areaOpacity);

    this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
    this.groupDots = this._renderDots(paper, groupPositions, colors, dotOpacity);

    if (allowSelect) {
      this.selectionDot = this._makeSelectionDot(paper);
      this.selectionColor = theme.selectionColor;

      if (this.hasRangeData) {
        this.selectionStartDot = this._makeSelectionDot(paper);
      }
    }

    this.outDotStyle = outDotStyle;
    this.groupPositions = groupPositions;
    this.dotOpacity = dotOpacity;
    this.pivotGroupDots = null;

    const seriesSet = paper.setFinish();
    this._moveSeriesToFrontAll();
    this.tooltipLine.toFront();

    return seriesSet;
  }

  /**
   * Rearrange all series sequences.
   * @private
   */
  _moveSeriesToFrontAll() {
    const len = this.groupPaths ? this.groupPaths.length : 0;
    for (let i = 0; i < len; i += 1) {
      this.moveSeriesToFront(this.groupAreas[i], this.groupDots[i]);
    }
  }

  /**
   * Get path for area chart.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions - positions
   * @param {boolean} [hasExtraPath] - whether has extra path or not
   * @param {boolean} [connectNulls] - boolean value connect nulls or not
   * @returns {*}
   * @private
   */
  _getAreaChartPath(groupPositions, hasExtraPath, connectNulls) {
    if (this.isSpline) {
      return this._makeSplineAreaChartPath(groupPositions, hasExtraPath);
    }

    return this._makeAreaChartPath(groupPositions, hasExtraPath, connectNulls);
  }

  /**
   * Render area graphs.
   * @param {object} paper paper
   * @param {Array.<object>} groupPaths group paths
   * @param {Array.<string>} colors colors
   * @param {number} lineWidth line width
   * @param {number} opacity opacity
   * @returns {Array} raphael objects
   * @private
   */
  _renderAreas(paper, groupPaths, colors, lineWidth, opacity) {
    colors = colors.slice(0, groupPaths.length);
    colors.reverse();
    groupPaths.reverse();

    const groupAreas = groupPaths.map((path, groupIndex) => {
      const polygons = {};
      const areaColor = colors[groupIndex] || 'transparent';
      const lineColor = areaColor;
      const area = raphaelRenderUtil.renderArea(paper, path.area.join(' '), {
        fill: areaColor,
        opacity,
        stroke: areaColor
      });
      const line = raphaelRenderUtil.renderLine(paper, path.line.join(' '), lineColor, lineWidth);

      area.node.setAttribute('class', CLASS_NAME_SVG_AUTOSHAPE);
      line.node.setAttribute('class', CLASS_NAME_SVG_AUTOSHAPE);

      polygons.area = area;
      polygons.line = line;

      if (path.startLine) {
        polygons.startLine = raphaelRenderUtil.renderLine(
          paper,
          path.startLine.join(' '),
          lineColor,
          0
        );
      }

      return polygons;
    });

    return groupAreas.reverse();
  }

  /**
   * Make height.
   * @param {number} top top
   * @param {number} startTop start top
   * @returns {number} height
   * @private
   */
  _makeHeight(top, startTop) {
    return Math.abs(top - startTop);
  }

  /**
   * Make areas path.
   * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
   * @param {boolean} [hasExtraPath] - whether has extra path or not
   * @returns {Array.<string | number>} path
   * @private
   */
  _makeAreasPath(positions, hasExtraPath) {
    const paths = [];
    const positionLength = positions.length;
    let path = [];
    let latterPath = [];
    let formerPath = [];
    let prevNull = false;

    Object.entries(positions).forEach(([index, position]) => {
      let moveOrLine;
      if (position) {
        if (prevNull) {
          moveOrLine = 'M';
          prevNull = false;
        } else {
          moveOrLine = 'L';
        }

        formerPath.push([moveOrLine, position.left, position.top]);
        latterPath.unshift(['L', position.left, position.startTop]);
      } else {
        prevNull = true;
        latterPath.push(['z']);
      }

      if (!position || parseInt(index, 10) === positionLength - 1) {
        paths.push(formerPath.concat(latterPath));
        formerPath = [];
        latterPath = [];
      }
    });

    paths.forEach(partialPath => {
      path = path.concat(partialPath);
    });

    if (hasExtraPath !== false) {
      const targetIndex = positions.length - 1;
      path.splice(targetIndex + 1, 0, path[targetIndex], path[targetIndex + 1]);
    }

    path = [].concat(...path);
    path[0] = 'M';

    return path;
  }

  /**
   * Make path for area chart.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
   * @param {boolean} [hasExtraPath] - whether has extra path or not
   * @param {boolean} [connectNulls] - boolean value connect nulls or not
   * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
   * @private
   */
  _makeAreaChartPath(groupPositions, hasExtraPath, connectNulls) {
    return groupPositions.map(positions => {
      const paths = {
        area: this._makeAreasPath(positions, hasExtraPath),
        line: this._makeLinesPath(positions, null, connectNulls)
      };

      if (this.hasRangeData) {
        paths.startLine = this._makeLinesPath(positions, 'startTop');
      }

      return paths;
    });
  }

  /**
   * Make spline path for area chart.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
   * @param {boolean} [hasExtraPath] - whether has extra path or not
   * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
   * @private
   */
  _makeSplineAreaChartPath(groupPositions, hasExtraPath) {
    return groupPositions.map(positions => {
      const reversePosition = positions
        .concat()
        .reverse()
        .map(position => ({
          left: position.left,
          top: position.startTop
        }));

      const linesPath = this._makeSplineLinesPath(positions);
      const reverseLinesPath = this._makeSplineLinesPath(reversePosition, {
        isReverseDirection: true,
        isBeConnected: true
      });

      const areaPath = JSON.parse(JSON.stringify(linesPath));
      const reverseAreaPath = JSON.parse(JSON.stringify(reverseLinesPath));

      if (hasExtraPath !== false) {
        const lastPosition = positions[positions.length - 1];
        const lastReversePosition = reversePosition[reversePosition.length - 1];

        areaPath.push(['K', lastPosition.left, lastPosition.top]);
        areaPath.push(['L', lastPosition.left, lastPosition.startTop]);

        reverseAreaPath.push(['K', lastReversePosition.left, lastReversePosition.top]);
        reverseAreaPath.push(['L', lastReversePosition.left, lastReversePosition.top]);
      }

      return {
        area: areaPath.concat(reverseAreaPath),
        line: linesPath
      };
    });
  }

  /**
   * Resize graph of area chart.
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
   */
  resize({ dimension, groupPositions, zeroTop }) {
    this.resizeClipRect(dimension.width, dimension.height);

    this.zeroTop = zeroTop;
    this.groupPositions = groupPositions;
    this.groupPaths = this._getAreaChartPath(groupPositions);
    this.paper.setSize(dimension.width, dimension.height);
    this.tooltipLine.attr({ top: dimension.height });

    this.groupPaths.forEach((path, groupIndex) => {
      const area = this.groupAreas[groupIndex];
      area.area.attr({ path: path.area.join(' ') });
      area.line.attr({ path: path.line.join(' ') });

      if (area.startLine) {
        area.startLine.attr({ path: path.startLine.join(' ') });
      }

      this.groupDots[groupIndex].forEach((item, index) => {
        const position = groupPositions[groupIndex][index];

        if (item.endDot) {
          this._moveDot(item.endDot.dot, position);
        }
        if (item.startDot) {
          const startPositon = Object.assign({}, position);
          startPositon.top = startPositon.startTop;
          this._moveDot(item.startDot.dot, startPositon);
        }
      });
    });
  }

  /**
   * Select legend.
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const noneSelected = snippet.isNull(legendIndex);

    if (this.selectedLegendIndex && this.selectedLegendIndex !== -1) {
      this.resetSeriesOrder(this.selectedLegendIndex);
    }

    this.selectedLegendIndex = legendIndex;

    this.groupAreas.forEach((area, groupIndex) => {
      const isSelectedLegend = legendIndex === groupIndex;
      const opacity = noneSelected || isSelectedLegend ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;
      const groupDots = this.groupDots[groupIndex];

      area.area.attr({ 'fill-opacity': opacity });
      area.line.attr({ 'stroke-opacity': opacity });

      if (area.startLine) {
        area.startLine.attr({ 'stroke-opacity': opacity });
      }

      if (isSelectedLegend) {
        this.moveSeriesToFront(area, groupDots);
      }
    });
  }

  /**
   * Reset series order after selected to be same to when it is first rendered
   * @param {number} legendIndex - legend index to reset series order
   * @ignore
   */
  resetSeriesOrder(legendIndex) {
    const frontSeries =
      legendIndex + 1 < this.groupAreas.length ? this.groupAreas[legendIndex + 1] : null;

    if (frontSeries) {
      const frontArea = frontSeries.area;
      this.groupAreas[legendIndex].area.insertBefore(frontArea);
      this.groupAreas[legendIndex].line.insertBefore(frontArea);
      this.groupDots[legendIndex].forEach(item => {
        if (item && item.endDot) {
          item.endDot.dot.insertBefore(frontArea);
        }
      });
    }
  }

  /**
   * @param {{area: {SVGElement}, line: {SVGElement}, startLine: {SVGElement}}} areaSurface - line or plane to represent area chart
   * @param {Array.<SVGElement>} dots - dot type element
   * @ignore
   * @override
   */
  moveSeriesToFront(areaSurface, dots) {
    areaSurface.line.toFront();
    areaSurface.area.toFront();

    if (areaSurface.startLine) {
      areaSurface.startLine.toFront();
    }

    dots.forEach(item => {
      item.endDot.dot.toFront();
      if (item.startDot) {
        item.startDot.dot.toFront();
      }
    });
  }

  /**
   * Animate for adding data.
   * @param {object} data - data for graph rendering
   * @param {number} tickSize - tick size
   * @param {Array.<Array.<object>>} groupPositions - group positions
   * @param {boolean} [shiftingOption] - shifting option
   * @param {number} zeroTop - position top value for zero point
   */
  animateForAddingData(data, tickSize, groupPositions, shiftingOption, zeroTop) {
    const groupPaths = this._getAreaChartPath(groupPositions, false);
    let additionalIndex = 0;

    if (!groupPositions.length) {
      return;
    }

    if (shiftingOption) {
      additionalIndex = 1;
    }

    this.zeroTop = zeroTop;

    this.groupAreas.forEach((area, groupIndex) => {
      const dots = this.groupDots[groupIndex];
      const groupPosition = groupPositions[groupIndex];
      const pathMap = groupPaths[groupIndex];

      if (shiftingOption) {
        this._removeFirstDot(dots);
      }

      dots.forEach((item, index) => {
        const position = groupPosition[index + additionalIndex];
        this._animateByPosition(item.endDot.dot, position, tickSize);

        if (item.startDot) {
          this._animateByPosition(
            item.startDot.dot,
            {
              left: position.left,
              top: position.startTop
            },
            tickSize
          );
        }
      });

      this._animateByPath(area.area, pathMap.area, tickSize);
      this._animateByPath(area.line, pathMap.line, tickSize);

      if (area.startLine) {
        this._animateByPath(area.startLine, pathMap.startLine, tickSize);
      }
    });
  }

  renderSeriesLabel(paper, groupPositions, groupLabels, labelTheme) {
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      'text-anchor': 'middle',
      opacity: 0
    };
    const set = paper.set();

    groupLabels.forEach((categoryLabel, categoryIndex) => {
      categoryLabel.forEach((label, seriesIndex) => {
        const position = groupPositions[categoryIndex][seriesIndex];
        const endLabel = raphaelRenderUtil.renderText(paper, position.end, label.end, attributes);

        set.push(endLabel);

        endLabel.node.style.userSelect = 'none';
        endLabel.node.style.cursor = 'default';
        endLabel.node.setAttribute('filter', 'url(#glow)');

        if (position.start) {
          const startLabel = raphaelRenderUtil.renderText(
            paper,
            position.start,
            label.start,
            attributes
          );

          startLabel.node.style.userSelect = 'none';
          startLabel.node.style.cursor = 'default';
          startLabel.node.setAttribute('filter', 'url(#glow)');

          set.push(startLabel);
        }
      });
    });

    return set;
  }

  /**
   * Test areaOpacity is a number, and return the result.
   * It is used to determine whether to set a default value, 0.5.
   * If it is not a number, areaOpacity will be changed to the default value, 0.5.
   * @param {*} areaOpacity - value of property `options.areaOpacity`
   * @returns {boolean} - whether areaOpacity is a number.
   * @private
   */
  _isAreaOpacityNumber(areaOpacity) {
    const isNumber = snippet.isNumber(areaOpacity);

    if (isNumber) {
      if (areaOpacity < 0 || areaOpacity > 1) {
        consoleUtil.print(GUIDE_AREACHART_AREAOPACITY_TYPE, 'warn');
      }
    } else if (!snippet.isUndefined(areaOpacity)) {
      consoleUtil.print(GUIDE_AREACHART_AREAOPACITY_TYPE, 'error');
    }

    return isNumber;
  }
}

export default RaphaelAreaChart;
