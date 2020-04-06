import { updateSplineCurve } from '@src/helpers/calculator';
import { SplinePoint } from '@t/options';

describe('spline chart', () => {
  describe('updateSplineCurve', () => {
    it('should calculate properly for a multiple point', () => {
      const points = [
        { x: 1, y: 2 },
        { x: 3, y: 5 },
        { x: 5, y: 4 }
      ];

      updateSplineCurve(points);

      points.forEach((point: SplinePoint) => {
        expect(point.controlPoint).toBeDefined();
      });
    });

    it('should calculate properly for a single point', () => {
      const points = [{ x: 1, y: 2 }];

      updateSplineCurve(points);

      expect(points[0]).toEqual({
        x: 1,
        y: 2,
        controlPoint: { prev: { x: 1, y: 2 }, next: { x: 1, y: 2 } }
      });
    });
  });
});
