/**
 * @fileoverview AxisTypeBase is base class of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../axes/axis.js'),
    Plot = require('../plots/plot.js'),
    Legend = require('../legends/legend.js'),
    Tooltip = require('../tooltips/tooltip.js');

/**
 * @classdesc AxisTypeBase is base class of axis type chart(bar, column, line, area).
 * @class AxisTypeBase
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
        var convertData = params.convertData,
            options = this.options;

        if (params.plotData) {
            this.addComponent('plot', Plot, params.plotData);
        }

        ne.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data
            });
        }, this);

        if (convertData.joinLegendLabels) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertData.joinLegendLabels,
                legendLabels: convertData.legendLabels,
                chartType: params.chartType
            });
        }

        this.addComponent('series', params.Series, ne.util.extend({
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
        }, params.seriesData));

        this.addComponent('tooltip', Tooltip, {
            values: convertData.values,
            formattedValues: convertData.formattedValues,
            labels: convertData.labels,
            legendLabels: convertData.legendLabels,
            prefix: this.tooltipPrefix
        });
    }
});

AxisTypeBase.mixin = function(func) {
    ne.util.extend(func.prototype, AxisTypeBase.prototype);
};

module.exports = AxisTypeBase;
