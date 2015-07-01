/**
 * @fileoverview axis model
 * @author jiung.kang@nhnent.com
 */

'user strict';

var AxisModel,
    AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label';

require('code-snippet/code-snippet');

AxisModel = ne.util.defineClass({
    labels: [],
    tickCount: 5,
    min: 0,
    max: 0,
    axisType: null,
    init: function(options) {
        if (options && options.data) {
            this.setData(options.data);
        }
    },

    /**
     * setting label type axis
     * @param {array} labels
     */
    setLabelAxis: function(labels) {
        this.axisType = AXIS_TYPE_LABEL;
        this.setLabels(labels);
        this.setTickCount(labels.length);
    },

    /**
     * set labels
     * @param {array} labels
     */
    setLabels: function(labels) {
        this.labels = labels;
    },

    /**
     * get labels
     * @returns {array}
     */
    getLabels: function() {
        return this.labels;
    },

    /**
     * get tickCount;
     * @param {number} tickCount
     */
    setTickCount: function(tickCount) {
        this.tickCount = tickCount;
    },

    /**
     * get tick count
     * @returns {number}
     */
    getTickCount: function() {
        return this.tickCount;
    },

    /**
     * set tick min value
     * @param {number} min
     */
    setMin: function(min) {
        this.min = min;
    },

    /**
     * get tick min value
     * @returns {number}
     */
    getMin: function() {
        return this.min;
    },


    /**
     * set tick max value
     * @param {number} max;
     */
    setMax: function(max) {
        this.max = max;
    },

    /**
     * get tick max value
     * @returns {number}
     */
    getMax: function() {
        return this.max;
    },

    /**
     * calculate scale of value axis
     * from : http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min value
     * @param {number} max max value
     * @returns {object}
     */
    getCalculateScale: function(min, max) {
        var result = {},
            iodValue = (max - min) / 20; // increase or decrease the value;
        result.max = max + iodValue;

        if (max / 6 > min) {
            result.min  = 0;
        } else {
            result.min = min - iodValue;
        }

        return result;
    },

    /**
     * get scale step
     * @param {object} scale axis scale
     * @param {number} count value count
     * @returns {number}
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * ne.util에 range가 추가되기 전까지 임시로 사용
     * @param start
     * @param stop
     * @param step
     * @returns {array}
     */
    range: function(start, stop, step) {
        var arr = [],
            flag;

        if (ne.util.isUndefined(stop)) {
            stop = start || 0;
            start = 0;
        }

        step = step || 1;
        flag = step < 0 ? -1 : 1;
        stop *= flag;

        while(start * flag < stop) {
            arr.push(start);
            start += step;
        }

        return arr;
    },

    /**
     * make labels from scale
     * @param {object} scale axis scale
     * @param {number} step step between max and min
     * @returns {array}
     */
    makeLabelsFromScale: function(scale, step) {
        var labels = this.range(scale.min, scale.max + 1, step);
        return labels;
    },

    /**
     * setting value type axis
     * @param {number} min
     * @param {number} max
     */
    setValueAxis: function(min, max) {
        var scale = this.getCalculateScale(min, max),
            tickCount = this.getTickCount(),
            step = this.getScaleStep(scale, tickCount),
            labels = this.range(scale.min, scale.max + 1, step);

        this.axisType = AXIS_TYPE_VALUE;
        this.setLabels(labels);
        this.setMin(scale.min);
        this.setMax(scale.max);

    },

    /**
     * check label type axis
     * @returns {boolean}
     */
    isLabelAxis: function() {
        return this.axisType === AXIS_TYPE_LABEL;
    },

    /**
     * check value type axis
     * @returns {boolean}
     */
    isValueAxis: function() {
        return this.axisType === AXIS_TYPE_VALUE;
    },

    /**
     * setting axis
     * @param data
     */
    setData: function(data) {
        if (data.labels) {
            this.setLabelAxis(data.labels);
        } else if (data.min && data.max) {
            this.setValueAxis(data.min, data.max);
        }
    }
});

module.exports = AxisModel;
