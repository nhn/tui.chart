/**
 * @fileoverview Test for SeriesDataModelForBullet.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import SeriesDataModel from '../../../src/js/models/data/seriesDataModelForBullet';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import SeriesItem from '../../../src/js/models/data/seriesItem';

describe('Test for SeriesDataModelForBullet', () => {
  let seriesDataModel;

  beforeEach(() => {
    seriesDataModel = new SeriesDataModel({});
    seriesDataModel.rawSeriesData = [
      {
        data: 11,
        ranges: [
          [-29, -10],
          [-10, 11],
          [11, 30]
        ],
        markers: [10, 9]
      },
      {
        data: 20,
        ranges: [
          [-29, -10],
          [-10, 11],
          [11, 30]
        ],
        markers: [10, 9, 8, 7]
      }
    ];
  });

  describe('_createSeriesGroupsFromRawData()', () => {
    it('should create series group from base groups', () => {
      const actual = seriesDataModel._createSeriesGroupsFromRawData();

      expect(actual.length).toBe(2);
      expect(actual[0] instanceof SeriesGroup).toBe(true);
      expect(actual[0].items.length).toBe(6);
    });

    it('should create series item from raw data', () => {
      const actual = seriesDataModel._createSeriesGroupsFromRawData()[0].items;

      expect(actual.length).toBe(6);
      expect(actual[0].value).toBe(-29);
      expect(actual[1].value).toBe(11);
      expect(actual[2].value).toBe(30);
      expect(actual[3].value).toBe(11);
      expect(actual[4].value).toBe(10);
      expect(actual[5].value).toBe(9);
    });
  });

  describe('_createBaseGroups()', () => {
    it('should create base group from raw data', () => {
      const [actual] = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(6);
      expect(actual[0].value).toBe(-29);
      expect(actual[1].value).toBe(11);
      expect(actual[2].value).toBe(30);
      expect(actual[3].value).toBe(11);
      expect(actual[4].value).toBe(10);
      expect(actual[5].value).toBe(9);
    });
  });

  describe('_createValues()', () => {
    it('should create base group from seriesGroup', () => {
      const rawSeriesData = [
        {
          data: 11,
          ranges: [
            [-29, -10],
            [-10, 11],
            [11, 30]
          ],
          markers: [10, 9]
        }
      ];

      seriesDataModel.rawSeriesData = rawSeriesData;
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItem({ datum: 11 }),
          new SeriesItem({ datum: [-29, -10] }),
          new SeriesItem({ datum: [-10, 11] }),
          new SeriesItem({ datum: [11, 30] }),
          new SeriesItem({ datum: 10 }),
          new SeriesItem({ datum: 9 })
        ])
      ];

      const actual = seriesDataModel._createValues();
      expect(actual).toEqual([11, -29, -10, 11, -10, 30, 11, 10, 9]);
    });
  });
});
