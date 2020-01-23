/**
 * @fileoverview Test for RaphaelLineChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import RaphaelLineChart from '../../src/js/plugins/raphaelLineChart';

describe('RaphaelLineChart', () => {
  let lineChart;

  beforeEach(() => {
    lineChart = new RaphaelLineChart();
  });

  describe('_getLinesPath()', () => {
    it('should creat path for normal line chart', () => {
      const actual = lineChart._getLinesPath([
        [
          {
            left: 10,
            top: 30,
            startTop: 50
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ]
      ]);
      const expected = [['M', 10, 30, 'L', 30, 40]];
      expect(actual).toEqual(expected);
    });
  });

  describe('_getSplineLinesPath()', () => {
    it('should creat path for spline line chart', () => {
      lineChart.zeroTop = 50;
      const actual = lineChart._getSplineLinesPath([
        [
          {
            left: 10,
            top: 30,
            startTop: 50
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ]
      ]);
      const expected = [
        [
          ['M', 10, 30, 'C', 10, 30],
          [30, 40, 30, 40]
        ]
      ];
      expect(actual).toEqual(expected);
    });
  });
});
