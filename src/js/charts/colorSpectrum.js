/**
 * @fileoverview ColorSpectrum create a color spectrum and provide color value.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var colorutil = require('../helpers/colorutil');
var snippet = require('tui-code-snippet');

var ColorSpectrum = snippet.defineClass(/** @lends ColorSpectrum.prototype */ {
    /**
     * ColorSpectrum create a color spectrum and provide color value.
     * @constructs ColorSpectrum
     * @private
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
        return snippet.map(startRGB, function(value, index) {
            return endRGB[index] - value;
        });
    },

    /**
     * Get hex color.
     * @param {number} ratio ratio
     * @returns {string} hex color
     */
    getColor: function(ratio) {
        var hexColor = this.colorMap[ratio];
        var distances, rgbColor;

        if (!hexColor) {
            distances = this.distances;
            rgbColor = snippet.map(this.startRGB, function(start, index) {
                return start + parseInt(distances[index] * ratio, 10);
            });
            hexColor = colorutil.rgbToHEX.apply(null, rgbColor);
        }

        return hexColor || null;
    }
});

module.exports = ColorSpectrum;
