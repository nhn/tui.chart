/**
 * @fileoverview Test for AreaTypeDataModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import AreaTypeDataModel from '../../../src/js/components/mouseEventDetectors/areaTypeDataModel';

describe('Test for AreaTypeDataModel', () => {
  let dataModel;

  beforeEach(() => {
    dataModel = new AreaTypeDataModel([
      {
        chartType: 'line',
        data: {
          groupPositions: []
        }
      }
    ]);
  });

  describe('_makeData()', () => {
    it('make data for detecting mouse event', () => {
      const seriesItemBoundsData = [
        {
          chartType: 'line',
          data: {
            groupPositions: [
              [
                {
                  left: 10,
                  top: 10
                }
              ]
            ]
          }
        }
      ];
      const actual = dataModel._makeData(seriesItemBoundsData);

      expect(actual[0].chartType).toBe('line');
      expect(actual[0].indexes.groupIndex).toBe(0);
      expect(actual[0].indexes.index).toBe(0);
      expect(actual[0].bound).toEqual({
        left: 10,
        top: 10
      });
    });
  });

  describe('findData()', () => {
    it('Find the data closest to the x coordinate at not coordinate type chart.', () => {
      dataModel.data = [
        {
          bound: {
            top: 10,
            left: 10
          },
          indexes: {
            groupIndex: 0,
            index: 0
          }
        },
        {
          bound: {
            top: 20,
            left: 20
          }
        }
      ];
      const actual = dataModel.findData(
        {
          x: 17,
          y: 10
        },
        null,
        {
          isCoordinateTypeChart: false
        }
      );
      const [, expected] = dataModel.data;
      expect(actual).toBe(expected);
    });

    it('Find the data closest coordinate position at coordinate type chart.', () => {
      dataModel.data = [
        {
          bound: {
            top: 10,
            left: 10
          }
        },
        {
          bound: {
            top: 20,
            left: 20
          }
        }
      ];
      const actual = dataModel.findData(
        {
          x: 17,
          y: 10
        },
        null,
        {
          isCoordinateTypeChart: true
        }
      );
      const [expected] = dataModel.data;

      expect(actual).toBe(expected);
    });

    it('Must be found the data closest to the y-coordinate when x-coordinates are the same and not coordinate type chart.', () => {
      dataModel.data = [
        {
          bound: {
            top: 10,
            left: 10
          }
        },
        {
          bound: {
            top: 20,
            left: 10
          }
        }
      ];

      const actual = dataModel.findData(
        {
          x: 10,
          y: 17
        },
        null,
        {
          isCoordinateTypeChart: false
        }
      );
      const [, expected] = dataModel.data;
      expect(actual).toBe(expected);
    });
  });
});
