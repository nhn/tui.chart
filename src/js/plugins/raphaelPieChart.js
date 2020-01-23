/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';
import raphael from 'raphael';

const DEGREE_180 = 180;
const DEGREE_360 = 360;
const MIN_DEGREE = 0.01;
const RAD = Math.PI / DEGREE_180;
const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;
const DEFAULT_LUMINANT_VALUE = 0.2;
const OVERLAY_ID = 'overlay';
const TOOLTIP_OFFSET_VALUE = 20;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 * @private
 */
class RaphaelPieChart {
  /**
   * Render function of pie chart.
   * @param {object} paper Raphael paper
   * @param {{
   *      sectorData: Array.<object>,
   *      circleBound: {cx: number, cy: number, r: number},
   *      dimension: object, theme: object, options: object
   * }} data render data
   * @param {object} callbacks callbacks
   *      @param {function} callbacks.showTooltip show tooltip function
   *      @param {function} callbacks.hideTooltip hide tooltip function
   * @returns {object} paper raphael paper
   */
  render(paper, data, callbacks) {
    const pieSeriesSet = paper.set();
    /**
     * series rendering animation duration
     * @type {number | object}
     */
    this.animationDuration = data.options.animationDuration;

    /**
     * raphael object
     * @type {object}
     */
    this.paper = paper;

    /**
     * ratio for hole
     * @type {number}
     */
    // this.holeRatio = data.options.radiusRange[0];
    [this.holeRatio] = data.options.radiusRange;

    /**
     * base background
     * @type {string}
     */
    this.chartBackground = data.chartBackground;

    /**
     * type of chart
     * @type {string}
     */
    this.chartType = data.chartType;

    /**
     * functions for tooltip control
     * @type {{showTooltip: Function, hideTooltip: Function}}
     */
    this.callbacks = callbacks;

    /**
     * color for selection
     * @type {string}
     */
    this.selectionColor = data.theme.selectionColor;

    /**
     * bound for circle
     * @type {{cx: number, cy: number, r: number}}
     */
    this.circleBound = data.circleBound;

    /**
     * sector attr's name for draw graph
     * @type {string}
     */
    this.sectorName = `sector_${this.chartType}`;

    this._setSectorAttr();

    this.sectorInfos = this._renderPie(
      data.sectorData,
      data.theme.colors,
      data.additionalIndex,
      pieSeriesSet
    );

    this.overlay = this._renderOverlay();

    this.labelInfos = {
      value: [],
      legend: []
    };

    /**
     * previous mouse position
     * @type {{left: number, top: number}}
     */
    this.prevPosition = null;

    /**
     * previous hover sector
     * @type {object}
     */
    this.prevHoverSector = null;

    return pieSeriesSet;
  }

  /**
   * Clear paper.
   */
  clear() {
    this.paper.clear();
  }

  /**
   * Make sector path.
   * @param {number} cx center x
   * @param {number} cy center y
   * @param {number} r radius
   * @param {number} startAngle start angle
   * @param {number} endAngle end angel
   * @returns {{path: Array}} sector path
   * @private
   */
  _makeSectorPath(cx, cy, r, startAngle, endAngle) {
    const startRadian = startAngle * RAD;
    const endRadian = endAngle * RAD;
    const x1 = cx + r * Math.sin(startRadian); // x point of start radian
    const y1 = cy - r * Math.cos(startRadian); // y point of start radian
    const x2 = cx + r * Math.sin(endRadian); // x point of end radian
    const y2 = cy - r * Math.cos(endRadian); // y point of end radian
    const largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
    const path = ['M', cx, cy, 'L', x1, y1, 'A', r, r, 0, largeArcFlag, 1, x2, y2, 'Z'];

    // see details about path
    // http://www.w3schools.com/svg/svg_path.asp
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
    return { path };
  }

