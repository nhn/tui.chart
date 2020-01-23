/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import chartConst from '../const';
import renderUtil from '../helpers/renderUtil';
import predicate from '../helpers/predicate';
import calculator from '../helpers/calculator';

// prettier-ignore
const DEGREE_HORIZONTAL_BAR = 360;
const DEGREE_VERTICAL_BAR = 270;
const WEDGE_BASE_HALF = 2.5; // half of wedge base

/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 * @private
 */
class RaphaelMapLegend {
  constructor() {
    /**
     * Vertical base path
     * @type {Array}
     */
    // prettier-ignore
    this.verticalRightBasePath = ['M', -4, 0, 'L', -8, 2.5, 'L', -8, 12.5, 'L', -28, 12.5, 'L', -28, -12.5, 'L', -8, -12.5, 'L', -8, -2.5];
    // prettier-ignore
    this.verticalLeftBasePath = ['M', 10, 0, 'L', 14, 2.5, 'L', 14, 12.5, 'L', 34, 12.5, 'L', 34, -12.5, 'L', 14, -12.5, 'L', 14, -2.5];

    /**
     * Horizontal base path
     * @type {Array}
     */
    // prettier-ignore
    this.horizontalTopBasePath = ['M', 0, 10, 'L', 2.5, 14, 'L', 12.5, 14, 'L', 12.5, 34, 'L', -12.5, 34, 'L', -12.5, 14, 'L', -2.5, 14];
    // prettier-ignore
    this.horizontalBottomBasePath = ['M', 0, -4, 'L', 2.5, -8, 'L', 12.5, -8, 'L', 12.5, -28, 'L', -12.5, -28, 'L', -12.5, -8, 'L', -2.5, -8];
  }

  /**
   * Render function of map chart legend.
   * @param {object} param - param to render spectrum legend
   *  @param {object} param.paper raphael paper
   *  @param {object} param.layout legend layout
   *  @param {ColorSpectrum} param.colorSpectrum map chart color model
   *  @param {boolean} param.isHorizontal whether horizontal legend or not
   *  @param {Array.<object>} param.legendSet legend set
   */
  render(param) {
    const { layout, align, legendSet, theme, labels } = param;
    const isHorizontal = predicate.isHorizontalLegend(align);
    const [minLabel] = labels;
    const maxLabel = labels[labels.length - 1];
    const maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth([minLabel, maxLabel]);
    const labelHeight = renderUtil.getRenderedLabelHeight(minLabel, theme);
    const isBoxTypeChart = predicate.isBoxTypeChart(this.chartType);
    const { position } = layout;

    this.layout = layout;
    this.isHorizontal = isHorizontal;
    this.isLeftLegend = predicate.isLegendAlignLeft(align);
    this.isTopLegend = predicate.isLegendAlignTop(align);
    this.theme = theme;
    this.paper = param.paper;
    this.legendSet = param.legendSet;
    this.colorSpectrum = param.colorSpectrum;

    if (predicate.isLegendAlignTop(align)) {
      position.top +=
        chartConst.MAP_LEGEND_AREA_PADDING_WIDE +
        labelHeight +
        chartConst.MAP_LEGEND_LABEL_PADDING * 2;
    } else if (predicate.isLegendAlignBottom(align)) {
      position.top +=
        this._calculateHorizontalLegendTooltipHeight(labels, theme) +
        chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE;

      if (isBoxTypeChart) {
        position.top -= chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING;
      } else {
        position.top += chartConst.MAP_LEGEND_AREA_PADDING_WIDE;
      }
    } else if (predicate.isLegendAlignLeft(align)) {
      position.left += maxLabelWidth + chartConst.MAP_LEGEND_LABEL_PADDING;
    } else {
      position.left =
        layout.position.right -
        maxLabelWidth -
        chartConst.MAP_LEGEND_LABEL_PADDING -
        chartConst.MAP_LEGEND_GRAPH_SIZE;
    }

    const gradientBar = this._renderGradientBar(
      this.paper,
      layout,
      this.colorSpectrum,
      isHorizontal
    );

    legendSet.push(gradientBar);

    this.wedge = this._renderWedge(this.paper, position);
    this.wedgeText = this._renderWedgeText(this.paper, position, theme);
    legendSet.push(this.wedge);

    this.gradientBar = gradientBar;
  }

