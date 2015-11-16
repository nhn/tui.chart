/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    dataConverter = require('../helpers/dataConverter'),
    boundsMaker = require('../helpers/boundsMaker'),
    GroupedEventHandleLayer = require('../eventHandleLayers/groupedEventHandleLayer'),
    UserEventListener = require('../helpers/UserEventListener');

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
        this.convertedData = this._makeConvertedData(params);
        this.chartId = this._makeChartId();
        this.components = [];
        this.componentMap = {};
        this.renderingData = {};
        //this.bounds = params.bounds;

        this.theme = params.theme;
        this.options = params.options;
        this.hasAxes = params.hasAxes;

        this.isVertical = !!params.isVertical;
        this.isGroupedTooltip = params.options.tooltip && params.options.tooltip.grouped;
        this.userEvent = this._initUserEventListener();

        this._addGroupedEventHandleLayer();
    },

    /**
     * To make converted data.
     * @param {object} params parameters
     *      @params {object} userData user data
     *      @params {{chart: object, chartType: string}} options chart options
     *      @params {array} seriesChartTypes series chart types
     * @returns {object} converted data
     * @private
     */
    _makeConvertedData: function(params) {
        var options = params.options,
            convertedData = dataConverter.convert(params.userData, options.chart, options.chartType, params.seriesChartTypes);

        return convertedData;
    },

    /**
     * To make chart id.
     * @returns {string} chart id
     * @private
     */
    _makeChartId: function() {
        return chartConst.CHAR_ID_PREFIX + '-' + (new Date()).getTime();
    },

    /**
     * Initialize user event listener.
     * @returns {object} userEvent object
     * @private
     */
    _initUserEventListener: function() {
        return new UserEventListener();
    },

    /**
     * Add grouped event handler layer.
     * @param {{yAxis: obejct, xAxis: object}} axesData axes data
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @private
     */
    _addGroupedEventHandleLayer: function() {
        if (!this.hasAxes || !this.isGroupedTooltip) {
            return;
        }

        this.addComponent('eventHandleLayer', GroupedEventHandleLayer, {
            chartType: this.options.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * To make baes data.
     * @param {array | object} userData user data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} params add params
     * @returns {{convertedData: object, bounds: object}} base data
     */
    makeBaseData: function(userData, theme, options, params) {
        var seriesChartTypes = params ? params.seriesChartTypes : [],
            convertedData = dataConverter.convert(userData, options.chart, options.chartType, seriesChartTypes),
            bounds = boundsMaker.make(tui.util.extend({
                chartType: options.chartType,
                convertedData: convertedData,
                theme: theme,
                options: options
            }, params));

        return {
            convertedData: convertedData,
            bounds: bounds
        };
    },

    /**
     * Add component.
     * @param {string} name component name
     * @param {function} Component component function
     * @param {object} params parameters
     */
    addComponent: function(name, Component, params) {
        var commonParams = {},
            options, index, theme, component;

        params = params || {};

        options = params.options || this.options[params && params.componentType || name];
        theme = params.theme || this.theme[params && params.componentType || name];
        index = params && params.index || 0;

        commonParams.theme = tui.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};

        params = tui.util.extend(params, commonParams);

        component = new Component(params);

        this.components.push({
            name: name,
            componentType: params.componentType,
            instance: component
        });
        this.componentMap[name] = component;
    },

    /**
     * Attach custom evnet.
     * @private
     */
    _attachCustomEvent: function() {
        if (this.hasAxes && this.isGroupedTooltip) {
            this._attachCoordinateEvent();
        } else if (!this.hasAxes || !this.isGroupedTooltip) {
            this._attachTooltipEvent();
        }
    },

    /**
     * To make bounds.
     * @param {object} boundsParams parameters for making bounds
     * @param {object} parentData parent chart data
     * @returns {object} chart bounds
     * @private
     */
    _makeBounds: function(boundsParams, parentData) {
        var bounds;

        if (parentData) {
            bounds = parentData.bounds;
        } else {
            bounds = boundsMaker.make(tui.util.extend({
                chartType: this.options.chartType,
                convertedData: this.convertedData,
                theme: this.theme,
                options: this.options,
                hasAxes: this.hasAxes,
                isVertical: this.isVertical
            }, boundsParams));
        }

        return bounds;
    },

    _makeRenderingSeriesData: function(axesData, isVertical) {
        var aligned = !!axesData.xAxis.aligned,
            chartTypes, seriesData, firstData;

        if (!isVertical) {
            return {
                series: {
                    scale: axesData.xAxis.scale,
                    aligned: aligned
                }
            };
        }

        firstData = {
            scale: axesData.yAxis.scale,
            aligned: aligned
        };

        chartTypes = this.optionChartTypes;

        if (!chartTypes) {
            return {
                series: firstData
            };
        }

        seriesData = {};
        seriesData[chartTypes[0] + 'Series'] = firstData;
        seriesData[chartTypes[1] + 'Series'] = axesData.yrAxis ? {
            scale: axesData.yrAxis.scale,
            aligned: aligned
        } : firstData;

        return seriesData;
    },

    _makeRenderingDataForAxisType: function(convertedData, bounds, options) {
        var axesData = this._makeAxesData(convertedData, bounds, options),
            renderingData, seriesData, tickCount;

        if (this.isVertical) {
            tickCount = axesData.xAxis ? axesData.xAxis.tickCount : -1;
        } else {
            tickCount = axesData.yAxis ? axesData.yAxis.tickCount : -1;
        }

        seriesData = this._makeRenderingSeriesData(axesData, this.isVertical);

        renderingData = tui.util.extend({
            plot: this.makePlotData(convertedData.plotData, axesData),
            eventHandleLayer: {
                tickCount: tickCount
            }
        }, seriesData, axesData);

        return renderingData;
    },

    /**
     * Set rendering data.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     */
    _setRenderingData: function(bounds, convertedData, options) {
        var renderingData;
        if (this.hasAxes) {
            renderingData = this._makeRenderingDataForAxisType(convertedData, bounds, options);
        } else {
            renderingData = {
                tooltip: {
                    seriesPosition: bounds.series.position
                },
                series: {
                    chartWidth: bounds.chart.dimension.width
                }
            };
        }

        this.renderingData = renderingData;
    },

    /**
     * Render chart.
     * @param {HTMLElement} el chart element
     * @param {object} paper object for graph drawing
     * @param {object} boundsParams parameters for making bounds
     * @param {object} parentData parentData
     * @returns {HTMLElement} chart element
     */
    render: function(el, paper, boundsParams, parentData) {
        var bounds = this._makeBounds(boundsParams, parentData);

        this.bounds = bounds;
        this._setRenderingData(bounds, this.convertedData, this.options, parentData);

        if (!el) {
            el = dom.create('DIV', this.className);

            dom.addClass(el, 'tui-chart');
            this._renderTitle(el);
            renderUtil.renderDimension(el, bounds.chart.dimension);
            renderUtil.renderBackground(el, this.theme.chart.background);
            renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
        }

        this.elChart = el;
        this._renderComponents(el, this.components);
        this._attachCustomEvent();

        return el;
    },


    /**
     * To make plot data.
     * @param {object} plotData initialized plot data
     * @param {object} axesData axes data
     * @returns {{vTickCount: number, hTickCount: number}} plot data
     */
    makePlotData: function(plotData, axesData) {
        if (tui.util.isUndefined(plotData)) {
            plotData = {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            };
        }
        return plotData;
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
     * @param {HTMLElement} container container element
     * @param {array.<object>} components components
     * @param {object} paper object for graph drawing
     * @private
     */
    _renderComponents: function(container, components) {
        var paper,
            elements = tui.util.map(components, function(component) {
                var name = component.name,
                    bound = this.bounds[name] || (component.componentType && this.bounds[component.componentType]),
                    data = this.renderingData[name],
                    elComponent;

                if (!bound) {
                    return null;
                }

                elComponent = component.instance.render(bound, data, paper);
                if (!paper && component.instance.getPaper) {
                    paper = component.instance.getPaper();
                }

                return elComponent;
            }, this);
        dom.append(container, elements);
    },

    /**
     * Get paper.
     * @returns {object} paper
     */
    getPaper: function() {
        var series = this.componentMap.series,
            paper;

        if (series) {
            paper = series.getPaper();
        }

        return paper;
    },

    _makeAnimationEventName: function(chartType, prefix) {
        return prefix + chartType.substring(0, 1).toUpperCase() + chartType.substring(1) + 'Animation';
    },

    /**
     * Attach custom event
     * @private
     */
    _attachTooltipEvent: function() {
        var tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

        tui.util.forEach(serieses, function(series) {
            series.on('showTooltip', tooltip.onShow, tooltip);
            series.on('hideTooltip', tooltip.onHide, tooltip);
            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    },

    /**
     * Attach coordinate event.
     * @private
     */
    _attachCoordinateEvent: function() {
        var eventHandleLayer = this.componentMap.eventHandleLayer,
            tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        eventHandleLayer.on('showGroupTooltip', tooltip.onShow, tooltip);
        eventHandleLayer.on('hideGroupTooltip', tooltip.onHide, tooltip);

        if (series) {
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        }
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
     * To register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
    }
});

module.exports = ChartBase;
