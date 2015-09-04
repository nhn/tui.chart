/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var converter = require('../../src/js/helpers/dataConverter.js');

describe('test dataConverter', function() {
    describe('_pickValues()', function() {
        it('value 추출', function () {
            var result = converter._pickValues([
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
        it('legend label 추출', function () {
            var labels = converter._pickLegendLabels([
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
        it('"001"타입으로 zero fill한 결과 반환', function () {
            var result = converter._formatZeroFill(3, 1);
            expect(result).toEqual('001');
        });

        it('"0022"타입으로 zero fill한 결과 반환', function () {
            var result = converter._formatZeroFill(4, 22);
            expect(result).toEqual('0022');
        });
    });

    describe('_formatDecimal()', function() {
        it('소수점 둘째 자리로 포맷팅한 결과 반환', function () {
            var result = converter._formatDecimal(2, 1.1111);
            expect(result).toEqual('1.11');
        });

        it('소수점 첫째 자리로 포맷팅한 결과 반환', function () {
            var result = converter._formatDecimal(1, 1);
            expect(result).toEqual('1.0');
        });
    });

    describe('_formatComma()', function() {
        it('1000을 comma형으로 포맷팅한 결과(1,000) 반환', function () {
            var result = converter._formatComma(1000);
            expect(result).toEqual('1,000');
        });

        it('1000000을 comma형으로 포맷팅한 결과(1,000,000) 반환', function () {
            var result = converter._formatComma(1000000);
            expect(result).toEqual('1,000,000');
        });
    });

    describe('_pickMaxLenUnderPoint()', function() {
        it('전달된 소수들의 소수점 이하의 길이를 비교하여 제일 긴 길이 값 반환', function () {
            var point = converter._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
            expect(point).toEqual(3);
        });
    });

    describe('_findFormatFunctions()', function() {
        it('포맷 정보가 없을 경우에는 빈 배열 반환', function () {
            var result = converter._findFormatFunctions();
            expect(result).toEqual([]);
        });
        it("포맷이 '0.000'인 경우에는 [_formatDecimal] 반환", function() {
            var result = converter._findFormatFunctions('0.000');
            expect(result[0](1000)).toEqual('1000.000');
        });

        it("포맷이 '1,000'인 경우에는 [_formatComma] 반환", function() {
            var result = converter._findFormatFunctions('1,000');
            expect(result[0](1000)).toEqual('1,000');
        });

        it("포맷이 '1,000.00'인 경우에는 [_formatDecimal, _formatComma] 반환", function() {
            var result = converter._findFormatFunctions('1,000.00');
            expect(result.length).toEqual(2);
            expect(result[1](result[0](1000))).toEqual('1,000.00');
        });

        it("포맷이 '0001'인 경우에는 [_formatZeroFill] 반환", function() {
            var result = converter._findFormatFunctions('0001');
            expect(result[0](11)).toEqual('0011');
        });
    });

    describe('_formatValues()', function() {
        it('단일 차트일 경우의 포맷팅된 value 반환', function () {
            var formatFunctions = converter._findFormatFunctions('0.0'),
                result = converter._formatValues([
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

        it('Combo 차트일 경우의 포맷팅된 value 반환', function () {
            var formatFunctions = converter._findFormatFunctions('0.0'),
                result = converter._formatValues({
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
        it('사용자 data의 변환 결과 반환', function () {
            var convertData = converter.convert({
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
            delete convertData.formatFunctions;
            expect(convertData).toEqual({
                labels: ['cate1', 'cate2', 'cate3'],
                values: [
                    [20, 40, 60, 80],
                    [30, 40, 50, 10],
                    [50, 60, 10, 70]
                ],
                joinValues: [
                    [20, 40, 60, 80],
                    [30, 40, 50, 10],
                    [50, 60, 10, 70]
                ],
                legendLabels: ['Legend1', 'Legend2', 'Legend3', 'Legend4'],
                joinLegendLabels: [
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
                ],
                formattedValues: [
                    ['20.0', '40.0', '60.0', '80.0'],
                    ['30.0', '40.0', '50.0', '10.0'],
                    ['50.0', '60.0', '10.0', '70.0']
                ]
            });
        });
    });
});
