/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');

var PADDING = chartConst.LEGEND_AREA_PADDING;
var DEGREE_HORIZONTAL_BAR = 360;
var DEGREE_VERTICAL_BAR = 270;
var GAP_BETWEEN_LABEL_AND_LEGEND_BAR = 35;
var TICK_BAR_LENGTH = 15;
var WEDGE_BASE_HALF = 3; // half of wedge triagle base
/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 * @private
 */
var RaphaelMapLegend = snippet.defineClass(/** @lends RaphaelMapLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {object} paper raphael paper
     * @param {object} layout legend layout
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @param {Array.<object>} legendSet legend set
     */
    render: function(paper, layout, colorSpectrum, isHorizontal, legendSet) {
        var gradientBar;

        layout.position.left += (PADDING * 2);
        layout.position.top += PADDING;

        gradientBar = this._renderGradientBar(paper, layout, colorSpectrum, isHorizontal);

        legendSet.push(gradientBar);

        this.wedge = this._renderWedge(paper, layout.position);
        legendSet.push(this.wedge);

        this.gradientBar = gradientBar;
    },

    /**
     * Render gradient bar inner tick & tick label
     * @param {object} paper Raphael paper
     * @param {object} baseData base data for render ticks
     * @param {Array.<string>} labels labels
     * @param {boolean} isHorizontal boolean value for is horizontal or not
     * @param {Array.<object>} legendSet legend set
     */
    renderTicksAndLabels: function(paper, baseData, labels, isHorizontal, legendSet) {
        snippet.forEach(labels, function(label, labelIndex) {
            var offsetValue = baseData.step * labelIndex;
            var pos = snippet.extend({}, baseData.position);
            var path = 'M';

            if (isHorizontal) {
                pos.left += offsetValue;
                path += pos.left + ',' + (pos.top - GAP_BETWEEN_LABEL_AND_LEGEND_BAR)
                    + 'V' + (pos.top - GAP_BETWEEN_LABEL_AND_LEGEND_BAR + TICK_BAR_LENGTH);
            } else {
                pos.top += offsetValue;
                path += (pos.left - GAP_BETWEEN_LABEL_AND_LEGEND_BAR) + ',' + pos.top
                    + 'H' + (pos.left - GAP_BETWEEN_LABEL_AND_LEGEND_BAR + TICK_BAR_LENGTH);
            }

            legendSet.push(raphaelRenderUtil.renderLine(paper, path, '#ccc', 1));
            legendSet.push(raphaelRenderUtil.renderText(paper, pos, label));
        });
    },

    /**
     * Render gradient bar.
     * @param {object} paper raphael object
     * @param {object} layout legend layout
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @returns {object}
     * @private
     */
    _renderGradientBar: function(paper, layout, colorSpectrum, isHorizontal) {
        var rectHeight = layout.dimension.height;
        var left = layout.position.left;
        var degree, bound, fill;

        if (isHorizontal) {
            rectHeight -= PADDING;
            degree = DEGREE_HORIZONTAL_BAR;
            this._makeWedghPath = this._makeHorizontalWedgePath;
        } else {
            degree = DEGREE_VERTICAL_BAR;
            this._makeWedghPath = this._makeVerticalWedgePath;
        }

        fill = degree + '-' + colorSpectrum.start + '-' + colorSpectrum.end;

        bound = {
            left: left,
            top: layout.position.top,
            width: layout.dimension.width - PADDING,
            height: rectHeight
        };

        return raphaelRenderUtil.renderRect(paper, bound, {
            fill: fill,
            stroke: 'none'
        });
    },

    /**
     * Render wedge.
     * @param {object} paper raphael object
     * @param {{top: number, left: number}} position base position of legend
     * @returns {object} raphael object
     * @private
     */
    _renderWedge: function(paper, position) {
        return paper.path(this.verticalBasePath).attr({
            'fill': 'gray',
            stroke: 'none',
            opacity: 0,
            transform: 't' + position.left + ',' + position.top
        });
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
        path[5] = top - WEDGE_BASE_HALF;
        path[8] = top + WEDGE_BASE_HALF;

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

        path[1] = left;
        path[4] = left + WEDGE_BASE_HALF;
        path[7] = left - WEDGE_BASE_HALF;

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
    },

    /**
     * Remove location URL from fill attribute
     * @private
     */
    removeLocationURLFromFillAttribute: function() {
        var gradientBar = this.gradientBar;
        var fillURL = gradientBar.node.getAttribute('fill');
        this.locationURL = /url\('?([^#]+)#[^#]+'?\)/.exec(fillURL)[1];

        gradientBar.node.setAttribute('fill', fillURL.replace(this.locationURL, ''));
    },

    /**
     * Restore location URL to fill attribute
     * @private
     */
    restoreLocationURLToFillAttribute: function() {
        var gradientBar = this.gradientBar;
        var fillURL = gradientBar.node.getAttribute('fill');

        gradientBar.node.setAttribute('fill', fillURL.replace('#', this.locationURL + '#'));
    }
});

module.exports = RaphaelMapLegend;
