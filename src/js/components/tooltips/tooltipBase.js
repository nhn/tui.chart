/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import raphael from 'raphael';
import objectUtil from '../../helpers/objectUtil';
import chartConst from '../../const';
import dom from '../../helpers/domHandler';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';

class TooltipBase {
  /**
   * TooltipBase is base class of tooltip components.
   * @constructs TooltipBase
   * @private
   * @param {object} params - parameters
   *      @param {string} params.chartType - chart type
   *      @param {Array.<string>} params.chartTypes - chart types
   *      @param {DataProcessor} params.dataProcessor - DataProcessor instance
   *      @param {object} params.options - tooltip options
   *      @param {object} params.theme - tooltip theme
   *      @param {boolean} params.isVertical - whether vertical or not
   *      @param {object} params.eventBus - snippet.CustomEvents instance
   *      @param {object} params.labelTheme - theme for label
   *      @param {string} params.xAxisType - xAxis type
   *      @param {string} params.dateFormat - date format
   *      @param {object} params.labelFormatter - label formatter function
   */
  constructor(params) {
    const isPieChart = predicate.isPieChart(params.chartType);

    /**
     * Chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * Chart types
     * @type {Array.<string>}
     */
    this.chartTypes = params.chartTypes;

    /**
     * Data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * Options
     * @type {object}
     */
    this.options = params.options;
    this.colors = params.colors;

    /**
     * Theme
     * @type {object}
     */
    this.theme = params.theme;

    /**
     * Original Theme
     * @type {object}
     */
    this.originalTheme = objectUtil.deepCopy(params.theme);

    /**
     * whether vertical or not
     * @type {boolean}
     */
    this.isVertical = params.isVertical;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * label theme
     * @type {object}
     */
    this.labelTheme = params.labelTheme;

    /**
     * x axis type
     * @type {?string}
     */
    this.xAxisType = params.xAxisType;

    /**
     * dateFormat option for xAxis
     * @type {?string}
     */
    this.dateFormat = params.dateFormat;

    /**
     * tooltip options for each chart
     * @type {?function}
     */
    this.labelFormatter = params.labelFormatter;

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-chart-tooltip-area';

    /**
     * Tooltip container.
     * @type {HTMLElement}
     */
    this.tooltipContainer = null;

    /**
     * Tooltip suffix.
     * @type {string}
     */
    this.suffix = this.options.suffix ? `&nbsp;${this.options.suffix}` : '';

    /**
     * Tooltip template function.
     * @type {function}
     */
    this.templateFunc = this.options.template || snippet.bind(this._makeTooltipHtml, this);

    /**
     * Tooltip animation time.
     * @type {number}
     */
    this.animationTime = isPieChart
      ? chartConst.TOOLTIP_PIE_ANIMATION_TIME
      : chartConst.TOOLTIP_ANIMATION_TIME;

    /**
     * TooltipBase base data.
     * @type {Array.<Array.<object>>}
     */
    this.data = [];

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
     */
    this.layout = null;

    /**
     * dimension map for layout of chart
     * @type {null|object}
     */
    this.dimensionMap = null;

    /**
     * position map for layout of chart
     * @type {null|object}
     */
    this.positionMap = null;

    /**
     * Drawing type
     * @type {string}
     */
    this.drawingType = chartConst.COMPONENT_TYPE_DOM;

    this._setDefaultTooltipPositionOption();
    this._saveOriginalPositionOptions();

    this._attachToEventBus();
  }

  /**
   * Preset components for setData
   * @param {object} theme theme object
   * @ignore
   */
  presetForChangeData(theme = this.theme) {
    this.theme = theme;
    this.originalTheme = objectUtil.deepCopy(theme);
  }

  /**
   * Attach to event bus.
   * @private
   */
  _attachToEventBus() {
    this.eventBus.on(
      {
        showTooltip: this.onShowTooltip,
        hideTooltip: this.onHideTooltip
      },
      this
    );

    if (this.onShowTooltipContainer) {
      this.eventBus.on(
        {
          showTooltipContainer: this.onShowTooltipContainer,
          hideTooltipContainer: this.onHideTooltipContainer
        },
        this
      );
    }
  }

  /**
   * Make tooltip html.
   * @private
   * @abstract
   */
  _makeTooltipHtml() {}

