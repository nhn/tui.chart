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
     * @param {array.<string>} axisNames axis names
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addAxisComponents: function(axisNames, aligned) {
        tui.util.forEach(axisNames, function(name) {
            var axisParams = {
                aligned: aligned
            };
            if (name === 'rightYAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }
            this._addComponent(name, Axis, axisParams);
        }, this);
    },

    /**
     * Add series components
     * @param {array<object>} serieses serieses
     * @param {object} options options
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addSeriesComponents: function(serieses, options, aligned) {
        var seriesBaseParams = {
            libType: options.libType,
            chartType: options.chartType,
            parentChartType: options.parentChartType,
            aligned: aligned,
            hasGroupTooltip: this.hasGroupTooltip,
            userEvent: this.userEvent,
            componentType: 'series'
        };

        tui.util.forEach(serieses, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            this._addComponent(series.name, series.SeriesClass, seriesParams);
        }, this);
    },

    /**
     * Add tooltip component
     * @param {object} processedData processedData
     * @param {string} chartType chart type
     * @private
     */
    _addTooltipComponent: function(processedData, chartType) {
        var data = this._makeTooltipData(processedData, chartType),
            TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;
        this._addComponent('tooltip', TooltipClass, data);
    },

    /**
     * Add legend component.
     * @param {object} processedData processedData
     * @param {array.<string>} chartTypes series chart types
     * @param {string} chartType chartType
     * @param {object} legendOptions legend options
     * @private
     */
    _addLegendComponent: function(processedData, chartTypes, chartType, legendOptions) {
        if (!legendOptions || !legendOptions.hidden) {
            this._addComponent('legend', Legend, {
                joinLegendLabels: processedData.joinLegendLabels,
                legendLabels: processedData.legendLabels,
                chartTypes: chartTypes,
                chartType: chartType,
                userEvent: this.userEvent
            });
        }
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.processedData processed data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     * @private
     */
    _addComponentsForAxisType: function(params) {
        var processedData = params.processedData,
            options = this.options,
            aligned = !!params.aligned;

        this._addComponent('plot', Plot);
        this._addAxisComponents(params.axes, aligned);
        this._addLegendComponent(processedData, params.seriesChartTypes, params.chartType, this.options.legend);
        this._addSeriesComponents(params.serieses, options, aligned);
        this._addTooltipComponent(processedData, options.chartType);
    },

    /**
     * Get limit map.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map
     * @private
     */
    _getLimitMap: function(axesData, chartTypes, isVertical) {
        var limitMap = {},
            yAxisLimit = axesData.yAxis.limit;

        limitMap[chartTypes[0]] = isVertical ? yAxisLimit : axesData.xAxis.limit;

        if (chartTypes.length > 1) {
            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;
        }

        return limitMap;
    },

    /**
     * Make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes, isVertical) {
        var limitMap = this._getLimitMap(axesData, chartTypes, isVertical),
            aligned = axesData.xAxis.aligned,
            seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            var key = chartTypes.length > 1 ? chartType + 'Series' : 'series';
            seriesData[key] = {
                limit: limitMap[chartType],
                aligned: aligned
            };
        });
        return seriesData;
    },

    /**
     * Make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {?object} processedData processedData
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds, processedData) {
        var axesData, optionChartTypes, seriesData;

        axesData = this._makeAxesData(processedData || this.processedData, bounds);
        optionChartTypes = this.chartTypes || [this.chartType];
        seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);

        return tui.util.extend({
            plot: {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? axesData.xAxis.tickCount : axesData.yAxis.tickCount
            },
            tooltip: {
                chartDimension: bounds.chart.dimension
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
        this._addComponent('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this._addComponent('customEvent', PointTypeCustomEvent, {
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
     * @private
     */
    _attachCustomEventForGroupTooltip: function() {
        var customEvent = this.componentMap.customEvent,
            tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

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
     * @private
     */
    _attachCustomEventForNormalTooltip: function() {
        var customEvent = this.componentMap.customEvent,
            tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

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
     * @private
     */
    _attachCustomEventForSeriesSelection: function() {
        var customEvent = this.componentMap.customEvent,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

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
        ChartBase.prototype._attachCustomEvent.call(this);

        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip();
        } else {
            this._attachCustomEventForNormalTooltip();
        }

        this._attachCustomEventForSeriesSelection();
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
