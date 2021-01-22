import { calibrateDrawingValue, calibrateBoxStackDrawingValue } from '@src/helpers/boxSeries';

describe('box chart', () => {
  describe('calibrateBoxDrawingValue', () => {
    it('should be input value, if the minimum value is less than or equal to 0, and the input value is less than or equal to the maximum value', () => {
      expect(calibrateDrawingValue(3, 0, 8)).toBe(3);
      expect(calibrateDrawingValue(3, -1, 3)).toBe(3);
    });

    it('should be 0, if the entered positive value is less than or equal to the minimum value', () => {
      expect(calibrateDrawingValue(0, 0, 8)).toBe(0);
      expect(calibrateDrawingValue(2, 2, 8)).toBe(0);
      expect(calibrateDrawingValue(1, 2, 8)).toBe(0);
    });

    it('should be input value, if the maximum value is 0 or more and negative value is greater than or equal to the minimum value', () => {
      expect(calibrateDrawingValue(-3, -8, 0)).toBe(-3);
      expect(calibrateDrawingValue(-5, -8, 1)).toBe(-5);
    });

    it('should be 0, if the value entered is negative, and greater than or equal to the maximum', () => {
      expect(calibrateDrawingValue(-2, -8, -3)).toBe(0);
      expect(calibrateDrawingValue(-1, -8, -1)).toBe(0);
    });

    it('should be recalculated the length of the bar which is based on the maximum and minimum values', () => {
      expect(calibrateDrawingValue(3, 2, 8)).toBe(1);
      expect(calibrateDrawingValue(10, 2, 8)).toBe(6);
      expect(calibrateDrawingValue(-2, -8, -1)).toBe(-1);
      expect(calibrateDrawingValue(-9, -8, -1)).toBe(-7);
    });
  });

  describe('calibrateBoxStackDrawingValue', () => {
    it("shouldn't exceed maximum value, when positive value, current index is 0 and the minimum value is less than or equal to 0", () => {
      expect(calibrateBoxStackDrawingValue([10, 1, 2], 0, -1, 5)).toBe(5);
      expect(calibrateBoxStackDrawingValue([1, 1, 2], 0, -1, 5)).toBe(1);
      expect(calibrateBoxStackDrawingValue([0, 10, 2], 0, -1, 5)).toBe(0);
    });

    it("shouldn't exceed minimum value, when negativee value, current index is 0 and the maxmum value is greater than or equal to 0", () => {
      expect(calibrateBoxStackDrawingValue([-10, -5, -1], 0, -15, 0)).toBe(-10);
      expect(calibrateBoxStackDrawingValue([-10, -5, -1], 0, -5, 1)).toBe(-5);
      expect(calibrateBoxStackDrawingValue([-5, -3, 0], 0, -5, 0)).toBe(-5);
    });

    it('should not be defined when the sum of the previous values ​​exceeds the minimum and maximum', () => {
      expect(calibrateBoxStackDrawingValue([-10, -5, -1], 1, -5, 0)).toBe(null);
      expect(calibrateBoxStackDrawingValue([-10, -5, -1], 2, -10, 1)).toBe(null);
      expect(calibrateBoxStackDrawingValue([-5, -3, 0], 1, -5, 0)).toBe(null);
    });

    it('should be recalculated value, if the value to be drawn conflicts with the maximum or minimum value', () => {
      const values = [-5, -10, -3, 3, 7, 4];
      const min = -8;
      const max = 5;

      expect(calibrateBoxStackDrawingValue(values, 0, min, max)).toBe(-5);
      expect(calibrateBoxStackDrawingValue(values, 1, min, max)).toBe(-3);
      expect(calibrateBoxStackDrawingValue(values, 2, min, max)).toBe(null);
      expect(calibrateBoxStackDrawingValue(values, 3, min, max)).toBe(3);
      expect(calibrateBoxStackDrawingValue(values, 4, min, max)).toBe(2);
      expect(calibrateBoxStackDrawingValue(values, 5, min, max)).toBe(null);
    });
  });
});
