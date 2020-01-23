/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';
import raphael from 'raphael';

const ANIMATION_DURATION = 700;
const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;
const DEFAULT_LUMINANC = 0.2;
const BAR_HOVER_SPARE_SIZE = 8;
const SERIES_EXTRA_VISUAL_AREA_FOR_ZERO = 2;
const SERIES_EXTRA_VISUAL_OPACITY_FOR_ZERO = 0.4;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 * @private
 */
class RaphaelBarChart {
  /**
   * Render function of bar chart
   * @param {object} paper paper object
   * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
   * @returns {Array.<object>} seriesSet
   */
  render(paper, data) {
    const { groupBounds, theme, seriesDataModel, chartType, options } = data;

    if (!groupBounds) {
      return null;
    }

    this.paper = paper;

    this.theme = theme;
    this.seriesDataModel = seriesDataModel;
    this.chartType = chartType;

    this.paper.setStart();

    this.options = options;
    this.theme = theme;
    this.groupBars = this._renderBars(groupBounds);
    this.groupBorders = this._renderBarBorders(groupBounds);

    this.overlay = this._renderOverlay();
    this.groupBounds = groupBounds;

    return this.paper.setFinish();
  }

  /**
   * Render overlay.
   * @returns {object} raphael object
   * @private
   */
  _renderOverlay() {
    const bound = {
      width: 1,
      height: 1,
      left: 0,
      top: 0
    };
    const attributes = {
      'fill-opacity': 0
    };
    const overlay = this._renderBar(bound, '#fff', attributes);

    overlay.node.setAttribute('class', 'auto-shape-rendering');

    return overlay;
  }

  /**
   * Render rect
   * @param {{left: number, top: number, width: number, height: number}} bound bound
   * @param {string} color series color
   * @param {object} [attributes] - attributes
   * @returns {object} bar rect
   * @private
   */
  _renderBar(bound, color, attributes) {
    if (bound.width < 0 || bound.height < 0) {
      return null;
    }

    const rect = raphaelRenderUtil
      .renderRect(
        this.paper,
        bound,
        Object.assign(
          {
            fill: color,
            stroke: 'none'
          },
          attributes
        )
      )
      .toFront();

    rect.node.setAttribute('class', 'auto-shape-rendering');

    return rect;
  }

  /**
   * Render bars.
   * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
   * @returns {Array.<Array.<object>>} bars
   * @private
   */
  _renderBars(groupBounds) {
    const { colors } = this.theme;
    const { colorByPoint, animationDuration } = this.options;
    const groupBars = groupBounds.map((bounds, groupIndex) =>
      bounds.map((bound, index) => {
        if (!bound) {
          return null;
        }

        const item = this.seriesDataModel.getSeriesItem(groupIndex, index);
        const color = colorByPoint ? colors[groupIndex] : colors[index];
        const rect = this._renderBar(animationDuration ? bound.start : bound.end, color);

        return {
          rect,
          color,
          bound: bound.end,
          item,
          groupIndex,
          index,
          isRange: item.isRange
        };
      })
    );

    return groupBars;
  }

  /**
   * Make rect points.
   * @param {{left: number, top:number, width: number, height: number}} bound rect bound
   * @returns {{
   *      leftTop: {left: number, top: number},
   *      rightTop: {left: number, top: number},
   *      rightBottom: {left: number, top: number},
   *      leftBottom: {left: number, top: number}
   * }} rect points
   * @private
   */
  _makeRectPoints(bound) {
    return {
      leftTop: {
        left: Math.ceil(bound.left),
        top: Math.ceil(bound.top)
      },
      rightTop: {
        left: Math.ceil(bound.left + bound.width),
        top: Math.ceil(bound.top)
      },
      rightBottom: {
        left: Math.ceil(bound.left + bound.width),
        top: Math.ceil(bound.top + bound.height)
      },
      leftBottom: {
        left: Math.ceil(bound.left),
        top: Math.ceil(bound.top + bound.height)
      }
    };
  }

