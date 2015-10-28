/**
 * @fileoverview AxisTypeBase is base class of axis type chart(bar, column, line, area).
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
 * @classdesc AxisTypeBase is base class of axis type chart(bar, column, line, area).
 * @class AxisTypeBase
 * @mixin
 */
var AxisTypeBase = ne.util.defineClass(/** @lends AxisTypeBase.prototype */ {
    /**
     * Add axis components
     * @param {object} params parameters
     *      @param {object} params.covertData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.Series series class
     */
    addAxisComponents: function(params) {
        var convertedData = params.convertedData,
            options = this.options,
            aligned = !!params.aligned;

        if (params.plotData) {
            this.addComponent('plot', Plot, params.plotData);
        }

        ne.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data,
                aligned: aligned
            });
        }, this);

        if (convertedData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: params.chartType
            });
        }

        this.addComponent('series', params.Series, ne.util.extend({
            libType: options.libType,
            chartType: options.chartType,
            parentChartType: options.parentChartType,
            aligned: aligned,
            isSubChart: this.isSubChart,
            isGroupedTooltip: this.isGroupedTooltip
        }, params.seriesData));

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
                chartId: this.chartId
            });
        }

    },

    /**
     * To make plot data.
     * @param {object} plotData initialized plot data
     * @param {object} axesData axes data
     * @returns {{vTickCount: number, hTickCount: number}} plot data
     */
    makePlotData: function(plotData, axesData) {
        if (ne.util.isUndefined(plotData)) {
            plotData = {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            };
        }
        return plotData;
    }
});

AxisTypeBase.mixin = function(func) {
    ne.util.extend(func.prototype, AxisTypeBase.prototype);
};

module.exports = AxisTypeBase;
