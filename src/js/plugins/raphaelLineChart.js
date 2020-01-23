/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import RaphaelLineBase from './raphaelLineTypeBase';
import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';

const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;

class RaphaelLineChart extends RaphaelLineBase {
  /**
   * RaphaelLineCharts is graph renderer for line chart.
   * @constructs RaphaelLineChart
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
    this.chartType = 'line';

    /**
     * Line width
     * @type {number}
     */
    this.lineWidth = 6;
  }

  /**
   * Render function of line chart.
   * @param {object} [paper] - raphael paper
   * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
   * @returns {object} paper raphael paper
   */
  render(paper, data) {
    const { dimension, groupPositions, theme, options, position } = data;
    const { colors } = theme;
    const opacity = options.showDot ? 1 : 0;
    const isSpline = options.spline;
    const lineWidth = (this.lineWidth = snippet.isNumber(options.pointWidth)
      ? options.pointWidth
      : this.lineWidth);
    const borderStyle = this.makeBorderStyle(theme.dot.strokeColor, opacity, theme.dot.strokeWidth);
    const outDotStyle = this.makeOutDotStyle(opacity, borderStyle);
    let groupPaths;

    if (isSpline) {
      groupPaths = this._getSplineLinesPath(groupPositions, options.connectNulls);
    } else {
      groupPaths = this._getLinesPath(groupPositions, options.connectNulls);
    }

    this.paper = paper;
    this.theme = theme;
    this.isSpline = isSpline;
    this.dimension = dimension;
    this.position = position;

    paper.setStart();

    this.groupLines = this._renderLines(paper, groupPaths, colors, lineWidth);
    this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
    this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

    if (options.allowSelect) {
      this.selectionDot = this._makeSelectionDot(paper);
      this.selectionColor = theme.selectionColor;
    }
    this.colors = colors;
    this.borderStyle = borderStyle;
    this.outDotStyle = outDotStyle;
    this.groupPositions = groupPositions;
    this.groupPaths = groupPaths;
    this.dotOpacity = opacity;
    this.animationDuration = options.animationDuration;

    delete this.pivotGroupDots;

    if (paper.raphael.svg) {
      this.appendShadowFilterToDefs();
    }

    return paper.setFinish();
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
   * Get lines path.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
   * @param {boolean} [connectNulls] - boolean value connect nulls or not
   * @returns {Array.<Array.<string>>} path
   * @private
   */
  _getLinesPath(groupPositions, connectNulls) {
    return groupPositions.map(positions => this._makeLinesPath(positions, null, connectNulls));
  }

  /**
   * Get spline lines path.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
   * @param {boolean} [connectNulls] - boolean value connect nulls or not
   * @returns {Array} path
   * @private
   */
  _getSplineLinesPath(groupPositions, connectNulls) {
    return groupPositions.map(positions => this._makeSplineLinesPath(positions, { connectNulls }));
  }

  /**
   * Render lines.
   * @param {object} paper raphael paper
   * @param {Array.<Array.<string>>} groupPaths paths
   * @param {string[]} colors line colors
   * @param {?number} strokeWidth stroke width
   * @returns {Array.<Array.<object>>} lines
   * @private
   */
  _renderLines(paper, groupPaths, colors, strokeWidth) {
    return groupPaths.map((path, groupIndex) => {
      const color = colors[groupIndex] || 'transparent';
      const line = raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);
      line.node.setAttribute('class', 'auto-shape-rendering');

      return line;
    });
  }

  /**
   * Resize graph of line chart.
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
   */
  resize(params) {
    const { dimension, groupPositions } = params;

    this.resizeClipRect(dimension.width, dimension.height);

    this.groupPositions = groupPositions;
    this.groupPaths = this.isSpline
      ? this._getSplineLinesPath(groupPositions)
      : this._getLinesPath(groupPositions);
    this.paper.setSize(dimension.width, dimension.height);
    this.tooltipLine.attr({ top: dimension.height });

    this.groupPaths.forEach((path, groupIndex) => {
      this.groupLines[groupIndex].attr({ path: path.join(' ') });

      this.groupDots[groupIndex].forEach((item, index) => {
        if (item.endDot) {
          this._moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
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

    this.groupLines.forEach((line, groupIndex) => {
      const isSelectedLegend = legendIndex === groupIndex;
      const opacity = noneSelected || isSelectedLegend ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;
      const groupDots = this.groupDots[groupIndex];

      line.attr({ 'stroke-opacity': opacity });

      if (isSelectedLegend) {
        this.moveSeriesToFront(line, groupDots);
      }
    });

    if (noneSelected) {
      this.groupLines.forEach((line, groupIndex) => {
        this.moveSeriesToFront(line, this.groupDots[groupIndex]);
      });
    }
  }

  /**
   * Reset series order after selected to be same to when it is first rendered
   * @param {number} legendIndex - legend index to reset series order
   * @ignore
   */
  resetSeriesOrder(legendIndex) {
    const frontLine =
      legendIndex + 1 < this.groupLines.length ? this.groupLines[legendIndex + 1] : null;

    if (frontLine) {
      this.groupLines[legendIndex].insertBefore(frontLine);
      this.groupDots[legendIndex].forEach(item => {
        if (item && item.endDot) {
          item.endDot.dot.insertBefore(frontLine);
        }
      });
    }
  }

  /**
   * @param {SVGElement} lineType - line or area graph
   * @param {Array.<SVGElement>} dots - dot type element
   * @ignore
   * @override
   */
  moveSeriesToFront(lineType, dots) {
    lineType.toFront();

    dots.forEach(item => {
      item.endDot.dot.toFront();
    });
  }

  /**
   * Animate for adding data.
   * @param {object} data - data for graph rendering
   * @param {number} tickSize - tick size
   * @param {Array.<Array.<object>>} groupPositions - group positions
   * @param {boolean} [shiftingOption] - shifting option
   */
  animateForAddingData(data, tickSize, groupPositions, shiftingOption) {
    const isSpline = data.options.spline;
    const groupPaths = isSpline
      ? this._getSplineLinesPath(groupPositions)
      : this._getLinesPath(groupPositions);
    let additionalIndex = 0;

    if (!groupPositions.length) {
      return;
    }

    if (shiftingOption) {
      additionalIndex = 1;
    }

    this.groupLines.forEach((line, groupIndex) => {
      const dots = this.groupDots[groupIndex];
      const groupPosition = groupPositions[groupIndex];

      if (shiftingOption) {
        this._removeFirstDot(dots);
      }

      dots.forEach((item, index) => {
        const position = groupPosition[index + additionalIndex];
        this._animateByPosition(item.endDot.dot, position, tickSize);
      });

      this._animateByPath(line, groupPaths[groupIndex], tickSize);
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
}

export default RaphaelLineChart;
