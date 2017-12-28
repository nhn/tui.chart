/**
 * @fileoverview RaphaelCircleLegend is graph renderer for circleLegend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');

/**
 * @classdesc RaphaelCircleLegend is graph renderer for circleLegend.
 * @class RaphaelCircleLegend
 * @private
 */
var RaphaelCircleLegend = snippet.defineClass(/** @lends RaphaelCircleLegend.prototype */ {

    /**
     * Render circle and label.
     * @param {object} paper paper object
     * @param {{width: number, height: number}} layout - layout of circle legend area
     * @param {number} maxRadius - pixel type maximum radius
     * @param {Array.<number>} radiusRatios - radius ratios
     * @param {Array.<string>} labels - circle legend labels
     * @returns {Array.<object>}
     * @private
     */
    render: function(paper, layout, maxRadius, radiusRatios, labels) {
        var left = layout.position.left + (layout.dimension.width / 2);
        var circleLegendSet = paper.set();

        snippet.forEachArray(radiusRatios, function(ratio, index) {
            var radius = maxRadius * ratio;
            var top = layout.position.top + layout.dimension.height - radius;
            var circle = raphaelRenderUtil.renderCircle(paper, {
                left: left,
                top: top
            }, radius, {
                fill: 'none',
                opacity: 1,
                stroke: '#888',
                'stroke-width': 1
            });

            circleLegendSet.push(circle);

            circleLegendSet.push(raphaelRenderUtil.renderText(paper, {
                left: left,
                top: top - radius - 5
            }, labels[index]));
        });

        return circleLegendSet;
    }
});

module.exports = RaphaelCircleLegend;
