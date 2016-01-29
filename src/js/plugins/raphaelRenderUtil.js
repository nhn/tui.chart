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
     * @param {object} paper paper
     * @param {{start: string}} path path
     * @param {string} color fill color
     * @param {?number} opacity fill opacity
     * @param {string} strokeColor stroke color
     * @param {?number} strokeOpacity stroke opacity
     * @returns {Array.<object>} raphael object
     */
    renderArea: function(paper, path, color, opacity, strokeColor, strokeOpacity) {
        var area = paper.path(path),
            fillStyle = {
                fill: color,
                opacity: opacity,
                stroke: strokeColor,
                'stroke-opacity': strokeOpacity || 0
            };

        area.attr(fillStyle);

        return area;
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
            }, this);
        }, this);
    },

    /**
     * Make changed luminance color.
     * http://www.sitepoint.com/javascript-generate-lighter-darker-color/
     * @param {string} hex hax color
     * @param {number} lum luminance
     * @returns {string} changed color
     */
    makeChangedLuminanceColor: function (hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');

        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        lum = lum || 0;

        // convert to decimal and change luminosity
        return '#' + tui.util.map(tui.util.range(3), function(index) {
            var c = parseInt(hex.substr(index * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            return ('00' + c).substr(c.length);
        }).join('');
    }
};

module.exports = raphaelRenderUtil;
