/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
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
            isGroupedTooltip: this.isGroupedTooltip,
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
        if (this.isGroupedTooltip) {
            this.addComponent('tooltip', GroupTooltip, {
                labels: convertedData.labels,
                joinFormattedValues: convertedData.joinFormattedValues,
                joinLegendLabels: convertedData.joinLegendLabels,
                chartId: this.chartId
            });
        } else {
            this.addComponent('tooltip', Tooltip, {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                labels: convertedData.labels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType,
                chartId: this.chartId,
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
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = axisTypeMixer;
