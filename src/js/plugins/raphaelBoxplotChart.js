/**
 * @fileoverview Raphael boxplot chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import renderUtil from '../helpers/renderUtil';
import snippet from 'tui-code-snippet';
import raphael from 'raphael';

const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;
const DEFAULT_LUMINANC = 0.2;
const EDGE_LINE_WIDTH = 1;
const MEDIAN_LINE_WIDTH = 1;
const WHISKER_LINE_WIDTH = 1;

/**
 * @classdesc RaphaelBoxplotChart is graph renderer for bar, column chart.
 * @class RaphaelBoxplotChart
 * @private
 */
class RaphaelBoxplotChart {
  /**
   * Render function of bar chart
   * @param {object} paper paper object
   * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
   * @returns {Array.<object>} seriesSet
   */
  render(paper, data) {
    const { groupBounds } = data;

    if (!groupBounds) {
      return null;
    }

    this.paper = paper;

    this.theme = data.theme;
    this.options = data.options;
    this.seriesDataModel = data.seriesDataModel;
    this.chartType = data.chartType;
    this.animationDuration = data.options.animationDuration;

    this.paper.setStart();
    this.groupWhiskers = [];
    this.groupMedians = [];
    this.groupBoxes = this._renderBoxplots(groupBounds);
    this.groupBorders = this._renderBoxBorders(groupBounds);

    this.circleOverlay = this._renderCircleOverlay();
    this.groupBounds = groupBounds;

    return this.paper.setFinish();
  }

  /**
   * Render overlay.
   * @returns {object} raphael object
   * @private
   */
  _renderCircleOverlay() {
    const position = {
      left: 0,
      top: 0
    };
    const attributes = {
      'fill-opacity': 0
    };

    return raphaelRenderUtil.renderCircle(
      this.paper,
      position,
      0,
      snippet.extend(
        {
          'stroke-width': 0
        },
        attributes
      )
    );
  }

  /**
   * Render rect
   * @param {{left: number, top: number, width: number, height: number}} bound bound
   * @param {string} color series color
   * @param {object} [attributes] - attributes
   * @returns {object} bar rect
   * @private
   */
  _renderBox(bound, color, attributes) {
    if (bound.width < 0 || bound.height < 0) {
      return null;
    }

    const rect = raphaelRenderUtil.renderRect(
      this.paper,
      bound,
      snippet.extend(
        {
          fill: color,
          stroke: 'none'
        },
        attributes
      )
    );

    return rect;
  }

  /**
   * Render boxes.
   * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
   * @returns {Array.<Array.<object>>} bars
   * @private
   */
  _renderBoxes(groupBounds) {
    const { colors } = this.theme;
    const { colorByPoint } = this.options;

    return groupBounds.map((bounds, groupIndex) =>
      bounds.map((bound, index) => {
        if (!bound) {
          return null;
        }

        const item = this.seriesDataModel.getSeriesItem(groupIndex, index);
        const color = colorByPoint ? colors[groupIndex] : colors[index];
        const boundStart = this.animationDuration ? bound.start : bound.end;
        let rect;

        if (boundStart) {
          rect = this._renderBox(boundStart, color);
        }

        return {
          rect,
          color,
          bound: bound.end,
          item,
          groupIndex,
          index
        };
      })
    );
  }

  /**
   * Render boxplots.
   * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
   * @returns {Array.<Array.<object>>} bars
   * @private
   */
  _renderBoxplots(groupBounds) {
    const groupBoxes = this._renderBoxes(groupBounds);

    this.groupWhiskers = this._renderWhiskers(groupBounds);
    this.groupMedians = this._renderMedianLines(groupBounds);
    this.groupOutliers = this._renderOutliers(groupBounds);

    return groupBoxes;
  }

  _renderWhisker(end, start, color) {
    const { paper, animationDuration } = this;
    const topDistance = start.top - end.top;
    const whiskerDirection = topDistance > 0 ? 1 : -1;
    const { left, width } = end;
    const quartileWidth = width / 4;
    const edgePath = `M${left + quartileWidth},${end.top}H${left + quartileWidth * 3}`;
    const whiskerPath = renderUtil.oneLineTrim`
            M${left + quartileWidth * 2},${end.top}
            V${end.top + Math.abs(topDistance) * whiskerDirection}
        `;

    const edge = raphaelRenderUtil.renderLine(paper, edgePath, color, EDGE_LINE_WIDTH);
    const whisker = raphaelRenderUtil.renderLine(paper, whiskerPath, color, WHISKER_LINE_WIDTH);
    const whiskers = [];

    edge.attr({
      opacity: animationDuration ? 0 : 1
    });
    whisker.attr({
      opacity: animationDuration ? 0 : 1
    });

    whiskers.push(edge);
    whiskers.push(whisker);

    return whiskers;
  }

