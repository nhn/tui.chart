/**
 * @fileoverview Test for MapChartDataProcessor.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import MapChartDataProcessor from '../../../src/js/models/data/mapChartDataProcessor.js';

describe('Test for MapChartDataProcessor', () => {
  let dataProcessor;

  beforeEach(() => {
    dataProcessor = new MapChartDataProcessor({}, '', {});
  });

  describe('_makeValueMap()', () => {
    it('create value map.', () => {
      dataProcessor.rawData = {
        series: {
          map: [
            {
              code: 'KR',
              data: 100
            },
            {
              code: 'JP',
              data: 50
            }
          ]
        }
      };

      const actual = dataProcessor._makeValueMap();
      const expected = {
        KR: {
          value: 100,
          label: '100'
        },
        JP: {
          value: 50,
          label: '50'
        }
      };

      expect(actual).toEqual(expected);
    });

    it('create valueMap by adding format options', () => {
      dataProcessor.rawData = {
        series: {
          map: [
            {
              code: 'KR',
              data: 100
            },
            {
              code: 'JP',
              data: 50
            }
          ]
        }
      };
      dataProcessor.options = {
        chart: {
          format: '0100'
        }
      };
      const actual = dataProcessor._makeValueMap();
      const expected = {
        KR: {
          value: 100,
          label: '0100'
        },
        JP: {
          value: 50,
          label: '0050'
        }
      };

      expect(actual).toEqual(expected);
    });

    it('should create valueMap by adding name property', () => {
      dataProcessor.rawData = {
        series: {
          map: [
            {
              code: 'KR',
              name: 'South Korea',
              data: 100
            },
            {
              code: 'JP',
              name: 'Japan',
              data: 50
            }
          ]
        }
      };

      dataProcessor.options = {
        chart: {
          format: '0100'
        }
      };

      const actual = dataProcessor._makeValueMap();
      const expected = {
        KR: {
          name: 'South Korea',
          value: 100,
          label: '0100'
        },
        JP: {
          name: 'Japan',
          value: 50,
          label: '0050'
        }
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('getValues', () => {
    it('should pick value property from valueMap', () => {
      dataProcessor.valueMap = {
        KR: {
          value: 100
        },
        JP: {
          value: 50
        }
      };
      const actual = dataProcessor.getValues();
      const expected = [100, 50];

      expect(actual).toEqual(expected);
    });
  });

  describe('addDataRatios()', () => {
    it('should add ratios', () => {
      const limit = {
        min: 0,
        max: 200
      };

      dataProcessor.valueMap = {
        KR: {
          value: 100
        },
        JP: {
          value: 50
        }
      };
      dataProcessor.addDataRatios(limit);
      const actual = dataProcessor.getValueMap();
      const krExpected = 0.5;
      const jpExpected = 0.25;

      expect(actual.KR.ratio).toBe(krExpected);
      expect(actual.JP.ratio).toBe(jpExpected);
    });
  });
});
