/**
 * @fileoverview RaphaelCircleLegend is graph renderer for circleLegend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

/**
 * @classdesc RaphaelCircleLegend is graph renderer for circleLegend.
 * @class RaphaelCircleLegend
 */
var RaphaelCircleLegend = tui.util.defineClass(/** @lends RaphaelCircleLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension - dimension of circle legend area
     * @param {number} maxRadius - pixel type maximum radius
     * @param {Array.<number>} radiusRatios - radius ratios
     * @returns {object} paper raphael paper
     */
    render: function(container, dimension, maxRadius, radiusRatios) {
        var paper = raphael(container, dimension.width, dimension.height);

        this.paper = paper;

        this._renderCircles(dimension, maxRadius, radiusRatios);

        return paper;
    },

    /**
     * Render circles.
     * @param {{width: number, height: number}} dimension - dimension of circle legend area
     * @param {number} maxRadius - pixel type maximum radius
     * @param {Array.<number>} radiusRatios - radius ratios
     * @private
     */
    _renderCircles: function(dimension, maxRadius, radiusRatios) {
        var paper = this.paper;
        var left = dimension.width / 2;

        tui.util.forEachArray(radiusRatios, function(ratio) {
            var radius = maxRadius * ratio;
            var top = (dimension.height - radius) - 1;

            raphaelRenderUtil.renderCircle(paper, {
                left: left,
                top: top
            }, radius, {
                fill: 'none',
                opacity: 1,
                stroke: '#888',
                'stroke-width': 1
            });
        });
    }
});

module.exports = RaphaelCircleLegend;
