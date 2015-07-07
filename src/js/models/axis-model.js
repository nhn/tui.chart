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
    title: '',
    labels: [],
    tickCount: 5,
    scale: null,
    axisType: null,

    /**
     * constructor
     * @param {object} data
     * @param {object} options
     */
    init: function(data, options) {
        this.options = options || {};

        if (data) {
            this.setData(data);
        }
    },

    /**
     * set axis data
     * @param {object} data
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
        var options = this.options;

        this.title = options.title || this.title;
        this.axisType = AXIS_TYPE_LABEL;
        this.labels = labels;
        this.tickCount = labels.length;
    },

    /**
     * set value type axis data
     * @param {number} min
     * @param {number} max
     */
    setValueAxisData: function(arr2d) {
        var options = this.options,
            arr = this.flatten2dArray(arr2d),
            minMax = this.pickMinMax(arr),
            scale = this.getCalculateScale(minMax.min, minMax.max, options.minValue),
            step = this.getScaleStep(scale, this.tickCount),
            formats = options.format ? [options.format] : arr,
            lenUnderPoint = this.pickMaxLenUnderPoint(formats),
            labels = this.range(scale.min, scale.max + 1, step);

        labels = this.formatLabels(labels, lenUnderPoint);
        this.title = options.title || this.title;
        this.axisType = AXIS_TYPE_VALUE;
        this.labels = labels;
        this.scale = scale;
    },

    /**
     * flatten 2d array
     * @param {[array, ...]} arr2d
     * @returns {array}
     */
    flatten2dArray: function(arr2d) {
        var result = ne.util.reduce(arr2d, function(concatArr, arr) {
            concatArr = concatArr.concat(aps.call(arr));
            return concatArr;
        }, []);
        return result;
    },

    /**
     * pick min, max from user data
     * @param {[array, ...]} arr2d user data
     * @returns {{min: number, max: number}}
     */
    pickMinMax: function(arr) {
        arr.sort(function(a, b) {
            return a - b;
        });

        return {min: arr[0], max: arr[arr.length - 1]};
    },

    /**
     * calculate scale of axis value
     * http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @param {number} min min value
     * @param {number} max max value
     * @returns {{min: number, max: number}}
     */
    getCalculateScale: function(min, max, optionMin) {
        var scale = {},
            iodValue = (max - min) / 20; // increase or decrease the value;
        scale.max = max + iodValue;

        if (!ne.util.isUndefined(optionMin)) {
            scale.min = optionMin;
        } else if (max / 6 > min) {
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
     * @param {number} start
     * @param {number} stop
     * @param {number} step
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
     * pick max length under point
     * @param {[array, ...]}arr2d
     * @returns {number}
     */
    pickMaxLenUnderPoint: function(arr) {
        var max = 0;

        ne.util.forEachArray(arr, function(value) {
            var valueArr =  (value + '').split('.');
            if (valueArr.length === 2 && valueArr[1].length > max) {
                max = valueArr[1].length;
            }
        });

        return max;
    },

    /**
     * format labels
     * @param {array} arr labels
     * @param {number} len length under point
     * @returns {Array|*}
     */
    formatLabels: function(arr, len) {
        var format, result;
        if (len === 0) {
            format = function(value) {
                return parseInt(value, 10);
            }
        } else {
            format = function(value) {
                return parseFloat(parseFloat(value).toFixed(len));
            };
        }
        result = ne.util.map(arr, format);
        return result;
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