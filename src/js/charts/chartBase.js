/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = require('./componentManager');
var DefaultDataProcessor = require('../dataModels/dataProcessor');
var BoundsMaker = require('../helpers/boundsMaker');
var AxisScaleMaker = require('../helpers/axisScaleMaker');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var UserEventListener = require('../helpers/userEventListener');

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

        /**
         * options
         * @type {object}
         */
        this.options = null;
        this._setDefaultOptions(params.options);

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
         * whether chart has group tooltip or not
         * @type {boolean}
         */
        this.hasGroupTooltip = !!tui.util.pick(this.options, 'tooltip', 'grouped');

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = this._createDataProcessor(params);

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = new BoundsMaker({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical,
            chartType: this.chartType,
            chartTypes: params.seriesNames
        });

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = new ComponentManager({
            dataProcessor: this.dataProcessor,
            options: this.options,
            theme: this.theme,
            boundsMaker: this.boundsMaker,
            hasAxes: this.hasAxes
        });

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();
    },

    /**
     * Set default options.
     * @param {object} options - options for chart
     * @private
     */
    _setDefaultOptions: function(options) {
        options.legend = options.legend || {};

        if (tui.util.isUndefined(options.legend.visible)) {
            options.legend.visible = true;
        }

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
     * Pick limit from options.
     * @param {{min: number, max: number, title: string}} options - axis options
     * @returns {{min: ?number, max: ?number}}
     * @private
     */
    _pickLimitFromOptions: function(options) {
        options = options || {};

        return {
            min: options.min,
            max: options.max
        };
    },

    /**
     * Create AxisScaleMaker.
     * AxisScaleMaker calculates the limit and step into values of processed data and returns it.
     * @param {{title: string, min: number, max: number}} axisOptions - options for axis
     * @param {string} areaType - type of area like series, xAxis, yAxis, circleLegend, legend
     * @param {string} valueType - type of value like value, x, y, r
     * @param {string} chartType - type of chart
     * @param {?object} additionalParams additional parameters
     * @returns {AxisScaleMaker}
     * @private
     */
    _createAxisScaleMaker: function(axisOptions, areaType, valueType, chartType, additionalParams) {
        var limit = this._pickLimitFromOptions(axisOptions);
        var seriesOptions = this.options.series || {};

        chartType = chartType || this.chartType;
        seriesOptions = seriesOptions[chartType] || seriesOptions;

        return new AxisScaleMaker(tui.util.extend({
            dataProcessor: this.dataProcessor,
            boundsMaker: this.boundsMaker,
            options: {
                stackType: seriesOptions.stackType,
                diverging: seriesOptions.diverging,
                limit: limit
            },
            isVertical: this.isVertical,
            areaType: areaType,
            valueType: valueType,
            chartType: chartType
        }, additionalParams));
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
            chartType: this.chartType
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
     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
     * @abstract
     * @private
     */
    _makeAxesData: function() {},

    /**
     * Update dimensions.
     * @abstract
     * @private
     */
    _updateDimensions: function() {},

    /**
     * Add data ratios.
     * @private
     * @abstract
     */
    _addDataRatios: function() {},

    /**
     * Execute component function.
     * @param {string} funcName function name
     * @private
     */
    _executeComponentFunc: function(funcName) {
        this.componentManager.each(function(component) {
            if (component[funcName]) {
                component[funcName]();
            }
        });
    },

    /**
     * Register axes data, used in a axis component like yAxis, xAxis.
     * @private
     */
    _registerAxesData: function() {
        var axesData = this._makeAxesData();
        this.boundsMaker.registerAxesData(axesData);
    },

    /**
     * Update axesData.
     * @private
     * @abstract
     */
    _updateAxesData: function() {},

    /**
     * Render.
     * @param {function} onRender render callback function
     * @private
     */
    _render: function(onRender) {
        var labelAxisOptions = (this.isVertical ? this.options.xAxis : this.options.yAxis) || {};
        var renderingData;

        this._executeComponentFunc('registerDimension');
        this._registerAxesData();
        this._executeComponentFunc('registerAdditionalDimension');
        this.boundsMaker.registerSeriesDimension();

        if (this.hasAxes && predicate.isAutoTickInterval(labelAxisOptions.tickInterval)) {
            this._updateAxesData();
        }

        this._updateDimensions();

        this.boundsMaker.registerBoundsData();
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

        this.axisScaleMakerMap = null;
        this.dataProcessor.initData(rawData);
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
        var titleElement = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');

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
        var self = this,
            customEvent = this.componentManager.get('customEvent'),
            seriesInfos, chartTypes;

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
     * Make event name for animation.
     * @param {string} chartType chart type
     * @param {string} prefix prefix
     * @returns {string} event name
     * @private
     */
    _makeAnimationEventName: function(chartType, prefix) {
        return prefix + chartType.substring(0, 1).toUpperCase() + chartType.substring(1) + 'Animation';
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
        var chartOptions = this.options.chart;

        if (dimension.width && chartOptions.width !== dimension.width) {
            chartOptions.width = dimension.width;
            updated = true;
        }

        if (dimension.height && chartOptions.height !== dimension.height) {
            chartOptions.height = dimension.height;
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
     * Set position option.
     * @param {object} position moving position
     *      @param {number} position.left left
     *      @param {number} position.top top
     * @api
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
    resetTooltipPosition: function() {
        this.componentManager.get('tooltip').resetPosition();
    },

    /**
     * Show series label.
     * @api
     */
    showSeriesLabel: function() {
        var serieses = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(serieses, function(series) {
            series.showLabel();
        });
    },

    /**
     * Hide series label.
     * @api
     */
    hideSeriesLabel: function() {
        var serieses = this.componentManager.where({componentType: 'series'});

        tui.util.forEachArray(serieses, function(series) {
            series.hideLabel();
        });
    },

    /**
     * Add data.
     * @abstract
     */
    addData: function() {}
});

module.exports = ChartBase;
