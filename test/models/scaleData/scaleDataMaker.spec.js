/**
 * @fileoverview Test for ScaleDataMaker.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import scaleDataMaker from '../../../src/js/models/scaleData/scaleDataMaker.js';
import chartConst from '../../../src/js/const';

describe('Test for ScaleDataMaker', () => {
  describe('_makeLimitForDivergingOption()', () => {
    it('Make diverging chart centered by adjust min, max value', () => {
      const actual = scaleDataMaker._makeLimitForDivergingOption({
        min: -20,
        max: 10
      });
      const expected = {
        min: -20,
        max: 20
      };

      expect(actual).toEqual(expected);
    });
  });
  describe('_findDateType()', () => {
    it('if difference between minimum and maximum value is over year value, returns chartConst.DATE_TYPE_YEAR', () => {
      const baseLimit = {
        min: new Date(2010, 1, 1).getTime(),
        max: new Date(2018, 1, 1).getTime()
      };
      const actual = scaleDataMaker._findDateType(baseLimit, 6);

      expect(actual).toBe(chartConst.DATE_TYPE_YEAR);
    });

    it(
      'if difference between minimum and maximum value is over year value and' +
        ' it divided by millisecond of year value is less than data count,' +
        ' returns chartConst.DATE_TYPE_MONTH',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2011, 1, 1).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 24);

        expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
      }
    );

    it(
      'if difference between minimum and maximum value is over month value,' +
        ' returns chartConst.DATE_TYPE_MONTH',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 12, 1).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 6);

        expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
      }
    );

    it(
      'if difference between minimum and maximum value is over week value and' +
        ' it divided by millisecond of month value is less than data count and 2 weeks,' +
        ' returns chartConst.DATE_TYPE_WEEK',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 1, 13).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_DATE);
      }
    );

    it(
      'if difference between minimum and maximum value is over month value and' +
        ' it divided by millisecond of month value is less than data count and over 2 weeks,' +
        ' returns chartConst.DATE_TYPE_WEEK',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 1, 15).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_WEEK);
      }
    );

    it(
      'if difference between minimum and maximum value is over date value,' +
        ' returns chartConst.DATE_TYPE_DATE',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 1, 10).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 6);

        expect(actual).toBe(chartConst.DATE_TYPE_DATE);
      }
    );

    it(
      'if difference between minimum and maximum value is over date value and' +
        ' it divided by millisecond of date value exceeded 2 days,' +
        ' returns chartConst.DATE_TYPE_DATE',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 1, 3).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_DATE);
      }
    );

    it(
      'if difference between minimum and maximum value is over date value and' +
        ' it divided by millisecond of date value is less than data count,' +
        ' returns chartConst.DATE_TYPE_HOUR',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1).getTime(),
          max: new Date(2010, 1, 2).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
      }
    );

    it(
      'if difference between minimum and maximum value is over hour value,' +
        ' returns chartConst.DATE_TYPE_HOUR',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 13).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 6);

        expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
      }
    );

    it(
      'if difference between minimum and maximum value is over hour value and' +
        ' it divided by millisecond of hour value exceeded 2 hours,' +
        ' returns chartConst.DATE_TYPE_HOUR',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 3).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
      }
    );

    it(
      'if difference between minimum and maximum value is over hour value and' +
        ' it divided by millisecond of hour value is less than data count,' +
        ' returns chartConst.DATE_TYPE_HOUR',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 2).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
      }
    );

    it(
      'if difference between minimum and maximum value is over minute value,' +
        ' returns chartConst.DATE_TYPE_MINUTE',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 1, 12).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 6);

        expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
      }
    );

    it(
      'if difference between minimum and maximum value is over minute value and' +
        ' it divided by millisecond of minute value exceeded 2 minutes,' +
        ' returns chartConst.DATE_TYPE_MINUTE',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 1, 3).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
      }
    );

    it(
      'if difference between minimum and maximum value is over minute value and' +
        ' it divided by millisecond of minute value is less than data count,' +
        ' returns chartConst.DATE_TYPE_SECOND',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 1, 2).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
      }
    );

    it(
      'if difference between minimum and maximum value is over second value,' +
        ' returns chartConst.DATE_TYPE_SECOND',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 1, 1, 12).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 6);

        expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
      }
    );

    it(
      'if difference between minimum and maximum value is over second value and' +
        ' it divided by millisecond of second value is less than data count,' +
        ' returns chartConst.DATE_TYPE_SECOND',
      () => {
        const baseLimit = {
          min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
          max: new Date(2010, 1, 1, 1, 1, 6).getTime()
        };
        const actual = scaleDataMaker._findDateType(baseLimit, 12);

        expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
      }
    );

    it('if minimum and maximum value are same, returns chartConst.DATE_TYPE_SECOND', () => {
      const baseLimit = {
        min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
        max: new Date(2010, 1, 1, 1, 1, 1).getTime()
      };
      const actual = scaleDataMaker._findDateType(baseLimit, 6);

      expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
    });
  });

  describe('makeScaleData()', () => {
    it('calculate coordinate scale.', () => {
      const baseValues = [10, 20, 40, 90];
      const baseSize = 400;
      const chartType = chartConst.CHART_TYPE_BAR;
      const actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, {});
      const expected = {
        limit: { min: 0, max: 100 },
        step: 20,
        stepCount: 5
      };

      expect(actual).toEqual(expected);
    });

    it('calculate scale, when axis type is datetime', () => {
      const baseValues = [
        new Date('01/01/2016').getTime(),
        new Date('01/03/2016').getTime(),
        new Date('01/06/2016').getTime(),
        new Date('01/10/2016').getTime()
      ];
      const baseSize = 400;
      const chartType = chartConst.CHART_TYPE_BAR;
      const options = {
        type: chartConst.AXIS_TYPE_DATETIME
      };
      const actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);
      const expected = {
        limit: {
          min: new Date('01/01/2016').getTime(),
          max: new Date('01/11/2016').getTime()
        },
        step: scaleDataMaker.millisecondMap.date * 2,
        stepCount: 5
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_calculateCoordinateScale()', () => {
    it('should return limitOption, if there is limitOption', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [10, 20, 30, 40],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: 0,
            max: 100
          }
        }
      });

      expect(scaleData.limit.max).toBe(100);
      expect(scaleData.limit.min).toBe(0);
      expect(scaleData.step).toBe(50);
    });

    it("should set scale data's limit value by baseValues, when limit option is not set", () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [10, 20, 30, 39],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: null,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(40);
      expect(scaleData.limit.min).toBe(0);
      expect(scaleData.step).toBe(10);
    });

    it('should adjust limit.max value, if no limtOption and max value is not zero', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [10, 20, 30, 40],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: null,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(50);
      expect(scaleData.limit.min).toBe(0);
      expect(scaleData.step).toBe(10);
    });

    it('should adjust limit.min value, if no limit option and min value is not zero', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [-10, -20, -30, 0],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: null,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(0);
      expect(scaleData.limit.min).toBe(-40);
      expect(scaleData.step).toBe(10);
    });

    it('should set limit to (min : data - step, max: 0), when base values count is 1, and the value is negative', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [-10],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: null,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(0);
      expect(scaleData.limit.min).toBe(-15);
    });

    it('should set limit to (min : 0, max: data + step), when baseValues count is 1, and the value is positive.', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [10],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: null,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(15);
      expect(scaleData.limit.min).toBe(0);
    });

    it('should set minimum value to zero, when limit.min is zero', () => {
      const scaleData = scaleDataMaker._calculateCoordinateScale({
        baseValues: [0.501, 0.551],
        baseSize: 100,
        overflowItem: null,
        isDiverging: false,
        chartType: 'bar',
        options: {
          limitOption: {
            min: 0,
            max: null
          }
        }
      });

      expect(scaleData.limit.max).toBe(0.6);
      expect(scaleData.limit.min).toBe(0);
    });
  });

  describe('_calculatePercentStackedScale()', () => {
    it('should return chartConst.PERCENT_STACKED_AXIS_RANGE, when sum of negative values is 0', () => {
      const baseValues = [10, 20, 30, 40];
      const actual = scaleDataMaker._calculatePercentStackedScale(baseValues);
      const expected = chartConst.PERCENT_STACKED_AXIS_SCALE;

      expect(actual).toBe(expected);
    });

    it('should return chartConst.MINUS_PERCENT_STACKED_AXIS_RANGE, when sum of positive values is 0', () => {
      const baseValues = [-10, -20, -30, -40];
      const actual = scaleDataMaker._calculatePercentStackedScale(baseValues);
      const expected = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;

      expect(actual).toBe(expected);
    });

    it('should return chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE, when there is diverging option with negatives and positives sum are not 0', () => {
      const baseValues = [-10, 20, -30, 40];
      const actual = scaleDataMaker._calculatePercentStackedScale(baseValues, true);
      const expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;

      expect(actual).toBe(expected);
    });

    it('should return chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE, when there is no diverging option with negatives and positives sum are not 0', () => {
      const baseValues = [-10, 20, -30, 40];
      const actual = scaleDataMaker._calculatePercentStackedScale(baseValues, false);
      const expected = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;

      expect(actual).toBe(expected);
    });
  });

  describe('_getLimitSafely', () => {
    it('get (value +/- 10%) from min, max when baseValue has same values', () => {
      const actual = scaleDataMaker._getLimitSafely([100, 100]);

      expect(actual).toEqual({
        min: 90,
        max: 110
      });
    });
    it('get min = 0, max = value from single value', () => {
      const actual = scaleDataMaker._getLimitSafely([100]);

      expect(actual).toEqual({
        min: 0,
        max: 100
      });
    });
    it('get min = 0, max = 10 from single zero baseValue', () => {
      const actual = scaleDataMaker._getLimitSafely([0, 0]);

      expect(actual).toEqual({
        min: 0,
        max: 10
      });
    });

    it('get min = 0, max = 10 from single zero baseValue of length 1', () => {
      const actual = scaleDataMaker._getLimitSafely([0]);
      expect(actual).toEqual({
        min: 0,
        max: 10
      });
    });
  });

  describe('_isOverflowed()', () => {
    let scaleData;

    beforeEach(() => {
      scaleData = {
        limit: { min: -10, max: 30 },
        step: 10
      };
    });

    it('should check overflowed when there are overflow items', () => {
      const overflowItem = { minItem: [{}] };
      const isOverflowed = scaleDataMaker._isOverflowed(overflowItem, scaleData, {});

      expect(isOverflowed.min).toBe(true);
      expect(isOverflowed.max).toBe(false);
    });

    it('should check overflowed, when scaled min value is same to minimum data value and no min option', () => {
      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: -10, max: 25 },
        false,
        false
      );

      expect(isOverflowed.min).toBe(true);
      expect(isOverflowed.max).toBe(false);
    });

    it('should check overflowed, when scaled max value is same to maximum data value and no max option', () => {
      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: -6, max: 30 },
        false,
        false
      );

      expect(isOverflowed.min).toBe(false);
      expect(isOverflowed.max).toBe(true);
    });

    it('should check overflowed, when scaled min value is same to min option', () => {
      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: -10, max: 25 },
        true,
        false
      );

      expect(isOverflowed).toBe(null);
    });

    it('should check overflowed, when scaled max value is same to max option', () => {
      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: -6, max: 30 },
        false,
        true
      );

      expect(isOverflowed).toBe(null);
    });

    it('should check overflowed, when scaled min value is zero', () => {
      scaleData.limit = { min: 0, max: 30 };
      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: 0, max: 25 },
        false,
        false
      );

      expect(isOverflowed).toBe(null);
    });

    it('should not append step, when scaled max value is zero', () => {
      scaleData.limit = { min: -30, max: 0 };

      const isOverflowed = scaleDataMaker._isOverflowed(
        null,
        scaleData,
        { min: -25, max: 0 },
        false,
        false
      );

      expect(isOverflowed).toBe(null);
    });
  });

  describe('_adjustLimitForOverflow()', () => {
    let limit, step, isOverflowed;

    beforeEach(() => {
      limit = { min: 0.01, max: 0.06 };
      step = 0.01;
      isOverflowed = { min: false, max: false };
    });

    it('should return limit value same to input, if (data.min !== axis.min && data.max !== axis.max)', () => {
      const actual = scaleDataMaker._adjustLimitForOverflow(limit, step, isOverflowed);

      expect(actual.min).toBe(0.01);
      expect(actual.max).toBe(0.06);
    });

    it('should lower limit.min value, if (data.min === axis.min)', () => {
      isOverflowed.min = true;
      const actual = scaleDataMaker._adjustLimitForOverflow(limit, step, isOverflowed);

      expect(actual.min).toBe(0);
      expect(actual.max).toBe(0.06);
    });

    it('should upper limit.max value, if (data.max === axis.max)', () => {
      isOverflowed.max = true;
      const actual = scaleDataMaker._adjustLimitForOverflow(limit, step, isOverflowed);

      expect(actual.min).toBe(0.01);
      expect(actual.max).toBe(0.07);
    });
  });
});
