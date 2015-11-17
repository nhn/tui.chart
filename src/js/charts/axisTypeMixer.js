/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
    GroupedEventHandleLayer = require('../eventHandleLayers/groupedEventHandleLayer'),
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
            hasGroupedTooltip: this.hasGroupedTooltip,
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
        if (this.hasGroupedTooltip) {
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
     * To make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, isVertical) {
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

    /**
     * To make plot data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @returns {{vTickCount: number, hTickCount: number}} plot data
     * @private
     */
    _makePlotDataForRendering: function(axesData) {
        return {
            vTickCount: axesData.yAxis.validTickCount,
            hTickCount: axesData.xAxis.validTickCount
        };
    },

    /**
     * To make data of event handle layer for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {boolean} isVertical whether vertical or not
     * @returns {{tickCount: number}} event handler data
     * @private
     */
    _makeEventHandleLayerDataForRendering: function(axesData, isVertical) {
        return {
            tickCount: isVertical ? axesData.xAxis.tickCount : axesData.yAxis.tickCount
        };
    },

    /**
     * Set rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     * @override
     */
    _setRenderingData: function(bounds, convertedData, options) {
        var axesData = this._makeAxesData(convertedData, bounds, options),
            seriesData = this._makeSeriesDataForRendering(axesData, this.isVertical);

        this.renderingData = tui.util.extend({
            plot: this._makePlotDataForRendering(axesData),
            eventHandleLayer: this._makeEventHandleLayerDataForRendering(axesData, this.isVertical)
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
    _addGroupedEventHandleLayer: function() {
        if (!this.hasGroupedTooltip) {
            return;
        }

        this.addComponent('eventHandleLayer', GroupedEventHandleLayer, {
            chartType: this.options.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        if (this.hasGroupedTooltip) {
            this._attachCoordinateEvent();
        } else {
            this._attachTooltipEvent();
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
