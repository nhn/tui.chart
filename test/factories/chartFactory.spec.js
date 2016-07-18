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
        it('combo type 차트가 아닌 경우, chart type을 그대로 반환합니다.', function() {
            var actual = chartFactory._findKey('line');

            expect(actual).toBe('line');
        });

        it('combo type 차트의 경우, rawData.series에 column, line이 모두 존재하면 columnLineCombo를 반환합니다.', function() {
            var actual = chartFactory._findKey('combo', {
                series: {
                    line: {},
                    column: {}
                }
            });

            expect(actual).toBe('columnLineCombo');
        });

        it('combo type 차트의 경우, rawData.series에 pie, donut이 모두 존재하면 pieDonutCombo를 반환합니다.', function() {
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

        it('combo type 차트의 경우, rawData.series에 해당하는 조합의 차트명이 존재하지 않으면 null을 반환합니다.', function() {
            var actual = chartFactory._findKey('combo', {
                line: {},
                pie: {}
            });

            expect(actual).toBeNull();
        });
    });

    describe('get()', function() {
        it('등록된 차트를 요청했을 경우에는 차트를 반환합니다.', function() {
            var chart = chartFactory.get('barChart', {});
            expect(chart).toEqual(jasmine.any(TempClass));
        });

        it('등록되지 않은 차트를 요청했을 경우에는 예외를 발생시킵니다.', function() {
            expect(function() {
                chartFactory.get('lineChart', {});
            }).toThrowError('Not exist lineChart chart.');
        });
    });
});
