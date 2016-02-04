/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../helpers/renderUtil'),
    ChartBase = require('./chartBase'),
    Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
    GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent'),
    PointTypeCustomEvent = require('../customEvents/pointTypeCustomEvent'),
    Tooltip = require('../tooltips/tooltip'),
    GroupTooltip = require('../tooltips/groupTooltip');


/**
 * Axis limit value.
 * @typedef {{min: number, max: number}} axisLimit
 */

/**
 * axisTypeMixer is base class of axis type chart(bar, column, line, area).
 * @mixin
 */
var axisTypeMixer = {
    /**
     * Add axis components.
     * @param {Array.<object>} axes axes option
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addAxisComponents: function(axes, aligned) {
        tui.util.forEach(axes, function(axis) {
            var axisParams = {
                aligned: aligned,
                isLabel: !!axis.isLabel,
                chartType: axis.chartType
            };

            if (axis.name === 'rightYAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }

            this.componentManager.register(axis.name, Axis, axisParams);
        }, this);
    },

    /**
     * Add series components
     * @param {Array<object>} serieses serieses
     * @param {object} options options
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addSeriesComponents: function(serieses, options) {
        var seriesBaseParams = {
            libType: options.libType,
            chartType: options.chartType,
            userEvent: this.userEvent,
            componentType: 'series'
        };

        tui.util.forEach(serieses, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            this.componentManager.register(series.name, series.SeriesClass, seriesParams);
        }, this);
    },

    /**
     * Add tooltip component
     * @private
     */
    _addTooltipComponent: function() {
        var TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;
        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());
    },

    /**
     * Add legend component.
     * @param {Array.<string>} chartTypes series chart types
     * @param {string} chartType chartType
     * @param {object} legendOptions legend options
     * @private
     */
    _addLegendComponent: function(chartTypes, chartType, legendOptions) {
        if (!legendOptions || !legendOptions.hidden) {
            this.componentManager.register('legend', Legend, {
                chartTypes: chartTypes,
                chartType: chartType,
                userEvent: this.userEvent
            });
        }
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     * @private
     */
    _addComponentsForAxisType: function(params) {
        var options = this.options,
            aligned = !!params.aligned;

        this.componentManager.register('plot', Plot);
        this._addAxisComponents(params.axes, aligned);
        this._addLegendComponent(params.seriesChartTypes, params.chartType, this.options.legend);
        this._addSeriesComponents(params.serieses, options);
        this._addTooltipComponent(options.chartType);
    },

    /**
     * Get limit map.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map
     * @private
     */
    _getLimitMap: function(axesData, chartTypes) {
        var limitMap = {},
            yAxisLimit = axesData.yAxis ? axesData.yAxis.limit : axesData.rightYAxis.limit;

        limitMap[chartTypes[0]] = this.isVertical ? yAxisLimit : axesData.xAxis.limit;

        if (chartTypes.length > 1) {
            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;
        }

        return limitMap;
    },

    /**
     * Make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes) {
        var limitMap = this._getLimitMap(axesData, chartTypes),
            aligned = axesData.xAxis.aligned,
            seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            seriesData[chartType + 'Series'] = {
                limit: limitMap[chartType],
                aligned: aligned,
                hasAxes: true
            };
        });

        return seriesData;
    },

    /**
     * Update percent values.
     * @param {object} axesData axes data
     * @private
     * @override
     */
    _updatePercentValues: function(axesData) {
        var chartTypes = this.chartTypes || [this.chartType],
            limitMap = this._getLimitMap(axesData, chartTypes),
            stackedOption = this.options.series && this.options.series.stacked;
        tui.util.forEachArray(chartTypes, function(chartType) {
            this.dataProcessor.registerPercentValues(limitMap[chartType], stackedOption, chartType);
        }, this);
    },

    /**
     * Make rendering data for axis type chart.
     * @param {object} axesData axesData
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(axesData) {
        var optionChartTypes = this.chartTypes || [this.chartType],
            seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical),
            yAxis = axesData.yAxis ? axesData.yAxis : axesData.rightYAxis;

        return tui.util.extend({
            plot: {
                vTickCount: yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? axesData.xAxis.tickCount : yAxis.tickCount
            }
        }, seriesData, axesData);
    },

    /**
     * Add grouped event handler layer.
     * @param {{yAxis: obejct, xAxis: object}} axesData axes data
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @private
     * @override
     */
    _addCustomEventComponentForGroupTooltip: function() {
        this.componentManager.register('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', PointTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        if (this.hasGroupTooltip) {
            this._addCustomEventComponentForGroupTooltip();
        } else {
            this._addCustomEventComponentForNormalTooltip();
        }
    },

    /**
     * Attach coordinate event.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForGroupTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowGroupTooltipLine) {
                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);
                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);
            }
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        }, this);
    },

    /**
     * Attach custom event for normal tooltip.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForNormalTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    },

    /**
     * Attach custom event for series selection.
     * @param {CustomEvent} customEvent custom event component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForSeriesSelection: function(customEvent, serieses) {
        tui.util.forEach(serieses, function(series) {
            customEvent.on(renderUtil.makeCustomEventName('select', series.chartType, 'series'), series.onSelectSeries, series);
            customEvent.on(renderUtil.makeCustomEventName('unselect', series.chartType, 'series'), series.onUnselectSeries, series);
        }, this);
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var serieses = this.componentManager.where({componentType: 'series'}),
            customEvent = this.componentManager.get('customEvent'),
            tooltip = this.componentManager.get('tooltip');

        ChartBase.prototype._attachCustomEvent.call(this, serieses);

        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip(customEvent, tooltip, serieses);
        } else {
            this._attachCustomEventForNormalTooltip(customEvent, tooltip, serieses);
        }

        this._attachCustomEventForSeriesSelection(customEvent, serieses);
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = axisTypeMixer;
