/**
 * @fileoverview Calculate coordinateType scale data
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import csc from '../../../src/js/models/scaleData/coordinateScaleCalculator';

describe('coordinateScaleCalculator', () => {
  describe('positive values', () => {
    it('calculate with tick count', () => {
      const scale = csc({
        min: 0,
        max: 1000,
        offsetSize: 1000,
        stepCount: 10
      });

      expect(scale.limit.min).toEqual(0);
      expect(scale.limit.max).toEqual(1000);
      expect(scale.step).toEqual(100);
      expect(scale.stepCount).toEqual(10);
    });

    it('calculate with default tick pixel size(pixelsPerTick)', () => {
      const scale = csc({
        min: 0,
        max: 880,
        offsetSize: 880
      });

      expect(scale.limit.min).toEqual(0);
      expect(scale.limit.max).toEqual(900);
      expect(scale.step).toEqual(100);
      expect(scale.stepCount).toEqual(9);
    });

    it('get tick value that normalized', () => {
      const scale = csc({
        min: 0,
        max: 12345,
        offsetSize: 1000
      });

      expect(scale.step).toEqual(1000);
    });

    it('get edges that normalized', () => {
      const scale = csc({
        min: 322,
        max: 12345,
        offsetSize: 1000
      });

      expect(scale.limit.min).toEqual(0);
      expect(scale.limit.max).toEqual(13000);
    });
  });

  describe('Negative values', () => {
    let scale;

    beforeEach(() => {
      scale = csc({
        min: -1830,
        max: 12345,
        offsetSize: 1000
      });
    });

    it('min should be -2000', () => {
      expect(scale.limit.min).toEqual(-2000);
    });
  });

  describe('Under decimal point', () => {
    it('edge range 0.120 ~ 0.900, should have step 0.05', () => {
      const scale = csc({
        min: 0.12,
        max: 0.9,
        offsetSize: 1000
      });

      expect(scale.limit.max).toEqual(0.9);
      expect(scale.limit.min).toEqual(0.1);
      expect(scale.step).toEqual(0.05);
    });

    it('edge range 0.0045 ~ 1, should have step 0.05', () => {
      const scale = csc({
        min: 0.0045,
        max: 2,
        offsetSize: 1000
      });

      expect(scale.limit.max).toEqual(2);
      expect(scale.limit.min).toEqual(0);
      expect(scale.step).toEqual(0.2);
    });

    it('edge range 0.01 ~ 0.47, should have min=0, max=0.6, step=0.2', () => {
      const scale = csc({
        min: 0.01,
        max: 0.47,
        offsetSize: 196
      });

      expect(scale.limit.max).toEqual(0.6);
      expect(scale.limit.min).toEqual(0);
      expect(scale.step).toEqual(0.2);
    });

    it('using the showLabel option, the max value of sereis must be considered to the height of the label.', () => {
      const scale = csc({
        min: 0.01,
        max: 0.47,
        offsetSize: 196,
        showLabel: true
      });

      expect(scale.limit.max).toEqual(2.6);
    });
  });
});
