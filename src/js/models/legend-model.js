/**
 * @fileoverview This model is legend model for management of legend data.
 *               Legend data used to draw the legend area.
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

    /**
     * Constructor
     * @param {{labels: array, colors: array} data legend data
     */
    init: function(data) {
        /**
         * Legend data
         * @type {[[array, array], ...]}
         */
        this.data = [];

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Get legend data.
     * @param {{labels: array, colors: array} data legend data
     * @private
     */
    _setData: function(data) {
        this.data = this.zip(data.labels, data.colors);
    },

    /**
     * Get legend data.
     * @returns {array}
     */
    getData: function() {
        return this.data;
    }
});

module.exports = LegendModel;