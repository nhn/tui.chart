/**
 * @fileoverview LegendModel is model for management of legend data.
 *               Legend data used to draw the legend area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

/**
 * @classdesc LegendModel is model for management of legend data.
 * @class
 * @augments Model
 */
var LegendModel = ne.util.defineClass(Model, {
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
        this.data = ne.util.zip(data.labels, data.colors);
    }
});

module.exports = LegendModel;