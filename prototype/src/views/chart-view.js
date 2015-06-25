var Backbone = require('backbone'),
    ChartView;

ChartView = Backbone.View.extend({
    className: 'ne-chart-component',
    initialize: function(options) {
        options.size = options.size || {};
        options.size.width = options.size.width || 300;
        options.size.height = options.size.height || 300;

        this.options = options;
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
        throw new Error('renderSeries를 구현해야합니다.');
    }
});

module.exports = ChartView;