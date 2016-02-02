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

        this.wedge = this._renderWedge(paper);

        return paper;
    },

    /**
     * Base path
     * @type {Array}
     */
    basePath: ['M', 16, 6, 'L', 24, 3, 'L', 24, 9],

    /**
     * Render wedge.
     * @param {object} paper raphael object
     * @returns {object} raphael object
     * @private
     */
    _renderWedge: function(paper) {
        var wedge = paper.path(this.basePath).attr({
            'fill': 'gray',
            stroke: 'none',
            opacity: 0
        });

        return wedge;
    },

    /**
     * Show wedge.
     * @param {number} top top
     */
    showWedge: function(top) {
        var path = this.basePath;

        path[2] = top;
        path[5] = top - 3;
        path[8] = top + 3;

        this.wedge.attr({
            path: path,
            opacity: 1
        });
    },

    /**
     * Hide wedge
     */
    hideWedge: function() {
        this.wedge.attr({
            opacity: 0
        });
    }
});

module.exports = RaphaelMapLegend;
