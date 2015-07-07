/**
 * @fileoverview legend model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendModel;

LegendModel = ne.util.defineClass({
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

    data: [],

    /**
     * set legend data
     * @param {object} data
     */
    init: function(data) {
        if (data) {
            this.setData(data);
        }
    },

    /**
     * set legend data
     * @param {object} data
     */
    setData: function(data) {
        this.data = this.zip(data.labels, data.colors);
    },

    /**
     * get legend data
     * @returns {array}
     */
    getData: function() {
        return this.data;
    }
});

module.exports = LegendModel;