/**
 * @fileoverview ChartBase
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import ComponentManager from './componentManager';
import DefaultDataProcessor from '../models/data/dataProcessor';
import rawDataHandler from '../models/data/rawDataHandler';
import dom from '../helpers/domHandler';
import renderUtil from '../helpers/renderUtil';
import objectUtil from '../helpers/objectUtil';
import boundsAndScaleBuilder from '../models/boundsAndScaleBuilder.js';
import themeManager from '../themes/themeManager';
import predicate from '../helpers/predicate';
import snippet from 'tui-code-snippet';

const GA_TRACKING_ID = 'UA-129983528-1';

/** Class representing a point. */
class ChartBase {
  /**
   * Chart base.
   * @constructs ChartBase
   * @param {object} params parameters
   *      @param {object} params.rawData raw data
   *      @param {object} params.theme chart theme
   *      @param {object} params.options chart options
   *      @param {boolean} params.hasAxes whether has axes or not
   *      @param {boolean} params.isVertical whether vertical or not
   *      @param {DataProcessor} params.DataProcessor DataProcessor
   */
  constructor(params) {
    /**
     * theme
     * @type {object}
     * @ignore
     */
    this.theme = params.theme;

    if (params.seriesTypes) {
      this.seriesTypes = params.seriesTypes;
    }

    if (params.chartTypes) {
      this.chartTypes = params.chartTypes;
    }

    /**
     * chart original options
     * @type {string}
     * @ignore
     */
    this.originalOptions = objectUtil.deepCopy(params.options);

    this._initializeOptions(params.options);

    /**
     * chart type
     * @type {string}
     */
    this.chartType = this.options.chartType;

    /**
     * whether chart has axes or not
     * @type {boolean}
     * @ignore
     */
    this.hasAxes = params.hasAxes;

    /**
     * whether vertical or not
     * @type {boolean}
     * @ignore
     */
    this.isVertical = !!params.isVertical;

    /**
     * data processor
     * @type {DataProcessor}
     * @ignore
     */
    this.dataProcessor = this._createDataProcessor(params);

    /**
     * event bus for transmitting message
     * @type {object}
     * @ignore
     */
    this.eventBus = new snippet.CustomEvents();

    /**
     * previous xAxis data
     * @type {null|object}
     * @ignore
     */
    this.prevXAxisData = null;

    /**
     * component manager
     * @type {ComponentManager}
     * @ignore
     */
    this.componentManager = this._createComponentManager();

    /**
     * Whether has right y axis or not.
     * @type {boolean}
     * @ignore
     */
    this.hasRightYAxis = snippet.isArray(this.options.yAxis) && this.options.yAxis.length > 1;

    this.addComponents();

    this._attachToEventBus();

    this.componentManager.presetAnimationConfig(this.options.series.animation);

    if (this.options.usageStatistics) {
      snippet.sendHostname('chart', GA_TRACKING_ID);
    }
  }

  /**
   * Destroys the instance.
   * @api
   * @example
   * chart.destroy();
   */
  destroy() {
    this.eventBus.off();
    this.chartContainer.outerHTML = '';
    snippet.forEach(this, (value, key) => {
      this[key] = null;
    });
  }

  /**
   * get on select series function
   * @param {{legendIndex: number, index: number}} indexInfo - selected indexes
   * @param {?boolean} shouldSelect - whether should select or not
   * @api
   * @example
   * chart.selectSeries({legendIndex: 0, index: 0}, true);
   */
  selectSeries({ legendIndex: index, index: groupIndex }, shouldSelect = true) {
    this.componentManager.get('mouseEventDetector').selectSeries(
      {
        chartType: this.chartType,
        indexes: {
          groupIndex,
          index
        }
      },
      shouldSelect
    );
  }

  /**
   * get on deselect series function
   * @api
   * @example
   * chart.unselectSeries();
   */
  unselectSeries() {
    this.componentManager.get('mouseEventDetector').unselectSeries();
  }

  /**
   * Attach to event bus.
   * @private
   */
  _attachToEventBus() {
    this.eventBus.on('changeCheckedLegends', this.onChangeCheckedLegends, this);

    if (this.onZoom) {
      this.eventBus.on(
        {
          zoom: this.onZoom,
          resetZoom: this.onResetZoom
        },
        this
      );
    }
  }

