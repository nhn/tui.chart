var Backbone = require('backbone'),
    pluginFactory = require('../plugin-factory.js'),
    SeriesView = require('./series-view.js'),
    ChartView;

ChartView = Backbone.View.extend({
    className: 'ne-chart-component',
    initialize: function(model, options) {
        this.model = model;
        options.size = options.size || {};
        options.size.width = options.size.width || 300;
        options.size.height = options.size.height || 300;

        this.options = options;

        this.seriesView = new SeriesView({
            model: model.getSeries(),
            libType: options.libType,
            chartType: this.chartType
        });
    },

    render: function() {
        this.$el.html('');
        this.renderSeries();
        this.$el.css({
            width: this.options.size.width,
            height: this.options.size.height
        });

        return this.$el;
    },

    renderSeries: function() {
        var shapeWidth = this.options.size.width - 90,
            shapeHeight = this.options.size.height - 50,
            $shapeArea = this.seriesView.render({
                width: shapeWidth,
                height: shapeHeight
            });
        this.$el.append($shapeArea);
    }
});

module.exports = ChartView;