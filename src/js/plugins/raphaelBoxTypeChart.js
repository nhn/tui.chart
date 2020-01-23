/**
 * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';
import predicate from '../helpers/predicate';

const ANIMATION_DURATION = 100;
const MIN_BORDER_WIDTH = 0;
const MAX_BORDER_WIDTH = 4;

/**
 * @classdesc RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @class RaphaelBarChart
 * @private
 */
class RaphaelBoxTypeChart {
  /**
   * Render function of bar chart
   * @param {object} paper Raphael paper
   * @param {{
   *      dimension: {width: number, height: number},
   *      colorSpectrum: object,
   *      seriesDataModel: SeriesDataModel,
   *      groupBounds: (Array.<Array.<object>>|object.<string, object>),
   *      theme: object
   * }} seriesData - data for graph rendering
   * @returns {object}
   */
  render(paper, seriesData) {
    const seriesSet = paper.set();

    this.paper = paper;

    this.chartType = seriesData.chartType;

    /**
     * theme
     * @type {*|{}}
     */
    this.theme = seriesData.theme || {};

    /**
     * color spectrum
     * @type {Object}
     */
    this.colorSpectrum = seriesData.colorSpectrum;

    /**
     * chart background
     */
    this.chartBackground = seriesData.chartBackground;

    /**
     * zoomable option
     */
    this.zoomable = seriesData.zoomable;

    /**
     * options useColorValue
     */
    this.useColorValue = seriesData.options.useColorValue;

    /**
     * border color for rendering box
     * @type {string}
     */
    this.borderColor = this.theme.borderColor || 'none';

    /**
     * border width for rendering box
     */
    this.borderWidth = this.theme.borderWidth;

    /**
     * group bounds
     * @type {Array.<Array.<object>>|object.<string, object>}
     */
    this.groupBounds = seriesData.groupBounds;

    /**
     * bound map
     * @type {object.<string, {left: number, top: number, width: number, height: number}>}
     */
    this.boundMap = seriesData.boundMap;

    this._bindGetBoundFunction();
    this._bindGetColorFunction();

    this.seriesDataModel = seriesData.seriesDataModel;

    /**
     * boxes set
     * @type {Array.<Array.<{rect: Object, color: string}>>}
     */
    this.boxesSet = this._renderBoxes(
      seriesData.seriesDataModel,
      seriesData.startDepth,
      !!seriesData.isPivot,
      seriesSet
    );
    this.rectOverlay = this._renderRectOverlay();

    return seriesSet;
  }

  /**
   * Render overlay.
   * @returns {object} raphael object
   * @private
   */
  _renderRectOverlay() {
    const bound = {
      width: 1,
      height: 1,
      left: 0,
      top: 0
    };
    const attributes = {
      'fill-opacity': 0
    };

    const rectOverlay = raphaelRenderUtil.renderRect(
      this.paper,
      bound,
      Object.assign(
        {
          'stroke-width': 0
        },
        attributes
      )
    );

    rectOverlay.node.setAttribute('filter', 'url(#shadow)');

    return rectOverlay;
  }

  /**
   * Bind _getBound private function.
   * @private
   */
  _bindGetBoundFunction() {
    if (this.boundMap) {
      this._getBound = this._getBoundFromBoundMap;
    } else {
      this._getBound = this._getBoundFromGroupBounds;
    }
  }

  /**
   * Bind _bindGetColorFunction private function.
   * @private
   */
  _bindGetColorFunction() {
    if (this.colorSpectrum) {
      this._getColor = this._getColorFromSpectrum;
    } else {
      this._getColor = this._getColorFromColors;
    }
  }

  /**
   * Get bound from groupBounds by indexes(groupIndex, index) of seriesItem.
   * @param {SeriesItem} seriesItem - seriesItem
   * @returns {{width: number, height: number, left: number, top: number}}
   * @private
   */
  _getBoundFromGroupBounds(seriesItem) {
    return this.groupBounds[seriesItem.groupIndex][seriesItem.index].end;
  }

  /**
   * Get bound from boundMap by id of seriesItem.
   * @param {SeriesItem} seriesItem - seriesItem
   * @returns {{width: number, height: number, left: number, top: number}}
   * @private
   */
  _getBoundFromBoundMap(seriesItem) {
    return this.boundMap[seriesItem.id];
  }

