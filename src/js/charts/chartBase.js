/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    predicate = require('../helpers/predicate'),
    DataProcessor = require('../helpers/dataProcessor'),
    boundsMaker = require('../helpers/boundsMaker'),
    UserEventListener = require('../helpers/userEventListener');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.bounds chart bounds
     *      @param {object} params.theme chart theme
     *      @param {{yAxis: obejct, xAxis: object}} axesData axes data
     *      @param {object} params.options chart options
     *      @param {boolean} param.isVertical whether vertical or not
     */
    init: function(params) {

        /**
         * data processor
         * @type {object}
         */
        this.dataProcessor = this._getDataProcessor(params);

        /**
         * component array
         * @type {array}
         */
        this.components = [];

        /**
         * component instance map
         * @type {object}
         */
        this.componentMap = {};

        /**
         * Raw data.
         * @type {object} raw data
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
         * @type {*|boolean}
         */
        this.hasGroupTooltip = params.options.tooltip && params.options.tooltip.grouped;

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();

        this.chartType = this.options.chartType;

        this._addCustomEventComponent();
    },

    /**
     * Get data processor.
     * @param {object} params parameters
     *      @params {object} rawData raw data
     *      @params {{chart: object, chartType: string}} options chart options
     *      @params {array} seriesChartTypes series chart types
     * @returns {object} data processor
     * @private
     */
    _getDataProcessor: function(params) {
        var dataProcessor = new DataProcessor(params.rawData),
            options = params.options;

        dataProcessor.process(params.rawData, options.chart, options.chartType, params.seriesChartTypes);
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
     * Add component.
     * The component refers to a component of the chart.
     * The component types are axis, legend, plot, series and customEvent.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {function} Component component constructor
     * @param {object} params parameters
     * @private
     */
    _addComponent: function(name, Component, params) {
        var commonParams = {},
            options, index, theme,
            component, componentType;

        params = params || {};

        componentType = params.componentType || name;
        options = params.options || this.options[componentType];
        theme = params.theme || this.theme[componentType];
        index = params.index || 0;

        commonParams.theme = tui.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};
        commonParams.dataProcessor = this.dataProcessor;

        params = tui.util.extend(params, commonParams);

        component = new Component(params);

        this.components.push({
            name: name,
            componentType: componentType,
            instance: component
        });
        this.componentMap[name] = component;
    },

    /**
     * Make bounds.
     * @param {?object} boundParams addition params for calculating bounds
     * @returns {object} chart bounds
     * @private
     */
    _makeBounds: function(boundParams) {
        return boundsMaker.make(this.dataProcessor, tui.util.extend({
            theme: this.theme,
            options: this.options,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical
        }, boundParams));
    },

    /**
     * Make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} options options
     * @private
     * @abstract
     */
    _makeRenderingData: function() {},

    /**
     * Attach custom evnet.
     * @private
     */
    _attachCustomEvent: function() {
        var legend = this.componentMap.legend,
            serieses = tui.util.filter(this.componentMap, function (component) {
                return component.componentType === 'series';
            });

        if (legend) {
            legend.on('changeCheckedLegends', this.onChangeCheckedLegends, this);
            tui.util.forEach(serieses, function (series) {
                legend.on(renderUtil.makeCustomEventName('select', series.chartType, 'legend'), series.onSelectLegend, series);
            }, this);
        }
    },

    /**
     * Render chart.
     * @param {object} boundParams parameters for making bounds
     * @returns {HTMLElement} chart element
     */
    render: function(boundParams) {
        var el = dom.create('DIV', this.className),
            bounds, renderingData;

        dom.addClass(el, 'tui-chart');
        bounds = this._makeBounds(boundParams);
        renderingData = this._makeRenderingData(bounds);

        this._renderTitle(el);
        renderUtil.renderDimension(el, bounds.chart.dimension);
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
        this._renderComponents(bounds, renderingData, 'render', el);
        this._sendSeriesData();
        this._attachCustomEvent();
        this.chartContainer = el;

        return el;
    },

    /**
     * Filter raw data.
     * @param {object} rawData raw data
     * @param {array.<?boolean> | {line: ?array.<boolean>, column: ?array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     * @private
     */
    _filterRawData: function(rawData, checkedLegends) {
        var cloneData;

        cloneData = JSON.parse(JSON.stringify(rawData));

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
     * @param {array.<?boolean> | {line: ?array.<boolean>, column: ?array.<boolean>}} checkedLegends checked legends
     * @returns {object} rendering data
     * @private
     */
    _makeRerenderingData: function(renderingData, checkedLegends) {
        var tooltipData = this._makeTooltipData(),
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

        renderingData.tooltip = tui.util.extend(tooltipData, renderingData.tooltip);

        tui.util.forEach(serieses, function(series, seriesName) {
            renderingData[seriesName] = tui.util.extend({
                checkedLegends: checkedLegends[series.chartType] || checkedLegends
            }, renderingData[seriesName]);
        });

        return renderingData;
    },

    /**
     * Rerender.
     * @param {array.<?boolean> | {line: ?array.<boolean>, column: ?array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @private
     */
    _rerender: function(checkedLegends, rawData, boundsParams) {
        var prevFullLegendData = this.dataProcessor.getFullLegendData(),
            bounds, renderingData;

        rawData = rawData || this._filterRawData(this.dataProcessor.getRawData(), checkedLegends);

        this.dataProcessor.process(rawData, this.options, this.chartType, this.seriesChartTypes);

        // 범례 영역은 변경되지 않으므로, bounds 계산에는 변경되지 않은 레이블 데이터를 포함해야 함
        this.dataProcessor.setFullLegendData(prevFullLegendData);

        bounds = this._makeBounds(boundsParams);
        renderingData = this._makeRenderingData(bounds);
        renderingData = this._makeRerenderingData(renderingData, checkedLegends);

        this._renderComponents(bounds, renderingData, 'rerender');

        this._sendSeriesData(boundsParams);
    },

    /**
     * On change checked legend.
     * @param {array.<?boolean> | {line: ?array.<boolean>, column: ?array.<boolean>}} checkedLegends checked legends
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
     * @param {array.<object>} bounds bounds
     * @param {object} renderingData data for rendering
     * @param {string} funcName function name for execution
     * @param {HTMLElement} container container element
     * @private
     */
    _renderComponents: function(bounds, renderingData, funcName, container) {
        var elements;
        elements = tui.util.map(this.components, function(component) {
            var bound = bounds[component.name] || bounds[component.componentType],
                data = renderingData[component.name],
                element = null;

            if (bound && component.instance[funcName]) {
                element = component.instance[funcName](bound, data);
            }

            return element;
        }, this);

        if (container) {
            dom.append(container, elements);
        }
    },

    /**
     * Send series data to custom event component.
     * @private
     */
    _sendSeriesData: function() {
        var seriesInfos, chartTypes;

        if (!this.componentMap.customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(chartType) {
            var component = this.componentMap[chartType + 'Series'] || this.componentMap.series;

            return {
                chartType: chartType,
                data: component.getSeriesData()
            };
        }, this);

        this.componentMap.customEvent.initCustomEventData(seriesInfos);
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
        tui.util.forEachArray(this.components, function(component) {
            if (component.instance.animateComponent) {
                component.instance.animateComponent();
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
     * @param {{width: number, height: number}} dimension dimension
     */
    resize: function(dimension) {
        var updated, bounds, renderingData;

        if (!dimension) {
            return;
        }

        updated = this._updateDimension(dimension);

        if (!updated) {
            return;
        }

        bounds = this._makeBounds();
        renderingData = this._makeRenderingData(bounds);
        renderUtil.renderDimension(this.chartContainer, bounds.chart.dimension);
        this._renderComponents(bounds, renderingData, 'resize');
        this._sendSeriesData();
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setTooltipAlign: function(align) {
        this.componentMap.tooltip.setAlign(align);
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setTooltipPosition: function(position) {
        this.componentMap.tooltip.setPosition(position);
    },

    /**
     * Reset tooltip align option.
     */
    resetTooltipAlign: function() {
        this.componentMap.tooltip.resetAlign();
    },

    /**
     * Reset tooltip position.
     */
    resetTooltipPosition: function() {
        this.componentMap.tooltip.resetPosition();
    }
});

module.exports = ChartBase;
