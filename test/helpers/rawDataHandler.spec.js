/**
 * @fileoverview Test for rawDataHandler.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var rawDataHandler = require('../../src/js/helpers/rawDataHandler.js'),
    chartConst = require('../../src/js/const');

describe('Test for rawDataHandler', function() {
    describe('_pickStacks', function() {
        it('rawSeriesData에서 stack을 추출합니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('stack 값이 없는 경우에는 chartConst.DEFAULT_STACK을 추가합니다.', function() {
            var rawSeriesData = [{
                    data: []
                },
                {
                    data: [],
                    stack: 'stack1'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', chartConst.DEFAULT_STACK];
            expect(actual).toEqual(expected);
        });

        it('중복되지 않은 상태의 추출된 순서대로 반환합니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                },
                {
                    data: [],
                    stack: 'stack2'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('3개 이상인 경우 2개 까지만 반환합니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                },
                {
                    data: [],
                    stack: 'stack3'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('모든 값에 stack 값이 없는 경우에는 defalut stack만을 담은 배열이 반환되어야 합니다.', function() {
            var rawSeriesData = [{
                    data: []
                },
                {
                    data: []
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = [chartConst.DEFAULT_STACK];
            expect(actual).toEqual(expected);
        });
    });

    describe('sortSeriesData()', function() {
        it('stacks의 stack 순서대로 seriesData를 정렬합니다.', function() {
            var rawSriesData = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }],
                stacks = ['st1', 'st2'],
                actual = rawDataHandler.sortSeriesData(rawSriesData, stacks),
                expected = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }];

            expect(actual).toEqual(expected);
        });
    });

    describe('removeSeriesStack()', function() {
        it('seriesData에서 stack 정보를 제거합니다.', function() {
            var rawSriesData = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }],
                actual, expected;

            rawDataHandler.removeSeriesStack(rawSriesData);
            actual = rawSriesData;
            expected = [{
                data: [1, 2, 3]
            }, {
                data: [4, 5, 6]
            }, {
                data: [9, 8, 7]
            }];

            expect(actual).toEqual(expected);
        });
    });
});
