/**
 * @fileoverview MapChartColorModel is color model for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var colorutil = require('../helpers/colorutil');

var MapChartColorModel = tui.util.defineClass(/** @lends MapChartColorModel.prototype */ {
    /**
     * MapChartColorModel is legend model.
     * @constructs MapChartColorModel
     * @param {string} startColor hex color
     * @param {string} endColor hex color
     */
    init: function(startColor, endColor) {
        var endRGB;

        this.start = colorutil.colorNameToHex(startColor);
        this.startRGB = colorutil.hexToRGB(this.start);
        this.end = colorutil.colorNameToHex(endColor);

        endRGB = colorutil.hexToRGB(this.end);
        this.distances = this._makeDistances(this.startRGB, endRGB);
        this.colorMap = {};
    },

    /**
     * Make distances start RGB to end RGB.
     * @param {Array.<number>} startRGB start RGB
     * @param {Array.<number>} endRGB end RGB
     * @returns {Array.<number>} distances
     * @private
     */
    _makeDistances: function(startRGB, endRGB) {
        return tui.util.map(startRGB, function(value, index) {
            return endRGB[index] - value;
        });
    },

    /**
     * Get hex color.
     * @param {number} ratio ratio
     * @returns {string} hex color
     */
    getColor: function(ratio) {
        var hexColor = this.colorMap[ratio],
            distances, rgbColor;

        if (!hexColor) {
            distances = this.distances;
            rgbColor = tui.util.map(this.startRGB, function (start, index) {
                return start + parseInt(distances[index] * ratio, 10);
            });
            hexColor = colorutil.rgbToHEX.apply(null, rgbColor);
        }

        return hexColor;
    }
});

module.exports = MapChartColorModel;
