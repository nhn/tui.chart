/**
 * @fileoverview ColorSpectrum create a color spectrum and provide color value.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import colorutil from '../helpers/colorutil';

class ColorSpectrum {
  /**
   * ColorSpectrum create a color spectrum and provide color value.
   * @constructs ColorSpectrum
   * @param {string} startColor hex color
   * @param {string} endColor hex color
   * @private
   */
  constructor(startColor, endColor) {
    this.start = colorutil.colorNameToHex(startColor);
    this.startRGB = colorutil.hexToRGB(this.start);
    this.end = colorutil.colorNameToHex(endColor);

    const endRGB = colorutil.hexToRGB(this.end);
    this.distances = this._makeDistances(this.startRGB, endRGB);
    this.colorMap = {};
  }

  /**
   * Make distances start RGB to end RGB.
   * @param {Array.<number>} startRGB start RGB
   * @param {Array.<number>} endRGB end RGB
   * @returns {Array.<number>} distances
   * @private
   */
  _makeDistances(startRGB, endRGB) {
    return startRGB.map((value, index) => endRGB[index] - value);
  }

  /**
   * Get hex color.
   * @param {number} ratio ratio
   * @returns {string} hexcolor
   */
  getColor(ratio) {
    let hexColor = this.colorMap[ratio];

    if (!hexColor) {
      const { distances, startRGB } = this;
      const rgbColor = startRGB.map(
        (start, index) => start + parseInt(distances[index] * ratio, 10)
      );
      hexColor = colorutil.rgbToHEX(...rgbColor);
    }

    return hexColor || null;
  }
}

export default ColorSpectrum;
