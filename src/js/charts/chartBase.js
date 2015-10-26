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
    GroupedCoordinateEventor = require('../eventors/groupedCoordinateEventor');

var ChartBase = ne.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.bounds chart bounds
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {object} params.initedData initialized data from combo chart
     */
    init: function(params) {
        var tickCount;
        this.chartId = params.initedData && params.initedData.chartId || chartConst.CHAR_ID_PREFIX + '-' + (new Date()).getTime();
        this.isSubChart = !!params.initedData;
        this.components = [];
        this.componentMap = {};
        this.bounds = params.bounds;
        this.theme = params.theme;
        this.options = params.options;
        this.hasAxes = !!params.axesData;
        this.isGroupedTooltip = params.options.tooltip && params.options.tooltip.grouped;

        if (this.isGroupedTooltip && params.axesData && !this.isSubChart) {
            if (params.isVertical) {
                tickCount = params.axesData.xAxis && params.axesData.xAxis.tickCount || -1;
            } else {
                tickCount = params.axesData.yAxis && params.axesData.yAxis.tickCount || -1;
            }
            this.addComponent('eventor', GroupedCoordinateEventor, {
                tickCount: tickCount,
                chartType: params.options.chartType,
                isVertical: params.isVertical
            });
        }
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
            bounds = boundsMaker.make(ne.util.extend({
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
        var bound = this.bounds[name],
            theme = this.theme[name],
            options = this.options[name],
            index = params.index || 0,
            commonParams = {},
            component;

        commonParams.bound = ne.util.isArray(bound) ? bound[index] : bound;
        commonParams.theme = ne.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = ne.util.isArray(options) ? options[index] : options || {};

        params = ne.util.extend(commonParams, params);
        component = new Component(params);
        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Render chart.
     * @param {HTMLElement} el chart element
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} chart element
     */
    render: function(el, paper) {
        if (!el) {
            el = dom.create('DIV', this.className);

            dom.addClass(el, 'ne-chart');
            this._renderTitle(el);
            renderUtil.renderDimension(el, this.bounds.chart.dimension);
            renderUtil.renderBackground(el, this.theme.chart.background);
            renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
        }

        this._renderComponents(el, this.components, paper);

        if (this.hasAxes && this.isGroupedTooltip && !this.isSubChart) {
            this._attachCoordinateEvent();
        } else if (!this.hasAxes || !this.isGroupedTooltip) {
            this._attachTooltipEvent();
        }
        return el;
    },

    /**
     * Render title.
     * @param {HTMLElement} el target element
     * @private
     */
    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'ne-chart-title');
        dom.append(el, elTitle);
    },

    /**
     * Render components.
     * @param {HTMLElement} container container element
     * @param {array.<object>} components components
     * @param {object} paper object for graph drawing
     * @private
     */
    _renderComponents: function(container, components, paper) {
        var elements = ne.util.map(components, function(component) {
            return component.render(paper);
        });
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

    /**
     * Attach custom event
     * @private
     */
    _attachTooltipEvent: function() {
        var tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        if (!tooltip || !series) {
            return;
        }
        series.on('showTooltip', tooltip.onShow, tooltip);
        series.on('hideTooltip', tooltip.onHide, tooltip);

        if (!series.onShowAnimation) {
            return;
        }

        tooltip.on('showAnimation', series.onShowAnimation, series);
        tooltip.on('hideAnimation', series.onHideAnimation, series);
    },

    /**
     * Attach coordinate event.
     * @private
     */
    _attachCoordinateEvent: function() {
        var eventor = this.componentMap.eventor,
            tooltip = this.componentMap.tooltip;
        eventor.on('showGroupTooltip', tooltip.onShow, tooltip);
        eventor.on('hideGroupTooltip', tooltip.onHide, tooltip);
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        ne.util.forEachArray(this.components, function(component) {
            if (component.animateComponent) {
                component.animateComponent();
            }
        });
    }
});

module.exports = ChartBase;
