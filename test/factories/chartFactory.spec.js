/**
 * @fileoverview Test for chartFactory.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import chartFactory from '../../src/js/factories/chartFactory.js';

describe('Test for chartFactory', () => {
  const TempClass = () => {};

  chartFactory.register('barChart', TempClass);

  describe('_findKey()', () => {
    it('should return chart type, if it is single chart.', () => {
      const actual = chartFactory._findKey('line');

      expect(actual).toBe('line');
    });

    it('should return `columnLineCombo`, if it is combo chart and rawData.series has line and column property.', () => {
      const actual = chartFactory._findKey('combo', {
        series: {
          line: {},
          column: {}
        }
      });

      expect(actual).toBe('columnLineCombo');
    });

    it('should return `pieDonutCombo`, if it is combo chart and rawData.series has pie and donut property.', () => {
      const actual = chartFactory._findKey('combo', {
        seriesAlias: {
          donut: 'pie'
        },
        series: {
          pie: {},
          donut: {}
        }
      });

      expect(actual).toBe('pieDonutCombo');
    });

    it('shoud return null, if combined property of rawData.series is not supported type of combo chart', () => {
      const actual = chartFactory._findKey('combo', {
        line: {},
        pie: {}
      });

      expect(actual).toBeNull();
    });
  });

  describe('get()', () => {
    it('should return chart, when requested chart is registered.', () => {
      const chart = chartFactory.get('barChart', {});
      expect(chart).toEqual(jasmine.any(TempClass));
    });

    it('should return chart, when requested chart is not registered.', () => {
      expect(() => {
        chartFactory.get('lineChart', {});
      }).toThrowError('Not exist lineChart chart.');
    });
  });
});