  /**
   * Make sector path for donut chart.
   * @param {number} cx - center x
   * @param {number} cy - center y
   * @param {number} r - radius
   * @param {number} startAngle - start angle
   * @param {number} endAngle - end angel
   * @param {number} [holeRadius] - hole radius
   * @returns {{path: Array}} sector path
   * @private
   */
  _makeDonutSectorPath(cx, cy, r, startAngle, endAngle, holeRadius) {
    /* eslint max-params: [2, 6]*/
    const startRadian = startAngle * RAD;
    const endRadian = endAngle * RAD;
    const r2 = holeRadius || r * this.holeRatio; // radius of donut hole
    const x1 = cx + r * Math.sin(startRadian);
    const y1 = cy - r * Math.cos(startRadian);
    const x2 = cx + r2 * Math.sin(startRadian);
    const y2 = cy - r2 * Math.cos(startRadian);
    const x3 = cx + r * Math.sin(endRadian);
    const y3 = cy - r * Math.cos(endRadian);
    const x4 = cx + r2 * Math.sin(endRadian);
    const y4 = cy - r2 * Math.cos(endRadian);
    const largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;

    // prettier-ignore
    const path = [
      'M', x1, y1,
      'A', r, r, 0, largeArcFlag, 1, x3, y3,
      'L', x4, y4,
      'A', r2, r2, 0, largeArcFlag, 0, x2, y2,
      'Z'
    ];

    return { path };
  }

  /**
   * Set sector attribute for raphael paper.
   * @private
   */
  _setSectorAttr() {
    let makeSectorPath;

    if (this.paper.customAttributes[this.sectorName]) {
      return;
    }

    if (this.holeRatio) {
      makeSectorPath = this._makeDonutSectorPath;
    } else {
      makeSectorPath = this._makeSectorPath;
    }

    this.paper.customAttributes[this.sectorName] = makeSectorPath.bind(this);
  }

  /**
   * Render overlay.
   * @returns {object} raphael object
   * @private
   */
  _renderOverlay() {
    const params = {
      paper: this.paper,
      circleBound: {
        cx: 0,
        cy: 0,
        r: 0
      },
      angles: {
        startAngle: 0,
        endAngle: 0
      },
      attrs: {
        fill: 'none',
        opacity: 0,
        stroke: this.chartBackground.color,
        'stroke-width': 1
      }
    };
    const inner = this._renderSector(params);

    inner.node.setAttribute('class', 'auto-shape-rendering');

    inner.data('id', OVERLAY_ID);
    inner.data('chartType', this.chartType);

    return inner;
  }

  /**
   * Render sector
   * @param {object} params parameters
   *      @param {object} params.paper raphael paper
   *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds
   *      @param {number} params.startAngle start angle
   *      @param {number} params.endAngle end angle
   *      @param {{object}} params.attrs attributes
   * @returns {object} raphael object
   * @private
   */
  _renderSector(params) {
    const { circleBound, angles, attrs } = params;

    attrs[this.sectorName] = [
      circleBound.cx,
      circleBound.cy,
      circleBound.r,
      angles.startAngle,
      angles.endAngle
    ];

    return params.paper.path().attr(attrs);
  }

  /**
   * Render pie graph.
   * @param {Array.<object>} sectorData - sectorData
   * @param {Array.<string>} colors - sector colors
   * @param {number} additionalIndex - additional index for accumulate past pie series's data indexes on pieDonutCombo
   * @param {Array.<object>} pieSeriesSet - pie series set
   * @returns {Array.<object>}
   * @private
   */
  _renderPie(sectorData, colors, additionalIndex, pieSeriesSet) {
    const { circleBound, chartBackground, animationDuration } = this;
    const sectorInfos = [];

    sectorData.forEach((sectorDatum, index) => {
      const { ratio, angles } = sectorDatum;
      const color = colors[index];
      const sector = this._renderSector({
        paper: this.paper,
        circleBound,
        angles: animationDuration ? angles.start : angles.end,
        attrs: {
          fill: animationDuration ? chartBackground.color : color,
          stroke: chartBackground.color,
          'stroke-width': 0
        }
      });

      sector.node.setAttribute('class', 'auto-shape-rendering');

      sector.data('index', index);
      sector.data('legendIndex', index + additionalIndex);
      sector.data('chartType', this.chartType);

      sectorInfos.push({
        sector,
        color,
        angles: angles.end,
        ratio
      });

      pieSeriesSet.push(sector);
    });

    return sectorInfos;
  }

