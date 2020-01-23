/**
 * @fileoverview Test for RaphaelBarChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import RaphaelBarChart from '../../src/js/plugins/raphaelBarChart';

describe('RaphaelBarChart', () => {
  let barChart;

  beforeEach(() => {
    barChart = new RaphaelBarChart();
  });

  describe('_makeRectPoints()', () => {
    it('should create position data by boundingRect data', () => {
      const actual = barChart._makeRectPoints({
        left: 10,
        top: 10,
        width: 100,
        height: 40
      });
      const expected = {
        leftTop: {
          left: 10,
          top: 10
        },
        rightTop: {
          left: 110,
          top: 10
        },
        rightBottom: {
          left: 110,
          top: 50
        },
        leftBottom: {
          left: 10,
          top: 50
        }
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeTopLinePath()', () => {
    it('should make top line path', () => {
      const points = {
        leftTop: {
          left: 10,
          top: 10
        },
        rightTop: {
          left: 50,
          top: 10
        }
      };
      const actual = barChart._makeTopLinePath(points, 'bar', {});
      const expected = 'M 10 9.5 L 50 9.5';
      expect(actual).toBe(expected);
    });

    it('should subtract 1 from top line path, when it is column chart', () => {
      const points = {
        leftTop: {
          left: 10,
          top: 10
        },
        rightTop: {
          left: 50,
          top: 10
        }
      };
      const actual = barChart._makeTopLinePath(points, 'column', {
        value: 1
      });
      const expected = 'M 9 9.5 L 50 9.5';
      expect(actual).toBe(expected);
    });

    it('should subtract 1 from top line path, when it is bar chart of negative value', () => {
      const points = {
        leftTop: {
          left: 10,
          top: 10
        },
        rightTop: {
          left: 50,
          top: 10
        }
      };
      const actual = barChart._makeTopLinePath(points, 'bar', {
        value: -1
      });
      const expected = 'M 9 9.5 L 50 9.5';
      expect(actual).toBe(expected);
    });
  });

  describe('_makeBorderLinesPaths()', () => {
    it('should create top, right, bottom path when it is bar chart of positive value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'bar',
        {
          value: 10
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).not.toBeDefined();
    });

    it('should create additional left path, if it is ranged bar chart of positive value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'bar',
        {
          value: 10,
          isRange: true
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should creat top, bottom, left path, when it is bar chart of negative value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'bar',
        {
          value: -10
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).not.toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should create additional right path, if it is ranged bar chart of negative value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'bar',
        {
          value: -10,
          isRange: true
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should creat top, right, left path, if it is column chart of positive value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'column',
        {
          value: 10
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).not.toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should create additional bottom path, if it is ranged column chart of positive value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'column',
        {
          value: 10,
          isRange: true
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should create right, bottom, left path, if it is column chart of negative value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'column',
        {
          value: -10
        }
      );

      expect(actual.top).not.toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });

    it('should create additional top path if it is ranged column chart of negative value', () => {
      const actual = barChart._makeBorderLinesPaths(
        {
          left: 10,
          top: 10,
          width: 100,
          height: 50
        },
        'column',
        {
          value: -10,
          isRange: true
        }
      );

      expect(actual.top).toBeDefined();
      expect(actual.right).toBeDefined();
      expect(actual.bottom).toBeDefined();
      expect(actual.left).toBeDefined();
    });
  });

  describe('_animateRect()', () => {
    it('should draw 2px even if width is 0.', () => {
      const rect = {
        animate: () => {}
      };
      const bound = {
        left: 10,
        top: 10,
        width: 0,
        height: 10
      };
      spyOn(rect, 'animate');

      barChart._animateRect(rect, bound);

      expect(rect.animate.calls.mostRecent().args[0].width).toBe(2);
    });

    it('should draw 2px even if height is 0.', () => {
      const rect = {
        animate: () => {}
      };
      const bound = {
        left: 10,
        top: 10,
        width: 10,
        height: 0
      };
      spyOn(rect, 'animate');

      barChart._animateRect(rect, bound);

      expect(rect.animate.calls.mostRecent().args[0].height).toBe(2);
    });
  });
});
