/**
 * @fileoverview Util for raphael rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 */
var raphaelRenderUtil = {
    /**
     * Make line path.
     * @memberOf module:raphaelRenderUtil
     * @param {{top: number, left: number}} fromPos from position
     * @param {{top: number, left: number}} toPos to position
     * @param {number} width width
     * @returns {string} path
     */
    makeLinePath: function(fromPos, toPos, width) {
        var fromPoint = [fromPos.left, fromPos.top],
            toPoint = [toPos.left, toPos.top];

        width = width || 1;

        tui.util.forEachArray(fromPoint, function(from, index) {
            if (from === toPoint[index]) {
                fromPoint[index] = toPoint[index] = Math.round(from) - (width % 2 / 2);
            }
        });
        return ['M'].concat(fromPoint).concat('L').concat(toPoint);
    },

    /**
     * Render line.
     * @memberOf module:raphaelRenderUtil
     * @param {object} paper raphael paper
     * @param {string} path line path
     * @param {string} color line color
     * @param {number} strokeWidth stroke width
     * @returns {object} raphael line
     */
    renderLine: function(paper, path, color, strokeWidth) {
        var line = paper.path([path]),
            strokeStyle = {
                stroke: color,
                'stroke-width': strokeWidth || 2
            };

        if (color === 'transparent') {
            strokeStyle.stroke = '#fff';
            strokeStyle['stroke-opacity'] = 0;
        }
        line.attr(strokeStyle);

        return line;
    },

    /**
     * Render area graph.
     * @param {object} paper raphael paper
     * @param {string} path path
     * @param {object} fillStyle fill style
     *      @param {string} fillStyle.fill fill color
     *      @param {?number} fillStyle.opacity fill opacity
     *      @param {string} fillStyle.stroke stroke color
     *      @param {?number} fillStyle.stroke-opacity stroke opacity
     * @returns {Array.<object>} raphael object
     */
    renderArea: function(paper, path, fillStyle) {
        var area = paper.path(path);

        fillStyle = tui.util.extend({
            'stroke-opacity': 0
        }, fillStyle);
        area.attr(fillStyle);

        return area;
    },

    /**
     * Render circle.
     * @param {object} paper - raphael object
     * @param {{left: number, top: number}} position - position
     * @param {number} radius - radius
     * @param {object} attributes - attributes
     * @returns {object}
     * @private
     */
    renderCircle: function(paper, position, radius, attributes) {
        var circle = paper.circle(position.left, position.top, radius);

        circle.attr(attributes);

        return circle;
    },

    /**
     * Render items of line type chart.
     * @param {Array.<Array.<object>>} groupItems group items
     * @param {function} funcRenderItem function
     */
    forEach2dArray: function(groupItems, funcRenderItem) {
        tui.util.forEachArray(groupItems, function(items, groupIndex) {
            tui.util.forEachArray(items, function(item, index) {
                funcRenderItem(item, groupIndex, index);
            });
        });
    },

    /**
     * Make changed luminance color.
     * @param {string} hex hax color
     * @param {number} lum luminance
     * @returns {string} changed color
     */
    makeChangedLuminanceColor: function(hex, lum) {
        /*eslint no-magic-numbers: 0*/
        var changedHex;

        hex = hex.replace('#', '');
        lum = lum || 0;

        changedHex = tui.util.map(tui.util.range(3), function(index) {
            var hd = parseInt(hex.substr(index * 2, 2), 16);
            var newHd = hd + (hd * lum);

            newHd = Math.round(Math.min(Math.max(0, newHd), 255)).toString(16);
            return tui.chart.renderUtil.formatToZeroFill(newHd, 2);
        }).join('');

        return '#' + changedHex;
    }
};

module.exports = raphaelRenderUtil;
