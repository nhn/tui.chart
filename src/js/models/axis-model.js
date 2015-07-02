/**
 * @fileoverview axis model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var AxisModel,
    AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label';

AxisModel = ne.util.defineClass({
    labels: [],
    tickCount: 5,
    min: 0,
    max: 0,
    axisType: null,

    /**
     * constructor
     * @param {object} options
     */
    init: function(options) {
        if (options && options.data) {
            this.setData(options.data);
        }
    },

    /**
     * set axis data
     * @param data
     */
    setData: function(data) {
        if (data.labels) {
            this.setLabelAxisData(data.labels);
        } else if (data.min && data.max) {
            this.setValueAxisData(data.min, data.max);
        }
    },

    /**
     * set label type axis data
     * @param {array} labels
     */
    setLabelAxisData: function(labels) {
        this.axisType = AXIS_TYPE_LABEL;
        this.labels = labels;
        this.tickCount = labels.length;
    },

    /**
     * set value type axis data
     * @param {number} min
     * @param {number} max
     */
    setValueAxisData: function(min, max) {
        var scale = this.getCalculateScale(min, max),
            tickCount = this.getTickCount(),
            step = this.getScaleStep(scale, tickCount),
            labels = this.range(scale.min, scale.max + 1, step);

        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.min = scale.min;
        this.max = scale.max;
    },

    /**
     * get labels
     * @returns {array}
     */
    getLabels: function() {
        return this.labels;
    },

    /**
     * get tick count
     * @returns {number}
     */
    getTickCount: function() {
        return this.tickCount;
    },

    /**
     * get tick min value
     * @returns {number}
     */
    getMin: function() {
        return this.min;
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
    }
});

module.exports = AxisModel;