/**
 * @fileoverview series model
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
     * constructor
     * @param {object} options
     */
    init: function(data) {
        if (data) {
            this.setData(data);
        }
    },

    /**
     * set series data
     * @param data
     */
    setData: function(data) {
        if (!data || ne.util.isEmpty(data.values) || !data.scale || !data.colors) {
            throw new Error('... 없습니다.');
        }

        this.markers = data.values;
        this.percentValues = this.makePercentValues(data.values, data.scale);
        this.colors = data.colors;

        if (ne.util.isNotEmpty(data.lastColors)) {
            this.lastColors = data.lastColors;
        }
    },

    /**
     * convert two dimensional(2d) array
     * @param {Array} arr2d target 2d array
     * @param {Function} callback convert function
     * @returns {Array}
     */
    convertValues: function(arr2d, callback) {
        var result = ne.util.map(arr2d, function(arr) {
            return ne.util.map(arr, callback);
        });
        return result;
    },

    /**
     * make to percent value
     * @param {Array} arr2d maker data
     * @param {Object} scale min, max scale
     * @returns {Array}
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
     * make to pixel value
     * @param arr2d percent data
     * @param size width or height
     * @returns {Array}
     */
    makePixelValues: function(arr2d, size) {
        var result = this.convertValues(arr2d, function(value) {
            return value * size;
        });
        return result;
    }

});

module.exports = SeriesModel;