  /**
   * Set offset property
   * @param {{offset: object}} options - options
   * @param {string} fromProperty - from property name
   * @param {string} toProperty - to property name
   * @private
   */
  _setOffsetProperty(options, fromProperty, toProperty) {
    if (!snippet.isExisty(options[fromProperty])) {
      return;
    }

    options.offset = options.offset || {};
    options.offset[toProperty] = options[fromProperty];
    delete options[fromProperty];
  }

  /**
   * Initialize offset.
   * @param {{offsetX: ?number, offsetY: ?number}} options - offset options
   * @private
   */
  _initializeOffset(options) {
    if (!options) {
      return;
    }

    this._setOffsetProperty(options, 'offsetX', 'x');
    this._setOffsetProperty(options, 'offsetY', 'y');
  }

  /**
   * Initialize title options.
   * @param {
   *      Array.<{title: (string | {text: string, offsetX: number, offsetY: number})}> |
   *      {title: (string | {text: string, offsetX: number, offsetY: number})}
   * } targetOptions - target options
   * @private
   */
  _initializeTitleOptions(targetOptions) {
    if (!targetOptions) {
      return;
    }

    const optionsSet = snippet.isArray(targetOptions) ? targetOptions : [targetOptions];
    optionsSet.forEach(options => {
      const { title } = options;

      if (snippet.isString(title)) {
        options.title = {
          text: title
        };
      }

      this._initializeOffset(options.title);
    });
  }

  /**
   * Initialize tooltip options.
   * @param {{grouped: ?boolean, offsetX: ?number, offsetY: ?number}} options - tooltip options
   * @private
   */
  _initializeTooltipOptions(options) {
    options.grouped = !!options.grouped;
    this._initializeOffset(options);

    delete options.position;
  }

  /**
   * Initialize options.
   * @param {object} options - options for chart
   * @private
   */
  _initializeOptions(options) {
    const originalOptions = objectUtil.deepCopy(options);
    const defaultOption = {
      chartTypes: this.chartTypes,
      xAxis: {},
      series: {},
      tooltip: {},
      usageStatistics: true,
      chartExportMenu: Object.assign(
        {
          visible: true
        },
        originalOptions.chartExportMenu
      ),
      legend: Object.assign(
        {
          visible: true
        },
        originalOptions.legend
      )
    };
    delete originalOptions.chartExportMenu;
    delete originalOptions.legend;

    Object.assign(options, defaultOption, originalOptions);

    this._initializeTitleOptions(options.chart);
    this._initializeTitleOptions(options.xAxis);
    this._initializeTitleOptions(options.yAxis);
    this._initializeTooltipOptions(options.tooltip);
    this.options = options;
  }

  /**
   * Create dataProcessor for processing raw data.
   * @param {object} params parameters
   *      @param {object} params.rawData - raw data
   *      @param {DataProcessor} params.DataProcessor - DataProcessor class
   *      @param {{chart: object, chartType: string}} params.options - chart options
   *      @param {Array} params.seriesTypes series - chart types for rendering series
   * @returns {object} data processor
   * @private
   */
  _createDataProcessor(params) {
    const DataProcessor = params.DataProcessor || DefaultDataProcessor;
    const dataProcessor = new DataProcessor(
      params.rawData,
      this.chartType,
      params.options,
      this.seriesTypes
    );

    return dataProcessor;
  }

  /**
   * Create ComponentManager.
   * @returns {ComponentManager}
   * @private
   */
  _createComponentManager() {
    return new ComponentManager({
      options: this.options,
      theme: this.theme,
      dataProcessor: this.dataProcessor,
      hasAxes: this.hasAxes,
      eventBus: this.eventBus,
      isVertical: this.isVertical,
      seriesTypes: this.seriesTypes || [this.chartType]
    });
  }

  /**
   * Add components.
   * @abstract
   * @ignore
   */
  addComponents() {}

  /**
   * Get scale option.
   * @abstract
   * @ignore
   */
  getScaleOption() {}

