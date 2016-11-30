/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var PADDING = 10;

/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 * @private
 */
var RaphaelMapLegend = tui.util.defineClass(/** @lends RaphaelMapLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension legend dimension
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @returns {object} paper raphael paper
     */
    render: function(container, dimension, colorSpectrum, isHorizontal) {
        var paper = raphael(container, dimension.width, dimension.height);

        this._renderGradientBar(paper, dimension, colorSpectrum, isHorizontal);
        this.wedge = this._renderWedge(paper);

        return paper;
    },

    /**
     * Render gradient bar.
     * @param {object} paper raphael object
     * @param {{width: number, height: number}} dimension legend dimension
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @private
     */
    _renderGradientBar: function(paper, dimension, colorSpectrum, isHorizontal) {
        var rectHeight = dimension.height;
        var left = 0;
        var degree, bound;

        if (isHorizontal) {
            rectHeight -= PADDING;
            left = PADDING / 2;
            degree = 360;
            this._makeWedghPath = this._makeHorizontalWedgePath;
        } else {
            degree = 270;
            this._makeWedghPath = this._makeVerticalWedgePath;
        }

        bound = {
            left: left,
            top: 0,
            width: dimension.width - PADDING,
            height: rectHeight
        };

        raphaelRenderUtil.renderRect(paper, bound, {
            fill: degree + '-' + colorSpectrum.start + '-' + colorSpectrum.end,
            stroke: 'none'
        });
    },

    /**
     * Render wedge.
     * @param {object} paper raphael object
     * @returns {object} raphael object
     * @private
     */
    _renderWedge: function(paper) {
        var wedge = paper.path(this.verticalBasePath).attr({
            'fill': 'gray',
            stroke: 'none',
            opacity: 0
        });

        return wedge;
    },

    /**
     * Vertical base path
     * @type {Array}
     */
    verticalBasePath: ['M', 16, 6, 'L', 24, 3, 'L', 24, 9],

    /**
     * Make vertical wedge path.
     * @param {number} top top
     * @returns {Array} path
     * @private
     */
    _makeVerticalWedgePath: function(top) {
        var path = this.verticalBasePath;

        path[2] = top;
        path[5] = top - 3;
        path[8] = top + 3;

        return path;
    },

    /**
     * Horizontal base path
     * @type {Array}
     */
    horizontalBasePath: ['M', 5, 16, 'L', 8, 24, 'L', 2, 24],

    /**
     * Make horizontal wedge path.
     * @param {number} left left
     * @returns {Array} path
     * @private
     */
    _makeHorizontalWedgePath: function(left) {
        var path = this.horizontalBasePath;

        left += PADDING / 2;

        path[1] = left;
        path[4] = left + 3;
        path[7] = left - 3;

        return path;
    },

    /**
     * Show wedge.
     * @param {number} positionValue top
     */
    showWedge: function(positionValue) {
        var path = this._makeWedghPath(positionValue);

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
