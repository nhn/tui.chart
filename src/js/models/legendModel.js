/**
 * @fileoverview LegendModel is model for management of legend data.
 *               Legend data used to draw the legend area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var LegendModel = ne.util.defineClass(Model, /** @lends LegendModel.prototype */ {
    /**
     * LegendModel is model for management of legend data.
     * Legend data used to draw the legend area.
     * @constructs LegendModel
     * @extends Model
     * @param {{labels: array, colors: array}} data legend data
     */
    init: function(data) {
        /**
         * Legend labels
         * @type {string[]}
         */
        this.labels = [];

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Get legend data.
     * @param {{labels: array, colors: array}} data legend data
     * @private
     */
    _setData: function(data) {
        this.labels = data.labels;
    }
});

module.exports = LegendModel;