  /**
   * Build bounds and scale data.
   * @param {object} prevXAxisData - previous xAxis data
   * @param {boolean} addingDataMode - whether adding data mode or not
   * @returns {{
   *      layoutBounds: {
   *          dimensionMap: {
   *              xAxis: {width: number, height: number},
   *              yAxis: {width: number, height: number},
   *              rightYAxis: {width: number, height: number},
   *              series: {width: number, height: number},
   *              extendedSeries: {width: number, height: number},
   *              mouseEventDetector: {width: number, height: number},
   *              legend: {width: number, height: number},
   *              tooltip: {width: number, height: number}
   *          },
   *          positionMap: {
   *              xAxis: {left: number, top: number},
   *              yAxis: {left: number, top: number},
   *              rightYAxis: {left: number, top: number},
   *              series: {left: number, top: number},
   *              extendedSeries: {left: number, top: number},
   *              mouseEventDetector: {left: number, top: number},
   *              legend: {left: number, top: number},
   *              tooltip: {left: number, top: number}
   *          }
   *      },
   *      limitMap: {
   *          xAxis: {min: number, max: number},
   *          yAxis: {min: number, max: number}
   *      },
   *      axisDataMap: {
   *          xAxis: object,
   *          yAxis: object,
   *          yRightAxis: object
   *      },
   *      maxRadius: ?number
   * }}
   * @private
   */
  _buildBoundsAndScaleData(prevXAxisData, addingDataMode) {
    return boundsAndScaleBuilder.build(this.dataProcessor, this.componentManager, {
      chartType: this.chartType,
      seriesTypes: this.seriesTypes,
      options: this.options,
      theme: this.theme,
      hasAxes: this.hasAxes,
      scaleOption: this.getScaleOption(),
      isVertical: this.isVertical,
      hasRightYAxis: this.hasRightYAxis,
      addedDataCount: this._dynamicDataHelper ? this._dynamicDataHelper.addedDataCount : null,
      prevXAxisData,
      addingDataMode
    });
  }

  /**
   * Add data ratios.
   * @abstract
   * @ignore
   */
  addDataRatios() {}

  /**
   * Make chart ready for render, it should be invoked before render, rerender, resize and zoom.
   * @param {?boolean} addingDataMode - whether adding data mode or not
   * @returns {object} Bounds and scale data
   * @ignore
   */
  readyForRender(addingDataMode) {
    const boundsAndScale = this._buildBoundsAndScaleData(this.prevXAxisData, addingDataMode);

    if (boundsAndScale.axisDataMap.xAxis) {
      this.prevXAxisData = boundsAndScale.axisDataMap.xAxis;
    }

    this.addDataRatios(boundsAndScale.limitMap);

    return boundsAndScale;
  }

  /**
   * Render chart.
   * @param {HTMLElement} wrapper chart wrapper element
   * @ignore
   */
  render(wrapper) {
    const container = dom.create('DIV', `tui-chart ${this.className}`);
    const { componentManager, dataProcessor } = this;
    const seriesVisibilityMap = dataProcessor.getLegendVisibility();
    const rawData = rawDataHandler.filterCheckedRawData(dataProcessor.rawData, seriesVisibilityMap);
    const raphaelPaper = componentManager.drawingToolPicker.getPaper(
      container,
      chartConst.COMPONENT_TYPE_RAPHAEL
    );

    this.dataProcessor.initData(rawData);

    raphaelPaper.changeChartBackgroundColor(this.theme.chart.background.color);
    raphaelPaper.changeChartBackgroundOpacity(this.theme.chart.background.opacity);
    renderUtil.renderFontFamily(container, this.theme.chart.fontFamily);

    dom.append(wrapper, container);

    const boundsAndScale = this.readyForRender();

    renderUtil.renderDimension(container, boundsAndScale.dimensionMap.chart);
    componentManager.render(
      'render',
      boundsAndScale,
      {
        checkedLegends: seriesVisibilityMap
      },
      container
    );
    this.chartContainer = container;
    this.paper = raphaelPaper;
  }

  /**
   * protectedRerender
   * @param {{line: Array.<boolean>, column: Array.<boolean>}} checkedLegends checked legends
   * @param {?object} rawData rawData
   * @ignore
   */
  protectedRerender(checkedLegends, rawData) {
    const { dataProcessor } = this;

    if (!rawData) {
      rawData = rawDataHandler.filterCheckedRawData(dataProcessor.getCurrentData(), checkedLegends);
    }

    this.dataProcessor.initData(rawData);

    const boundsAndScale = this.readyForRender();

    this.componentManager.render(
      'rerender',
      boundsAndScale,
      { checkedLegends },
      this.chartContainer
    );
  }