  /**
   * Set default align option of tooltip.
   * @private
   * @abstract
   */
  _setDefaultTooltipPositionOption() {}

  /**
   * Save position options.
   * @private
   */
  _saveOriginalPositionOptions() {
    this.orgPositionOptions = {
      align: this.options.align,
      offset: this.options.offset
    };
  }

  /**
   * Render tooltip component.
   * @param {HTMLElement} iconElement - icon element
   */
  makeLineLegendIcon(iconElement) {
    const iconElementLength = iconElement.length;

    for (let i = 0; i < iconElementLength; i += 1) {
      const icon = iconElement[i];
      const strokeColor = icon.style['background-color'];
      const paper = raphael(icon, 10, 10);
      const line = paper.path(chartConst.LEGEND_LINE_ICON_PATH);
      icon.style['background-color'] = '';
      line.attr({
        stroke: strokeColor,
        'stroke-width': 2,
        'stroke-opacity': 1
      });
    }
  }

  /**
   * Make tooltip data.
   * @private
   * @abstract
   */
  makeTooltipData() {}

  /**
   * Set data for rendering.
   * @param {{
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      dimensionMap: object
   * }} data - bounds data
   * @private
   */
  _setDataForRendering(data) {
    this.layout = data.layout;
    this.dimensionMap = data.dimensionMap;
    this.positionMap = data.positionMap;
  }

  /**
   * Render tooltip component.
   * @param {object} data - bounds data
   * @returns {HTMLElement} tooltip element
   */
  render(data) {
    const el = data.paper;

    dom.addClass(el, this.className);

    this._setDataForRendering(data);
    this.data = this.makeTooltipData();
    this.tooltipColors = this.makeTooltipLegendColor(data.checkedLegends);
    renderUtil.renderPosition(el, this.layout.position);

    this.tooltipContainer = el;

    return el;
  }

  /**
   * Rerender.
   * @param {object} data - bounds data
   */
  rerender(data) {
    this.resize(data);
    this.data = this.makeTooltipData();
    this.tooltipColors = this.makeTooltipLegendColor(data.checkedLegends);
  }

  /**
   * make legend color
   * @param {object | Array.<boolean>}checkedLegends checked legends
   * @returns {{colors: Array.<string>}} legend colors
   * @private
   */
  makeTooltipLegendColor(checkedLegends) {
    const colors = {};

    if (checkedLegends) {
      Object.keys(this.theme).forEach(themeKey => {
        if (!colors[themeKey]) {
          colors[themeKey] = [];
        }
        (checkedLegends[themeKey] || []).forEach((checked, index) => {
          if (checked) {
            colors[themeKey].push(this.theme[themeKey].colors[index]);
          }
        });
      });
    }

    return colors;
  }

  /**
   * Resize tooltip component.
   * @param {object} data - bounds data
   * @override
   */
  resize(data) {
    this._setDataForRendering(data);

    renderUtil.renderPosition(this.tooltipContainer, this.layout.position);
    if (this.positionModel) {
      this.positionModel.updateBound(this.layout);
    }
  }

  /**
   * Zoom.
   */
  zoom() {
    this.data = this.makeTooltipData();
  }

  /**
   * Get tooltip element.
   * @returns {HTMLElement} tooltip element
   * @private
   */
  _getTooltipElement() {
    if (!this.tooltipElement) {
      const tooltipElement = (this.tooltipElement = dom.create('DIV', 'tui-chart-tooltip'));
      dom.append(this.tooltipContainer, tooltipElement);
    }

    return this.tooltipElement;
  }

  /**
   * onShowTooltip is callback of mouse event detector showTooltip for SeriesView.
   * @param {object} params coordinate event parameters
   */
  onShowTooltip(params) {
    const tooltipElement = this._getTooltipElement();
    const isScatterCombo =
      predicate.isComboChart(this.chartType) && predicate.isScatterChart(params.chartType);
    let prevPosition;

    if (
      (!predicate.isChartToDetectMouseEventOnSeries(params.chartType) || isScatterCombo) &&
      tooltipElement.offsetWidth
    ) {
      prevPosition = {
        left: tooltipElement.offsetLeft,
        top: tooltipElement.offsetTop
      };
    }
    this._showTooltip(tooltipElement, params, prevPosition);
  }

