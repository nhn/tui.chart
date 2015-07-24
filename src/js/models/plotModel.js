/**
 * @fileoverview PlotModel is model for management of plot data.
 *               Plot data used to draw the plot area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

/**
 * @classdesc PlotModel is model for management of plot data.
 * @class
 * @augments Model
 */
var PlotModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {data} data
     */
    init: function(data, options) {
        options = options || {};
        /**
         * Axis options
         * @type {object}
         */
        this.options = options || {};

        /**
         * Vertical tick count
         * @type {number}
         */
        this.vTickCount = 0;

        /**
         * Horizontal tick count
         * @type {number}
         */
        this.hTickCount = 0;

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Set plot data.
     * @param {vTickCount: number, hTickCount: number} data plot data
     * @private
     */
    _setData: function(data) {
        this.vTickCount = data.vTickCount || 0;
        this.hTickCount = data.hTickCount || 0;
    },

    /**
     * makes vertical pixel positions
     * @param {} width
     * @returns {*|Array}
     */
    makeVPixelPositions: function(height) {
        var positions = this.makePixelPositions(height, this.vTickCount);
        positions.shift();
        return positions;
    },

    makeHPixelPositions: function(width) {
        var positions = this.makePixelPositions(width, this.hTickCount);;
        positions.shift();
        return positions;
    }
});

module.exports = PlotModel;