/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = require('./componentManager');
var DefaultDataProcessor = require('../dataModels/dataProcessor');
var BoundsMaker = require('../boundsModels/boundsMaker');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var UserEventListener = require('../helpers/userEventListener');
var ScaleModel = require('../scaleModels/scaleModel');

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
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = this._createBoundsMaker(params.seriesNames);

        /**
         * scale model
         * @type {ScaleModel}
         */
        this.scaleModel = this._createScaleModel(params.seriesNames);

        this.boundsMaker.setScaleModel(this.scaleModel);

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = this._createComponentManager();

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();
    },

    /**
     * Set offset property
     * @param {{offset: object}} ptions -options
     * @param {string} fromProperty - from property name
     * @param {string} toProperty - to property name
     * @private
     */
    _setOffsetProperty: function(ptions, fromProperty, toProperty) {
        if (!tui.util.isExisty(ptions[fromProperty])) {
            return;
        }

        ptions.offset = ptions.offset || {};
        ptions.offset[toProperty] = ptions[fromProperty];
        delete ptions[fromProperty];
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
        options.xAxis = options.xAxis || {};
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        this._initializeTitleOptions(options.chart);
        this._initializeTitleOptions(options.xAxis);
        this._initializeTitleOptions(options.yAxis);

        if (tui.util.isUndefined(options.legend.visible)) {
            options.legend.visible = true;
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
     *      @param {Array} params.seriesNames series - chart types for rendering series
     * @returns {object} data processor
     * @private
     */
    _createDataProcessor: function(params) {
        var DataProcessor, dataProcessor;

        DataProcessor = params.DataProcessor || DefaultDataProcessor;
        dataProcessor = new DataProcessor(params.rawData, this.chartType, params.options, params.seriesNames);

        return dataProcessor;
    },

    /**
     * Create BoundsMaker.
     * @param {Array.<string>} seriesNames - series names like column, line, area.
     * @returns {BoundsMaker}
     * @private
     */
    _createBoundsMaker: function(seriesNames) {
        return new BoundsMaker({
            chartType: this.chartType,
            seriesNames: seriesNames,
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical
        });
    },

    /**
     * Create ScaleModel.
     * @param {Array.<string>} seriesNames - series names like column, line, area.
     * @returns {ScaleModel}
     * @private
     */
    _createScaleModel: function(seriesNames) {
        return new ScaleModel({
            chartType: this.chartType,
            seriesNames: seriesNames,
            options: this.options,
            dataProcessor: this.dataProcessor,
            boundsMaker: this.boundsMaker,
            hasRightYAxis: this.hasRightYAxis
        });
    },

    /**
     * Create ComponentMananger.
     * @returns {ComponentMananger}
     * @private
     */
    _createComponentManager: function() {
        return new ComponentManager({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            boundsMaker: this.boundsMaker,
            scaleModel: this.scaleModel,
            hasAxes: this.hasAxes
        });
    },

    /**
     * Make data for tooltip component.
     * @returns {object} tooltip data
     * @private
     */
    _makeTooltipData: function() {
        return {
            isVertical: this.isVertical,
            userEvent: this.userEvent,
            chartType: this.chartType,
            xAxisType: this.options.xAxis.type,
            dateFormat: this.options.xAxis.dateFormat
        };
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} rendering data.
     * @private
     */
    _makeRenderingData: function() {
        return {};
    },

    /**
     * Attach custom event.
     * @param {Array.<object>} serieses serieses
     * @private
     */
    _attachCustomEvent: function(serieses) {
        var legend = this.componentManager.get('legend');
        var customEvent = this.componentManager.get('customEvent');

        serieses = serieses || this.componentManager.where({componentType: 'series'});

        if (tui.util.pick(this.options.series, 'zoomable')) {
            customEvent.on('zoom', this.onZoom, this);
            customEvent.on('resetZoom', this.onResetZoom, this);
        }

        if (legend) {
            legend.on('changeCheckedLegends', this.onChangeCheckedLegends, this);
            tui.util.forEach(serieses, function(series) {
                var selectLegendEventName = renderUtil.makeCustomEventName('select', series.chartType, 'legend');
                legend.on(selectLegendEventName, series.onSelectLegend, series);
            });
        }
    },

    /**
     * Add data ratios.
     * @private
     * @abstract
     */
    _addDataRatios: function() {},

    /**
     * Add scale data for y axis.
     * @private
     * @abstract
     */
    _addScaleDataForYAxis: function() {},

    /**
     * Add scale data for x axis.
     * @private
     * @abstract
     */
    _addScaleDataForXAxis: function() {},

    /**
     * Add scale data for legend.
     * @private
     * @abstract
     */
    _addScaleDataForLegend: function() {},

    /**
     * Register dimension for y axis.
     * @param {string} axisName - axis name like yAxis and rightYAxis
     * @private
     */
    _registerYAxisDimension: function(axisName) {
        var yAxis = this.componentManager.get(axisName);

        if (!yAxis) {
            return;
        }

        this.boundsMaker.registerYAxisDimension(axisName, yAxis.options, yAxis.theme);
    },

    /**
     * Register circle legend dimension.
     * @private
     * @abstract
     */
    _registerCircleLegendDimension: function() {},

    /**
     * Set layout bounds and scale.
     * @private
     */
    _setLayoutBoundsAndScale: function() {
        var labelAxisOptions = (this.isVertical ? this.options.xAxis : this.options.yAxis) || {};
        var cm = this.componentManager;
        var bm = this.boundsMaker;
        var sm = this.scaleModel;

        sm.initScaleData(this.addedDataCount);

        // 01. base dimension 등록
        if (cm.has('xAxis')) {
            bm.registerXAxisHeight();
        }

        if (cm.has('legend')) {
            bm.registerLegendDimension();

            if (cm.get('legend').colorSpectrum) {
                bm.updateDimensionForSpectrumLegend();
            }
        }

        // 02. y axis, legend scale 추가
        this._addScaleDataForYAxis();
        this._addScaleDataForLegend();

        // 03. y axis dimension 등록
        this._registerYAxisDimension('yAxis');
        this._registerYAxisDimension('rightYAxis');

        // 04. x axis scale 추가
        this._addScaleDataForXAxis();

        // 05. series 영역 dimension 등록
        bm.registerSeriesDimension();

        // 06. 자동 tick 계산 옵션이 있을 경우에 axis data 갱신
        if (cm.has('xAxis') && predicate.isAutoTickInterval(labelAxisOptions.tickInterval)) {
            sm.updateXAxisData();
        }

        // 07. circle legend가 있을 경우에 circle legend dimension 등록
        if (cm.has('circleLegend')) {
            this._registerCircleLegendDimension();
        }

        // 08. 나머지 영역 dimension 등록 및 각 영역의 position 정보 등록
        bm.registerBoundsData();
    },

    /**
     * Render.
     * @param {function} onRender render callback function
     * @private
     */
    _render: function(onRender) {
        var renderingData;

        // layout bounds, scale 정보 계산 및 등록
        this._setLayoutBoundsAndScale();

        // 비율값 추가
        this._addDataRatios();

        renderingData = this._makeRenderingData();

        onRender(renderingData);

        this._sendSeriesData();
    },

    /**
     * Render chart.
     * @returns {HTMLElement} chart element
     */
    render: function() {
        var el = dom.create('DIV', this.className),
            self = this;

        dom.addClass(el, 'tui-chart');
        this._renderTitle(el);
        renderUtil.renderDimension(el, this.boundsMaker.getDimension('chart'));
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);

        this._render(function(renderingData) {
            self._renderComponents(renderingData, 'render', el);
        });

        this._attachCustomEvent();
        this.chartContainer = el;

        return el;
    },

    /**
     * Filter raw data belong to checked legend.
     * @param {object} rawData raw data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     * @private
     */
    _filterCheckedRawData: function(rawData, checkedLegends) {
        var cloneData = JSON.parse(JSON.stringify(rawData));

        if (tui.util.isArray(cloneData.series)) {
            cloneData.series = tui.util.filter(cloneData.series, function(series, index) {
                return checkedLegends[index];
            });
        } else {
            tui.util.forEach(cloneData.series, function(serieses, chartType) {
                if (!checkedLegends[chartType]) {
                    cloneData.series[chartType] = [];
                } else if (checkedLegends[chartType].length) {
                    cloneData.series[chartType] = tui.util.filter(serieses, function(series, index) {
                        return checkedLegends[chartType][index];
                    });
                }
            });
        }

        return cloneData;
    },

    /**
     * Make rerendering data.
     * @param {object} renderingData rendering data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rendering data
     * @private
     */
    _makeRerenderingData: function(renderingData, checkedLegends) {
        var tooltipData = this._makeTooltipData();
        var serieses = this.componentManager.where({componentType: 'series'});

        renderingData.tooltip = tui.util.extend({
            checkedLegends: checkedLegends
        }, tooltipData, renderingData.tooltip);

        tui.util.forEach(serieses, function(series) {
            renderingData[series.componentName] = tui.util.extend({
                checkedLegends: checkedLegends[series.seriesName] || checkedLegends
            }, renderingData[series.componentName]);
        });

        return renderingData;
    },

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @private
     */
    _rerender: function(checkedLegends, rawData) {
        var self = this;
        var dataProcessor = this.dataProcessor;

        if (!rawData) {
            rawData = this._filterCheckedRawData(dataProcessor.getZoomedRawData(), checkedLegends);
        }

        this.dataProcessor.initData(rawData);
        this.scaleModel.initScaleData(this.addedDataCount);
        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData = self._makeRerenderingData(renderingData, checkedLegends);
            self._renderComponents(renderingData, 'rerender');
        });
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._rerender(checkedLegends, rawData, boundsParams);
    },

    /**
     * On zoom.
     * @abstract
     */
    onZoom: function() {},

    /**
     * On reset zoom.
     * @abstract
     */
    onResetZoom: function() {},

    /**
     * Render title.
     * @param {HTMLElement} container - container
     * @private
     */
    _renderTitle: function(container) {
        var chartOptions = this.options.chart || {};
        var title = chartOptions.title || {};
        var titleElement = renderUtil.renderTitle(title.text, this.theme.title, 'tui-chart-title');

        if (title.offset) {
            renderUtil.renderPosition(titleElement, {
                left: title.offset.x,
                top: title.offset.y
            });
        }

        dom.append(container, titleElement);
    },

    /**
     * Render components.
     * @param {object} renderingData data for rendering
     * @param {string} funcName function name for execution
     * @param {HTMLElement} container container element
     * @private
     */
    _renderComponents: function(renderingData, funcName, container) {
        var paper;
        var elements = this.componentManager.map(function(component) {
            var element = null;
            var data, result;

            if (component[funcName]) {
                data = renderingData[component.componentName] || renderingData || {};
                data.paper = paper;
                result = component[funcName](data);

                if (result && result.container) {
                    element = result.container;
                    paper = result.paper;
                } else {
                    element = result;
                }
            }

            return element;
        });

        if (container) {
            dom.append(container, elements);
        }
    },

    /**
     * Send series data to custom event component.
     * @param {string} chartType - type of chart
     * @private
     */
    _sendSeriesData: function(chartType) {
        var self = this;
        var customEvent = this.componentManager.get('customEvent');
        var seriesInfos, chartTypes;

        if (!customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [chartType || this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(seriesName) {
            var _chartType = self.dataProcessor.findChartType(seriesName);
            var componentName = (seriesName || _chartType) + 'Series';
            var component = self.componentManager.get(componentName) || self.componentManager.get('series');

            return {
                chartType: _chartType,
                data: component.getSeriesData()
            };
        });

        customEvent.initCustomEventData(seriesInfos);
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        this.componentManager.each(function(component) {
            if (component.animateComponent) {
                component.animateComponent();
            }
        });
    },

    /**
     * Register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
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
        var self = this;
        var updated;

        if (!dimension) {
            return;
        }

        this.scaleModel.initForAutoTickInterval();
        updated = this._updateChartDimension(dimension);

        if (!updated) {
            return;
        }

        this.boundsMaker.initBoundsData(this.options.chart);
        renderUtil.renderDimension(this.chartContainer, this.boundsMaker.getDimension('chart'));

        this._render(function(renderingData) {
            self._renderComponents(renderingData, 'resize');
        });
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
