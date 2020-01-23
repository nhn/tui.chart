/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphaelRenderUtil from './raphaelRenderUtil';
import renderUtil from '../helpers/renderUtil';
import predicate from '../helpers/predicate';
import arrayUtil from '../helpers/arrayUtil';
import chartConst from '../const';
import snippet from 'tui-code-snippet';

const { browser } = snippet;
const IS_LTE_IE8 = browser.msie && browser.version <= 8;
const DEFAULT_DOT_RADIUS = 6;
const SELECTION_DOT_RADIUS = 7;
const DE_EMPHASIS_OPACITY = 0.3;
const MOVING_ANIMATION_DURATION = 300;
const CHART_HOVER_STATUS_OVER = 'over';
const CHART_HOVER_STATUS_OUT = 'out';

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 * @private
 */
class RaphaelLineTypeBase {
  /**
   * Make lines path.
   * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
   * @param {?string} [posTopType='top'] position top type
   * @param {boolean} [connectNulls] - boolean value connect nulls or not
   * @returns {Array.<string | number>} paths
   * @private
   */
  _makeLinesPath(positions, posTopType, connectNulls) {
    let path = [];
    let prevMissing = false;

    posTopType = posTopType || 'top';
    [].concat(positions).forEach(position => {
      const pathCommand = prevMissing && !connectNulls ? 'M' : 'L';

      if (position) {
        path.push([pathCommand, position.left, position[posTopType]]);
        if (prevMissing) {
          prevMissing = false;
        }
      } else {
        prevMissing = true;
      }
    });

    path = [].concat(...path);

    if (path.length > 0) {
      path[0] = 'M';
    }

    return path;
  }

  /**
   * Get anchor. (http://raphaeljs.com/analytics.js)
   * @param {{left: number, top: number}} fromPos from position
   * @param {{left: number, top: number}} pos position
   * @param {{left: number, top: number}} nextPos next position
   * @param {?boolean} [isReverseDirection] - True when the line is drawn from right to left
   * @returns {{x1: number, y1: number, x2: number, y2: number}} anchor
   * @private
   */
  _getAnchor(fromPos, pos, nextPos, isReverseDirection) {
    const l1 = (pos.left - fromPos.left) / 2;
    const l2 = (nextPos.left - pos.left) / 2;
    let a, b;

    if (isReverseDirection) {
      a = Math.atan((fromPos.left - pos.left) / Math.abs(fromPos.top - pos.top));
      b = Math.atan((pos.left - nextPos.left) / Math.abs(nextPos.top - pos.top));
    } else {
      a = Math.atan((pos.left - fromPos.left) / Math.abs(pos.top - fromPos.top));
      b = Math.atan((nextPos.left - pos.left) / Math.abs(pos.top - nextPos.top));
    }

    a = fromPos.top < pos.top ? Math.PI - a : a;
    b = nextPos.top < pos.top ? Math.PI - b : b;
    const alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;
    const dx1 = l1 * Math.sin(alpha + a);
    const dy1 = l1 * Math.cos(alpha + a);
    const dx2 = l2 * Math.sin(alpha + b);
    const dy2 = l2 * Math.cos(alpha + b);
    const result = {
      x1: pos.left - dx1,
      y1: pos.top + dy1,
      x2: pos.left + dx2,
      y2: pos.top + dy2
    };

    if (isReverseDirection) {
      result.y1 = pos.top - dy1;
      result.y2 = pos.top - dy2;
    }

    return result;
  }

  /**
   * Get spline positions groups which is divided with null data value.
   * If series has not divided positions, it returns only one positions group.
   * @param {Array.<object>} positions positions array
   * @param {boolean} connectNulls option of connect line of both null data's side
   * @Returns {Array.<Array.<object>>}
   * @private
   */
  _getSplinePositionsGroups(positions, connectNulls) {
    const positionsGroups = [];
    let positionsGroup = [];
    positions.forEach((position, index) => {
      const isLastIndex = index === positions.length - 1;

      if (position) {
        positionsGroup.push(position);
      }

      if ((!position && positionsGroup.length > 0 && !connectNulls) || isLastIndex) {
        positionsGroups.push(positionsGroup);
        positionsGroup = [];
      }
    });

    return positionsGroups;
  }

