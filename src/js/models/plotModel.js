/**
 * @fileoverview This model is plot model for management of plot data.
 *               Plot data used to draw the plot area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('./model.js');

var PlotModel = ne.util.defineClass(Model, {
    /**
     * Constructor
     * @param {data} data
     */
    init: function(data) {
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

    range: function(start, stop, step) {
        var arr = [],
            flag;

        if (ne.util.isUndefined(stop)) {
            stop = start || 0;
            start = 0;
        }

        step = step || 1;
        flag = step < 0 ? -1 : 1;
        stop *= flag;

        while(start * flag < stop) {
            arr.push(start);
            start += step;
        }

        return arr;
    },

    makeVPixelPositions: function(width) {
        var positions = this.makePixelPositions(width, this.vTickCount);
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