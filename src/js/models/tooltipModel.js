/**
 * @fileoverview TooltipModel is model for management of tooltip data.
 *               Tooltip data used to draw the tooltip area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var apc = Array.prototype.concat,
    TooltipModel;

/**
 * @classdesc TooltipModel is model for management of tooltip data.
 * @class
 * @augments Model
 */
TooltipModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {{labels: array, colors: array}} data legend data
     * @param {object} options options
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Tooltip options
         * @type {{template: string}}
         */
        this.options = options;

        /**
         * Tooltip data
         * @type {[[array, array], ...]}
         */
        this.data = [];

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
        var labels = data.labels,
            groupValues = data.values,
            legendLabels = data.legendLabels,
            tooltipData = ne.util.map(groupValues, function(values, groupIndex) {
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
        this.data = apc.apply([], tooltipData);
    }
});

module.exports = TooltipModel;