  _renderWhiskers(groupBounds) {
    const { colors } = this.theme;
    const { colorByPoint } = this.options;
    const groupWhiskers = [];

    groupBounds.forEach((bounds, groupIndex) => {
      let whiskers = [];

      bounds.forEach((bound, index) => {
        const color = colorByPoint ? colors[groupIndex] : colors[index];

        if (!bound) {
          return;
        }

        whiskers = whiskers.concat(this._renderWhisker(bound.min, bound.start, color));
        whiskers = whiskers.concat(this._renderWhisker(bound.max, bound.end, color));
      });

      groupWhiskers.push(whiskers);
    });

    return groupWhiskers;
  }

  _renderMedianLine(bound) {
    const { width } = bound;
    const medianLinePath = `M${bound.left},${bound.top},H${bound.left + width}`;
    const median = raphaelRenderUtil.renderLine(
      this.paper,
      medianLinePath,
      '#ffffff',
      MEDIAN_LINE_WIDTH
    );

    median.attr({
      opacity: this.animationDuration ? 0 : 1
    });

    return median;
  }

  _renderMedianLines(groupBounds) {
    const groupMedians = [];

    groupBounds.forEach(bounds => {
      const medians = [];

      bounds.forEach(bound => {
        if (!bound) {
          return;
        }

        medians.push(this._renderMedianLine(bound.median));
      });
      groupMedians.push(medians);
    });

    return groupMedians;
  }

  _renderOutlier(bound, color) {
    const outlier = raphaelRenderUtil.renderCircle(
      this.paper,
      {
        left: bound.left,
        top: bound.top
      },
      3.5,
      {
        stroke: color,
        'stroke-width': 2
      }
    );

    outlier.attr({
      opacity: this.animationDuration ? 0 : 1
    });

    return outlier;
  }

