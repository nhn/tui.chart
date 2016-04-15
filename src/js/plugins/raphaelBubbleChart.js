/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;


/**
 * @classdesc RaphaelBubbleChart is graph renderer for bar, column chart.
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
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
    },

    /**
     * Resize graph of bar type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{
     *                  left:number, top:number, width: number, height: number
     *              }>>} params.groupBounds group bounds
     */
    resize: function(params) {
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
    }
});

module.exports = RaphaelBubbleChart;