  /**
   * rerender
   * @param {{column: Array.<string>, line: Array.<string>}} checkedLegends data that whether series has checked or not
   * @param {object} rawData rawData
   * @api
   * @deprecated
   */
  rerender(checkedLegends, rawData) {
    checkedLegends = checkedLegends || this.getCheckedLegend();
    rawData = rawData || this.dataProcessor.getOriginalRawData();

    const seriesData = rawData.series;

    rawData.series = Object.keys(seriesData).reduce((result, item) => {
      const series = seriesData[item];
      const checkedInfo = checkedLegends[item];

      result[item] = series.map((seriesItem, index) => {
        seriesItem.visible = checkedInfo[index];

        return seriesItem;
      });

      return result;
    }, {});

    this.setData(rawData);
  }

  /**
   * setData
   * @param {object} rawData rawData
   * @param {boolean | object} animation whether animate or not, duration
   * @api
   */
  setData(rawData = null, animation = true) {
    const data = this._initializeRawData(rawData);
    const { dataProcessor } = this;
    const { chartType, theme: themeOptions } = this.options;

    dataProcessor.initData(data, true);

    const theme = themeManager.get(themeOptions, chartType, data.series);

    this.theme = theme;
    this.componentManager.presetBeforeRerender();
    this.componentManager.presetForChangeData(theme);
    this.componentManager.presetAnimationConfig(animation);
    this.protectedRerender(dataProcessor.getLegendVisibility());
  }

  /**
   * Get checked indexes.
   * @returns {{column: ?Array.<string>, line: ?Array.<string>}} object data that whether series has checked or not
   * @api
   */
  getCheckedLegend() {
    const { componentManager, dataProcessor } = this;
    const hasLegendComponent = componentManager.has('legend');

    return hasLegendComponent
      ? componentManager.get('legend').getCheckedIndexes()
      : dataProcessor.getLegendVisibility();
  }

  /**
   * initialize rawData
   * @param {object} rawData rawData
   * @returns {object} - remaked rawData
   * @private
   */
  _initializeRawData(rawData) {
    const data = objectUtil.deepCopy(rawData);
    const { chartType, series: seriesOption } = this.originalOptions;

    if (chartType !== 'combo' && snippet.isArray(data.series)) {
      const clonedSeries = data.series;
      data.series = {};
      data.series[chartType] = clonedSeries;
    }

    rawDataHandler.updateRawSeriesDataByOptions(data, seriesOption);

    if (chartType === 'boxplot') {
      rawDataHandler.appendOutliersToSeriesData(data);
    }

    return data;
  }

  /**
   * On change checked legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @param {?object} rawData rawData
   * @param {?object} boundsParams addition params for calculating bounds
   * @ignore
   */
  onChangeCheckedLegends(checkedLegends, rawData, boundsParams) {
    this.protectedRerender(checkedLegends, rawData, boundsParams);
  }

  /**
   * Animate chart.
   * @ignore
   */
  animateChart() {
    this.componentManager.execute('animateComponent');
  }