  /**
   * Render tick label
   * @param {object} paper Raphael paper
   * @param {object} baseData base data for render ticks
   * @param {Array.<string>} labels labels
   * @param {string} align legend align option
   * @param {Array.<object>} legendSet legend set
   */
  renderTickLabels(paper, baseData, labels, align, legendSet) {
    const { theme } = this;
    const attribute = {
      'font-size': theme.fontSize,
      'font-family': theme.fontFamily,
      'font-weight': theme.fontWeight,
      fill: '#000'
    };
    const [minLabel] = labels;
    const maxLabel = labels[labels.length - 1];
    const maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth([minLabel, maxLabel]);
    const labelHeight = renderUtil.getRenderedLabelHeight(minLabel, theme);

    labels.forEach((label, labelIndex) => {
      const offsetValue = baseData.step * labelIndex;
      const pos = Object.assign({}, baseData.position);

      if (predicate.isHorizontalLegend(align)) {
        pos.left += offsetValue;
        if (this.isTopLegend) {
          pos.top -= labelHeight / 2;
        } else {
          pos.top += labelHeight / 2;
        }
      } else {
        pos.top += offsetValue;
        if (this.isLeftLegend) {
          attribute['text-anchor'] = 'end';
          pos.left = chartConst.CHART_PADDING + maxLabelWidth;
        } else {
          attribute['text-anchor'] = 'start';
        }
      }

      legendSet.push(raphaelRenderUtil.renderText(paper, pos, label, attribute));
    }, this);
  }

  /**
   * Render gradient bar.
   * @param {object} paper raphael object
   * @param {object} layout legend layout
   * @param {ColorSpectrum} colorSpectrum map chart color model
   * @param {boolean} isHorizontal whether horizontal legend or not
   * @returns {object}
   * @private
   */
  _renderGradientBar(paper, layout, colorSpectrum, isHorizontal) {
    let width, height, degree;

    if (isHorizontal) {
      ({ width } = layout.dimension);
      height = chartConst.MAP_LEGEND_GRAPH_SIZE;
      degree = DEGREE_HORIZONTAL_BAR;
      this._makeWedghPath = this._makeHorizontalWedgePath;
    } else {
      width = chartConst.MAP_LEGEND_GRAPH_SIZE;
      ({ height } = layout.dimension);
      degree = DEGREE_VERTICAL_BAR;
      this._makeWedghPath = this._makeVerticalWedgePath;
    }

    const bound = {
      left: layout.position.left,
      top: layout.position.top,
      width,
      height
    };

    return raphaelRenderUtil.renderRect(paper, bound, {
      fill: `${degree}-${colorSpectrum.start}-${colorSpectrum.end}`,
      stroke: 'none'
    });
  }

  /**
   * Render wedge text
   * @param {object} paper - raphael paper
   * @param {object} position - position
   * @param {object} theme - legend label theme
   * @returns {SVGTextElement} - wedge text
   * @private
   */
  _renderWedgeText(paper, position, theme) {
    if (this.isLeftLegend) {
      position.left +=
        chartConst.MAP_LEGEND_WEDGE_SIZE + chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING;
    }

    return raphaelRenderUtil.renderText(paper, position, '', {
      'font-size': theme.fontSize,
      'font-family': theme.fontFamily,
      'font-weight': theme.fontWeight,
      fill: theme.color
    });
  }

  /**
   * Render wedge.
   * @param {object} paper raphael object
   * @param {{top: number, left: number}} position base position of legend
   * @returns {object} raphael object
   * @private
   */
  _renderWedge(paper, position) {
    return paper.path(this.verticalBasePath).attr({
      fill: 'gray',
      stroke: 'white',
      'stroke-opacity': 0.2,
      opacity: 0,
      transform: `t${position.left},${position.top}`
    });
  }

  /**
   * Make vertical wedge path.
   * @param {number} top top
   * @param {object} labelDimension label width and height
   * @returns {Array} path
   * @private
   */
  _makeVerticalWedgePath(top, labelDimension) {
    const { isLeftLegend } = this;
    const path = (this.verticalBasePath = isLeftLegend
      ? this.verticalLeftBasePath
      : this.verticalRightBasePath);
    const {
      MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING: PADDING_H,
      MAP_LEGEND_TOOLTIP_VERTICAL_PADDING: PADDING_V
    } = chartConst;
    const { width: labelWidth, height: labelHeight } = labelDimension;

    path[2] = top;
    path[5] = top + WEDGE_BASE_HALF;
    path[8] = path[11] = top + labelHeight / 2 + PADDING_V;
    path[14] = path[17] = top - labelHeight / 2 - PADDING_V;
    path[20] = top - WEDGE_BASE_HALF;

    if (isLeftLegend) {
      path[10] = path[13] = path[4] + labelWidth + PADDING_H * 2;
    } else {
      path[10] = path[13] = path[4] - labelWidth - PADDING_H * 2;
    }

    return path;
  }

