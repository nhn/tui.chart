/**
 * @fileoverview plot model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var PlotModel;

PlotModel = ne.util.defineClass({
    vTickCount: 0,
    hTickCount: 0,

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
     * set plot data
     * @param {object} data
     */
    setData: function(data) {
        this.vTickCount = data.vTickCount || 0;
        this.hTickCount = data.hTickCount || 0;
    },

    /**
     * get vertical tick count
     * @returns {number}
     */
    getVTickCount: function() {
        return this.vTickCount;
    },

    /**
     * get horizontal tick count
     * @returns {number}
     */
    getHTickCount: function() {
        return this.hTickCount;
    }
});

module.exports = PlotModel;