  /**
   * Get color from colorSpectrum by ratio of seriesItem.
   * @param {SeriesItem} seriesItem - seriesItem
   * @param {number} startDepth - start depth
   * @returns {string}
   * @private
   */
  _getColorFromSpectrum(seriesItem, startDepth) {
    let color;

    if (!seriesItem.hasChild || seriesItem.depth !== startDepth) {
      color =
        this.colorSpectrum.getColor(seriesItem.colorRatio || seriesItem.ratio) ||
        this.chartBackground;
    } else {
      color = 'none';
    }

    return color;
  }

  /**
   * Get color from colors theme by group property of seriesItem.
   * @param {SeriesItem} seriesItem - seriesItem
   * @param {number} startDepth - start depth
   * @returns {string}
   * @private
   */
  _getColorFromColors(seriesItem, startDepth) {
    return seriesItem.depth === startDepth ? this.theme.colors[seriesItem.group] : '#000';
  }

  /**
   * Render rect.
   * @param {{width: number, height: number, left: number, top: number}} bound - bound
   * @param {string} color - color
   * @param {number} strokeWidth - stroke width
   * @param {number} [fillOpacity] - fill opacity
   * @returns {object}
   * @private
   */
  _renderRect(bound, color, strokeWidth, fillOpacity) {
    return raphaelRenderUtil.renderRect(this.paper, bound, {
      fill: color,
      stroke: this.borderColor,
      'stroke-width': strokeWidth,
      'fill-opacity': fillOpacity
    });
  }

  /**
   * Get stroke width.
   * @param {boolean} isFirstDepth - whether it is same to first depth or not
   * @returns {number}
   * @private
   */
  _getStrokeWidth(isFirstDepth) {
    let strokeWidth;

    if (this.borderWidth) {
      strokeWidth = this.borderWidth;
    } else if (isFirstDepth) {
      strokeWidth = MAX_BORDER_WIDTH;
    } else {
      strokeWidth = MIN_BORDER_WIDTH;
    }

    return strokeWidth;
  }

  /**
   * Render boxes.
   * @param {SeriesDataModel} seriesDataModel - seriesDataModel
   * @param {number} startDepth - start depth
   * @param {boolean} isPivot - whether pivot or not
   * @param {Array.<object>} seriesSet - seriesSet
   * @returns {Array.<Array.<{rect: object, color: string}>>}
   * @private
   */
  _renderBoxes(seriesDataModel, startDepth, isPivot, seriesSet) {
    const isTreemap = predicate.isTreemapChart(this.chartType);

    return seriesDataModel.map((seriesGroup, groupIndex) => {
      if (isTreemap && !this.colorSpectrum && seriesGroup.getSeriesItemCount()) {
        const firstItem = seriesGroup.getSeriesItem(0);
        this._setTreeFillOpacity(
          {
            id: firstItem.parent
          },
          startDepth
        );
      }

      return seriesGroup.map((seriesItem, index) => {
        let result = null;
        const { depth } = seriesItem;
        const strokeWidth = this.colorSpectrum ? 0 : this._getStrokeWidth(depth === startDepth);
        const fillOpacity = this.colorSpectrum ? 1 : seriesItem.fillOpacity;

        seriesItem.groupIndex = groupIndex;
        seriesItem.index = index;
        const bound = this._getBound(seriesItem);

        if (bound) {
          const color = this._getColor(seriesItem, startDepth);
          result = {
            rect: this._renderRect(bound, color, strokeWidth, fillOpacity),
            seriesItem,
            color
          };

          if (seriesSet) {
            seriesSet.push(result.rect);
          }
        }

        return result;
      });
    }, isPivot);
  }

  /**
   * @param {{id: number, fillOpacity: number}} parentInfo - parent info
   * @param {number} startDepth - start depth
   * @private
   */
  _setTreeFillOpacity(parentInfo, startDepth) {
    const children = this.seriesDataModel.findSeriesItemsByParent(parentInfo.id);

    children.forEach((datum, index) => {
      const { depth } = datum;

      if (depth === startDepth) {
        datum.fillOpacity = 1;
      } else if (depth === startDepth + 1) {
        datum.fillOpacity = 0.05 * index;
      } else if (depth < startDepth) {
        datum.fillOpacity = 0;
      } else {
        datum.fillOpacity = parentInfo.fillOpacity + 0.05 * index;
      }

      if (datum.hasChild) {
        this._setTreeFillOpacity(
          {
            id: datum.id,
            fillOpacity: datum.fillOpacity
          },
          startDepth
        );
      }
    });
  }