  /**
   * Make horizontal wedge path.
   * @param {number} left left
   * @param {object} labelDimension label width and height
   * @returns {Array} path
   * @private
   */
  _makeHorizontalWedgePath(left, labelDimension) {
    const path = (this.horiziontalBaseBath = this.isTopLegend
      ? this.horizontalTopBasePath
      : this.horizontalBottomBasePath);
    const {
      MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING: PADDING_H,
      MAP_LEGEND_TOOLTIP_VERTICAL_PADDING: PADDING_V
    } = chartConst;
    const { width: labelWidth, height: labelHeight } = labelDimension;

    path[1] = left;
    path[4] = left + WEDGE_BASE_HALF;
    path[7] = path[10] = left + labelWidth / 2 + PADDING_H;
    path[13] = path[16] = left - labelWidth / 2 - PADDING_H;
    path[19] = left - WEDGE_BASE_HALF;

    if (this.isTopLegend) {
      path[11] = path[14] = path[5] + labelHeight + PADDING_V * 2;
    } else {
      path[11] = path[14] = path[5] - labelHeight - PADDING_V * 2;
    }

    return path;
  }

  /**
   * Show wedge.
   * @param {number} ratio value ratio beyond spectrum legend
   * @param {string} label data value
   */
  showWedge(ratio, label) {
    const labelTheme = this.theme;
    const labelSize = raphaelRenderUtil.getRenderedTextSize(
      label,
      labelTheme.fontSize,
      labelTheme.fontFamily
    );
    const legendSize = this.isHorizontal
      ? this.layout.dimension.width
      : this.layout.dimension.height;
    const path = this._makeWedghPath(legendSize * ratio, labelSize);

    this.wedge.attr({
      path,
      opacity: 1,
      fill: this.colorSpectrum.getColor(ratio)
    });

    const wedgeBBox = this.wedge.getBBox();

    let wedgeTextTop = calculator.sum([
      wedgeBBox.y,
      chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING,
      labelSize.height / 2
    ]);

    let wedgeTextLeft = calculator.sum([
      wedgeBBox.x,
      chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING,
      labelSize.width / 2
    ]);

    if (this.isLeftLegend) {
      wedgeTextLeft += chartConst.MAP_LEGEND_WEDGE_SIZE;
    }

    if (this.isTopLegend) {
      wedgeTextTop += chartConst.MAP_LEGEND_WEDGE_SIZE;
    }

    this.wedgeText.attr({
      x: wedgeTextLeft,
      y: wedgeTextTop,
      text: label,
      opacity: 1
    });

    this.wedge.toFront();
    this.wedgeText.toFront();
  }

  /**
   * Hide wedge
   */
  hideWedge() {
    this.wedge.attr({
      opacity: 0
    });

    this.wedgeText.attr({
      opacity: 0
    });
  }

  /**
   * Remove location URL from fill attribute
   * @private
   */
  removeLocationURLFromFillAttribute() {
    const { gradientBar } = this;
    const fillURL = gradientBar.node.getAttribute('fill');
    const locationUrlRegExp = /url\('?([^#]+)#[^#]+'?\)/;
    [, this.locationURL] = locationUrlRegExp.exec(fillURL);

    gradientBar.node.setAttribute('fill', fillURL.replace(this.locationURL, ''));
  }

  /**
   * Restore location URL to fill attribute
   * @private
   */
  restoreLocationURLToFillAttribute() {
    const { gradientBar } = this;
    const fillURL = gradientBar.node.getAttribute('fill');

    gradientBar.node.setAttribute('fill', fillURL.replace('#', `${this.locationURL}#`));
  }

  /**
   * Calculate tooltip area height of horizontal legend
   * @param {Array.<string>} labels - labels
   * @param {object} theme - legend label theme
   * @returns {number} - tooltip height
   * @private
   */
  _calculateHorizontalLegendTooltipHeight(labels, theme) {
    const label = labels.length ? labels[labels.length - 1] : '';
    const labelHeight = renderUtil.getRenderedLabelHeight(label, theme);

    return calculator.sum([
      chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2,
      labelHeight,
      chartConst.MAP_LEGEND_WEDGE_SIZE
    ]);
  }

  /**
   * Calculate tooltip area width of vertical legend
   * @param {Array.<string>} labels - labels
   * @param {object} theme - legend label theme
   * @returns {number} - tooltip width
   * @private
   */
  _calculateVerticalLegendTooltipWidth(labels, theme) {
    const label = labels.length ? labels[labels.length - 1] : '';
    const labelWidth = renderUtil.getRenderedLabelWidth(label, theme);

    return calculator.sum([
      chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2,
      labelWidth,
      chartConst.MAP_LEGEND_WEDGE_SIZE
    ]);
  }
}

export default RaphaelMapLegend;
