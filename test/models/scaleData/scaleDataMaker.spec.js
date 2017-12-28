/**
 * @fileoverview Test for ScaleDataMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var scaleDataMaker = require('../../../src/js/models/scaleData/scaleDataMaker.js');
var chartConst = require('../../../src/js/const');

describe('Test for ScaleDataMaker', function() {
    describe('_makeLimitForDivergingOption()', function() {
        it('Make diverging chart centered by adjust min, max value', function() {
            var actual = scaleDataMaker._makeLimitForDivergingOption({
                    min: -20,
                    max: 10
                }),
                expected = {
                    min: -20,
                    max: 20
                };

            expect(actual).toEqual(expected);
        });
    });
    describe('_findDateType()', function() {
        it('if difference between minimum and maximum value is over year value,' +
                    ' returns chartConst.DATE_TYPE_YEAR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2018, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_YEAR);
        });

        it('if difference between minimum and maximum value is over year value and' +
                    ' it divided by millisecond of year value is less than data count,' +
                    ' returns chartConst.DATE_TYPE_MONTH', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2011, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 24);

            expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
        });

        it('if difference between minimum and maximum value is over month value,' +
            ' returns chartConst.DATE_TYPE_MONTH', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 12, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
        });

        it('if difference between minimum and maximum value is over week value and' +
            ' it divided by millisecond of month value is less than data count and 2 weeks,' +
            ' returns chartConst.DATE_TYPE_WEEK', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 13).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
        });

        it('if difference between minimum and maximum value is over month value and' +
            ' it divided by millisecond of month value is less than data count and over 2 weeks,' +
            ' returns chartConst.DATE_TYPE_WEEK', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 15).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_WEEK);
        });

        it('if difference between minimum and maximum value is over date value,' +
            ' returns chartConst.DATE_TYPE_DATE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 10).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
        });

        it('if difference between minimum and maximum value is over date value and' +
            ' it divided by millisecond of date value exceeded 2 days,' +
            ' returns chartConst.DATE_TYPE_DATE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
        });

        it('if difference between minimum and maximum value is over date value and' +
            ' it divided by millisecond of date value is less than data count,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 2).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
        });

        it('if difference between minimum and maximum value is over hour value,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 13).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
        });

        it('if difference between minimum and maximum value is over hour value and' +
            ' it divided by millisecond of hour value exceeded 2 hours,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
        });

        it('if difference between minimum and maximum value is over hour value and' +
            ' it divided by millisecond of hour value is less than data count,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 2).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
        });

        it('if difference between minimum and maximum value is over minute value,' +
            ' returns chartConst.DATE_TYPE_MINUTE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 12).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
        });

        it('if difference between minimum and maximum value is over minute value and' +
            ' it divided by millisecond of minute value exceeded 2 minutes,' +
            ' returns chartConst.DATE_TYPE_MINUTE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
        });

        it('if difference between minimum and maximum value is over minute value and' +
            ' it divided by millisecond of minute value is less than data count,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 2).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if difference between minimum and maximum value is over second value,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 12).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if difference between minimum and maximum value is over second value and' +
            ' it divided by millisecond of second value is less than data count,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 6).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if minimum and maximum value are same, returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });
    });

    describe('makeScaleData()', function() {
        it('calculate coordinate scale.', function() {
            var baseValues = [10, 20, 40, 90];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, {});
            var expected = {
                limit: {min: 0, max: 100},
                step: 20,
                stepCount: 5
            };

            expect(actual).toEqual(expected);
        });

        it('calculate scale, when axis type is datetime', function() {
            var baseValues = [
                (new Date('01/01/2016')).getTime(),
                (new Date('01/03/2016')).getTime(),
                (new Date('01/06/2016')).getTime(),
                (new Date('01/10/2016')).getTime()
            ];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var options = {
                type: chartConst.AXIS_TYPE_DATETIME
            };
            var actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);
            var expected = {
                limit: {
                    min: (new Date('01/01/2016')).getTime(),
                    max: (new Date('01/11/2016')).getTime()
                },
                step: scaleDataMaker.millisecondMap.date * 2,
                stepCount: 5
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateCoordinateScale()', function() {
        it('limitOption 값이 있는 경우 옵션의 min, max를 반환합니다.', function() {
            var scaleData = scaleDataMaker._calculateCoordinateScale([10, 20, 30, 40], 100, null, false, {
                limitOption: {
                    min: 0,
                    max: 100
                }});

            expect(scaleData.limit.max).toBe(100);
            expect(scaleData.limit.min).toBe(0);
            expect(scaleData.step).toBe(50);
        });

        it('scaleData를 반환합니다.', function() {
            var scaleData = scaleDataMaker._calculateCoordinateScale([10, 20, 30, 40], 100, null, false, {
                min: null,
                max: null
            });

            expect(scaleData.limit.max).toBe(40);
            expect(scaleData.limit.min).toBe(0);
            expect(scaleData.step).toBe(10);
        });

        it('data가 한개이며 음수인 경우 (min : data, max: 0)을 반환합니다.', function() {
            var scaleData = scaleDataMaker._calculateCoordinateScale([-10], 100, null, false, {
                min: null,
                max: null
            });

            expect(scaleData.limit.max).toBe(0);
            expect(scaleData.limit.min).toBe(-10);
        });

        it('data가 한개이며 양수인 경우 (min : 0, max: data)를 반환합니다.', function() {
            var scaleData = scaleDataMaker._calculateCoordinateScale([10], 100, null, false, {
                min: null,
                max: null
            });

            expect(scaleData.limit.max).toBe(10);
            expect(scaleData.limit.min).toBe(0);
        });
    });
    describe('_calculatePercentStackedScale()', function() {
        it('음수의 합이 0일 경우에는 chartConst.PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [10, 20, 30, 40];
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues);
            var expected = chartConst.PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('양수의 합이 0일 경우에는 chartConst.MINUS_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [-10, -20, -30, -40];
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues);
            var expected = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 있을 경우에는 chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [-10, 20, -30, 40];
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues, true);
            var expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 없을 경우에는 chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE 반환합니다.', function() {
            var baseValues = [-10, 20, -30, 40];
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues, false);
            var expected = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });
    });

    describe('_getLimitSafely', function() {
        it('get (value +/- 10%) from min, max when baseValue has same values', function() {
            var actual = scaleDataMaker._getLimitSafely([100, 100]);

            expect(actual).toEqual({
                min: 90,
                max: 110
            });
        });
        it('get min = 0, max = value from single value', function() {
            var actual = scaleDataMaker._getLimitSafely([100]);

            expect(actual).toEqual({
                min: 0,
                max: 100
            });
        });
        it('get min = 0, max = 10 from single zero baseValue', function() {
            var actual = scaleDataMaker._getLimitSafely([0, 0]);

            expect(actual).toEqual({
                min: 0,
                max: 10
            });
        });
    });
});
