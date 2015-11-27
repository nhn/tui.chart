/**
 * @fileoverview Test dataProcessor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dataProcessor = require('../../src/js/helpers/dataProcessor.js');

describe('test dataProcessor', function() {
    describe('_pickValues()', function() {
        it('사용자가 입력한 data에서 value를 추출합니다.', function () {
            var result = dataProcessor._pickValues([
                {
                    name: 'Legend1',
                    data: [20, 30, 50]
                },
                {
                    name: 'Legend2',
                    data: [40, 40, 60]
                },
                {
                    name: 'Legend3',
                    data: [60, 50, 10]
                },
                {
                    name: 'Legend4',
                    data: [80, 10, 70]
                }
            ]);
            expect(result).toEqual([
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ]);
        });
    });

    describe('_pickLegendLabels()', function() {
        it('사용자가 입력한 data에서 legend label을 추출합니다.', function () {
            var labels = dataProcessor._pickLegendLabels([
                {
                    name: 'Legend1',
                    data: [20, 30, 50]
                },
                {
                    name: 'Legend2',
                    data: [40, 40, 60]
                },
                {
                    name: 'Legend3',
                    data: [60, 50, 10]
                },
                {
                    name: 'Legend4',
                    data: [80, 10, 70]
                }
            ]);
            expect(labels).toEqual(['Legend1', 'Legend2', 'Legend3', 'Legend4']);
        });
    });

    describe('_formatZeroFill()', function() {
        it('1을 길이 3으로 zero fill하면 "001"이 반환됩니다.', function () {
            var result = dataProcessor._formatZeroFill(3, 1);
            expect(result).toBe('001');
        });

        it('22을 길이 4로 zero fill하면 "0022"가 반환됩니다.', function () {
            var result = dataProcessor._formatZeroFill(4, 22);
            expect(result).toBe('0022');
        });
    });

    describe('_formatDecimal()', function() {
        it('1.1111을 소수점 둘째 자리로 포맷팅하면 "1.11"이 반환됩니다.', function () {
            var result = dataProcessor._formatDecimal(2, 1.1111);
            expect(result).toBe('1.11');
        });

        it('1을 소수점 첫째 자리로 포맷팅하면 "1.0"이 반환됩니다.', function () {
            var result = dataProcessor._formatDecimal(1, 1);
            expect(result).toBe('1.0');
        });
    });

    describe('_formatComma()', function() {
        it('1000을 comma형으로 포맷팅하면 "1,000"이 반환됩니다.', function () {
            var result = dataProcessor._formatComma(1000);
            expect(result).toBe('1,000');
        });

        it('100000을 comma형으로 포맷팅하면 "100,000"이 반환됩니다.', function () {
            var result = dataProcessor._formatComma(100000);
            expect(result).toBe('100,000');
        });

        it('1000000을 comma형으로 포맷팅하면 "1,000,000"이 반환됩니다.', function () {
            var result = dataProcessor._formatComma(1000000);
            expect(result).toBe('1,000,000');
        });
    });

    describe('_pickMaxLenUnderPoint()', function() {
        it('입력받은 인자 [1.12, 2.2, 3.33, 4.456]중에 소수점 이하의 길이를 비교하여 제일 긴 길이 3(4.456의 소수점 이하 길이)을 반환합니다.', function () {
            var point = dataProcessor._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
            expect(point).toBe(3);
        });
    });

    describe('_findFormatFunctions()', function() {
        it('포맷 정보가 없을 경우에는 빈 배열을 반환합니다.', function () {
            var result = dataProcessor._findFormatFunctions();
            expect(result).toEqual([]);
        });
        it("포맷이 '0.000'인 경우에는 [_formatDecimal] 반환합니다.(currying되어있는 함수이기 때문에 함수 실행 결과로 테스트 했습니다)", function() {
            var result = dataProcessor._findFormatFunctions('0.000');
            expect(result[0](1000)).toBe('1000.000');
        });

        it("포맷이 '1,000'인 경우에는 [_formatComma] 반환합니다.", function() {
            var result = dataProcessor._findFormatFunctions('1,000');
            expect(result[0](1000)).toBe('1,000');
        });

        it("포맷이 '1,000.00'인 경우에는 [_formatDecimal, _formatComma] 반환합니다.", function() {
            var result = dataProcessor._findFormatFunctions('1,000.00');
            expect(result.length).toBe(2);
            expect(result[1](result[0](1000))).toBe('1,000.00');
        });

        it("포맷이 '0001'인 경우에는 [_formatZeroFill] 반환합니다.", function() {
            var result = dataProcessor._findFormatFunctions('0001');
            expect(result[0](11)).toBe('0011');
        });
    });

    describe('_formatValues()', function() {
        it('단일 차트 data를 "0.0"으로 포맷팅하여 반환합니다.', function () {
            var formatFunctions = dataProcessor._findFormatFunctions('0.0'),
                result = dataProcessor._formatValues([
                    [20, 40, 60, 80],
                    [30, 40, 50, 10],
                    [50, 60, 10, 70]
                ], formatFunctions);
            expect(result).toEqual([
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0'],
                ['50.0', '60.0', '10.0', '70.0']
            ]);
        });

        it('Combo 차트 data를 "0.0"으로 포맷팅하여 반환합니다.', function () {
            var formatFunctions = dataProcessor._findFormatFunctions('0.0'),
                result = dataProcessor._formatValues({
                    column: [
                        [20, 40, 60, 80],
                        [30, 40, 50, 10]
                    ],
                    line: [
                        [50, 60, 10, 70]
                    ]
                }, formatFunctions);
            expect(result).toEqual({
                column: [
                    ['20.0', '40.0', '60.0', '80.0'],
                    ['30.0', '40.0', '50.0', '10.0']

                ],
                line: [
                    ['50.0', '60.0', '10.0', '70.0']
                ]
            });
        });
    });

    describe('convert()', function() {
        it('사용자 data를 사용하기 좋은 형태로 변환하여 반환합니다.', function () {
            var actual = dataProcessor.process({
                categories: ['cate1', 'cate2', 'cate3'],
                series: [
                    {
                        name: 'Legend1',
                        data: [20, 30, 50]
                    },
                    {
                        name: 'Legend2',
                        data: [40, 40, 60]
                    },
                    {
                        name: 'Legend3',
                        data: [60, 50, 10]
                    },
                    {
                        name: 'Legend4',
                        data: [80, 10, 70]
                    }
                ]
            }, {
                format: '0.0'
            }, 'column');

            // formatFunctions는 currying된 functions들로 구성되어있어 function 비교가 불가하여 삭제합니다.
            delete actual.formatFunctions;
            expect(actual.labels).toEqual(['cate1', 'cate2', 'cate3']);
            expect(actual.values).toEqual([
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ]);
            expect(actual.joinValues).toEqual([
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ]);
            expect(actual.joinFormattedValues).toEqual([
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0'],
                ['50.0', '60.0', '10.0', '70.0']
            ]);
            expect(actual.legendLabels).toEqual(['Legend1', 'Legend2', 'Legend3', 'Legend4']);
            expect(actual.joinLegendLabels).toEqual([
                {
                    chartType: 'column',
                    label: 'Legend1'
                },
                {
                    chartType: 'column',
                    label: 'Legend2'
                },
                {
                    chartType: 'column',
                    label: 'Legend3'
                },
                {
                    chartType: 'column',
                    label: 'Legend4'
                }
            ]);
            expect(actual.formattedValues).toEqual([
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0'],
                ['50.0', '60.0', '10.0', '70.0']
            ]);
        });
    });
});