  /**
   * Get tooltip dimension
   * @param {HTMLElement} tooltipElement tooltip element
   * @returns {{width: number, height: number}} rendered tooltip dimension
   */
  getTooltipDimension({ offsetWidth, offsetHeight }) {
    return {
      width: offsetWidth,
      height: offsetHeight
    };
  }

  /**
   * Move to Position.
   * @param {HTMLElement} tooltipElement tooltip element
   * @param {{left: number, top: number}} position position
   * @param {{left: number, top: number}} prevPosition prev position
   * @private
   */
  _moveToPosition(tooltipElement, position, prevPosition) {
    if (prevPosition) {
      this._slideTooltip(tooltipElement, prevPosition, position);
    } else {
      renderUtil.renderPosition(tooltipElement, position);
    }
  }

  /**
   * Slide tooltip
   * @param {HTMLElement} tooltipElement tooltip element
   * @param {{left: number, top: number}} prevPosition prev position
   * @param {{left: number, top: number}} position position
   * @private
   */
  _slideTooltip(tooltipElement, prevPosition, position) {
    const moveTop = position.top - prevPosition.top;
    const moveLeft = position.left - prevPosition.left;

    renderUtil.cancelAnimation(this.slidingAnimation);

    this.slidingAnimation = renderUtil.startAnimation(this.animationTime, ratio => {
      const left = moveLeft * ratio;
      const top = moveTop * ratio;
      tooltipElement.style.left = `${prevPosition.left + left}px`;
      tooltipElement.style.top = `${prevPosition.top + top}px`;
    });
  }

  /**
   * onHideTooltip is callback of mouse event detector hideTooltip for SeriesView
   * @param {number|object} prevFound - showing tooltip object in case single tooltip,
   *                                  - showing tooltip index in case group tooltip
   * @param {{silent: {boolean}}} [options] - hide tooltip options
   */
  onHideTooltip(prevFound, options) {
    const tooltipElement = this._getTooltipElement();

    this._hideTooltip(tooltipElement, prevFound, options);
  }

  /**
   * Set align option.
   * @param {string} align align
   */
  setAlign(align) {
    this.options.align = align;
    if (this.positionModel) {
      this.positionModel.updateOptions(this.options);
    }
  }

  /**
   * Update offset option.
   * @param {{x: number, y: number}} offset - offset
   * @private
   */
  _updateOffsetOption(offset) {
    this.options.offset = offset;

    if (this.positionModel) {
      this.positionModel.updateOptions(this.options);
    }
  }

  /**
   * Set offset.
   * @param {{x: number, y: number}} offset - offset
   */
  setOffset(offset) {
    const offsetOption = Object.assign({}, this.options.offset);

    if (snippet.isExisty(offset.x)) {
      offsetOption.x = offset.x;
    }

    if (snippet.isExisty(offset.y)) {
      offsetOption.y = offset.y;
    }

    this._updateOffsetOption(snippet.extend({}, this.options.offset, offsetOption));
  }

  /**
   * Set position option.
   * @param {{left: number, top: number}} position moving position
   * @deprecated
   */
  setPosition(position) {
    const offsetOption = Object.assign({}, this.options.offset);

    if (snippet.isExisty(position.left)) {
      offsetOption.x = position.left;
    }

    if (snippet.isExisty(position.top)) {
      offsetOption.y = position.y;
    }

    this._updateOffsetOption(offsetOption);
  }

  /**
   * Reset align option.
   */
  resetAlign() {
    const { align } = this.orgPositionOptions;

    this.options.align = align;

    if (this.positionModel) {
      this.positionModel.updateOptions(this.options);
    }
  }

  /**
   * Reset offset option.
   */
  resetOffset() {
    this.options.offset = this.orgPositionOptions.offset;
    this._updateOffsetOption(this.options.offset);
  }

  /**
   * Get category's raw data
   * @param {number} index - index of categories
   * @param {string} format - date format
   * @returns {string} - category's raw data
   */
  getRawCategory(index, format) {
    const axis = this.isVertical ? 'x' : 'y';
    const categories = this.dataProcessor.categoriesMap
      ? this.dataProcessor.categoriesMap[axis]
      : null;
    let rawCategory = '';

    if (categories) {
      rawCategory = categories[index];
    }

    if (format) {
      rawCategory = renderUtil.formatDate(rawCategory, format);
    }

    return rawCategory;
  }
}

export default TooltipBase;
