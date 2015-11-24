/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../helpers/renderUtil'),
    Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
    GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent'),
    PointTypeCustomEvent = require('../customEvents/pointTypeCustomEvent'),
    Tooltip = require('../tooltips/tooltip'),
    GroupTooltip = require('../tooltips/groupTooltip');

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
            if (name === 'yrAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }
            this.addComponent(name, Axis, axisParams);
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
            this.addComponent(series.name, series.SeriesClass, seriesParams);
        }, this);
    },

    /**
     * Add tooltip component
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     */
    _addTooltipComponent: function(convertedData, options) {
        if (this.hasGroupTooltip) {
            this.addComponent('tooltip', GroupTooltip, {
                labels: convertedData.labels,
                joinFormattedValues: convertedData.joinFormattedValues,
                joinLegendLabels: convertedData.joinLegendLabels
            });
        } else {
            this.addComponent('tooltip', Tooltip, {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                labels: convertedData.labels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType,
                isVertical: this.isVertical
            });
        }
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     */
    addComponentsForAxisType: function(params) {
        var convertedData = params.convertedData,
            options = this.options,
            aligned = !!params.aligned;

        this.addComponent('plot', Plot);
        this._addAxisComponents(params.axes, aligned);
        this.addComponent('legend', Legend, {
            joinLegendLabels: convertedData.joinLegendLabels,
            legendLabels: convertedData.legendLabels,
            seriesChartTypes: params.seriesChartTypes,
            chartType: params.chartType,
            userEvent: this.userEvent
        });
        this._addSeriesComponents(params.serieses, options, aligned);
        this._addTooltipComponent(convertedData, options);
    },

    /**
     * Get scales.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @returns {array.<{min: number, max: number}>} scales
     * @param {boolean} isVertical whether vertical or not
     * @private
     */
    _getScales: function(axesData, chartTypes, isVertical) {
        var scales = {},
            yAxisScale = axesData.yAxis.scale;

        scales[chartTypes[0]] = isVertical ? yAxisScale : axesData.xAxis.scale;

        if (chartTypes.length > 1) {
            scales[chartTypes[1]] = axesData.yrAxis ? axesData.yrAxis.scale : yAxisScale;
        }

        return scales;
    },

    /**
     * To make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes, isVertical) {
        var scales = this._getScales(axesData, chartTypes, isVertical),
            aligned = axesData.xAxis.aligned,
            seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            var key = chartTypes.length > 1 ? chartType + 'Series' : 'series';
            seriesData[key] = {
                scale: scales[chartType],
                aligned: aligned
            };
        });
        return seriesData;
    },

    /**
     * To make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds, convertedData, options) {
        var axesData = this._makeAxesData(convertedData, bounds, options),
            optionChartTypes = this.chartTypes || [this.chartType],
            seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);

        return tui.util.extend({
            plot: {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? axesData.xAxis.tickCount : axesData.yAxis.tickCount
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
        this.addComponent('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.addComponent('customEvent', PointTypeCustomEvent, {
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
            series = this.componentMap.series;
        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);

        if (series) {
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        }
    },

    /**
     * To attach coordinate event of combo chart.
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
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip();
        } else {
            this._attachCustomEventForNormalTooltip();
        }
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
