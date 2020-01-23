/**
 * @fileoverview Test for ColorSpectrum.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ColorSpectrum from '../../src/js/charts/colorSpectrum';

describe('Test for ColorSpectrum', () => {
  let colorSpectrum;

  beforeEach(() => {
    colorSpectrum = new ColorSpectrum('#ffffff', '#ff0000');
  });

  describe('_makeDistance()', () => {
    it('should calculate diffs between start and end RGB values', () => {
      const startRGB = [255, 255, 255];
      const endRGB = [0, 0, 0];
      const actual = colorSpectrum._makeDistances(startRGB, endRGB);
      const expected = [-255, -255, -255];

      expect(actual).toEqual(expected);
    });
  });

  describe('getColor()', () => {
    it('should calculate hex color according to ratio', () => {
      colorSpectrum.startRGB = [255, 255, 255];
      colorSpectrum.distances = [-100, -150, -200];

      const actual = colorSpectrum.getColor(0.5);
      const expected = '#cdb49b';

      expect(actual).toBe(expected);
    });

    it('should return cached data, if color value corresponding to ratio is cached', () => {
      colorSpectrum.colorMap = {
        '0.5': '#0000ff'
      };

      const actual = colorSpectrum.getColor(0.5);
      const expected = '#0000ff';

      expect(actual).toBe(expected);
    });
  });
});
