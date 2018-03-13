/**
 * @fileoverview Test for chartFactory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartFactory = require('../../src/js/factories/chartFactory.js');

describe('Test for chartFactory', function() {
    var TempClass = function() {};

    chartFactory.register('barChart', TempClass);

    describe('_findKey()', function() {
        it('should return chart type, if it is single chart.', function() {
            var actual = chartFactory._findKey('line');

            expect(actual).toBe('line');
        });

        it('should return `columnLineCombo`, if it is combo chart and rawData.series has line and column property.', function() {
            var actual = chartFactory._findKey('combo', {
                series: {
                    line: {},
                    column: {}
                }
            });

            expect(actual).toBe('columnLineCombo');
        });

        it('should return `pieDonutCombo`, if it is combo chart and rawData.series has pie and donut property.', function() {
            var actual = chartFactory._findKey('combo', {
                seriesAlias: {
                    donut: 'pie'
                },
                series: {
                    pie: {},
                    donut: {}
                }
            });

            expect(actual).toBe('pieDonutCombo');
        });

        it('shoud return null, if combined property of rawData.series is not supported type of combo chart', function() {
            var actual = chartFactory._findKey('combo', {
                line: {},
                pie: {}
            });

            expect(actual).toBeNull();
        });
    });

    describe('get()', function() {
        it('should return chart, when requested chart is registered.', function() {
            var chart = chartFactory.get('barChart', {});
            expect(chart).toEqual(jasmine.any(TempClass));
        });

        it('should return chart, when requested chart is not registered.', function() {
            expect(function() {
                chartFactory.get('lineChart', {});
            }).toThrowError('Not exist lineChart chart.');
        });
    });
});
