/**
 * @fileoverview axis model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var aps = Array.prototype.slice,
    AXIS_TYPE_VALUE = 'value',
    AXIS_TYPE_LABEL = 'label',
    AxisModel;

AxisModel = ne.util.defineClass({
    labels: [],
    tickCount: 5,
    scale: null,
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
        } else if (data.values) {
            this.setValueAxisData(data.values);
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
    setValueAxisData: function(values) {
        var minMax = this.pickMinMax(values),
            scale = this.getCalculateScale(minMax.min, minMax.max),
            tickCount = this.getTickCount(),
            step = this.getScaleStep(scale, tickCount),
            labels = this.range(scale.min, scale.max + 1, step);

        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.scale = scale;
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
     * get tick scale
     * @returns {object}
     */
    getScale: function() {
        return this.scale;
    },

    pickMinMax: function(orgArr2d) {
        var resultArr = ne.util.reduce(orgArr2d, function(concatArr, arr) {
            concatArr = concatArr.concat(aps.call(arr));
            return concatArr;
        }, []);

        resultArr.sort(function(a, b) {
            return a - b;
        });

        return {min: resultArr[0], max: resultArr[resultArr.length-1]};
    },

    /**
     * calculate scale of value axis
     * from : http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min value
     * @param {number} max max value
     * @returns {object}
     */
    getCalculateScale: function(min, max) {
        var scale = {},
            iodValue = (max - min) / 20; // increase or decrease the value;
        scale.max = max + iodValue;

        if (max / 6 > min) {
            scale.min  = 0;
        } else {
            scale.min = min - iodValue;
        }

        return scale;
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