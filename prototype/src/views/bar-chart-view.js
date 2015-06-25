var _ = require('underscore'),
    Raphael = require('raphael'),
    chartFactory = require('../chartFactory.js'),
    ChartView = require('./chart-view.js'),
    BarChartModel = require('../models/bar-chart-model.js'),
    AxisView = require('./axis-view.js'),
    BarChartView;

BarChartView = ChartView.extend({
    className: function() {
        return this.constructor.__super__.className + ' ne-bar-chart';
    },

    initialize: function(options) {
        var model = this.model = new BarChartModel(_.pick(options, 'data'));
        this.constructor.__super__.initialize.call(this, options);

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
        //var shapeWidth = this.options.size.width - 90,
        //    shapeHeight = this.options.size.height - 50,
        //    paper, $shapeArea;
        //
        //this.$el.html('<div class="shape-area"></div>');
        //$shapeArea = this.$el.find('.shape-area');
        //paper = Raphael($shapeArea[0], shapeWidth, shapeHeight);
        //var rect = paper.rect(0,0,50,100);
        //rect.attr({
        //    fill:'red'
        //})
        //$shapeArea.css({
        //    width: shapeWidth,
        //    height: shapeHeight
        //});
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