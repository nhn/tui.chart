/**
 * @fileoverview Test for scaleLabelFormatter.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var scaleLabelFormatter = require('../../../src/js/models/scaleData/scaleLabelFormatter.js');
var chartConst = require('../../../src/js/const');

describe('Test for scaleLabelFormatter', function() {
    describe('_getFormatFunctions()', function() {
        it('get format functions, when is percent stacked chart', function() {
            var chartType = 'bar';
            var stackType = 'percent';
            var actual, expected;

            scaleLabelFormatter.chartType = chartConst.CHART_TYPE_BAR;
            scaleLabelFormatter.stackType = chartConst.PERCENT_STACK_TYPE;
            actual = scaleLabelFormatter._getFormatFunctions(chartType, stackType);
            expected = '10%';

            expect(actual[0](10)).toBe(expected);
        });

        it('get format functions, when is not percent stacked chart', function() {
            var chartType = chartConst.CHART_TYPE_LINE;
            var stackType = '';
            var formatFunctions = 'formatFunctions';
            var actual;

            actual = scaleLabelFormatter._getFormatFunctions(chartType, stackType, formatFunctions);

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
            var actual = scaleLabelFormatter._createScaleValues(scaleData, chartType, diverging);
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
            var actual = scaleLabelFormatter._createScaleValues(scaleData, chartType, diverging);
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

            spyOn(scaleLabelFormatter, '_createScaleValues').and.returnValue([
                (new Date('01/01/2016')),
                (new Date('04/01/2016')),
                (new Date('08/01/2016'))
            ]);

            actual = scaleLabelFormatter.createFormattedLabels(scaleData, typeMap, options);

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

            spyOn(scaleLabelFormatter, '_createScaleValues').and.returnValue([10, 20, 30]);

            actual = scaleLabelFormatter.createFormattedLabels(scaleData, typeMap, options, formatFunctions);

            expect(actual).toEqual([
                'formatted:10',
                'formatted:20',
                'formatted:30'
            ]);
        });
    });
});
