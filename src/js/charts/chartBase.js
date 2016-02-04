/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    DefaultDataProcessor = require('../helpers/dataProcessor'),
    BoundsMaker = require('../helpers/boundsMaker'),
    ComponentManager = require('./componentManager'),
    UserEventListener = require('../helpers/userEventListener');

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
         * raw data.
         * @type {object}
         */
        this.rawData = params.rawData;

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = params.options;

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
        this.dataProcessor = this._createDataProcessor(params.DataProcessor || DefaultDataProcessor, params);

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
            chartType: this.chartType
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

        /**
         * original whole legend data
         * @type {Array.<object>}
         */
        this.orgWholeLegendData = this.dataProcessor.getWholeLegendData();

        this._addCustomEventComponent();
    },

    /**
     * Create dataProcessor.
     * @param {DataProcessor} DataProcessor DataProcessor class
     * @param {object} params parameters
     *      @params {object} rawData raw data
     *      @params {{chart: object, chartType: string}} options chart options
     *      @params {Array} seriesChartTypes series chart types
     * @returns {object} data processor
     * @private
     */
    _createDataProcessor: function(DataProcessor, params) {
        var dataProcessor = new DataProcessor(params.rawData),
            options = params.options;

        dataProcessor.process(params.rawData, options, params.seriesChartTypes);
        return dataProcessor;
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
     * Add custom event component.
     * @private
     * @abstract
     */
    _addCustomEventComponent: function() {},

    /**
     * Make rendering data for axis type chart.
     * @returns {object} rendering data.
     * @private
     */
    _makeRenderingData: function() {
        return {};
    },

    /**
     * Attach custom evnet.
     * @param {Array.<object>} serieses serieses
     * @private
     */
    _attachCustomEvent: function(serieses) {
        var legend = this.componentManager.get('legend');

        serieses = serieses || this.componentManager.where({componentType: 'series'});

        if (legend) {
            legend.on('changeCheckedLegends', this.onChangeCheckedLegends, this);
            tui.util.forEach(serieses, function (series) {
                legend.on(renderUtil.makeCustomEventName('select', series.chartType, 'legend'), series.onSelectLegend, series);
            }, this);
        }
    },

    /**
     * Make axes data.
     * @abstract
     * @private
     */
    _makeAxesData: function() {},

    /**
     * Update percent values.
     * @private
     * @abstract
     */
    _updatePercentValues: function() {},

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
     * Render.
     * @param {function} callback callback function
     * @private
     */
    _render: function(callback) {
        var axesData, renderingData;

        this._executeComponentFunc('registerDimension');
        axesData = this._makeAxesData();
        this.boundsMaker.registerAxesData(axesData);
        this._executeComponentFunc('registerAdditionalDimension');
        this.boundsMaker.registerBoundsData();
        this._updatePercentValues(axesData);
        renderingData = this._makeRenderingData(axesData);

        callback(renderingData);

        this._sendSeriesData();
    },

    /**
     * Render chart.
     * @returns {HTMLElement} chart element
     */
    render: function() {
        var el = dom.create('DIV', this.className),
            that = this;

        dom.addClass(el, 'tui-chart');
        this._renderTitle(el);
        renderUtil.renderDimension(el, this.boundsMaker.getDimension('chart'));
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);

        this._render(function(renderingData) {
            that._renderComponents(renderingData, 'render', el);
        });

        this._attachCustomEvent();
        this.chartContainer = el;

        return el;
    },

    /**
     * Filter raw data.
     * @param {object} rawData raw data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     * @private
     */
    _filterRawData: function(rawData, checkedLegends) {
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
        var tooltipData = this._makeTooltipData(),
            serieses = this.componentManager.where({componentType: 'series'});

        renderingData.tooltip = tui.util.extend({
            checkedLegends: checkedLegends
        }, tooltipData, renderingData.tooltip);

        tui.util.forEach(serieses, function(series) {
            renderingData[series.name] = tui.util.extend({
                checkedLegends: checkedLegends[series.chartType] || checkedLegends
            }, renderingData[series.name]);
        });

        return renderingData;
    },

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @private
     */
    _rerender: function(checkedLegends, rawData) {
        var that = this,
            newWholeLegendData;

        rawData = rawData || this._filterRawData(this.dataProcessor.getRawData(), checkedLegends);

        this.dataProcessor.process(rawData, this.options, this.seriesChartTypes);

        newWholeLegendData = this.dataProcessor.getWholeLegendData();
        // 범례 영역은 변경되지 않으므로, bounds 계산에는 변경되지 않은 레이블 데이터를 포함해야 함
        this.dataProcessor.setWholeLegendData(this.orgWholeLegendData);

        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData = that._makeRerenderingData(renderingData, checkedLegends);
            that.dataProcessor.setWholeLegendData(newWholeLegendData);
            that._renderComponents(renderingData, 'rerender');
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
     * Render title.
     * @param {HTMLElement} el target element
     * @private
     */
    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');

        dom.append(el, elTitle);
    },

    /**
     * Render components.
     * @param {object} renderingData data for rendering
     * @param {string} funcName function name for execution
     * @param {HTMLElement} container container element
     * @private
     */
    _renderComponents: function(renderingData, funcName, container) {
        var elements = this.componentManager.map(function(component) {
            var data = renderingData[component.name],
                element = null;

            if (component[funcName]) {
                element = component[funcName](data);
            }

            return element;
        });

        if (container) {
            dom.append(container, elements);
        }
    },

    /**
     * Send series data to custom event component.
     * @private
     */
    _sendSeriesData: function() {
        var customEvent = this.componentManager.get('customEvent'),
            seriesInfos, chartTypes;

        if (!customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(chartType) {
            var component = this.componentManager.get(chartType + 'Series') || this.componentManager.get('series');

            return {
                chartType: chartType,
                data: component.getSeriesData()
            };
        }, this);

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
     * Update dimension.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether updated or not
     * @private
     */
    _updateDimension: function(dimension) {
        var updated = false;

        if (dimension.width) {
            this.options.chart.width = dimension.width;
            updated = true;
        }

        if (dimension.height) {
            this.options.chart.height = dimension.height;
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
        var that = this,
            updated;

        if (!dimension) {
            return;
        }

        updated = this._updateDimension(dimension);

        if (!updated) {
            return;
        }

        this.boundsMaker.initBoundsData(this.options.chart);
        renderUtil.renderDimension(this.chartContainer, this.boundsMaker.getDimension('chart'));

        this._render(function(renderingData) {
            that._renderComponents(renderingData, 'resize');
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
    }
});

module.exports = ChartBase;
