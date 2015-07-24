/**
 * @fileoverview PopupModel is model for management of popup data.
 *               Popup data used to draw the popup area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var apc = Array.prototype.concat,
    PopupModel;

/**
 * @classdesc PopupModel is model for management of popup data.
 * @class
 * @augments Model
 */
PopupModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {{labels: array, colors: array} data legend data
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Popup options
         * @type {{template: string}}
         */
        this.options = options;

        /**
         * Popup data
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
        var labels = data.labels,
            groupValues = data.values,
            legendLabels = data.legendLabels,
            popupData = ne.util.map(groupValues, function(values, groupIndex) {
                var items = ne.util.map(values, function(value, index) {
                    var item = {
                        label: labels[groupIndex],
                        value: value,
                        legendLabel: legendLabels[index],
                        id: groupIndex + '-' + index
                    };
                    return item;
                });

                return items;
            });
        this.data = apc.apply([], popupData);
    }
});

module.exports = PopupModel;