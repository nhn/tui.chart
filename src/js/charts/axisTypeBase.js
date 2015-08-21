/**
 * @fileoverview AxisBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase.js'),
    Axis = require('../axes/axis.js'),
    Plot = require('../plots/plot.js'),
    Legend = require('../legends/legend.js'),
    Tooltip = require('../tooltips/tooltip.js');

var AxisTypeBase = ne.util.defineClass(ChartBase, /** @lends AxisTypeBase.prototype */ {
    /**
     * Axis type chart base
     * @constructs AxisTypeBase
     */
    init: function() {
        var args = [].slice.call(arguments);
        ChartBase.apply(this, args);
    },

    /**
     * Add axis components
     * @param {object} params parameters
     *      @param {object} params.covertData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.Series series class
     *      @param {object} params.axisScale axis scale
     *      @param {object} params.options chart options
     */
    addAxisComponents: function(params) {
        var convertData = params.convertData,
            options = params.options;

        this.addComponent('plot', Plot, params.plotData);

        ne.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data
            });
        }, this);

        this.addComponent('series', params.Series, {
            libType: options.libType,
            chartType: options.chartType,
            tooltipPrefix: this.tooltipPrefix,
            isVertical: params.isVertical,
            data: params.seriesData || {
                values: convertData.values,
                formattedValues: convertData.formattedValues,
                scale: params.axisScale
            }
        });

        this.addComponent('legend', Legend, {
            legendLabels: convertData.legendLabels
        });

        this.addComponent('tooltip', Tooltip, {
            values: convertData.formattedValues,
            labels: convertData.labels,
            legendLabels: convertData.legendLabels,
            prefix: this.tooltipPrefix
        });
    }
});

module.exports = AxisTypeBase;