  /**
   * Get spline partial paths
   * @param {Array.<Array.<object>>} positionsGroups positions groups
   * @param {?boolean} [isReverseDirection] - True when the line is drawn from right to left
   * @returns {Array.<Array.<Array>>}
   * @private
   */
  _getSplinePartialPaths(positionsGroups, isReverseDirection) {
    const paths = [];
    let lastPos, positionsLen, fromPos, middlePositions, path;

    positionsGroups.forEach(dataPositions => {
      let [prevPos] = dataPositions;
      const firstPos = prevPos;
      positionsLen = dataPositions.length;
      fromPos = firstPos;
      lastPos = dataPositions[positionsLen - 1];
      middlePositions = dataPositions.slice(1).slice(0, positionsLen - 2);

      path = middlePositions.map((position, index) => {
        const nextPos = dataPositions[index + 2];
        const anchor = this._getAnchor(fromPos, position, nextPos, isReverseDirection);

        fromPos = position;

        if (Math.abs(anchor.y1 - prevPos.top) > Math.abs(prevPos.top - position.top)) {
          anchor.y1 = position.top;
        }

        if (Math.abs(anchor.y2 - nextPos.top) > Math.abs(nextPos.top - position.top)) {
          anchor.y2 = position.top;
        }

        prevPos = position;

        return [anchor.x1, anchor.y1, position.left, position.top, anchor.x2, anchor.y2];
      });

      path.push([lastPos.left, lastPos.top, lastPos.left, lastPos.top]);
      path.unshift(['M', firstPos.left, firstPos.top, 'C', firstPos.left, firstPos.top]);
      paths.push(path);
    });

    return paths;
  }

  /**
   * Make spline lines path.
   * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
   * @param {?object} [makeLineOptions] - options for make spline line
   *   @param {?boolean} [makeLineOptions.connectNulls] - boolean value connect nulls or not
   *   @param {?boolean} [makeLineOptions.isReverseDirection] - True when the line is drawn from right to left
   *   @param {?boolean} [makeLineOptions.isBeConnected] - True when part of another line.
   * @returns {Array.<string | number>} paths
   * @private
   */
  _makeSplineLinesPath(positions, makeLineOptions = {}) {
    const positionsGroups = this._getSplinePositionsGroups(positions, makeLineOptions.connectNulls);
    const partialPaths = this._getSplinePartialPaths(
      positionsGroups,
      makeLineOptions.isReverseDirection
    );
    let path = [];

    partialPaths.forEach(partialPath => {
      path = path.concat(partialPath);
    });

    if (makeLineOptions.isBeConnected) {
      path[0] = path[0].slice(3);
    }

    return path;
  }

  /**
   * Render tooltip line.
   * @param {object} paper raphael paper
   * @param {number} height height
   * @returns {object} raphael object
   * @private
   */
  _renderTooltipLine(paper, height) {
    const linePath = raphaelRenderUtil.makeLinePath(
      {
        left: 10,
        top: height
      },
      {
        left: 10,
        top: 0
      }
    );

    return raphaelRenderUtil.renderLine(paper, linePath, 'transparent', 1);
  }

  appendShadowFilterToDefs() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    const feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');

