/**
 * @fileoverview This model is plot model for management of plot data.
 *               Plot data used to draw the plot area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var PlotModel;

PlotModel = ne.util.defineClass({
    vTickCount: 0,
    hTickCount: 0,

    /**
     * Constructor
     * @param {data} data
     */
    init: function(data) {
        if (data) {
            this.setData(data);
        }
    },

    /**
     * Set plot data.
     * @param {vTickCount: number, hTickCount: number} data plot data
     */
    setData: function(data) {
        this.vTickCount = data.vTickCount || 0;
        this.hTickCount = data.hTickCount || 0;
    },

    /**
     * Get vertical tick count.
     * @returns {number}
     */
    getVTickCount: function() {
        return this.vTickCount;
    },

    /**
     * Get horizontal tick count.
     * @returns {number}
     */
    getHTickCount: function() {
        return this.hTickCount;
    }
});

module.exports = PlotModel;