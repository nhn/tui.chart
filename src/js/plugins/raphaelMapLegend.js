/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';


var raphael = window.Raphael;

var PADDING = 10;

/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 */
var RaphaelMapLegend = tui.util.defineClass(/** @lends RaphaelMapLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension legend dimension
     * @param {MapChartColorModel} colorModel map chart color model
     * @returns {object} paper raphael paper
     */
    render: function(container, dimension, colorModel) {
        var paper = raphael(container, dimension.width, dimension.height),
            rect = paper.rect(0, 0, dimension.width - PADDING, dimension.height);

        rect.attr({
            fill: '270-' + colorModel.start + '-' + colorModel.end,
            stroke: 'none'
        });
        return paper;
    }
});

module.exports = RaphaelMapLegend;
