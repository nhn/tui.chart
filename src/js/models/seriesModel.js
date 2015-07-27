/**
 * @fileoverview SeriesModel is model for management of series data.
 *               Series data used to draw the series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

/**
 * @classdesc SeriesModel is model for management of series data.
 * @class
 * @augments Model
 */
var SeriesModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {object} data series data
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
         * Series last item styles
         * @type {Array}
         */
        this.lastItemStyles = [];

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
        if (!data || ne.util.isEmpty(data.values) || !data.scale) {
            throw new Error('Invalid series data.');
        }

        this.markers = data.values;
        this.percentValues = this._makePercentValues(data.values, data.scale);

        if (ne.util.isNotEmpty(data.lastItemStyles)) {
            this.lastItemStyles = data.lastItemStyles;
        }
    },

    /**
     * Convert two dimensional(2d) values.
     * @param {array.<array>} values2d target 2d array
     * @param {function} condition convert condition function
     * @returns {array.<array>} 2d array
     * @private
     */
    _convertValues: function(values2d, condition) {
        var result = ne.util.map(values2d, function(values) {
            return ne.util.map(values, condition);
        });
        return result;
    },

    /**
     * Make to percent value.
     * @param {array.<array>} values maker data
     * @param {{min:number, max:number}} scale min, max scale
     * @returns {array.<array>} percent values
     * @private
     */
    _makePercentValues: function(values, scale) {
        var min = scale.min,
            max = scale.max,
            percentValues = this._convertValues(values, function(value) {
                return (value - min) / max;
            });
        return percentValues;
    },

    /**
     * Make to pixel values.
     * @param {number} size width or height
     * @returns {array.<array>} pixel values
     */
    getPixelValues: function(size) {
        var result = this._convertValues(this.percentValues, function(value) {
            return value * size;
        });
        return result;
    },

    /**
     * Pick last colors.
     * @returns {array} colors
     */
    pickLastColors: function() {
        var lastItemsStyles = this.lastItemStyles,
            colors = [];
        if (lastItemsStyles.length && lastItemsStyles[0].color) {
            colors = ne.util.pluck(lastItemsStyles, 'color');
        }

        return colors;
    }

});

module.exports = SeriesModel;