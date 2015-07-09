/**
 * @fileoverview This model is series model for management of series data.
 *               Series data used to draw the series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var SeriesModel;

SeriesModel = ne.util.defineClass({
    /**
     * Constructor
     * @param {data} data
     */
    init: function(data) {
        /**
         * Series makers
         * @type {array}
         */
        this.markers = [];

        /**
         * Series percent values
         * @type {Array}
         */
        this.percentValues = [];

        /**
         * Axis scale
         * @type {{min: number, max: number}}
         */
        this.tickScale = {};

        /**
         * Series colors
         * @type {Array}
         */
        this.colors = [];

        /**
         * Series lastColors
         * @type {Array}
         */
        this.lastColors = [];

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Set series data.
     * @param {{values: array, scale: object, colors: array}} data series data
     * @private
     */
    _setData: function(data) {
        if (!data || ne.util.isEmpty(data.values) || !data.scale || !data.colors) {
            throw new Error('...');
        }

        this.markers = data.values;
        this.percentValues = this._makePercentValues(data.values, data.scale);
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
     * @private
     */
    _convertValues: function(arr2d, callback) {
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
     * @private
     */
    _makePercentValues: function(arr2d, scale) {
        var min = scale.min,
            max = scale.max,
            result = this._convertValues(arr2d, function(value) {
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
    getPixelValues: function(size) {
        var result = this._convertValues(this.percentValues, function(value) {
            return value * size;
        });
        return result;
    }

});

module.exports = SeriesModel;