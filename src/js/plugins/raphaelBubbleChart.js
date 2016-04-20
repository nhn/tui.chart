/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = window.Raphael;

/**
 * @classdesc RaphaelBubbleChart is graph renderer for bubble chart.
 * @class RaphaelBubbleChart
 */
var RaphaelBubbleChart = tui.util.defineClass(/** @lends RaphaelBubbleChart.prototype */ {
    /**
     * Render function of bubble chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            paper;

        paper = raphael(container, dimension.width, dimension.height);

        return paper;
    },

    /**
     * Animate.
     */
    animate: function() {},

    /**
     * Resize graph of bubble type chart.
     */
    resize: function() {},

    /**
     * Select legend.
     */
    selectLegend: function() {}
});

module.exports = RaphaelBubbleChart;
