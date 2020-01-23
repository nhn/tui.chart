/**
 * @fileoverview Raphael radial line series renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import RaphaelLineTypeBase from './raphaelLineTypeBase';
import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';

const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;
const DEFAULT_LINE_WIDTH = 6;

class RaphaelRadialLineSeries extends RaphaelLineTypeBase {
  /**
   * RaphaelLineCharts is graph renderer for line chart.
   * @constructs RaphaelRadialLineSeries
   * @extends RaphaelLineTypeBase
   * @ignore
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
    this.chartType = 'radial';

    /**
     * Line width
     * @type {number}
     */
    this.lineWidth = DEFAULT_LINE_WIDTH;
  }

  /**
   * Render function of line chart.
   * @param {object} paper - raphael paper
   * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
   * @returns {object} paper raphael paper
   */
  render(paper, data) {
    const { dimension, groupPositions, theme } = data;
    const { colors } = theme;
    const { pointWidth, showDot, showArea } = data.options;
    const dotOpacity = showDot ? 1 : 0;

    const groupPaths = this._getLinesPath(groupPositions);
    const borderStyle = this.makeBorderStyle(theme.strokeColor, dotOpacity, theme.strokeWidth);
    const outDotStyle = this.makeOutDotStyle(dotOpacity, borderStyle);
    const radialSeriesSet = paper.set();
    const lineWidth = (this.lineWidth = pointWidth ? pointWidth : this.lineWidth);
    const dotPositions = groupPositions.map(positions => {
      positions.pop();

      return positions;
    });

    this.paper = paper;
    this.theme = theme;
    this.dimension = dimension;
    this.position = data.position;

    if (showArea) {
      this.groupAreas = this._renderArea(paper, groupPaths, colors, radialSeriesSet);
    }

    this.groupLines = this._renderLines(paper, groupPaths, colors, lineWidth, radialSeriesSet);
    this.groupDots = this._renderDots(paper, dotPositions, colors, dotOpacity, radialSeriesSet);

    if (data.options.allowSelect) {
      this.selectionDot = this._makeSelectionDot(paper);
      this.selectionColor = theme.selectionColor;
    }

    this.colors = colors;
    this.borderStyle = borderStyle;
    this.outDotStyle = outDotStyle;
    this.groupPositions = groupPositions;
    this.groupPaths = groupPaths;
    this.dotOpacity = dotOpacity;
    this.showArea = showArea;

    return radialSeriesSet;
  }

  /**
   * Get lines path.
   * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
   * @returns {Array.<Array.<string>>} path
   * @private
   */
  _getLinesPath(groupPositions) {
    return groupPositions.map(positions => this._makeLinesPath(positions));
  }

  /**
   * Render lines.
   * @param {object} paper raphael paper
   * @param {Array.<Array.<string>>} groupPaths paths
   * @param {string[]} colors line colors
   * @param {?number} strokeWidth stroke width
   * @param {Array.<object>} radialSeriesSet radial line series set
   * @returns {Array.<Array.<object>>} lines
   * @private
   */
  _renderLines(paper, groupPaths, colors, strokeWidth, radialSeriesSet) {
    return groupPaths.map((path, groupIndex) => {
      const color = colors[groupIndex] || 'transparent';
      const line = raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);

      radialSeriesSet.push(line);

      return line;
    });
  }

  /**
   * Render area.
   * @param {object} paper raphael paper
   * @param {Array.<Array.<string>>} groupPaths paths
   * @param {string[]} colors line colors
   * @param {Array.<object>} radialSeriesSet radial line series set
   * @returns {Array.<Array.<object>>} lines
   * @private
   */
  _renderArea(paper, groupPaths, colors, radialSeriesSet) {
    return groupPaths.map((path, groupIndex) => {
      const color = colors[groupIndex] || 'transparent';
      const area = raphaelRenderUtil.renderArea(paper, path, {
        fill: color,
        opacity: 0.4,
        'stroke-width': this.lineWidth,
        stroke: color
      });

      radialSeriesSet.push(area);

      return area;
    }, this);
  }

  /**
   * Resize graph of line chart.
   * /todo copied at raphaelLineCharts#resize, should remove duplication
   * tooltipLine code was deleted, as group tooltip not works on radial chart/
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
   */
  resize(params) {
    const { dimension, groupPositions } = params;

    this.groupPositions = groupPositions;
    this.groupPaths = this._getLinesPath(groupPositions);
    this.paper.setSize(dimension.width, dimension.height);

    this.groupPaths.forEach((path, groupIndex) => {
      this.groupLines[groupIndex].attr({ path: path.join(' ') });
      if (this.showArea) {
        this.groupAreas[groupIndex].attr({ path: path.join(' ') });
      }
      this.groupDots[groupIndex].forEach((item, index) => {
        this._moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
      });
    });
  }

  /**
   * Select legend.
   * /todo copied at raphaelLineCharts, should remove duplication
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const noneSelected = snippet.isNull(legendIndex);

    this.selectedLegendIndex = legendIndex;

    this.groupLines.forEach((line, groupIndex) => {
      const opacity =
        noneSelected || legendIndex === groupIndex ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      line.attr({ 'stroke-opacity': opacity });
    });
  }
}

export default RaphaelRadialLineSeries;
