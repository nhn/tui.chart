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

        it('if difference between minimum and maximum value is over month value and' +
            ' it divided by millisecond of month value is less than data count,' +
            ' returns chartConst.DATE_TYPE_DATE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 3, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
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
            ' it divided by millisecond of date value is less than data count,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 3).getTime()
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
            ' it divided by millisecond of hour value is less than data count,' +
            ' returns chartConst.DATE_TYPE_MINUTE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 3).getTime()
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
            ' it divided by millisecond of minute value is less than data count,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 3).getTime()
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
            var chartType = chartConst.CHART_TYPE_BAR;
            var diverging = true;
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues, chartType, diverging);
            var expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 없을 경우에는 chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE 반환합니다.', function() {
            var baseValues = [-10, 20, -30, 40];
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual = scaleDataMaker._calculatePercentStackedScale(baseValues, chartType);
            var expected = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });
    });

    describe('_getFormatFunctions()', function() {
        it('get format functions, when is percent stacked chart', function() {
            var chartType = 'bar';
            var stackType = 'percent';
            var actual, expected;

            scaleDataMaker.chartType = chartConst.CHART_TYPE_BAR;
            scaleDataMaker.stackType = chartConst.PERCENT_STACK_TYPE;
            actual = scaleDataMaker._getFormatFunctions(chartType, stackType);
            expected = '10%';

            expect(actual[0](10)).toBe(expected);
        });

        it('get format functions, when is not percent stacked chart', function() {
            var chartType = chartConst.CHART_TYPE_LINE;
            var stackType = '';
            var formatFunctions = 'formatFunctions';
            var actual;

            actual = scaleDataMaker._getFormatFunctions(chartType, stackType, formatFunctions);

            expect(actual).toBe('formatFunctions');
        });
    });

    describe('_createScaleValues()', function() {
        it('create scale values, when is diverging chart', function() {
            var scaleData = {
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            };
            var chartType = chartConst.CHART_TYPE_BAR;
            var diverging = true;
            var actual = scaleDataMaker._createScaleValues(scaleData, chartType, diverging);
            var expected = [50, 25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });

        it('create scale values, when is not diverging chart', function() {
            var scaleData = {
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            };
            var chartType = chartConst.CHART_TYPE_LINE;
            var diverging = false;
            var actual = scaleDataMaker._createScaleValues(scaleData, chartType, diverging);
            var expected = [-50, -25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });
    });

    describe('createFormattedLabels()', function() {
        it('create formatted scale values, when axis type is datetime', function() {
            var scaleData = {};
            var typeMap = {};
            var options = {
                type: chartConst.AXIS_TYPE_DATETIME,
                dateFormat: 'YYYY.MM'
            };
            var actual;

            spyOn(scaleDataMaker, '_createScaleValues').and.returnValue([
                (new Date('01/01/2016')),
                (new Date('04/01/2016')),
                (new Date('08/01/2016'))
            ]);

            actual = scaleDataMaker.createFormattedLabels(scaleData, typeMap, options);

            expect(actual).toEqual([
                '2016.01',
                '2016.04',
                '2016.08'
            ]);
        });

        it('create formatted scale values, when axis type is not datetime', function() {
            var scaleData = {};
            var typeMap = {
                chartType: chartConst.CHART_TYPE_LINE
            };
            var options = {};
            var formatFunctions = [
                function(value) {
                    return 'formatted:' + value;
                }
            ];
            var actual;

            spyOn(scaleDataMaker, '_createScaleValues').and.returnValue([10, 20, 30]);

            actual = scaleDataMaker.createFormattedLabels(scaleData, typeMap, options, formatFunctions);

            expect(actual).toEqual([
                'formatted:10',
                'formatted:20',
                'formatted:30'
            ]);
        });
    });
});
