/**
 * @fileoverview Test public APIs for bar chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import dom from '../../src/js/helpers/domHandler';
import chart from '../../src/js/index';
import RaphaelBulletChart from '../../src/js/plugins/raphaelBulletChart';
const { bulletChart: bulletChartFactory } = chart;

describe('Test public APIs for bullet chart', () => {
  const rawData = {
    categories: ['July', 'August'],
    series: [
      {
        name: 'Budget',
        data: 25,
        markers: [28, 2, 15],
        ranges: [
          [-1, 10],
          [10, 20],
          [20, 30]
        ]
      },
      {
        name: 'Hello',
        data: 11,
        markers: [20],
        ranges: [
          [0, 8],
          [8, 15]
        ]
      }
    ]
  };
  let bulletChart;

  beforeEach(() => {
    const container = dom.create('DIV');

    bulletChart = bulletChartFactory(container, rawData, {
      series: {
        vertical: false
      }
    });
  });

  describe('resize()', () => {
    it('should only be rendered once when calling resize api.', () => {
      spyOn(RaphaelBulletChart.prototype, 'render');

      bulletChart.resize({
        width: 800
      });

      expect(RaphaelBulletChart.prototype.render.calls.count()).toBe(1);
    });
  });
});
