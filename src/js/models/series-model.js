/**
 * @fileoverview This model is series model for management of series data.
 *               Series data used to draw the series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var SeriesModel;

SeriesModel = ne.util.defineClass({
    markers: [],
    percentValues: [],
    tickScale: {},
    colors: [],
    lastColors: [],

    /**
     * Constructor
     * @param {data} data
     */
    init: function(data) {
        if (data) {
            this.setData(data);
        }
    },

    /**
     * Set series data.
     * @param {{values: array, scale: object, colors: array}} data series data
     */
    setData: function(data) {
        if (!data || ne.util.isEmpty(data.values) || !data.scale || !data.colors) {
            throw new Error('...');
        }

        this.markers = data.values;
        this.percentValues = this.makePercentValues(data.values, data.scale);
        this.colors = data.colors;

        if (ne.util.isNotEmpty(data.lastColors)) {
            this.lastColors = data.lastColors;
        }
    },

    /**
     * Convert two dimensional(2d) array.
     * @param {[array, ...]} arr2d target 2d array
     * @param {function} callback convert callback function
     * @returns {array}
     */
    convertValues: function(arr2d, callback) {
        var result = ne.util.map(arr2d, function(arr) {
            return ne.util.map(arr, callback);
        });
        return result;
    },

    /**
     * Make to percent value.
     * @param {[array, ...]} arr2d maker data
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array}
     */
    makePercentValues: function(arr2d, scale) {
        var min = scale.min,
            max = scale.max,
            result = this.convertValues(arr2d, function(value) {
                return (value - min) / max;
            });
        return result;
    },

    /**
     * Make to pixel value.
     * @param {[array, ...]}arr2d percent data
     * @param {number} size width or height
     * @returns {array}
     */
    makePixelValues: function(arr2d, size) {
        var result = this.convertValues(arr2d, function(value) {
            return value * size;
        });
        return result;
    }

});

module.exports = SeriesModel;