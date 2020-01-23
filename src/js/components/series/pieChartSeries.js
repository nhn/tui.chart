/**
 * @fileoverview Pie chart series component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import snippet from 'tui-code-snippet';
import raphaelRenderUtil from '../../plugins/raphaelRenderUtil';

const {
  COMPONENT_TYPE_RAPHAEL,
  ANGLE_360,
  PIE_GRAPH_LEGEND_LABEL_INTERVAL,
  ANGLE_90,
  PIE_GRAPH_SMALL_RATIO,
  PIE_GRAPH_DEFAULT_RATIO,
  RAD,
  PIE_GRAPH_LEGEND_LABEL_SIZE,
  SERIES_OUTER_LABEL_PADDING,
  SERIES_LABEL_PADDING
} = chartConst;
const COMBO_PIE1 = 'pie1';

class PieChartSeries extends Series {
  /**
   * Line chart series component.
   * @constructs PieChartSeries
   * @private
   * @extends Series
   * @param {object} params parameters
   *      @param {object} params.model series model
   *      @param {object} params.options series options
   *      @param {object} params.theme series theme
   */
  constructor(params) {
    super(params);

    this.isCombo = !!params.isCombo;

    this.isShowOuterLabel = predicate.isShowOuterLabel(this.options);

    this.isLabelAlignOuter = predicate.isLabelAlignOuter(this.options.labelAlign);

    this.legendMaxWidth = params.legendMaxWidth;

    this.drawingType = COMPONENT_TYPE_RAPHAEL;

    /**
     * range for quadrant.
     * @type {?number}
     */
    this.quadrantRange = null;

    /**
     * previous clicked index.
     * @type {?number}
     */
    this.prevClickedIndex = null;

    /**
     * series legend names
     * @type {Array}
     */
    this.legendLabels = [];

    /**
     * series values.
     * @type {Array}
     */
    this.valueLabels = [];

    /**
     * series ratio values.
     * @type {Array}
     */
    this.ratioValues = [];

    /**
     * max legend width
     * @type {number}
     */
    this.legendLongestWidth = 0;

    /**
     * labelTheme
     * @type {object}
     */
    this.labelTheme = this.theme.label;

    this._setDefaultOptions();
  }

  /**
   * Make legendlabes
   * @returns {Array.<string>}
   * @private
   */
  _getLegendLabels() {
    const legendLabels = this.dataProcessor.getLegendLabels(this.seriesType);

    return legendLabels.map(legendName =>
      raphaelRenderUtil.getEllipsisText(legendName, this.legendMaxWidth, this.labelTheme)
    );
  }

  /**
   * Make valid angle.
   * @param {number} angle - angle
   * @param {number} defaultAngle - default angle
   * @returns {number}
   * @private
   */
  _makeValidAngle(angle, defaultAngle) {
    if (snippet.isUndefined(angle)) {
      angle = defaultAngle;
    } else if (angle < 0) {
      angle = ANGLE_360 - (Math.abs(angle) % ANGLE_360);
    } else if (angle > 0) {
      angle = angle % ANGLE_360;
    }

    return angle;
  }

  /**
   * Transform radius range.
   * @param {Array.<number>} radiusRange - radius range
   * @returns {Array}
   * @private
   */
  _transformRadiusRange(radiusRange = ['0%', '100%']) {
    return radiusRange.map(percent => {
      const ratio = parseInt(percent, 10) * 0.01;

      return Math.max(Math.min(ratio, 1), 0);
    });
  }

  /**
   * Set default options for series of pie type chart.
   * @private
   */
  _setDefaultOptions() {
    const { options } = this;

    options.startAngle = this._makeValidAngle(options.startAngle, 0);
    options.endAngle = this._makeValidAngle(options.endAngle, options.startAngle);
    options.radiusRange = this._transformRadiusRange(options.radiusRange);

    if (options.radiusRange.length === 1) {
      options.radiusRange.unshift(0);
    }
  }

  /**
   * Calculate angle for rendering.
   * @returns {number}
   * @private
   */
  _calculateAngleForRendering() {
    const { startAngle, endAngle } = this.options;
    let renderingAngle;

    if (startAngle < endAngle) {
      renderingAngle = endAngle - startAngle;
    } else if (startAngle > endAngle) {
      renderingAngle = ANGLE_360 - (startAngle - endAngle);
    } else {
      renderingAngle = ANGLE_360;
    }

    return renderingAngle;
  }

  /**
   * Make sectors information.
   * @param {{cx: number, cy: number, r: number}} circleBound circle bound
   * @returns {Array.<object>} sectors information
   * @private
   */
  _makeSectorData(circleBound) {
    const { cx, r, cy } = circleBound;
    const [holeRatio] = this.options.radiusRange;
    const angleForRendering = this._calculateAngleForRendering();
    const seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();
    let angle = this.options.startAngle;
    let centerR = r * 0.5;

    if (holeRatio) {
      centerR += centerR * holeRatio;
    }

    if (!seriesGroup) {
      return null;
    }

    const paths = seriesGroup.map(seriesItem => {
      const ratio = seriesItem ? seriesItem.ratio : 0;
      const currentAngle = angleForRendering * ratio;
      const endAngle = angle + currentAngle;
      const popupAngle = angle + currentAngle / 2;
      const angles = {
        start: {
          startAngle: angle,
          endAngle: angle
        },
        end: {
          startAngle: angle,
          endAngle
        }
      };
      const positionData = {
        cx,
        cy,
        angle: popupAngle
      };

      angle = endAngle;

      return {
        ratio,
        angles,
        centerPosition: this._getArcPosition(
          snippet.extend(
            {
              r: centerR
            },
            positionData
          )
        ),
        outerPosition: this._getArcPosition(
          snippet.extend(
            {
              r: r + this.legendLongestWidth / 2 + PIE_GRAPH_LEGEND_LABEL_INTERVAL
            },
            positionData
          )
        )
      };
    });

    return paths;
  }

  /**
   * Make value labels
   * @returns {Array.<string>}
   * @private
   */
  _makeValueLabel() {
    const seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();

    return seriesGroup.map(seriesItem => seriesItem.label);
  }

  /**
   * Make ratio values
   * @returns {Array.<number>}
   * @private
   */
  _makeRatioValues() {
    const seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();

    return seriesGroup.map(seriesItem => seriesItem.ratio);
  }

  /**
   * Make series data.
   * @returns {{
   *      chartBackground: string,
   *      circleBound: ({cx: number, cy: number, r: number}),
   *      sectorData: Array.<object>
   * }} add data for graph rendering
   * @private
   * @override
   */
  _makeSeriesData() {
    this.valueLabels = this._makeValueLabel();
    this.legendLabels = this._getLegendLabels();
    this.legendLongestWidth = this._getMaxLengthLegendWidth();
    this.ratioValues = this._makeRatioValues();

    const circleBound = this._makeCircleBound();
    const sectorData = this._makeSectorData(circleBound);

    return {
      chartBackground: this.chartBackground,
      circleBound,
      sectorData,
      isAvailable: () => sectorData && sectorData.length > 0
    };
  }

  /**
   * Get quadrant from angle.
   * @param {number} angle - angle
   * @param {boolean} isEnd whether end quadrant
   * @returns {number}
   * @private
   */
  _getQuadrantFromAngle(angle, isEnd) {
    let quadrant = parseInt(angle / ANGLE_90, 10) + 1;

    if (isEnd && angle % ANGLE_90 === 0) {
      quadrant += quadrant === 1 ? 3 : -1;
    }

    return quadrant;
  }

  /**
   * Get range for quadrant.
   * @returns {{start: number, end: number}}
   * @private
   */
  _getRangeForQuadrant() {
    if (!this.quadrantRange) {
      this.quadrantRange = {
        start: this._getQuadrantFromAngle(this.options.startAngle),
        end: this._getQuadrantFromAngle(this.options.endAngle, true)
      };
    }

    return this.quadrantRange;
  }

  /**
   * Whether in range for quadrant.
   * @param {number} start - start quadrant
   * @param {number} end - end quadrant
   * @returns {boolean}
   * @private
   */
  _isInQuadrantRange(start, end) {
    const quadrantRange = this._getRangeForQuadrant();

    return quadrantRange.start === start && quadrantRange.end === end;
  }

  /**
   * Calculate base size.
   * @returns {number}
   * @private
   */
  _calculateBaseSize() {
    const { dimension } = this.layout;
    let { width, height } = dimension;

    if (!this.isCombo) {
      const quadrantRange = this._getRangeForQuadrant();
      if (this._isInQuadrantRange(2, 3) || this._isInQuadrantRange(4, 1)) {
        height *= 2;
      } else if (this._isInQuadrantRange(1, 2) || this._isInQuadrantRange(3, 4)) {
        width *= 2;
      } else if (quadrantRange.start === quadrantRange.end) {
        width *= 2;
        height *= 2;
      }
    }

    return Math.min(width, height);
  }

  /**
   * Calculate radius.
   * @returns {number}
   * @private
   */
  _calculateRadius() {
    const isComboPie1 = this.isCombo && this.seriesType === COMBO_PIE1;
    const baseSize = this._calculateBaseSize();
    let radiusRatio = 0;
    let { isShowOuterLabel } = this;

    if (isComboPie1) {
      isShowOuterLabel = this.dataProcessor.isComboDonutShowOuterLabel();
    }

    radiusRatio = isShowOuterLabel ? PIE_GRAPH_SMALL_RATIO : PIE_GRAPH_DEFAULT_RATIO;

    return (baseSize * radiusRatio * this.options.radiusRange[1]) / 2;
  }

  /**
   * Calculate center x, y.
   * @param {number} radius - radius
   * @returns {{cx: number, cy: number}}
   * @private
   */
  _calculateCenterXY(radius) {
    const {
      dimension: { width, height },
      position: { top, left }
    } = this.layout;
    const halfRadius = radius / 2;
    let cx = width / 2 + left;
    let cy = height / 2 + top;

    if (!this.isCombo) {
      if (this._isInQuadrantRange(1, 1)) {
        cx -= halfRadius;
        cy += halfRadius;
      } else if (this._isInQuadrantRange(1, 2)) {
        cx -= halfRadius;
      } else if (this._isInQuadrantRange(2, 2)) {
        cx -= halfRadius;
        cy -= halfRadius;
      } else if (this._isInQuadrantRange(2, 3)) {
        cy -= halfRadius;
      } else if (this._isInQuadrantRange(3, 3)) {
        cx += halfRadius;
        cy -= halfRadius;
      } else if (this._isInQuadrantRange(3, 4)) {
        cx += halfRadius;
      } else if (this._isInQuadrantRange(4, 1)) {
        cy += halfRadius;
      } else if (this._isInQuadrantRange(4, 4)) {
        cx += halfRadius;
        cy += halfRadius;
      }
    }

    return {
      cx,
      cy
    };
  }

  /**
   * Make circle bound
   * @returns {{cx: number, cy: number, r: number}} circle bounds
   * @private
   */
  _makeCircleBound() {
    const radius = this._calculateRadius();
    const centerXY = this._calculateCenterXY(radius);

    return Object.assign(
      {
        r: radius
      },
      centerXY
    );
  }

  /**
   * Get arc position.
   * @param {object} params parameters
   *      @param {number} params.cx center x
   *      @param {number} params.cy center y
   *      @param {number} params.r radius
   *      @param {number} params.angle angle(degree)
   * @returns {{left: number, top: number}} arc position
   * @private
   */
  _getArcPosition(params) {
    return {
      left: params.cx + params.r * Math.sin(params.angle * RAD),
      top: params.cy - params.r * Math.cos(params.angle * RAD)
    };
  }

  /**
   * Render raphael graph.
   * @param {{width: number, height: number}} dimension dimension
   * @param {object} seriesData series data
   * @param {object} paper paper object
   * @private
   * @override
   */
  _renderGraph(dimension, seriesData, paper) {
    const showTooltip = this.showTooltip.bind(this, {
      allowNegativeTooltip: !!this.allowNegativeTooltip,
      seriesType: this.seriesType,
      chartType: this.chartType
    });

    const callbacks = {
      showTooltip,
      hideTooltip: this.hideTooltip.bind(this)
    };
    const params = this._makeParamsForGraphRendering(dimension, seriesData);
    const currentSeriesName = this.seriesType;
    const { seriesDataModelMap } = this.dataProcessor;
    const pastSeriesNames = [];
    let pastIndex = 0;

    (this.dataProcessor.seriesTypes || []).forEach(seriesType => {
      let needNext = true;

      if (seriesType !== currentSeriesName) {
        pastSeriesNames.push(seriesType);
      } else {
        needNext = false;
      }

      return needNext;
    });

    pastSeriesNames.forEach(seriesType => {
      pastIndex += seriesDataModelMap[seriesType].baseGroups.length;
    });

    params.additionalIndex = pastIndex;

    return this.graphRenderer.render(paper, params, callbacks);
  }

  /**
   * showTooltip is mouseover event callback on series graph.
   * @param {object} params parameters
   *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
   * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
   * @param {number} groupIndex group index
   * @param {number} index index
   * @param {{left: number, top: number}} mousePosition mouse position
   */
  showTooltip(params, bound, groupIndex, index, mousePosition) {
    this.eventBus.fire(
      'showTooltip',
      snippet.extend(
        {
          indexes: {
            groupIndex,
            index
          },
          mousePosition
        },
        params
      )
    );
  }

  /**
   * hideTooltip is mouseout event callback on series graph.
   */
  hideTooltip() {
    this.eventBus.fire('hideTooltip');
  }

  /**
   * legendh max length width
   * @returns {number} max width
   * @private
   */
  _getMaxLengthLegendWidth() {
    const lableWidths = this.legendLabels.map(
      label =>
        raphaelRenderUtil.getRenderedTextSize(
          label,
          this.labelTheme.fontSize,
          this.labelTheme.fontFamily
        ).width
    );

    lableWidths.sort((prev, next) => prev - next);

    return lableWidths[lableWidths.length - 1];
  }

  /**
   * Make series data by selection.
   * @param {number} index index
   * @returns {{indexes: {index: number, groupIndex: number}}} series data
   * @private
   */
  _makeSeriesDataBySelection(index) {
    return {
      indexes: {
        index,
        groupIndex: index
      }
    };
  }

  /**
   * Pick poistions from sector data.
   * @param {string} positionType position type
   * @param {string} dataType legend or value label
   * @returns {Array} positions
   * @private
   */
  _pickPositionsFromSectorData(positionType, dataType) {
    const { showLegend, showLabel } = this.options;
    const legendLabelHeight = raphaelRenderUtil.getRenderedTextSize(
      this.legendLabels[0],
      this.labelTheme.fontSize,
      this.labelTheme.fontFamily
    ).height;

    const valueLabelHeight = raphaelRenderUtil.getRenderedTextSize(
      this.valueLabels[0],
      PIE_GRAPH_LEGEND_LABEL_SIZE,
      this.labelTheme.fontFamily
    ).height;

    return (this.seriesData.sectorData || []).map(datum => {
      const position = datum.ratio ? Object.assign({}, datum[positionType]) : null;
      const isReCalculatePosition = position && showLegend && showLabel && !this.isLabelAlignOuter;

      if (isReCalculatePosition) {
        if (dataType === 'value') {
          position.top -= valueLabelHeight / 2;
        } else if (dataType === 'legend') {
          position.top += legendLabelHeight / 2;
        }
      }

      return position;
    });
  }

  /**
   * Add end position.
   * @param {number} centerLeft center left
   * @param {Array.<object>} positions positions
   * @private
   */
  _addEndPosition(centerLeft, positions) {
    positions.forEach(position => {
      if (!position) {
        return;
      }

      const end = snippet.extend({}, position.middle);
      if (end.left < centerLeft) {
        end.left -= SERIES_OUTER_LABEL_PADDING;
      } else {
        end.left += SERIES_OUTER_LABEL_PADDING;
      }
      position.end = end;
    });
  }

  /**
   * Move to outer position.
   * @param {number} centerLeft center left
   * @param {object} position position
   * @param {string} label label
   * @returns {{left: number, top: number}} outer position
   * @private
   */
  _moveToOuterPosition(centerLeft, position, label) {
    const positionEnd = position.end;
    const { left, top } = positionEnd;
    const OffsetX =
      this.graphRenderer.getRenderedLabelWidth(label, this.labelTheme) / 2 + SERIES_LABEL_PADDING;

    return {
      left: left < centerLeft ? left - OffsetX : left + OffsetX,
      top
    };
  }

  /**
   * set series position
   * @param {object} params position infos
   * @param {Array.<string>} labels labels array
   * @returns {Array.<number>}
   * @private
   */
  _setSeriesPosition(params, labels) {
    let positions = [];
    if (params.funcMoveToPosition) {
      positions = params.positions.map((position, index) => {
        if (position) {
          return params.funcMoveToPosition(position, labels[index]);
        }

        return null;
      });
    } else {
      positions = params.positions;
    }

    return positions;
  }

  /**
   * Render series label.
   * @param {object} paper paper
   * @returns {Array.<object>}
   * @private
   */
  _renderSeriesLabel(paper) {
    let positions = [];
    const renderOption = {};
    const labelSet = paper.set();

    const graphRenderLabel = function(dataType, labels) {
      let colors;
      const theme = Object.assign({}, this.theme.label);
      const { ratioValues } = this;

      if (this.isLabelAlignOuter && dataType === 'legend') {
        colors = this.theme.colors;
        theme.fontWeight = 'bold';
      }

      theme.fontSize = dataType === 'value' ? 16 : theme.fontSize;
      positions = this._setSeriesPosition(renderOption, labels);

      this.graphRenderer.renderLabels({
        dataType,
        paper,
        labelSet,
        positions,
        labels,
        ratioValues,
        theme,
        colors,
        seriesNames: this.legendLabels,
        labelFilter: this.options.labelFilter
      });
    }.bind(this);

    if (this.options.showLabel) {
      renderOption.positions = this._pickPositionsFromSectorData('centerPosition', 'value');
      graphRenderLabel('value', this.decorateLabel(this.valueLabels));
    }

    if (this.options.showLegend) {
      const legendLabelPosition = this.isLabelAlignOuter ? 'outerPosition' : 'centerPosition';
      renderOption.positions = this._pickPositionsFromSectorData(legendLabelPosition, 'legend');
      graphRenderLabel('legend', this.legendLabels);
    }

    return labelSet;
  }

  /**
   * Whether detected label element or not.
   * @param {{left: number, top: number}} position - mouse position
   * @returns {boolean}
   * @private
   */
  _isDetectedLabel(position) {
    const labelElement = document.elementFromPoint(position.left, position.top);

    return snippet.isString(labelElement.className);
  }

  /**
   * On click series.
   * @param {{left: number, top: number}} position mouse position
   */
  onClickSeries(position) {
    const sectorInfo = this._executeGraphRenderer(position, 'findSectorInfo');
    const prevIndex = this.prevClickedIndex;
    const { allowSelect } = this.options;

    if (
      (sectorInfo || this._isDetectedLabel(position)) &&
      snippet.isExisty(prevIndex) &&
      allowSelect
    ) {
      this.onUnselectSeries({
        indexes: {
          index: prevIndex
        }
      });
      this.prevClickedIndex = null;
    }

    if (!sectorInfo || sectorInfo.chartType !== this.seriesType) {
      return;
    }

    const foundIndex = sectorInfo.index;
    const shouldSelect = foundIndex > -1 && foundIndex !== prevIndex;

    if (allowSelect && !shouldSelect) {
      return;
    }

    this.onSelectSeries(
      {
        chartType: this.chartType,
        indexes: {
          index: foundIndex,
          legendIndex: sectorInfo.legendIndex
        }
      },
      shouldSelect
    );

    if (allowSelect && foundIndex > -1) {
      this.prevClickedIndex = foundIndex;
    }
  }

  /**
   * On move series.
   * @param {{left: number, top: number}} position mouse position
   */
  onMoveSeries(position) {
    this._executeGraphRenderer(position, 'moveMouseOnSeries');
  }
}

/**
 * pieSeriesFactory
 * @param {object} params chart options
 * @returns {object} pie series instance
 * @ignore
 */
export default function pieSeriesFactory(params) {
  const { libType, chartType, legend: legendOption } = params.chartOptions;
  const { chartTheme } = params;

  params.libType = libType;
  params.chartType = 'pie';

  if (chartType === 'combo') {
    // elias series mapping key is used as a seriesType(ex. pie1)
    // It is now distinguished to follow current structure
    // elias will not be needed after chart constructor is integrated
    [params.seriesType] = params.name.split('Series');
    params.isCombo = true;
  }

  if (legendOption) {
    params.legendMaxWidth = legendOption.maxWidth;
  }

  params.chartBackground = chartTheme.chart.background;

  return new PieChartSeries(params);
}

pieSeriesFactory.componentType = 'series';
pieSeriesFactory.PieChartSeries = PieChartSeries;