  /**
   * Make top line path.
   * @param {object} points points
   *      @param {{left: number, top: number}} points.leftTop left top
   *      @param {{left: number, top: number}} points.rightTop right top
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {string} top line path
   * @private
   */
  _makeTopLinePath(points, chartType, item) {
    const { value } = item;
    let linePath = null;

    if (chartType === 'bar' || value >= 0 || item.isRange) {
      const cloneLeftTop = snippet.extend({}, points.leftTop);
      cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
      linePath = raphaelRenderUtil.makeLinePath(cloneLeftTop, points.rightTop).join(' ');
    }

    return linePath;
  }

  /**
   * Make right line path.
   * @param {object} points points
   *      @param {{left: number, top: number}} points.rightTop right top
   *      @param {{left: number, top: number}} points.rightBottom right bottom
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {string} top line path
   * @private
   */
  _makeRightLinePath(points, chartType, item) {
    let linePath = null;

    if (chartType === 'column' || item.value >= 0 || item.isRange) {
      linePath = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom).join(' ');
    }

    return linePath;
  }

  /**
   * Make bottom line path.
   * @param {object} points points
   *      @param {{left: number, top: number}} points.lefBottom left bottom
   *      @param {{left: number, top: number}} points.rightBottom right bottom
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {string} top line path
   * @private
   */
  _makeBottomLinePath(points, chartType, item) {
    let linePath = null;

    if (chartType === 'bar' || item.value < 0 || item.isRange) {
      linePath = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom).join(' ');
    }

    return linePath;
  }

  /**
   * Make left line path.
   * @param {object} points points
   *      @param {{left: number, top: number}} points.lefTop left top
   *      @param {{left: number, top: number}} points.leftBottom left bottom
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {string} top line path
   * @private
   */
  _makeLeftLinePath(points, chartType, item) {
    let linePath = null;

    if (chartType === 'column' || item.value < 0 || item.isRange) {
      linePath = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom).join(' ');
    }

    return linePath;
  }

  /**
   * Make border lines paths.
   * @param {{left: number, top:number, width: number, height: number}} bound rect bound
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {{top: string, right: string, bottom: string, left: string}} paths
   * @private
   */
  _makeBorderLinesPaths(bound, chartType, item) {
    const points = this._makeRectPoints(bound);
    const paths = {
      top: this._makeTopLinePath(points, chartType, item),
      right: this._makeRightLinePath(points, chartType, item),
      bottom: this._makeBottomLinePath(points, chartType, item),
      left: this._makeLeftLinePath(points, chartType, item)
    };

    return snippet.filter(paths, path => path);
  }

  /**
   * Render border lines;
   * @param {{left: number, top:number, width: number, height: number}} bound bar bound
   * @param {string} borderColor border color
   * @param {string} chartType chart type
   * @param {Item} item item
   * @returns {object} raphael object
   * @private
   */
  _renderBorderLines(bound, borderColor, chartType, item) {
    const borderLinePaths = this._makeBorderLinesPaths(bound, chartType, item);
    const lines = {};

    Object.entries(borderLinePaths).forEach(([name, path]) => {
      lines[name] = raphaelRenderUtil.renderLine(self.paper, path, borderColor, 1);
    });

    return lines;
  }

  /**
   * Render bar borders.
   * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
   * @returns {Array.<Array.<object>>} borders
   * @private
   */
  _renderBarBorders(groupBounds) {
    const { borderColor } = this.theme;

    if (!borderColor) {
      return null;
    }

    const groupBorders = snippet.map(groupBounds, (bounds, groupIndex) =>
      snippet.map(bounds, (bound, index) => {
        if (!bound) {
          return null;
        }

        const seriesItem = this.seriesDataModel.getSeriesItem(groupIndex, index);

        return this._renderBorderLines(bound.start, borderColor, self.chartType, seriesItem);
      })
    );

    return groupBorders;
  }

  /**
   * Animate rect.
   * @param {object} rect raphael object
   * @param {{left: number, top:number, width: number, height: number}} bound rect bound
   * @param {number} animationDuration animation duration
   * @private
   */
  _animateRect(rect, bound, animationDuration) {
    rect.animate(
      {
        x: bound.width ? bound.left : bound.left - SERIES_EXTRA_VISUAL_AREA_FOR_ZERO / 2,
        y: bound.height ? bound.top : bound.top - SERIES_EXTRA_VISUAL_AREA_FOR_ZERO / 2,
        width: bound.width ? bound.width : SERIES_EXTRA_VISUAL_AREA_FOR_ZERO,
        height: bound.height ? bound.height : SERIES_EXTRA_VISUAL_AREA_FOR_ZERO,
        opacity: bound.height && bound.width ? 1 : SERIES_EXTRA_VISUAL_OPACITY_FOR_ZERO
      },
      animationDuration,
      '>'
    );
  }

  /**
   * Animate borders.
   * @param {Array.<object>} lines raphael objects
   * @param {{left: number, top:number, width: number, height: number}} bound rect bound
   * @param {string} chartType chart type
   * @param {Item} item item
   * @private
   */
  _animateBorders(lines, bound, chartType, item) {
    const paths = this._makeBorderLinesPaths(bound, chartType, item);

    snippet.forEach(lines, (line, name) => {
      line.animate(
        {
          path: paths[name]
        },
        ANIMATION_DURATION,
        '>'
      );
    });
  }

  /**
   * Animate.
   * @param {function} onFinish finish callback function
   */
  animate(onFinish) {
    const groupBorders = this.groupBorders || [];
    const { animationDuration } = this.options;

    raphaelRenderUtil.forEach2dArray(this.groupBars, (bar, groupIndex, index) => {
      const lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
      if (!bar) {
        return;
      }

      if (animationDuration) {
        this._animateRect(bar.rect, bar.bound, animationDuration);
      }

      if (lines) {
        this._animateBorders(lines, bar.bound, this.chartType, bar.item);
      }
    });

    if (onFinish) {
      this.callbackTimeout = setTimeout(() => {
        onFinish();
        delete this.callbackTimeout;
      }, animationDuration);
    }
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  showAnimation(data) {
    const bar = this.groupBars[data.groupIndex][data.index];
    const { bound } = bar;

    this.overlay.attr({
      width: bound.width + BAR_HOVER_SPARE_SIZE,
      height: bound.height + BAR_HOVER_SPARE_SIZE,
      stroke: '#fff',
      'stroke-width': '1',
      x: bound.left - 4,
      y: bound.top - 4,
      'fill-opacity': 1
    });

    this.resortBarIndex(data.groupIndex);
    this.overlay.toFront();
    bar.rect.toFront();

    if (this.labelSet) {
      this.labelSet.toFront();
    }
    this.overlay.node.setAttribute('filter', 'url(#shadow)');
  }

  /**
   * Hide animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  hideAnimation(data) {
    this.resortBarIndex(data.groupIndex);
    this.overlay.attr({
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      'fill-opacity': 0
    });

    if (this.labelSet) {
      this.labelSet.toFront();
    }
  }

  /**
   * reindexing bar in group
   * @param {number} groupIndex - group index
   */
  resortBarIndex(groupIndex) {
    this.groupBars[groupIndex].forEach(barItem => {
      barItem.rect.toFront();
    });
  }

  /**
   * Update rect bound
   * @param {object} rect raphael object
   * @param {{left: number, top: number, width: number, height: number}} bound bound
   * @private
   */
  _updateRectBound(rect, bound) {
    rect.attr({
      x: bound.left,
      y: bound.top,
      width: bound.width,
      height: bound.height
    });
  }

  /**
   * Resize graph of bar type chart.
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {Array.<Array.<{
   *                  left:number, top:number, width: number, height: number
   *              }>>} params.groupBounds group bounds
   */
  resize(params) {
    const groupBorders = this.groupBorders || [];
    const { dimension, groupBounds } = params;

    this.groupBounds = groupBounds;
    this.paper.setSize(dimension.width, dimension.height);

    raphaelRenderUtil.forEach2dArray(this.groupBars, (bar, groupIndex, index) => {
      if (!bar) {
        return;
      }

      const lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
      const bound = groupBounds[groupIndex][index].end;

      bar.bound = bound;
      raphaelRenderUtil.updateRectBound(bar.rect, bound);

      if (lines) {
        this._updateBordersPath(lines, bound, this.chartType, bar.item);
      }
    });
  }

  /**
   * Change borders color.
   * @param {Array.<object>} lines raphael objects
   * @param {borderColor} borderColor border color
   * @private
   */
  _changeBordersColor(lines, borderColor) {
    snippet.forEach(lines, line => {
      line.attr({ stroke: borderColor });
    });
  }

  /**
   * Change bar color.
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @param {string} color fill color
   * @param {?string} borderColor stroke color
   * @private
   */
  _changeBarColor(indexes, color, borderColor) {
    const bar = this.groupBars[indexes.groupIndex][indexes.index];

    bar.rect.attr({
      fill: color
    });

    if (borderColor) {
      const lines = this.groupBorders[indexes.groupIndex][indexes.index];
      this._changeBordersColor(lines, borderColor);
    }
  }

  /**
   * Select series.
   * @param {{groupIndex: number, index: number}} indexes indexes
   */
  selectSeries(indexes) {
    const bar = this.groupBars[indexes.groupIndex][indexes.index];
    const objColor = raphael.color(bar.color);
    const selectionColorTheme = this.theme.selectionColor;
    const color =
      selectionColorTheme ||
      raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);
    let { borderColor } = this.theme;

    if (borderColor) {
      const objBorderColor = raphael.color(borderColor);
      borderColor = raphaelRenderUtil.makeChangedLuminanceColor(
        objBorderColor.hex,
        DEFAULT_LUMINANC
      );
    }

    this._changeBarColor(indexes, color, borderColor);
  }

  /**
   * Unselect series.
   * @param {{groupIndex: number, index: number}} indexes indexes
   */
  unselectSeries(indexes) {
    const bar = this.groupBars[indexes.groupIndex][indexes.index];
    const { borderColor } = this.theme;
    this._changeBarColor(indexes, bar.color, borderColor);
  }

  /**
   * Select legend.
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const groupBorders = this.groupBorders || [];
    const noneSelected = snippet.isNull(legendIndex);

    raphaelRenderUtil.forEach2dArray(this.groupBars, (bar, groupIndex, index) => {
      if (!bar) {
        return;
      }

      const lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
      const opacity =
        noneSelected || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      bar.rect.attr({ 'fill-opacity': opacity });
      if (lines) {
        snippet.forEach(lines, line => {
          line.attr({ 'stroke-opacity': opacity });
        });
      }
    });
  }

  renderSeriesLabel(paper, groupPositions, groupLabels, labelTheme, isStacked) {
    const textAnchor = isStacked || this.chartType === 'column' ? 'middle' : 'start';
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      opacity: 0,
      'text-anchor': textAnchor
    };
    const labelSet = (this.labelSet = paper.set());

    groupLabels.forEach((categoryLabel, categoryIndex) => {
      categoryLabel.forEach((label, seriesIndex) => {
        const position = groupPositions[categoryIndex][seriesIndex];
        const endLabel = raphaelRenderUtil.renderText(paper, position.end, label.end, attributes);
        const enaLabelNodeStyle = endLabel.node.style;

        enaLabelNodeStyle.userSelect = 'none';
        enaLabelNodeStyle.cursor = 'default';

        labelSet.push(endLabel);

        if (position.start) {
          const startLabel = raphaelRenderUtil.renderText(
            paper,
            position.start,
            label.start,
            attributes
          );
          startLabel.node.style.userSelect = 'none';
          startLabel.node.style.cursor = 'default';

          labelSet.push(startLabel);
        }
      });
    });

    return labelSet;
  }
}

export default RaphaelBarChart;