  /**
   * Show overlay.
   * @param {number} index - index
   * @param {number} legendIndex - legend index
   * @private
   */
  _showOverlay(index, legendIndex) {
    const { overlay } = this;
    const sectorInfo = this.sectorInfos[index];
    const sa = sectorInfo.angles.startAngle;
    const ea = sectorInfo.angles.endAngle;
    const cb = this.circleBound;
    const innerAttrs = {
      fill: '#fff',
      opacity: 1,
      'stroke-width': 7,
      'stroke-color': '#fff',
      'stroke-miterlimit': 15
    };

    innerAttrs[this.sectorName] = [cb.cx, cb.cy, cb.r, sa, ea, cb.r * this.holeRatio];
    overlay.attr(innerAttrs);
    overlay.data('index', index);
    overlay.data('legendIndex', legendIndex);

    overlay.node.setAttribute('filter', 'url(#shadow)');

    this._indexingOverlapElement([
      overlay,
      sectorInfo.sector,
      this.labelInfos.legend[index],
      this.labelInfos.value[index]
    ]);
  }

  /**
   * Element indexing For overlay.
   * @param {Array} elements - indexing elements
   * @private
   */
  _indexingOverlapElement(elements) {
    elements.forEach(element => {
      if (element) {
        element.toFront();
      }
    });
  }

  /**
   * Hide overlay.
   * @private
   */
  _hideOverlay() {
    const { overlay } = this;
    const attrs = {
      fill: 'none',
      opacity: 0
    };

    overlay.attr(attrs);

    this._indexingOverlapElement(this.labelInfos.legend);
    this._indexingOverlapElement(this.labelInfos.value);
  }

  /**
   * Animate.
   * @param {function} callback callback
   */
  animate(callback) {
    const { sectorName, circleBound, animationDuration } = this;
    const sectorArgs = [circleBound.cx, circleBound.cy, circleBound.r];
    let delayTime = 0;

    this.sectorInfos.forEach(sectorInfo => {
      const { angles } = sectorInfo;
      const attrMap = {
        fill: sectorInfo.color
      };
      if (animationDuration) {
        const animationTime = animationDuration * sectorInfo.ratio;

        if (angles.startAngle === 0 && angles.endAngle === DEGREE_360) {
          angles.endAngle = DEGREE_360 - MIN_DEGREE;
        }
        attrMap[sectorName] = sectorArgs.concat([angles.startAngle, angles.endAngle]);
        const anim = raphael.animation(attrMap, animationTime, '>');
        sectorInfo.sector.animate(anim.delay(delayTime));
        delayTime += animationTime;
      }
    });

    if (callback) {
      setTimeout(callback, delayTime);
    }
  }

  /**
   * Resize graph of pie chart.
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {{cx:number, cy:number, r: number}} params.circleBound circle bound
   */
  resize(params) {
    const { dimension, circleBound } = params;
    this.circleBound = circleBound;
    this.paper.setSize(dimension.width, dimension.height);
  }

  findSectorInfo(position) {
    const sector = this.paper && this.paper.getElementByPoint(position.left, position.top);
    let info = null;

    if (sector) {
      info = {
        legendIndex: snippet.isExisty(sector.data('legendIndex')) ? sector.data('legendIndex') : -1,
        index: snippet.isExisty(sector.data('index')) ? sector.data('index') : -1,
        chartType: sector.data('chartType')
      };
    }

    return info;
  }

  /**
   * Whether changed or not.
   * @param {{left: number, top: number}} prevPosition previous position
   * @param {{left: number, top: number}} position position
   * @returns {boolean} result boolean
   * @private
   */
  _isChangedPosition(prevPosition, position) {
    return (
      !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top
    );
  }

  /**
   * Show tooltip.
   * @param {object} sector - raphael object
   * @param {{left: number, top: number}} position - mouse position
   * @private
   */
  _showTooltip(sector, position) {
    const args = [
      {},
      0,
      sector.data('index'),
      {
        left: position.left - TOOLTIP_OFFSET_VALUE,
        top: position.top - TOOLTIP_OFFSET_VALUE
      }
    ];

    this.callbacks.showTooltip.apply(null, args);
  }

