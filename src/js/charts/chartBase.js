/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var ComponentManager = require('./componentManager');
var DefaultDataProcessor = require('../models/data/dataProcessor');
var rawDataHandler = require('../models/data/rawDataHandler');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var boundsAndScaleBuilder = require('../models/boundsAndScaleBuilder.js');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
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
    init: function(params) {
        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        this._initializeOptions(params.options);

        /**
         * chart type
         * @type {string}
         */
        this.chartType = this.options.chartType;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = this._createDataProcessor(params);

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = new tui.util.CustomEvents();

        /**
         * previous xAxis data
         * @type {null|object}
         */
        this.prevXAxisData = null;

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = this._createComponentManager();

        this.addComponents();

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        this.eventBus.on('changeCheckedLegends', this.onChangeCheckedLegends, this);

        if (this.onZoom) {
            this.eventBus.on({
                zoom: this.onZoom,
                resetZoom: this.onResetZoom
            }, this);
        }
    },

    /**
     * Set offset property
     * @param {{offset: object}} options - options
     * @param {string} fromProperty - from property name
     * @param {string} toProperty - to property name
     * @private
     */
    _setOffsetProperty: function(options, fromProperty, toProperty) {
        if (!tui.util.isExisty(options[fromProperty])) {
            return;
        }

        options.offset = options.offset || {};
        options.offset[toProperty] = options[fromProperty];
        delete options[fromProperty];
    },

    /**
     * Initialize offset.
     * @param {{offsetX: ?number, offsetY: ?number}} options - offset options
     * @private
     */
    _initializeOffset: function(options) {
        if (!options) {
            return;
        }

        this._setOffsetProperty(options, 'offsetX', 'x');
        this._setOffsetProperty(options, 'offsetY', 'y');
    },

    /**
     * Initialize title options.
     * @param {
     *      Array.<{title: (string | {text: string, offsetX: number, offsetY: number})}> |
     *      {title: (string | {text: string, offsetX: number, offsetY: number})}
     * } targetOptions - target options
     * @private
     */
    _initializeTitleOptions: function(targetOptions) {
        var self = this;
        var optionsSet;

        if (!targetOptions) {
            return;
        }

        optionsSet = tui.util.isArray(targetOptions) ? targetOptions : [targetOptions];
        tui.util.forEachArray(optionsSet, function(options) {
            var title = options.title;

            if (tui.util.isString(title)) {
                options.title = {
                    text: title
                };
            }

            self._initializeOffset(options.title);
        });
    },

    /**
     * Initialize tooltip options.
     * @param {{grouped: ?boolean, offsetX: ?number, offsetY: ?number}} options - tooltip options
     * @private
     */
    _initializeTooltipOptions: function(options) {
        var position = options.position;

        options.grouped = !!options.grouped;
        this._initializeOffset(options);

        if (!options.offset && position) {
            options.offset = {
                x: position.left,
                y: position.top
            };
        }

        delete options.position;
    },

    /**
     * Initialize options.
     * @param {object} options - options for chart
     * @private
     */
    _initializeOptions: function(options) {
        options.chartTypes = this.charTypes;
        options.xAxis = options.xAxis || {};
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};
        options.chartExportMenu = options.chartExportMenu || {};

        this._initializeTitleOptions(options.chart);
        this._initializeTitleOptions(options.xAxis);
        this._initializeTitleOptions(options.yAxis);

        if (tui.util.isUndefined(options.legend.visible)) {
            options.legend.visible = true;
        }

        if (tui.util.isUndefined(options.chartExportMenu.visible)) {
            options.chartExportMenu.visible = true;
        }

        this._initializeTooltipOptions(options.tooltip);

        /**
         * options
         * @type {object}
         */
        this.options = options;
    },

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
    _createDataProcessor: function(params) {
        var DataProcessor, dataProcessor;

        DataProcessor = params.DataProcessor || DefaultDataProcessor;
        dataProcessor = new DataProcessor(params.rawData, this.chartType, params.options, this.seriesTypes);

        return dataProcessor;
    },

    /**
     * Create ComponentManager.
     * @returns {ComponentManager}
     * @private
     */
    _createComponentManager: function() {
        return new ComponentManager({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes,
            eventBus: this.eventBus,
            isVertical: this.isVertical,
            seriesTypes: this.seriesTypes || [this.chartType]
        });
    },

    /**
     * Add components.
     * @abstract
     */
    addComponents: function() {},

    /**
     * Get scale option.
     * @abstract
     */
    getScaleOption: function() {},

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
    _buildBoundsAndScaleData: function(prevXAxisData, addingDataMode) {
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
            prevXAxisData: prevXAxisData,
            addingDataMode: addingDataMode
        });
    },

    /**
     * Add data ratios.
     * @abstract
     */
    addDataRatios: function() {},

    /**
     * Make chart ready for render, it should be invoked before render, rerender, resize and zoom.
     * @param {?boolean} addingDataMode - whether adding data mode or not
     * @returns {object} Bounds and scale data
     */
    readyForRender: function(addingDataMode) {
        var boundsAndScale = this._buildBoundsAndScaleData(this.prevXAxisData, addingDataMode);

        if (boundsAndScale.axisDataMap.xAxis) {
            this.prevXAxisData = boundsAndScale.axisDataMap.xAxis;
        }

        // 비율값 추가
        this.addDataRatios(boundsAndScale.limitMap);

        return boundsAndScale;
    },

    /**
     * Render chart.
     * @param {HTMLElement} wrapper chart wrapper element
     */
    render: function(wrapper) {
        var container = dom.create('DIV', 'tui-chart ' + this.className);
        var componentManager = this.componentManager;
        var dataProcessor = this.dataProcessor;
        var seriesVisibilityMap = dataProcessor.getLegendVisibility();
        var rawData = rawDataHandler.filterCheckedRawData(dataProcessor.rawData, seriesVisibilityMap);
        var raphaelPaper = componentManager.drawingToolPicker.getPaper(container, chartConst.COMPONENT_TYPE_RAPHAEL);
        var boundsAndScale;

        this.dataProcessor.initData(rawData);

        raphaelPaper.changeChartBackgroundColor(this.theme.chart.background.color);
        raphaelPaper.changeChartBackgroundOpacity(this.theme.chart.background.opacity);
        renderUtil.renderFontFamily(container, this.theme.chart.fontFamily);

        dom.append(wrapper, container);

        boundsAndScale = this.readyForRender();

        renderUtil.renderDimension(container, boundsAndScale.dimensionMap.chart);
        componentManager.render('render', boundsAndScale, {
            checkedLegends: seriesVisibilityMap
        }, container);

        this.chartContainer = container;
    },

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     */
    rerender: function(checkedLegends, rawData) {
        var dataProcessor = this.dataProcessor;
        var boundsAndScale;

        if (!rawData) {
            rawData = rawDataHandler.filterCheckedRawData(dataProcessor.getZoomedRawData(), checkedLegends);
        }

        this.dataProcessor.initData(rawData);

        boundsAndScale = this.readyForRender();

        this.componentManager.render('rerender', boundsAndScale, {
            checkedLegends: checkedLegends
        }, this.chartContainer);
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this.rerender(checkedLegends, rawData, boundsParams);
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        this.componentManager.execute('animateComponent');
    },

    /**
     * Register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        if (chartConst.PUBLIC_EVENT_MAP[eventName]) {
            this.eventBus.on(chartConst.PUBLIC_EVENT_PREFIX + eventName, func);
        }
    },

    /**
     * Update dimension of chart.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether updated or not
     * @private
     */
    _updateChartDimension: function(dimension) {
        var updated = false;
        var options = this.options;

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
    },

    /**
     * Public API for resizable.
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     * @api
     */
    resize: function(dimension) {
        var updated, boundsAndScale;

        if (!dimension) {
            return;
        }

        updated = this._updateChartDimension(dimension);

        if (!updated) {
            return;
        }

        boundsAndScale = this.readyForRender();

        renderUtil.renderDimension(this.chartContainer, boundsAndScale.dimensionMap.chart);
        this.componentManager.render('resize', boundsAndScale);
    },

    /**
     * Set tooltip align option.
     * @param {string} align align (left|center|right, top|middle|bottom)
     * @api
     */
    setTooltipAlign: function(align) {
        this.componentManager.get('tooltip').setAlign(align);
    },

    /**
     * Set tooltip offset option.
     * @param {object} offset - tooltip offset
     *      @param {number} offset.x - offset x
     *      @param {number} offset.y - offset y
     * @api
     */
    setTooltipOffset: function(offset) {
        this.componentManager.get('tooltip').setOffset(offset);
    },

    /**
     * Set position option.
     * @param {object} position moving position
     *      @param {number} position.left left
     *      @param {number} position.top top
     * @api
     * @deprecated
     */
    setTooltipPosition: function(position) {
        this.componentManager.get('tooltip').setPosition(position);
    },

    /**
     * Reset tooltip align option.
     * @api
     */
    resetTooltipAlign: function() {
        this.componentManager.get('tooltip').resetAlign();
    },

    /**
     * Reset tooltip position.
     * @api
     */
    resetTooltipOffset: function() {
        this.componentManager.get('tooltip').resetOffset();
    },

    /**
     * Reset tooltip position.
     * @api
     * @deprecated
     */
    resetTooltipPosition: function() {
        this.resetTooltipOffset();
    },

    /**
     * Show series label.
     * @api
     */
    showSeriesLabel: function() {
        var seriesSet = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(seriesSet, function(series) {
            series.showLabel();
        });
    },

    /**
     * Hide series label.
     * @api
     */
    hideSeriesLabel: function() {
        var seriesSet = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(seriesSet, function(series) {
            series.hideLabel();
        });
    },

    /**
     * Add data.
     * @abstract
     */
    addData: function() {},

    /**
     * Add plot line.
     * @abstract
     */
    addPlotLine: function() {},

    /**
     * Add plot band.
     * @abstract
     */
    addPlotBand: function() {},

    /**
     * Remove plot line.
     * @abstract
     */
    removePlotLine: function() {},

    /**
     * Remove plot band.
     * @abstract
     */
    removePlotBand: function() {}
});

module.exports = ChartBase;
