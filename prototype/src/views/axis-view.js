var Backbone = require('backbone'),
    _ = require('underscore'),
    template = _.template(require('./axis-template.html')),
    AxisView;
    //VERTICAL_AXIS_WIDTH = 90,
    //HORIZON_AXIS_HEIGHT = 50;

AxisView = Backbone.View.extend({
    className: 'axis-area',
    initialize: function(data) {
        this.data = data;
        this.model = data.model;
    },

    render: function() {
        //var isVertical = this.model.get('isVertical'),
        //    width = !isVertical ? this.options.size.width - VERTICAL_AXIS_WIDTH : VERTICAL_AXIS_WIDTH,
        //    height = isVertical ? this.options.size.height - HORIZON_AXIS_HEIGHT : HORIZON_AXIS_HEIGHT,
        //    standardWith = isVertical ? height : width,
        //    className = 'axis-' + (isVertical ? 'vertical' : 'horizontal'),
        //    html;

        //this.model.setApart(standardWith);
        //this.model.setTicks();

        //html = template(this.model.toJSON());

        //this.$el.addClass(className);
        //this.$el.css({
        //    width: width,
        //    height: height
        //});


        this.$el.html('<div>axis</div>');

        return this.$el;
    }
});

module.exports = AxisView;