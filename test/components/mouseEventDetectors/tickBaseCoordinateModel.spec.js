/**
 * @fileoverview Test for TickBaseCoordinateModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import TickBaseCoordinateModel from '../../../src/js/components/mouseEventDetectors/tickBaseCoordinateModel';

describe('Test for TickBaseCoordinateModel', () => {
  let coordinateModel;

  beforeEach(() => {
    coordinateModel = new TickBaseCoordinateModel(
      {
        dimension: {
          width: 200,
          height: 100
        },
        position: {
          top: 0,
          left: 0
        }
      },
      3,
      'column',
      true
    );
  });

  describe('_makeLineTypeData()', () => {
    it('should make limit data base on middle of tick intervals when line type chart.', () => {
      const actual = coordinateModel._makeLineTypeData(199, 3);
      const expected = [
        { min: -50, max: 50 },
        { min: 50, max: 150 },
        { min: 150, max: 249 }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeNormalData()', () => {
    it('should make limit data base on tick when not line type chart.', () => {
      const actual = coordinateModel._makeNormalData(200, 3);
      const expected = [
        { min: 0, max: 100 },
        { min: 100, max: 200 }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeData()', () => {
    it('should make data from _makeLineTypeData() when line type chart.', () => {
      coordinateModel.isLineType = true;

      const actual = coordinateModel._makeData(
        {
          dimension: {
            width: 200,
            height: 100
          },
          position: {
            top: 0,
            left: 0
          }
        },
        3,
        'line',
        true
      );
      const expected = coordinateModel._makeLineTypeData(200, 3);

      expect(actual).toEqual(expected);
    });

    it('should make data from _makeNormalData() when not line type chart.', () => {
      coordinateModel.isLineType = false;

      const actual = coordinateModel._makeData(
        {
          dimension: {
            width: 200,
            height: 100
          },
          position: {
            top: 0,
            left: 0
          }
        },
        3,
        'column',
        true
      );
      const expected = coordinateModel._makeNormalData(200, 3);

      expect(actual).toEqual(expected);
    });
  });

  describe('findIndex()', () => {
    it('should find group index by mouse position(layerX).', () => {
      const actual = coordinateModel.findIndex(110);
      const expected = 1;
      expect(actual).toBe(expected);
    });

    it('should return -1 if cannot find group index', () => {
      coordinateModel.coordinateData = [
        {
          min: 0,
          max: 50
        },
        {
          min: 50,
          max: 150
        }
      ];
      const actual = coordinateModel.findIndex(210);
      const exptected = -1;
      expect(actual).toBe(exptected);
    });
  });

  describe('makeRange()', () => {
    it('should set tooltip ranges to intermediate value of limit when line type chart.', () => {
      coordinateModel.isLineType = true;
      coordinateModel.data = [
        { min: -50, max: 50 },
        { min: 50, max: 150 },
        { min: 150, max: 250 }
      ];

      const actual = coordinateModel.makeRange(1, 'line');
      const expected = {
        start: 100,
        end: 100
      };

      expect(actual).toEqual(expected);
    });

    it('should set tooltip reanges as it is when not line type chart.', () => {
      coordinateModel.isLineType = false;
      coordinateModel.data = [
        { min: 0, max: 100 },
        { min: 100, max: 200 }
      ];

      const actual = coordinateModel.makeRange(0);
      const expected = {
        start: 0,
        end: 100
      };

      expect(actual).toEqual(expected);
    });
  });
});