  /**
   * Animate changing color of box.
   * @param {object} rect - raphael object
   * @param {string} [color] - fill color
   * @param {number} [opacity] - fill opacity
   * @param {number} [strokeColor] - stroke color
   * @param {number} [strokeWidth] - stroke width
   * @private
   */
  _animateChangingColor(rect, color, opacity, strokeColor, strokeWidth) {
    const properties = {
      'fill-opacity': snippet.isExisty(opacity) ? opacity : 1,
      stroke: strokeColor,
      'stroke-width': strokeWidth
    };

    if (color) {
      properties.fill = color;
    }

    rect.animate(properties, ANIMATION_DURATION, '>');
  }

  /**
   * Show animation.
   * @param {{groupIndex: number, index:number}} indexes - index info
   */
  showAnimation(indexes) {
    const box = this.boxesSet[indexes.groupIndex][indexes.index];

    if (!box) {
      return;
    }

    const rect = box.rect.node;
    let { color } = box;

    if (this.chartType === 'treemap' && !this.zoomable && !this.useColorValue) {
      color = this.theme.colors[indexes.index];
    }

    this.rectOverlay.attr({
      x: rect.getAttribute('x'),
      y: rect.getAttribute('y'),
      width: rect.getAttribute('width'),
      height: rect.getAttribute('height'),
      fill: color,
      'fill-opacity': 1,
      stroke: '#ffffff',
      'stroke-width': 4,
      'stroke-opacity': 1
    });

    this.rectOverlay.toFront();

    if (this.labelSet) {
      this.labelSet.toFront();
    }
  }

  /**
   * Hide animation.
   * @param {{groupIndex: number, index:number}} indexes - index info
   */
  hideAnimation(indexes) {
    const box = this.boxesSet[indexes.groupIndex][indexes.index];

    if (!box) {
      return;
    }

    this.rectOverlay.attr({
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      'fill-opacity': 0,
      'stroke-opacity': 0
    });
  }

  /**
   * Resize.
   * @param {{
   *      dimension: {width: number, height: number},
   *      groupBounds: (Array.<Array.<object>>|object.<string, object>)
   * }} seriesData - data for graph rendering
   */
  resize(seriesData) {
    const { dimension } = seriesData;

    this.boundMap = seriesData.boundMap;
    this.groupBounds = seriesData.groupBounds;
    this.paper.setSize(dimension.width, dimension.height);

    raphaelRenderUtil.forEach2dArray(this.boxesSet, (box, groupIndex, index) => {
      if (!box) {
        return;
      }

      const bound = this._getBound(box.seriesItem, groupIndex, index);

      if (bound) {
        raphaelRenderUtil.updateRectBound(box.rect, bound);
      }
    });
  }

  renderSeriesLabel(paper, positionSet, labels, labelTheme) {
    const labelSet = paper.set();
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: '#ffffff',
      opacity: 0
    };

    labels.forEach((categoryLabel, categoryIndex) => {
      categoryLabel.forEach((label, seriesIndex) => {
        const seriesLabel = raphaelRenderUtil.renderText(
          paper,
          positionSet[categoryIndex][seriesIndex].end,
          label,
          attributes
        );

        seriesLabel.node.style.userSelect = 'none';
        seriesLabel.node.style.cursor = 'default';

        labelSet.push(seriesLabel);
      });
    });

    this.labelSet = labelSet;

    return labelSet;
  }

  renderSeriesLabelForTreemap(paper, positions, labels, labelTheme) {
    const labelSet = paper.set();
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      opacity: 0
    };

    labels.forEach((label, index) => {
      if (positions[index]) {
        const seriesLabel = raphaelRenderUtil.renderText(
          paper,
          positions[index],
          label,
          attributes
        );

        seriesLabel.node.style.userSelect = 'none';
        seriesLabel.node.style.cursor = 'default';

        labelSet.push(seriesLabel);
      }
    });

    this.labelSet = labelSet;

    return labelSet;
  }
}

export default RaphaelBoxTypeChart;
