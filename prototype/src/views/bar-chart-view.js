var _ = require('underscore'),
    chartFactory = require('../chart-factory.js'),
    ChartView = require('./chart-view.js'),
    BarChartModel = require('../models/bar-chart-model.js'),
    AxisView = require('./axis-view.js'),
    BarChartView;

BarChartView = ChartView.extend({
    className: function() {
        return this.constructor.__super__.className + ' ne-bar-chart';
    },

    chartType: 'Bar',

    initialize: function(options) {
        var model = new BarChartModel(_.pick(options, 'data'));
        this.constructor.__super__.initialize.call(this, model, options);

        this.vAxisView = new AxisView({
            model: model.getVAxis(),
            size: options.size
        });

        this.hAxisView = new AxisView({
            model: model.getHAxis(),
            size: options.size
        });
    },

    renderSeries: function() {
        this.constructor.__super__.renderSeries.call(this);
    },

    render: function() {
        this.constructor.__super__.render.call(this);
        //this.$el.append(this.vAxisView.render());
        //this.$el.append(this.hAxisView.render());

        return this.$el;
    }
});

chartFactory.register('Bar', BarChartView);

module.exports = BarChartView;