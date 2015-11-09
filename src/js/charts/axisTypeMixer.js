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
            hasSeries = !!params.Series,
            aligned = !!params.aligned;

        this.addComponent('plot', Plot);

        tui.util.forEach(params.axes, function(name, data) {
            var AxisParams = {
                aligned: aligned
            };
            if (name === 'yrAxis') {
                AxisParams.key = 'yAxis';
                AxisParams.index = 1;
            }
            this.addComponent(name, Axis, AxisParams);
        }, this);

        if (convertedData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                seriesChartTypes: params.seriesChartTypes,
                chartType: params.chartType,
                userEvent: this.userEvent
            });
        }

        if (hasSeries) {
            this.addComponent('series', params.Series, tui.util.extend({
                libType: options.libType,
                chartType: options.chartType,
                parentChartType: options.parentChartType,
                aligned: aligned,
                isSubChart: this.isSubChart,
                isGroupedTooltip: this.isGroupedTooltip,
                userEvent: this.userEvent
            }, params.seriesData));
        }


        if (this.isGroupedTooltip) {
            this.addComponent('tooltip', GroupTooltip, {
                labels: convertedData.labels,
                joinFormattedValues: convertedData.joinFormattedValues,
                joinLegendLabels: convertedData.joinLegendLabels,
                chartId: this.chartId
            });
        } else if (hasSeries) {
            this.addComponent('tooltip', Tooltip, {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                labels: convertedData.labels,
                legendLabels: convertedData.legendLabels,
                chartId: this.chartId,
                isVertical: this.isVertical
            });
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
