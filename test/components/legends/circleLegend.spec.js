/**
 * @fileoverview test circleLegend
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import circleLegendFactory from '../../../src/js/components/legends/circleLegend';

describe('Test for CircleLegend', () => {
  let circleLegend, dataProcessor;

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getFormatFunctions',
      'getMaxValue',
      'getFormattedMaxValue'
    ]);
    circleLegend = new circleLegendFactory.CircleLegend({
      dataProcessor
    });
  });

  describe('_formatLabel()', () => {
    it('should convert float to number, when decimal place set to 0', () => {
      dataProcessor.getFormatFunctions.and.returnValue([]);
      const actual = circleLegend._formatLabel(10.22, 0);
      const expected = '10';

      expect(actual).toBe(expected);
    });

    it('should set decimal places to passed number', () => {
      dataProcessor.getFormatFunctions.and.returnValue([]);
      const actual = circleLegend._formatLabel(10.223, 2);
      const expected = '10.22';

      expect(actual).toBe(expected);
    });

    it('should format labels by formatFunctions, when formatFunctions exist', () => {
      dataProcessor.getFormatFunctions.and.returnValue([value => `00${value}`]);
      const actual = circleLegend._formatLabel(10.22, 0);
      const expected = '0010';

      expect(actual).toBe(expected);
    });
  });
});
