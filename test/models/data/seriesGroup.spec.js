/**
 * @fileoverview Test for seriesGroup.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesGroup = require('../../../src/js/models/data/seriesGroup');
var SeriesItem = require('../../../src/js/models/data/seriesItem');

describe('Test for seriesGroup', function() {
    var seriesGroup;

    beforeEach(function() {
        seriesGroup = new SeriesGroup();
    });

    describe('_createValues()', function() {
        it('should pick values from all series items', function() {
            var actual, expected;
            seriesGroup.items = [
                new SeriesItem({
                    datum: 10
                }),
                new SeriesItem({
                    datum: 20
                }),
                new SeriesItem({
                    datum: 30
                }),
                new SeriesItem({
                    datum: 40
                })
            ];

            actual = seriesGroup._createValues('value');
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });

        it('should return start value, when series item is range type', function() {
            var actual, expected;
            seriesGroup.items = [
                new SeriesItem({
                    datum: [10, 20]
                }),
                new SeriesItem({
                    datum: [20, 30]
                }),
                new SeriesItem({
                    datum: [30, 40]
                }),
                new SeriesItem({
                    datum: [40, 50]
                })
            ];

            actual = seriesGroup._createValues('value');
            expected = [20, 10, 30, 20, 40, 30, 50, 40];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeValuesMapPerStack()', function() {
        it('should create stacked values from series item', function() {
            var actual, expected;

            seriesGroup.items = [
                new SeriesItem({
                    datum: 10,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 0,
                    stack: 'st1'

                }),
                new SeriesItem({
                    datum: 20,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 1,
                    stack: 'st2'

                }),
                new SeriesItem({
                    datum: 30,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 2,
                    stack: 'st1'

                }),
                new SeriesItem({
                    datum: 40,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 3,
                    stack: 'st2'
                })
            ];

            actual = seriesGroup._makeValuesMapPerStack();
            expected = {
                st1: [10, 30],
                st2: [20, 40]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumMapPerStack()', function() {
        it('should replace each stack data to sum of values', function() {
            var actual, expected;

            seriesGroup.items = [
                new SeriesItem({
                    datum: 10,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 0,
                    stack: 'st1'

                }),
                new SeriesItem({
                    datum: 20,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 1,
                    stack: 'st2'

                }),
                new SeriesItem({
                    datum: 30,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 2,
                    stack: 'st1'

                }),
                new SeriesItem({
                    datum: 40,
                    chartType: 'bar',
                    formatFunctions: [],
                    index: 3,
                    stack: 'st2'
                })
            ];

            actual = seriesGroup._makeSumMapPerStack();
            expected = {
                st1: 40,
                st2: 60
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('addRatiosWhenPercentStacked()', function() {
        it('should calculate dividing number, when percent stack chart.', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesItem.stack = 'st';
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatiosWhenPercentStacked(0.5);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(20, 0, 0.5);
        });
    });

    describe('addRatiosWhenDivergingStacked()', function() {
        it('should send dividing number and 0.5 when diverging chart. dividing number should be selected from plus or minus sum', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatiosWhenDivergingStacked(30, 20);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(30, 0, 0.5);
        });
    });

    describe('addRatios()', function() {
        it('should send a dividing number and substraction value to addRatio()', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatios(20, 10);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(20, 10);
        });
    });
});