  /**
   * Register of user event.
   * @param {string} eventName event name
   * @param {function} func event callback
   * @api
   */
  on(eventName, func) {
    /**
     * Select legend event
     * @event ChartBase#selectLegend
     * @param {object} info selected legend info
     *   @param {string} legend legend name
     *   @param {string} chartType chart type
     *   @param {number} index selected legend index
     * @api
     * @example
     * chart.on('selectLegend', function(info) {
     *     console.log(info);
     * });
     */

    /**
     * Select series event
     * @event ChartBase#selectSeries
     * @param {object} info selected series info
     *   @param {string} legend legend name
     *   @param {string} chartType chart type
     *   @param {number} legendIndex selected legend index
     *   @param {number} index selected category index
     * @api
     * @example
     * chart.on('selectSeries', function(info) {
     *     console.log(info);
     * });
     */

    /**
     * unselect series event
     * @event ChartBase#unselectSeries
     * @param {object} info unselected series info
     *   @param {string} legend legend name
     *   @param {string} chartType chart type
     *   @param {number} legendIndex selected legend index
     *   @param {number} index selected category index
     * @api
     * @example
     * chart.on('unselectSeries', function(info) {
     *     console.log(info);
     * });
     */

    /**
     * before show tooltip event
     * @event ChartBase#beforeShowTooltip
     * @param {object} info target series info
     *   @param {string} legend legend name
     *   @param {string} chartType chart type
     *   @param {number} legendIndex target legend index
     *   @param {number} index target category index
     * @api
     * @example
     * chart.on('beforeShowTooltip', function(info) {
     * });
     */

    /**
     * after show tooltip event
     * @event ChartBase#afterShowTooltip
     * @param {object} info target series info
     *   @param {string} legend legend name
     *   @param {string} chartType chart type
     *   @param {number} legendIndex target legend index
     *   @param {number} index target category index
     *   @param {HTMLElement} element tooltip element
     *   @param {object} position tooltip position
     *     @param {number} left tooltip left position
     *     @param {number} top tooltip left position
     * @api
     * @example
     * chart.on('afterShowTooltip', function(info) {
     *    console.log(info);
     * });
     */

    /**
     * before hide tooltip event
     * @event ChartBase#beforeHideTooltip
     * @api
     * @example
     * chart.on('beforeHideTooltip', function() {
     *     // Create a task at the time of the event.
     * });
     */

    /**
     * change checked legend event
     * @event ChartBase#changeCheckedLegends
     * @param {object.<string, array>} info `checked` information that matches the chart type.
     * @api
     * @example
     * chart.on('changeCheckedLegends', function(info) {
     *    console.log(info);
     * });
     */

    /**
     * Register of user event.
     * @event MapChart#zoom
     * @param {string} magnification zoom ratio
     * @api
     * @example
     * chart.on('zoom', function(magnification) {
     *    console.log(magnification);
     * });
     */

    if (chartConst.PUBLIC_EVENT_MAP[eventName]) {
      this.eventBus.on(chartConst.PUBLIC_EVENT_PREFIX + eventName, func);
    }
  }

  /**
   * Remove user event.
   * @param {string} eventName event name
   * @param {function} func event callback
   * @ignore
   */
  off(eventName, func) {
    if (chartConst.PUBLIC_EVENT_MAP[eventName]) {
      this.eventBus.off(chartConst.PUBLIC_EVENT_PREFIX + eventName, func);
    }
  }

  /**
   * Update dimension of chart.
   * @param {{width: number, height: number}} dimension dimension
   * @returns {boolean} whether updated or not
   * @private
   */
  _updateChartDimension(dimension) {
    let updated = false;
    const { options } = this;

    options.chart = options.chart || {};

    if (dimension.width && dimension.width > 0 && options.chart.width !== dimension.width) {
      options.chart.width = dimension.width;
      updated = true;
    }

    if (dimension.height && dimension.height > 0 && options.chart.height !== dimension.height) {
      options.chart.height = dimension.height;
      updated = true;
    }

    return updated;
  }

  /**
   * Public API for resizable.
   * @param {object} dimension dimension
   *      @param {number} dimension.width width
   *      @param {number} dimension.height height
   * @api
   */
  resize(dimension) {
    const { dataProcessor } = this;
    const seriesVisibilityMap = dataProcessor.getLegendVisibility();

    if (!dimension) {
      return;
    }

    const updated = this._updateChartDimension(dimension);

    if (!updated) {
      return;
    }

    const boundsAndScale = this.readyForRender();
    const chartDimension = boundsAndScale.dimensionMap.chart;

    renderUtil.renderDimension(this.chartContainer, chartDimension);
    this.paper.resizeBackground(chartDimension.width, chartDimension.height);
    this.paper.setSize(chartDimension.width, chartDimension.height);

    this.componentManager.render('resize', boundsAndScale, {
      checkedLegends: seriesVisibilityMap
    });
  }

  /**
   * Set tooltip align option.
   * @param {string} align align (left|center|right, top|middle|bottom)
   * @api
   */
  setTooltipAlign(align) {
    this.componentManager.get('tooltip').setAlign(align);
  }

  /**
   * Set tooltip offset option.
   * @param {object} offset - tooltip offset
   *      @param {number} offset.x - offset x
   *      @param {number} offset.y - offset y
   * @api
   */
  setTooltipOffset(offset) {
    this.componentManager.get('tooltip').setOffset(offset);
  }

  /**
   * Set position option.
   * @param {object} position moving position
   *      @param {number} position.left left
   *      @param {number} position.top top
   * @api
   * @deprecated
   */
  setTooltipPosition(position) {
    this.componentManager.get('tooltip').setPosition(position);
  }

