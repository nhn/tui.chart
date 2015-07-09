/**
 * @fileoverview BarChartView
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartView = require('./chartView.js'),
    chartFactory = require('../factory/chartFactory.js'),
    BarChartModel = require('../models/BarChartModel.js'),
    AxisView = require('./axisView.js');

var BarChartView = ne.util.defineClass(ChartView, {
    className: 'bar-chart-area',
    init: function(data, options) {
        this.options = options;
        this.model = new BarChartModel(data, options);
        this.vAxisView = new AxisView(this.model.vAxis);
        this.hAxisView = new AxisView(this.model.hAxis);
        ChartView.prototype.init.call(this, data, options);
    },

    render: function() {
        var elVAxis = this.vAxisView.render(100, 250),
            elHAxis = this.hAxisView.render(400, 50);
        this.el.appendChild(elVAxis);
        this.el.appendChild(elHAxis);
        this.renderSize();
        return this.el;
    }
});

chartFactory.register('Bar', BarChartView);
module.exports = BarChartView;