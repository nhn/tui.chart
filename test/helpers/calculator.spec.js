/**
 * @fileoverview Test for calculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import calculator from '../../src/js/helpers/calculator.js';

describe('Test for calculator', () => {
  describe('calculateLimit()', () => {
    it('should calculate limit to {min: 0, max: 104.5} using userMin=10, userMax=100.', () => {
      const actual = calculator.calculateLimit(10, 100);
      expect(actual.min).toBe(0);
      expect(actual.max).toBe(104.5);
    });

    it('should calculate limit to {min: 16, max: 104} using userMin=20, userMax=100.', () => {
      const actual = calculator.calculateLimit(20, 100);
      expect(actual.min).toBe(16);
      expect(actual.max).toBe(104);
    });

    it('should calculate limit to {min: -100, max: -16} using userMin=-100, userMax=-20.', () => {
      const actual = calculator.calculateLimit(-100, -20);
      expect(actual.min).toBe(-100);
      expect(actual.max).toBe(-16);
    });
  });

  describe('makePixelPositions()', () => {
    it('make pixel positions, when size is 300 and count is 5', () => {
      const positions = calculator.makeTickPixelPositions(300, 5);
      expect(positions).toEqual([0, 75, 150, 225, 299]);
    });

    it('make pixel positions, when size is 400 and count is 6', () => {
      const positions = calculator.makeTickPixelPositions(400, 6);
      expect(positions).toEqual([0, 80, 160, 240, 320, 399]);
    });
  });

  describe('calculateStepFromLimit()', () => {
    it('should calculate step to 20 if limit.min=20, limit.max=100, tickCount=5', () => {
      const tickCount = 5;
      const limit = { min: 20, max: 100 };
      const step = calculator.calculateStepFromLimit(limit, tickCount);
      expect(step).toBe(20);
    });

    it('should calculate step to 30 if limit.min=10, limit.max=130 tickCount=4.', () => {
      const tickCount = 4;
      const limit = { min: 10, max: 130 };
      const step = calculator.calculateStepFromLimit(limit, tickCount);
      expect(step).toBe(40);
    });
  });

  describe('makeLabelsFromLimit()', () => {
    it('should set labels for min=20, max=100, step=20 to [20, 40, 60, 80, 100].', () => {
      const limit = { min: 20, max: 100 };
      const step = 20;
      const result = calculator.makeLabelsFromLimit(limit, step);
      expect(result).toEqual([20, 40, 60, 80, 100]);
    });

    it('should set labels for min=10, max=130, step=40 to [10, 50, 90, 130].', () => {
      const limit = { min: 10, max: 130 };
      const step = 40;
      const result = calculator.makeLabelsFromLimit(limit, step);
      expect(result).toEqual([10, 50, 90, 130]);
    });
  });

  describe('calculateRatio()', () => {
    it('should set ratito to (input value - subNumber) / divNumber * baseRatio.', () => {
      const actual = calculator.calculateRatio(10, 2, 2, 0.5);

      expect(actual).toEqual(2);
    });

    it('should return 0 when divNumber is 0', () => {
      const divNumber = 0;
      const actual = calculator.calculateRatio(10, divNumber, 2, 0.5);

      expect(actual).toEqual(0);
    });
  });
});
