/**
 * @fileoverview This is base model.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model;

Model = ne.util.defineClass({
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
     * * ne.util에 pluck이 추가되기 전까지 임시로 사용
     * @param {array} arr
     * @param {string} property
     * @returns {Array}
     */
    pluck: function(arr, property) {
        var result = ne.util.map(arr, function(item) {
            return item[property];
        });
        return result;
    },

    /**
     * * ne.util에 zip이 추가되기 전까지 임시로 사용
     * @params {...array}
     * @returns {array}
     */
    zip: function() {
        var arr2 = Array.prototype.slice.call(arguments),
            result = [];

        ne.util.forEach(arr2, function(arr) {
            ne.util.forEach(arr, function(value, index) {
                if (!result[index]) {
                    result[index] = [];
                }
                result[index].push(value);
            });
        });

        return result;
    },

    /**
     * Get scale step.
     * @param {object} scale axis scale
     * @param {number} count value count
     * @returns {number}
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * Makes tick positions.
     * @param {number} size area width or height
     * @returns {Array}
     */
    makePixelPositions: function(size, count) {
        var positions = [],
            pxScale, pxStep;

        if (count > 0) {
            pxScale = {min: 0, max: size - 1};
            pxStep = this.getScaleStep(pxScale, count);
            positions = ne.util.map(this.range(0, size, pxStep), function(position) {
                return Math.round(position);
            });
            positions[positions.length-1] = size - 1;
        }

        return positions;
    }
});

module.exports = Model;