  /**
   * Whether valid sector or not.
   * @param {object} sector - raphael object
   * @returns {boolean}
   * @private
   */
  _isValidSector(sector) {
    return sector && sector.data('chartType') === this.chartType;
  }

  /**
   * Move mouse on series.
   * @param {{left: number, top: number}} position mouse position
   */
  moveMouseOnSeries(position) {
    const sector = this.paper && this.paper.getElementByPoint(position.left, position.top);

    if (this._isValidSector(sector)) {
      if (this.prevHoverSector !== sector) {
        this._showOverlay(sector.data('index'), sector.data('legendIndex'));
        this.prevHoverSector = sector;
      }

      if (this._isChangedPosition(this.prevPosition, position)) {
        this._showTooltip(sector, position);
      }
    } else if (this.prevHoverSector) {
      this._hideOverlay();
      this.callbacks.hideTooltip();
      this.prevHoverSector = null;
    }

    this.prevPosition = position;
  }

  /**
   * Select series.
   * @param {{index: number}} indexes - index map
   */
  selectSeries(indexes) {
    const sectorInfo = this.sectorInfos[indexes.index];

    if (!sectorInfo) {
      return;
    }

    const objColor = raphael.color(sectorInfo.color);
    const luminanceColor = raphaelRenderUtil.makeChangedLuminanceColor(
      objColor.hex,
      DEFAULT_LUMINANT_VALUE
    );
    const color = this.selectionColor || luminanceColor;

    sectorInfo.sector.attr({
      fill: color
    });
  }

  /**
   * Unelect series.
   * @param {{index: number}} indexes - index map
   */
  unselectSeries(indexes) {
    const sectorInfo = this.sectorInfos[indexes.index];

    if (!sectorInfo) {
      return;
    }

    sectorInfo.sector.attr({
      fill: sectorInfo.color
    });
  }

  /**
   * Select legend.
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const isNull = snippet.isNull(legendIndex);
    this.sectorInfos.forEach((sectorInfo, index) => {
      const opacity = isNull || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      sectorInfo.sector.attr({
        'fill-opacity': opacity
      });
    });
  }

  /**
   * Get rendered label width
   * @param {string} text - text content
   * @param {object} theme - label theme
   * @returns {number}
   */
  getRenderedLabelWidth(text, theme) {
    return raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily).width;
  }

  /**
   * Get rendered label height
   * @param {string} text - text content
   * @param {object} theme - label theme
   * @returns {number}
   */
  getRenderedLabelHeight(text, theme) {
    return raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily).height;
  }

  /**
   * Render labels and return label set
   * @param {object} options label render options
   *      @param {dataType} options.dataType dataType (legend or value)
   *      @param {object} options.paper Raphael paper
   *      @param {Array.<object>} options.labelSet lableset
   *      @param {object} options.positions position left, top
   *      @param {Array.<string>} options.labels series labels
   *      @param {object} options.theme label theme
   *      @param {Array} options.colors series theme colors
   */
  renderLabels(options) {
    const { theme, labelFilter, dataType, ratioValues, seriesNames } = options;
    const attributes = {
      'font-size': theme.fontSize,
      'font-family': options.fontFamily ? options.fontFamily : options.theme.fontFamily,
      'font-weight': theme.fontWeight,
      'text-anchor': 'middle',
      fill: theme.color || '#fff',
      opacity: 0
    };

    options.positions.forEach((position, index) => {
      const ratio = ratioValues[index];
      const isFiltered =
        labelFilter &&
        !labelFilter({
          value: options.labels[index],
          labelType: dataType,
          seriesName: seriesNames[index],
          ratio
        });
      let label;

      if (isFiltered) {
        return;
      }

      if (options.colors) {
        attributes.fill = options.colors[index];
      }

      if (position) {
        label = raphaelRenderUtil.renderText(
          options.paper,
          position,
          options.labels[index],
          attributes
        );
        label.node.style.userSelect = 'none';
        label.node.style.cursor = 'default';
        label.node.setAttribute('class', 'auto-shape-rendering');
      }

      this.labelInfos[dataType].push(label);
      options.labelSet.push(label);
    }, this);

    if (!this.labelSet) {
      this.labelSet = options.labelSet;
    }
  }
}

export default RaphaelPieChart;