  /**
   * Reset tooltip align option.
   * @api
   */
  resetTooltipAlign() {
    this.componentManager.get('tooltip').resetAlign();
  }

  /**
   * Reset tooltip position.
   * @api
   */
  resetTooltipOffset() {
    this.componentManager.get('tooltip').resetOffset();
  }

  /**
   * Reset tooltip position.
   * @api
   * @deprecated
   */
  resetTooltipPosition() {
    this.resetTooltipOffset();
  }

  /**
   * Show series label.
   * @api
   */
  showSeriesLabel() {
    const seriesSet = this.componentManager.where({ componentType: 'series' });

    seriesSet.forEach(series => {
      series.showLabel();
    });
  }

  /**
   * Hide series label.
   * @api
   */
  hideSeriesLabel() {
    const seriesSet = this.componentManager.where({ componentType: 'series' });

    seriesSet.forEach(series => {
      series.hideLabel();
    });
  }

  /**
   * Add data.
   * @abstract
   */
  addData() {}

  /**
   * Add plot line.
   * @abstract
   */
  addPlotLine() {}

  /**
   * Add plot band.
   * @abstract
   */
  addPlotBand() {}

  /**
   * Remove plot line.
   * @abstract
   */
  removePlotLine() {}

  /**
   * Remove plot band.
   * @abstract
   */
  removePlotBand() {}

  /**
   * Get series item bound by indexes
   * @param {number} index - tooltip data's category index
   * @param {number} seriesIndex - tooltip data's series index
   * @param {number} [outlierIndex] - outlier index of tooltip, exists only hovered on boxplot chart's outlier point
   *
   * @returns {?object} - series item bound
   * @private
   */
  _getSeriesData(index, seriesIndex, outlierIndex) {
    const indexes = {
      index,
      seriesIndex,
      outlierIndex
    };

    if (seriesIndex < 0) {
      return null;
    }

    return this.componentManager.get('mouseEventDetector').findDataByIndexes(indexes);
  }

  /**
   * find series index by legend label
   * @param {string} chartType - chart tyoe
   * @param {string} legendLabel - legend label
   * @returns {number} - if not found return -1, else return found series index
   * @private
   */
  _findSeriesIndexByLabel(chartType, legendLabel) {
    const labels = this.dataProcessor.getLegendLabels(chartType);
    const len = labels ? labels.length : 0;
    let seriesIndex = -1;

    for (let i = 0; i < len; i += 1) {
      if (labels[i] === legendLabel) {
        seriesIndex = i;
        break;
      }
    }

    return seriesIndex;
  }

  /**
   * @param {number} index - category index
   * @param {number} seriesIndex - series index
   * @returns {object}
   * @private
   */
  _findDataByIndexes(index, seriesIndex) {
    return this.componentManager.get('mouseEventDetector').findDataByIndexes(index, seriesIndex);
  }

  /**
   * show tooltip by index of series item
   * @param {object} params - data needed for making a tooltip
   * @ignore
   */
  showTooltip(params) {
    let foundSeriesIndex, foundData;

    if (!predicate.isSupportPublicShowTooptipAPI(this.chartType)) {
      return;
    }

    const isGroupTooltip = this.options.tooltip && this.options.tooltip.grouped;
    const mouseEventDetector = this.componentManager.get('mouseEventDetector');

    if (isGroupTooltip) {
      foundData = { indexes: { groupIndex: params.index } };
    } else {
      foundSeriesIndex = this._findSeriesIndexByLabel(params.chartType, params.legend);
      foundData = this._getSeriesData(params.index, foundSeriesIndex, params.outlierIndex);
    }

    if (foundData) {
      foundData.silent = true;
      mouseEventDetector._showTooltip(foundData);
    } else {
      this.hideTooltip();
    }
  }

  /**
   * hide tooltip
   * @ignore
   */
  hideTooltip() {
    if (!predicate.isSupportPublicShowTooptipAPI(this.chartType)) {
      return;
    }

    const isGroupTooltip = this.options.tooltip && this.options.tooltip.grouped;
    const mouseEventDetector = this.componentManager.get('mouseEventDetector');

    if (
      (isGroupTooltip && mouseEventDetector.prevIndex >= 0) ||
      (!isGroupTooltip && mouseEventDetector.prevFoundData)
    ) {
      mouseEventDetector._hideTooltip({ silent: true });
    }
  }
}

export default ChartBase;
