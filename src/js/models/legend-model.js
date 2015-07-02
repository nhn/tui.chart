/**
 * @fileoverview legend model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendModel;

LegendModel = ne.util.defineClass({
    pluck: function(arr, property) {
        var result = ne.util.map(arr, function(item) {
            return item[property];
        });
        return result;
    },
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

    init: function(options) {
        if (options && options.data) {
            this.setData(options.data);
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
     * @returns {Array}
     */
    getData: function() {
        return this.data;
    }
});

module.exports = LegendModel;