  _renderOutliers(groupBounds) {
    const { colors } = this.theme;
    const { colorByPoint } = this.options;
    const groupOutliers = [];

    groupBounds.forEach((bounds, groupIndex) => {
      const outliers = [];
      bounds.forEach((bound, index) => {
        const color = colorByPoint ? colors[groupIndex] : colors[index];
        const seriesOutliers = [];

        if (!bound) {
          return;
        }

        if (bound.outliers.length) {
          bound.outliers.forEach(outlier => {
            seriesOutliers.push(this._renderOutlier(outlier, color));
          });
        }
        outliers.push(seriesOutliers);
      });
      groupOutliers.push(outliers);
    });

    return groupOutliers;
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
      lines[name] = raphaelRenderUtil.renderLine(this.paper, path, borderColor, 1);
    });

    return lines;
  }

  /**
   * Render bar borders.
   * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
   * @returns {Array.<Array.<object>>} borders
   * @private
   */
  _renderBoxBorders(groupBounds) {
    const { borderColor } = this.theme;

    if (!borderColor) {
      return null;
    }

    const groupBorders = groupBounds.map((bounds, groupIndex) =>
      bounds.map((bound, index) => {
        if (!bound) {
          return null;
        }
        const seriesItem = this.seriesDataModel.getSeriesItem(groupIndex, index);

        return this._renderBorderLines(bound.start, borderColor, this.chartType, seriesItem);
      })
    );

    return groupBorders;
  }

  /**
   * Animate rect.
   * @param {object} rect raphael object
   * @param {{left: number, top:number, width: number, height: number}} bound rect bound
   * @param {number} duration animation duration
   * @private
   */
  _animateRect(rect, bound, duration) {
    rect.animate(
      {
        x: bound.left,
        y: bound.top,
        width: bound.width,
        height: bound.height
      },
      duration,
      '>'
    );
  }

  /**
   * Animate.
   * @param {function} onFinish finish callback function
   */
  animate(onFinish) {
    if (this.animationDuration) {
      const animation = raphael.animation(
        {
          opacity: 1
        },
        this.animationDuration
      );

      raphaelRenderUtil.forEach2dArray(this.groupBoxes, box => {
        if (!box) {
          return;
        }
        this._animateRect(box.rect, box.bound, this.animationDuration);
      });

      raphaelRenderUtil.forEach2dArray(this.groupWhiskers, whisker => {
        whisker.animate(animation.delay(this.animationDuration));
      });

      raphaelRenderUtil.forEach2dArray(this.groupMedians, median => {
        median.animate(animation.delay(this.animationDuration));
      });

      raphaelRenderUtil.forEach2dArray(this.groupOutliers, outliers => {
        outliers.forEach(outlier => {
          outlier.animate(animation.delay(this.animationDuration));
        });
      });

      if (onFinish) {
        this.callbackTimeout = setTimeout(() => {
          onFinish();
          delete this.callbackTimeout;
        }, this.animationDuration);
      }
    }
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  showAnimation(data) {
    if (snippet.isNumber(data.outlierIndex)) {
      this.showOutlierAnimation(data);
    } else {
      this.showRectAnimation(data);
    }
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  showRectAnimation(data) {
    const bar = this.groupBoxes[data.groupIndex][data.index];
    this.hoveredBar = bar.rect;

    this.hoveredBar.attr({
      stroke: '#ffffff',
      'stroke-width': 4
    });
    this.hoveredBar.node.setAttribute('filter', 'url(#shadow)');
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} data show info
   */
  showOutlierAnimation(data) {
    const targetAttr = this.groupOutliers[data.groupIndex][data.index][data.outlierIndex].attr();

    this.circleOverlay.attr({
      r: targetAttr.r,
      cx: targetAttr.cx,
      cy: targetAttr.cy,
      fill: targetAttr.stroke,
      'fill-opacity': 1,
      stroke: targetAttr.stroke,
      'stroke-width': 4
    });
  }

  /**
   * Hide animation.
   */
  hideAnimation() {
    this.circleOverlay.attr({
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      'fill-opacity': 0,
      'stroke-width': 2
    });
    this.hoveredBar.attr({
      stroke: 'none'
    });
    this.hoveredBar.node.setAttribute('filter', 'none');
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
    const { dimension, groupBounds } = params;

    this.groupBounds = groupBounds;
    this.paper.setSize(dimension.width, dimension.height);

    raphaelRenderUtil.forEach2dArray(this.groupBoxes, (bar, groupIndex, index) => {
      if (!bar) {
        return;
      }

      const bound = groupBounds[groupIndex][index].end;
      bar.bound = bound;
      raphaelRenderUtil.updateRectBound(bar.rect, bound);
    });
  }

  /**
   * Change borders color.
   * @param {Array.<object>} lines raphael objects
   * @param {borderColor} borderColor border color
   * @private
   */
  _changeBordersColor(lines, borderColor) {
    lines.forEach(line => {
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
  _changeBoxColor(indexes, color, borderColor) {
    const bar = this.groupBoxes[indexes.groupIndex][indexes.index];

    bar.rect.attr({
      stroke: color
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
    const bar = this.groupBoxes[indexes.groupIndex][indexes.index];
    const objColor = raphael.color(bar.color);
    const selectionColorTheme = this.theme.selectionColor;
    const makeColor = raphaelRenderUtil.makeChangedLuminanceColor;
    const color = selectionColorTheme || makeColor(objColor.hex, DEFAULT_LUMINANC);
    let { borderColor } = this.theme;

    if (borderColor) {
      const objBorderColor = raphael.color(borderColor);
      borderColor = raphaelRenderUtil.makeChangedLuminanceColor(
        objBorderColor.hex,
        DEFAULT_LUMINANC
      );
    }

    this._changeBoxColor(indexes, color, borderColor);
  }

  /**
   * Unselect series.
   * @param {{groupIndex: number, index: number}} indexes indexes
   */
  unselectSeries(indexes) {
    const bar = this.groupBoxes[indexes.groupIndex][indexes.index];
    const { borderColor } = this.theme;
    this._changeBoxColor(indexes, bar.color, borderColor);
  }

  /**
   * Select legend.
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const noneSelected = snippet.isNull(legendIndex);

    raphaelRenderUtil.forEach2dArray(this.groupBoxes, (box, groupIndex, index) => {
      if (!box) {
        return;
      }

      const opacity =
        noneSelected || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      box.rect.attr({ 'stroke-opacity': opacity });
    });
    raphaelRenderUtil.forEach2dArray(this.groupWhiskers, (whisker, groupIndex, index) => {
      const opacity =
        noneSelected || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      whisker.attr({ 'stroke-opacity': opacity });
    });
    raphaelRenderUtil.forEach2dArray(this.groupMedians, (median, groupIndex, index) => {
      const opacity =
        noneSelected || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      median.attr({ 'stroke-opacity': opacity });
    });
  }

  renderSeriesLabel(paper, groupPositions, groupLabels, labelTheme, isStacked) {
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      opacity: 0,
      'text-anchor': isStacked ? 'middle' : 'start'
    };
    const labelSet = paper.set();

    groupLabels.forEach((categoryLabel, categoryIndex) => {
      categoryLabel.forEach((label, seriesIndex) => {
        const position = groupPositions[categoryIndex][seriesIndex];
        const endLabel = raphaelRenderUtil.renderText(paper, position.end, label.end, attributes);

        endLabel.node.style.userSelect = 'none';
        endLabel.node.style.cursor = 'default';
        endLabel.node.setAttribute('filter', 'url(#glow)');

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
          startLabel.node.setAttribute('filter', 'url(#glow)');

          labelSet.push(startLabel);
        }
      });
    });

    return labelSet;
  }
}

export default RaphaelBoxplotChart;