    filter.setAttributeNS(null, 'id', 'shadow');
    filter.setAttributeNS(null, 'x', '-50%');
    filter.setAttributeNS(null, 'y', '-50%');
    filter.setAttributeNS(null, 'width', '180%');
    filter.setAttributeNS(null, 'height', '180%');
    feOffset.setAttributeNS(null, 'result', 'offOut');
    feOffset.setAttributeNS(null, 'in', 'SourceAlpha');
    feOffset.setAttributeNS(null, 'dx', '0');
    feOffset.setAttributeNS(null, 'dy', '0');
    feGaussianBlur.setAttributeNS(null, 'result', 'blurOut');
    feGaussianBlur.setAttributeNS(null, 'in', 'offOut');
    feGaussianBlur.setAttributeNS(null, 'stdDeviation', '2');
    feBlend.setAttributeNS(null, 'in', 'SourceGraphic');
    feBlend.setAttributeNS(null, 'in2', 'blurOut');
    feBlend.setAttributeNS(null, 'mode', 'normal');
    filter.appendChild(feOffset);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feBlend);
    this.paper.defs.appendChild(filter);
  }

  /**
   * Make border style.
   * @param {string} borderColor border color
   * @param {number} opacity opacity
   * @param {number} borderWidth border width
   * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style
   */
  makeBorderStyle(borderColor, opacity, borderWidth) {
    const borderStyle = {
      'stroke-width': borderWidth,
      'stroke-opacity': opacity
    };

    if (borderColor) {
      borderStyle.stroke = borderColor;
    }

    return borderStyle;
  }

  /**
   * Make dot style for mouseout event.
   * @param {number} opacity opacity
   * @param {object} borderStyle border style
   * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style
   */
  makeOutDotStyle(opacity, borderStyle) {
    const outDotStyle = {
      'fill-opacity': opacity,
      'stroke-opacity': opacity,
      r: DEFAULT_DOT_RADIUS
    };

    if (borderStyle) {
      snippet.extend(outDotStyle, borderStyle);
    }

    return outDotStyle;
  }

  /**
   * Render dot.
   * @param {object} paper raphael papaer
   * @param {{left: number, top: number}} position dot position
   * @param {string} color dot color
   * @param {number} opacity opacity
   * @returns {object} raphael dot
   */
  renderDot(paper, position, color, opacity) {
    const dotTheme = (this.theme && this.theme.dot) || { dot: {} };
    let raphaelDot;

    if (position) {
      const dot = paper.circle(
        position.left,
        position.top,
        !snippet.isUndefined(dotTheme.radius) ? dotTheme.radius : DEFAULT_DOT_RADIUS
      );
      const dotStyle = {
        fill: dotTheme.fillColor || color,
        'fill-opacity': snippet.isNumber(opacity) ? opacity : dotTheme.fillOpacity,
        stroke: dotTheme.strokeColor || color,
        'stroke-opacity': snippet.isNumber(opacity) ? opacity : dotTheme.strokeOpacity,
        'stroke-width': dotTheme.strokeWidth
      };

      dot.attr(dotStyle);

      raphaelDot = {
        dot,
        color
      };
    }

    return raphaelDot;
  }

  /**
   * Move dots to front.
   * @param {Array.<{startDot: {dot: object}, endDot: {dot: object}}>} dots - dots
   * @private
   */
  _moveDotsToFront(dots) {
    raphaelRenderUtil.forEach2dArray(dots, dotInfo => {
      dotInfo.endDot.dot.toFront();
      if (dotInfo.startDot) {
        dotInfo.startDot.dot.toFront();
      }
    });
  }

  /**
   * Render dots.
   * @param {object} paper raphael paper
   * @param {Array.<Array.<object>>} groupPositions positions
   * @param {string[]} colors colors
   * @param {number} opacity opacity
   * @param {Array.<object>} [seriesSet] series set
   * @returns {Array.<object>} dots
   * @private
   */
  _renderDots(paper, groupPositions, colors, opacity, seriesSet) {
    const dots = groupPositions.map((positions, groupIndex) => {
      const color = colors[groupIndex];

      return Object.values(positions).map(position => {
        const dotMap = {
          endDot: this.renderDot(paper, position, color, opacity)
        };

        if (this.hasRangeData) {
          const startPosition = snippet.extend({}, position);
          startPosition.top = startPosition.startTop;
          dotMap.startDot = this.renderDot(paper, startPosition, color, opacity);
        }

        if (seriesSet) {
          seriesSet.push(dotMap.endDot.dot);
          if (dotMap.startDot) {
            seriesSet.push(dotMap.startDot.dot);
          }
        }

        return dotMap;
      });
    });

    return dots;
  }

  /**
   * Get center position
   * @param {{left: number, top: number}} fromPos from position
   * @param {{left: number, top: number}} toPos to position
   * @returns {{left: number, top: number}} position
   * @private
   */
  _getCenter(fromPos, toPos) {
    return {
      left: (fromPos.left + toPos.left) / 2,
      top: (fromPos.top + toPos.top) / 2
    };
  }

  /**
   * Show dot.
   * @param {object} dotInformation raphael object
   * @param {number} groupIndex seriesIndex
   * @private
   */
  _showDot(dotInformation, groupIndex) {
    const hoverTheme = this.theme.dot.hover;
    const attributes = {
      'fill-opacity': hoverTheme.fillOpacity,
      stroke: hoverTheme.strokeColor || dotInformation.color,
      'stroke-opacity': hoverTheme.strokeOpacity,
      'stroke-width': hoverTheme.strokeWidth,
      r: hoverTheme.radius,
      filter: 'url(#shadow)'
    };

    this._setPrevDotAttributes(groupIndex, dotInformation.dot);

    if (hoverTheme.fillColor) {
      attributes.fill = hoverTheme.fillColor;
    }

    dotInformation.dot.attr(attributes);
    if (dotInformation.dot.node) {
      dotInformation.dot.node.setAttribute('filter', 'url(#shadow)');
    }
    dotInformation.dot.toFront();
  }

  /**
   * temp save dot style attribute
   * @param {number} groupIndex seriesIndex
   * @param {object} dot raphael circle object
   * @private
   */
  _setPrevDotAttributes(groupIndex, dot) {
    if (!this._prevDotAttributes) {
      this._prevDotAttributes = {};
    }
    this._prevDotAttributes[groupIndex] = dot.attr();
  }

  /**
   * Update line stroke width.
   * @param {string} changeType over or out
   * @param {object} line raphael object
   * @private
   */
  _updateLineStrokeOpacity(changeType, line) {
    let opacity = 1;
    const isSelectedLegend = !snippet.isNull(this.selectedLegendIndex);
    if (this.groupLines) {
      if (changeType === CHART_HOVER_STATUS_OVER || isSelectedLegend) {
        opacity = this.chartType === 'radial' && this.showArea ? 0 : DE_EMPHASIS_OPACITY;
      }

      if (changeType === CHART_HOVER_STATUS_OUT && isSelectedLegend) {
        line = this.getLine(this.selectedLegendIndex);
      }

      this.groupLines.forEach(otherLine => {
        otherLine.attr({
          'stroke-opacity': opacity
        });
      });
      line.attr({
        'stroke-opacity': 1
      });
    }
  }

  /**
   * Get the raphael line element with groupIndex
   * @param {number} groupIndex  group index
   * @returns {object} line raphael object
   */
  getLine(groupIndex) {
    return this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex];
  }

  /**
   * Update line stroke width.
   * @param {string} changeType over or out
   * @private
   */
  _updateAreaOpacity(changeType) {
    if (this.groupAreas) {
      this.groupAreas.forEach(otherArea => {
        otherArea.area.attr({
          'fill-opacity': changeType === CHART_HOVER_STATUS_OVER ? DE_EMPHASIS_OPACITY : 1
        });
      });
    }
  }

  /**
   * Update line stroke width.
   * @param {object} line raphael object
   * @param {number} strokeWidth stroke width
   * @private
   */
  _updateLineStrokeWidth(line, strokeWidth) {
    const changeAttr = {
      'stroke-width': strokeWidth
    };
    if (line.attrs) {
      changeAttr.stroke = line.attrs.stroke;
    }
    line.attr(changeAttr);
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  showAnimation(data) {
    const groupIndex = data.index;
    const groupDot = this.groupDots[groupIndex];
    const item = this._findDotItem(groupDot, data.groupIndex);

    let line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex];
    let strokeWidth, startLine;

    if (!item) {
      return;
    }

    if (this.chartType === 'area') {
      ({ startLine, line } = line);
      strokeWidth = 5;
      this._updateAreaOpacity(CHART_HOVER_STATUS_OVER);
    } else {
      strokeWidth = this.lineWidth;
    }

    this._updateLineStrokeOpacity(CHART_HOVER_STATUS_OVER, line);
    this._updateLineStrokeWidth(line, strokeWidth);
    if (startLine) {
      this._updateLineStrokeWidth(startLine, strokeWidth);
    }

    this._showDot(item.endDot, groupIndex);

    if (item.startDot) {
      this._showDot(item.startDot, groupIndex);
    }
  }

  /**
   * Find dot item
   * @param {Array.<Object>} groupDot - groupDot info
   * @param {number} index - dot index
   * @returns {Object} - raphael object
   * @private
   */
  _findDotItem(groupDot = [], index) {
    const isRadialChart = predicate.isRadialChart(this.chartType);

    // For radial charts, the position path is one more than the length of the data.
    if (isRadialChart && groupDot.length === index) {
      index = 0;
    }

    return groupDot[index];
  }

  /**
   * Get pivot group dots.
   * @returns {Array.<Array>} dots
   * @private
   */
  _getPivotGroupDots() {
    if (!this.pivotGroupDots && this.groupDots) {
      this.pivotGroupDots = arrayUtil.pivot(this.groupDots);
    }

    return this.pivotGroupDots;
  }

  /**
   * Show group dots.
   * @param {number} index index
   * @private
   */
  _showGroupDots(index) {
    const groupDots = this._getPivotGroupDots();

    if (!groupDots || !groupDots[index]) {
      return;
    }

    groupDots[index].forEach((item, groupIndex) => {
      if (item.endDot) {
        this._showDot(item.endDot, groupIndex);
      }

      if (item.startDot) {
        this._showDot(item.startDot, groupIndex);
      }
    });
  }

  /**
   * Show line for group tooltip.
   * @param {{
   *      dimension: {width: number, height: number},
   *      position: {left: number, top: number}
   * }} bound bound
   * @param {object} layout layout
   */
  showGroupTooltipLine(bound, layout) {
    const left = Math.max(bound.position.left, 11);
    const linePath = raphaelRenderUtil.makeLinePath(
      {
        left,
        top: layout.position.top + bound.dimension.height
      },
      {
        left,
        top: layout.position.top
      }
    );

    if (this.tooltipLine) {
      this.tooltipLine.attr({
        path: linePath,
        stroke: '#999',
        'stroke-opacity': 1
      });
    }
  }

  /**
   * Show group animation.
   * @param {number} index index
   */
  showGroupAnimation(index) {
    this._showGroupDots(index);
  }

  /**
   * Hide dot.
   * @param {object} dot raphael object
   * @param {number} groupIndex seriesIndex
   * @param {?number} opacity opacity
   * @private
   */
  _hideDot(dot, groupIndex, opacity) {
    const prev = this._prevDotAttributes[groupIndex];
    let { outDotStyle } = this;

    // if prev data exists, use prev.r
    // there is dot disappearing issue, when hideDot
    if (prev && !snippet.isUndefined(opacity)) {
      outDotStyle = snippet.extend({
        r: prev.r,
        stroke: prev.stroke,
        fill: prev.fill,
        'stroke-opacity': prev['stroke-opacity'],
        'stroke-width': prev['stroke-width'],
        'fill-opacity': prev['fill-opacity']
      });
    }

    dot.attr(outDotStyle);
    if (dot.node) {
      dot.node.setAttribute('filter', '');
    }

    this.resetSeriesOrder(groupIndex);
  }

  /**
   * Hide animation.
   * @param {{groupIndex: number, index:number}} data hide info
   */
  hideAnimation(data) {
    const index = data.groupIndex; // Line chart has pivot values.
    const groupIndex = data.index;
    const groupDot = this.groupDots[groupIndex];
    const item = this._findDotItem(groupDot, index);

    let line, strokeWidth, startLine;
    let opacity = this.dotOpacity;

    if (!item) {
      return;
    }

    line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex];

    if (this.chartType === 'area') {
      strokeWidth = this.lineWidth;
      ({ startLine, line } = line);
      this._updateAreaOpacity(CHART_HOVER_STATUS_OUT);
    } else {
      strokeWidth = this.lineWidth;
    }

    if (
      opacity &&
      !snippet.isNull(this.selectedLegendIndex) &&
      this.selectedLegendIndex !== groupIndex
    ) {
      opacity = DE_EMPHASIS_OPACITY;
    }

    this._updateLineStrokeOpacity(CHART_HOVER_STATUS_OUT, line);
    this._updateLineStrokeWidth(line, strokeWidth);

    if (startLine) {
      this._updateLineStrokeWidth(startLine, strokeWidth);
    }

    if (item) {
      this._hideDot(item.endDot.dot, groupIndex, opacity);

      if (item.startDot) {
        this._hideDot(item.startDot.dot, groupIndex, opacity);
      }
    }
  }

  /**
   * Hide group dots.
   * @param {number} index index
   * @private
   */
  _hideGroupDots(index) {
    const hasSelectedIndex = !snippet.isNull(this.selectedLegendIndex);
    const baseOpacity = this.dotOpacity;
    const groupDots = this._getPivotGroupDots();

    if (!groupDots || !groupDots[index]) {
      return;
    }

    groupDots[index].forEach((item, groupIndex) => {
      let opacity = baseOpacity;

      if (opacity && hasSelectedIndex && this.selectedLegendIndex !== groupIndex) {
        opacity = DE_EMPHASIS_OPACITY;
      }

      if (item.endDot) {
        this._hideDot(item.endDot.dot, groupIndex, opacity);
      }

      if (item.startDot) {
        this._hideDot(item.startDot.dot, groupIndex, opacity);
      }
    });
  }

  /**
   * Hide line for group tooltip.
   */
  hideGroupTooltipLine() {
    this.tooltipLine.attr({
      'stroke-opacity': 0
    });
  }

  /**
   * Hide group animation.
   * @param {number} index index
   */
  hideGroupAnimation(index) {
    this._hideGroupDots(index);
  }

  /**
   * Move dot.
   * @param {object} dot - raphael object
   * @param {{left: number, top: number}} position - position
   * @private
   */
  _moveDot(dot, position) {
    let dotAttrs = {
      cx: position.left,
      cy: position.top
    };

    if (this.dotOpacity) {
      dotAttrs = snippet.extend({ 'fill-opacity': this.dotOpacity }, dotAttrs, this.borderStyle);
    }

    dot.attr(dotAttrs);
  }

  /**
   * Animate.
   * @param {function} onFinish callback
   * @param {Array.<object>} seriesSet series set
   */
  animate(onFinish, seriesSet) {
    const { paper, dimension, position, animationDuration } = this;
    const clipRectId = this._getClipRectId();
    const remakePosition = this._makeClipRectPosition(position);
    let { clipRect } = this;

    if (!IS_LTE_IE8 && dimension) {
      if (!clipRect) {
        clipRect = createClipPathRectWithLayout(
          paper,
          remakePosition,
          dimension,
          clipRectId,
          !!animationDuration
        );
        this.clipRect = clipRect;
      } else {
        this._makeClipRectPosition(position);
        clipRect.attr({
          width: animationDuration ? 0 : dimension.width,
          height: dimension.height,
          x: remakePosition.left,
          y: remakePosition.top
        });
      }

      seriesSet.forEach(seriesElement => {
        seriesElement.node.setAttribute('clip-path', `url(#${clipRectId})`);
      });

      if (animationDuration) {
        clipRect.animate(
          {
            width: dimension.width
          },
          animationDuration,
          '>',
          onFinish
        );
      }
    }
  }

  /**
   * Make selection dot.
   * @param {object} position clip rect position
   *   @param {number} left clip rect left position
   *   @param {number} top clip rect top position
   * @returns {{top: number, left: number}} remake clip rect position
   * @private
   */
  _makeClipRectPosition(position) {
    return {
      left: position.left - chartConst.SERIES_EXPAND_SIZE,
      top: position.top - chartConst.SERIES_EXPAND_SIZE
    };
  }

  /**
   * Make selection dot.
   * @param {object} paper raphael paper
   * @returns {object} selection dot
   * @private
   */
  _makeSelectionDot(paper) {
    const selectionDot = paper.circle(0, 0, SELECTION_DOT_RADIUS);

    selectionDot.attr({
      fill: '#ffffff',
      'fill-opacity': 0,
      'stroke-opacity': 0,
      'stroke-width': 2
    });

    return selectionDot;
  }

  /**
   * Select series.
   * @param {{groupIndex: number, index: number}} indexes indexes
   */
  selectSeries(indexes) {
    const item = this.groupDots[indexes.index][indexes.groupIndex];
    const position = this.groupPositions[indexes.index][indexes.groupIndex];

    this.selectedItem = item;
    this.selectionDot.attr({
      cx: position.left,
      cy: position.top,
      'fill-opacity': 0.5,
      'stroke-opacity': 1,
      stroke: this.selectionColor || item.endDot.color
    });

    if (this.selectionStartDot) {
      this.selectionStartDot.attr({
        cx: position.left,
        cy: position.startTop,
        'fill-opacity': 0.5,
        'stroke-opacity': 1,
        stroke: this.selectionColor || item.startDot.color
      });
    }
  }

  /**
   * Unselect series.
   * @param {{groupIndex: number, index: number}} indexes indexes
   */
  unselectSeries(indexes) {
    const item = this.groupDots[indexes.index][indexes.groupIndex];

    if (this.selectedItem === item) {
      this.selectionDot.attr({
        'fill-opacity': 0,
        'stroke-opacity': 0
      });
    }

    if (this.selectionStartDot) {
      this.selectionStartDot.attr({
        'fill-opacity': 0,
        'stroke-opacity': 0
      });
    }
  }

  /**
   * Set width or height of paper.
   * @param {number} width - width
   * @param {number} height - height
   */
  setSize(width, height) {
    width = width || this.dimension.width;
    height = height || this.dimension.height;
    this.paper.setSize(width, height);
  }

  /**
   * Animate by position.
   * @param {object} raphaelObj - raphael object
   * @param {{left: number, top: number}} position - position
   * @param {number} tickSize tick size
   * @private
   */
  _animateByPosition(raphaelObj, position, tickSize) {
    const attr = {
      cx: position.left,
      cy: position.top
    };

    if (snippet.isExisty(tickSize)) {
      attr.transform = `t-${tickSize},0`;
    }

    raphaelObj.animate(attr, MOVING_ANIMATION_DURATION);
  }

  /**
   * Animate by path.
   * @param {object} raphaelObj - raphael object
   * @param {Array.<string | number>} paths - paths
   * @param {number} tickSize tick size
   * @private
   */
  _animateByPath(raphaelObj, paths, tickSize) {
    const attr = {
      path: paths.join(' ')
    };

    if (snippet.isExisty(tickSize)) {
      attr.transform = `t-${tickSize},0`;
    }

    raphaelObj.animate(attr, MOVING_ANIMATION_DURATION);
  }

  /**
   * Remove first dot.
   * @param {Array.<object>} dots - dots
   * @private
   */
  _removeFirstDot(dots) {
    const firstDot = dots.shift();

    firstDot.endDot.dot.remove();

    if (firstDot.startDot) {
      firstDot.startDot.dot.remove();
    }
  }

  /**
   * Clear paper.
   */
  clear() {
    delete this.paper.dots;
    this.paper.clear();
  }

  /**
   * Resize clip rect size
   * @param {number} width series width
   * @param {number} height series height
   */
  resizeClipRect(width, height) {
    const clipRect = this.paper.getById(`${this._getClipRectId()}_rect`);

    clipRect.attr({
      width,
      height
    });
  }

  /**
   * Set clip rect id
   * @returns {string} id - clip rect id
   * @private
   */
  _getClipRectId() {
    if (!this.clipRectId) {
      this.clipRectId = renderUtil.generateClipRectId();
    }

    return this.clipRectId;
  }

  /**
   * Reset series order after selected to be same to when it is first rendered
   * @param {number} legendIndex - legend index to reset series order
   * @ignore
   * @abstract
   */
  resetSeriesOrder() {}

  /**
   * @param {SVGElement | {area: {SVGElement}, line: {SVGElement}, startLine: {SVGElement}}} lineType - line or area graph
   * @param {Array.<SVGElement>} dots - dot type element
   * @abstract
   */
  moveSeriesToFront() {}
}

/**
 * Create clip rect with layout
 * @param {object} paper Raphael paper
 * @param {object} position position
 * @param {object} dimension dimension
 * @param {string} id ID string
 * @param {boolean} isAnimated animation
 * @returns {object}
 * @ignore
 */
function createClipPathRectWithLayout(paper, position, dimension, id, isAnimated) {
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  const rect = paper.rect(
    position.left,
    position.top,
    isAnimated ? 0 : dimension.width,
    dimension.height
  );

  rect.id = `${id}_rect`;
  clipPath.id = id;

  clipPath.appendChild(rect.node);
  paper.defs.appendChild(clipPath);

  return rect;
}

export default RaphaelLineTypeBase;
