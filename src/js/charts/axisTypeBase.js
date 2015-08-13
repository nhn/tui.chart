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
    init: function() {
        var args = [].slice.call(arguments);
        ChartBase.apply(this, args);
    },
    addAxisComponents: function(params) {
        var convertData = params.convertData,
            options = params.options;

        this.addComponent('plot', Plot, params.plotData);

        ne.util.forEach(params.axes, function(data, name) {
            this.addComponent(name, Axis, {
                data: data
            });
        }, this);
        //console.log()
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