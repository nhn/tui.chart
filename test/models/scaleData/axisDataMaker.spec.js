/**
 * @fileoverview Test for axisDataMaker
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import maker from '../../../src/js/models/scaleData/axisDataMaker';
import chartConst from '../../../src/js/const';
import renderUtil from '../../../src/js/helpers/renderUtil';
import geometric from '../../../src/js/helpers/geometric';

describe('Test for axisDataMaker', () => {
  describe('_makeLabelsByIntervalOption()', () => {
    it('should skip label, except label is on labelInterval', () => {
      const actual = maker._makeLabelsByIntervalOption(
        ['label1', 'label2', 'label3', 'label4', 'label5'],
        2,
        0
      );
      const expected = [
        'label1',
        chartConst.EMPTY_AXIS_LABEL,
        'label3',
        chartConst.EMPTY_AXIS_LABEL,
        'label5'
      ];

      expect(actual).toEqual(expected);
    });

    it('should set start interval to (additional data % interval), when there is additional data', () => {
      const actual = maker._makeLabelsByIntervalOption(
        ['label1', 'label2', 'label3', 'label4', 'label5'],
        2,
        1
      );
      const expected = [
        chartConst.EMPTY_AXIS_LABEL,
        'label2',
        chartConst.EMPTY_AXIS_LABEL,
        'label4',
        chartConst.EMPTY_AXIS_LABEL
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('makeLabelAxisData()', () => {
    it('make axis data for label type', () => {
      const actual = maker.makeLabelAxisData({
        labels: ['label1', 'label2', 'label3']
      });
      expect(actual).toEqual({
        labels: ['label1', 'label2', 'label3'],
        tickCount: 4,
        validTickCount: 4,
        options: {},
        isLabelAxis: true,
        isVertical: false,
        isPositionRight: false,
        aligned: false
      });
    });

    it('if has labelInterval option, returns filtered label by labelInterval option', () => {
      const actual = maker.makeLabelAxisData({
        labels: ['label1', 'label2', 'label3', 'label4', 'label5'],
        options: {
          labelInterval: 2
        }
      });

      expect(actual.labels).toEqual(['label1', '', 'label3', '', 'label5']);
    });

    it('if has aligned option, tickCount is label length', () => {
      const actual = maker.makeLabelAxisData({
        labels: ['label1', 'label2', 'label3'],
        aligned: true
      });
      expect(actual.tickCount).toBe(3);
    });

    it('if axis type is datetime, returns formatted label by dateFormat', () => {
      const actual = maker.makeLabelAxisData({
        labels: ['01/01/2016', '02/01/2016', '03/01/2016'],
        options: {
          type: chartConst.AXIS_TYPE_DATETIME,
          dateFormat: 'YYYY.MM'
        }
      });

      expect(actual.labels).toEqual(['2016.01', '2016.02', '2016.03']);
    });
  });

  describe('makeAdditionalDataForCoordinateLineType()', () => {
    it('make additional axis data for coordinate line type chart', () => {
      const labels = [5, 10, 15, 20, 25, 30, 35];
      const values = [8, 20, 33, 23, 15];
      const limit = {
        min: 5,
        max: 35
      };
      const step = 5;
      const tickCount = 7;
      const actual = maker.makeAdditionalDataForCoordinateLineType(
        labels,
        values,
        limit,
        step,
        tickCount
      );
      const expected = {
        labels: [10, 15, 20, 25, 30],
        tickCount: 5,
        validTickCount: 5,
        limit: {
          min: 10,
          max: 30
        },
        dataMin: 8,
        distance: 25,
        positionRatio: 0.08,
        sizeRatio: 0.8
      };

      expect(actual).toEqual(expected);
    });

    it('make additional axis data, when included minus value', () => {
      const labels = [-5, 0, 5, 10, 15, 20, 25];
      const values = [-2, 20, 5, 23, 15];
      const limit = {
        min: -5,
        max: 25
      };
      const step = 5;
      const tickCount = 7;
      const actual = maker.makeAdditionalDataForCoordinateLineType(
        labels,
        values,
        limit,
        step,
        tickCount
      );
      const expected = {
        labels: [0, 5, 10, 15, 20],
        tickCount: 5,
        validTickCount: 5,
        limit: {
          min: 0,
          max: 20
        },
        dataMin: -2,
        distance: 25,
        positionRatio: 0.08,
        sizeRatio: 0.8
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('makeValueAxisData()', () => {
    it('make data for value type axis.', () => {
      const actual = maker.makeValueAxisData({
        labels: [0, 25, 50, 75, 100],
        tickCount: 5,
        limit: {
          min: 0,
          max: 100
        },
        step: 25,
        options: 'options',
        isVertical: true,
        isPositionRight: true,
        aligned: true
      });
      const expected = {
        labels: [0, 25, 50, 75, 100],
        tickCount: 5,
        validTickCount: 5,
        limit: {
          min: 0,
          max: 100
        },
        dataMin: 0,
        distance: 100,
        step: 25,
        options: 'options',
        isVertical: true,
        isPositionRight: true,
        aligned: true
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeAdjustingIntervalInfo()', () => {
    it('should adjust interval using remaining block count and new block count', () => {
      const actual = maker._makeAdjustingIntervalInfo(30, 300, 50);

      expect(actual.blockCount).toBe(6);
      expect(actual.beforeRemainBlockCount).toBe(0);
      expect(actual.interval).toBe(5);
    });

    it('should return null, when new block count is greater than previous block count', () => {
      const actual = maker._makeAdjustingIntervalInfo(4, 300, 50);

      expect(actual).toBeNull();
    });

    it('should return null, when interval is 1', () => {
      const actual = maker._makeAdjustingIntervalInfo(7, 300, 50);

      expect(actual).toBeNull();
    });

    it('should increase block count, when remaining block count is greater than interval', () => {
      const actual = maker._makeAdjustingIntervalInfo(15, 300, 50);

      expect(actual.blockCount).toBe(7);
      expect(actual.beforeRemainBlockCount).toBe(1);
      expect(actual.interval).toBe(2);
    });
  });

  describe('_makeCandidatesForAdjustingInterval()', () => {
    it('should make 7 candidates which is ranged from 90px to 120px(90, 95, 100, 105, 110, 115, 120)', () => {
      const actual = maker._makeCandidatesForAdjustingInterval(41, 300);

      expect(actual.length).toBe(7);
    });

    it('should return empty array, when all candidates are null', () => {
      spyOn(maker, '_makeAdjustingIntervalInfo').and.returnValue(null);
      const actual = maker._makeCandidatesForAdjustingInterval(41, 300);

      expect(actual.length).toBe(0);
    });
  });

  describe('_calculateAdjustingIntervalInfo()', () => {
    it('should make adjust interval info according to currunt block count and series width', () => {
      const actual = maker._calculateAdjustingIntervalInfo(73, 400);

      expect(actual.blockCount).toBe(4);
      expect(actual.beforeRemainBlockCount).toBe(1);
      expect(actual.interval).toBe(18);
    });

    it('should return null, if there is no candidates', () => {
      spyOn(maker, '_makeCandidatesForAdjustingInterval').and.returnValue([]);
      const actual = maker._calculateAdjustingIntervalInfo(73, 400);

      expect(actual).toBeNull();
    });
  });

  describe('_makeFilteredLabelsByInterval()', () => {
    it('should select labels at intervals', () => {
      const actual = maker._makeFilteredLabelsByInterval(
        ['label1', 'label2', 'label3', 'label4'],
        0,
        2
      );

      expect(actual).toEqual(['label1', 'label3']);
    });

    it('should select labels at intervals, and the index starts from `startIndex`', () => {
      const actual = maker._makeFilteredLabelsByInterval(
        ['label1', 'label2', 'label3', 'label4'],
        1,
        2
      );

      expect(actual).toEqual(['label2', 'label4']);
    });
  });

  describe('updateLabelAxisDataForAutoTickInterval()', () => {
    it('should make auto tick interval', () => {
      const axisData = {
        tickCount: 20,
        labels: snippet.range(10, 201, 10)
      };
      maker.updateLabelAxisDataForAutoTickInterval(axisData, 400, 0);

      expect(axisData.tickCount).toBe(5);
      expect(axisData.eventTickCount).toBe(20);
      expect(axisData.labels).toEqual([10, 50, 90, 130, 170, 200]);
      expect(axisData.sizeRatio).toBe(0.8421052631578947);
      expect(axisData.interval).toBe(4);
    });
  });

  describe('updateLabelAxisDataForStackingDynamicData()', () => {
    it('should update tick intervals using previous data and new axis data', () => {
      const axisData = {
        tickCount: 21,
        labels: snippet.range(10, 211, 10)
      };
      const prevUpdatedData = {
        interval: 6,
        startIndex: 1
      };

      maker.updateLabelAxisDataForStackingDynamicData(axisData, prevUpdatedData, 4);

      expect(axisData.tickCount).toBe(4);
      expect(axisData.eventTickCount).toBe(21);
      expect(axisData.labels).toEqual([20, 80, 140, 200]);
      expect(axisData.startIndex).toBe(1);
      expect(axisData.positionRatio).toBe(0.05);
      expect(axisData.sizeRatio).toBe(0.9);
      expect(axisData.interval).toBe(6);
    });
  });

  describe('_createMultilineLabel()', () => {
    it('create multiline labels, when label width shorter than limitWidth', () => {
      const actual = maker._createMultilineLabel('ABCDE FGHIJK', 100, {
        fontSize: 12,
        fontFamily: 'Verdana'
      });

      expect(actual).toBe('ABCDE FGHIJK');
    });

    it('create multiline labels, when label width longer than limitWidth', () => {
      const actual = maker._createMultilineLabel('ABCDE FGHIJK HIJKLMN', 40, {
        fontSize: 12,
        fontFamily: 'Verdana'
      });

      expect(actual).toBe('ABCDE\nFGHIJK\nHIJKLMN');
    });

    it('create multiline labels, when has not empty char)', () => {
      const actual = maker._createMultilineLabel('ABCDEFGHIJKHIJKLMN', 40, {
        fontSize: 12,
        fontFamily: 'Verdana'
      });

      expect(actual).toBe('ABCDEFGHIJKHIJKLMN');
    });
  });

  describe('_createMultilineLabels()', () => {
    it('create multiline labels', () => {
      const labels = ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];
      const labelTheme = {
        fontSize: 12,
        fontFamily: 'Verdana'
      };
      const labelWidth = 50;
      const actual = maker._createMultilineLabels(labels, labelTheme, labelWidth);

      expect(actual).toEqual(['ABCDEF\nGHIJ', 'AAAAA', 'BBBBBBBBBBBB']);
    });
  });

  describe('_calculateMultilineHeight()', () => {
    beforeAll(() => {
      spyOn(renderUtil, 'getRenderedLabelHeight').and.callFake(value => {
        if (value.indexOf('\n') > -1) {
          return 40;
        }

        return 20;
      });
    });
    it('calculate multiple line height', () => {
      const multilineLables = ['AAAA\nBBBB'];
      const labelAraeWidth = 50;

      const actual = maker._calculateMultilineHeight(multilineLables, labelAraeWidth);

      expect(actual).toBe(40);
    });

    it('calculate multiple line height, when not multiple line label', () => {
      const multilineLables = ['AAAA'];
      const labelAraeWidth = 50;
      const actual = maker._calculateMultilineHeight(multilineLables, labelAraeWidth);

      expect(actual).toBe(20);
    });
  });

  describe('_findRotationDegree()', () => {
    it('find rotation degree', () => {
      const actual = maker._findRotationDegree(50, 60, 20);

      expect(actual).toBe(65);
    });

    it('labelAreaWidth is too short to represent the label, the angle must be a maximum value of 85 degrees', () => {
      const actual = maker._findRotationDegree(5, 120, 20);

      expect(actual).toBe(85);
    });
  });

  describe('_calculateRotatedWidth()', () => {
    it('calculate rotated width', () => {
      const degree = 25;
      const firstLabel = 'abcdefghijklmnopqrstuvwxyz';
      const labelHeight = 20;

      spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(140);
      const actual = maker._calculateRotatedWidth(degree, firstLabel, labelHeight);

      expect(actual).toBe(131.109272802538);
    });
  });

  describe('makeAdditionalDataForRotatedLabels', () => {
    beforeEach(() => {
      spyOn(renderUtil, 'getRenderedLabelsMaxHeight').and.returnValue(20);
    });

    it('make additional data for rotated labels', () => {
      const validLabels = ['cate1', 'cate2', 'cate3'];
      const validLabelCount = 3;
      const labelTheme = {};
      const isLabelAxis = true;
      const dimensionMap = {
        series: {
          width: 300
        },
        yAxis: {
          width: 100
        },
        chart: {
          width: 500
        }
      };

      spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
      spyOn(geometric, 'calculateRotatedHeight').and.returnValue(30);
      spyOn(maker, '_calculateRotatedWidth').and.returnValue(110);

      const actual = maker.makeAdditionalDataForRotatedLabels(
        validLabels,
        validLabelCount,
        labelTheme,
        isLabelAxis,
        dimensionMap
      );

      expect(actual).toEqual({
        degree: 45,
        overflowHeight: 10,
        overflowLeft: -40,
        overflowRight: 30
      });
    });

    it('make additional data for rotated labels, when has not rotated label', () => {
      const validLabels = ['cate1', 'cate2', 'cate3'];
      const validLabelCount = 3;
      const labelTheme = {};
      const isLabelAxis = true;
      const dimensionMap = {
        series: {
          width: 400
        },
        yAxis: {
          width: 100
        },
        chart: {
          width: 500
        }
      };

      spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(120);

      const actual = maker.makeAdditionalDataForRotatedLabels(
        validLabels,
        validLabelCount,
        labelTheme,
        isLabelAxis,
        dimensionMap
      );

      expect(actual).toEqual({
        overflowLeft: -40,
        overflowRight: 140
      });
    });
  });
});
