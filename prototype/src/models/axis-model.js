var Backbone = require('backbone'),
    _ = require('underscore'),
    AxisModel;

AxisModel = Backbone.Model.extend({
    defaults: {
        title: 'axis',
        labels: [],
        tickCount: 5,
        max:0,
        min:0
    },

    initialize: function(data) {
        if (!data.labels && !data.values) {
            throw new Error('Data가 없어 Axis를 생성할 수 없습니다.');
        }

        this.setData(data);
    },

    setData: function(data) {
        if (data.labels) {
            this.setLabelAxisData(data.labels);
        } else if (data.values) {
            this.setValueAxisData(data.values);
        }
    },

    setLabelAxisData: function(labels) {
        this.set('labels', labels);
        this.set('tickCount', labels.length);
    },

    setValueAxisData: function(values) {
        var min = _.min(_.flatten(values)),
            max = _.max(_.flatten(values)),
            scale = this.getCalculateScale(min, max),
            tickCount = this.get('tickCount'),
            apart = (scale.max - scale.min) / (tickCount - 1),
            labels = _.map(_.range(tickCount), function(value) {
                return scale.min + (value * apart);
            });

        this.set('min', scale.min);
        this.set('max', scale.max);
        this.set('labels', labels);
    },

    getCalculateScale: function(min, max) {
        return {min: min, max: max};
    },

    getMinMaxTick: function() {
        return _.pick(this.toJSON(), 'min', 'max');
    },

    getTickCount: function() {
        return this.get('tickCount');
    }
});

module.exports = AxisModel;