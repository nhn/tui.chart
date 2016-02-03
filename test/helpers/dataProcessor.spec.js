/**
 * @fileoverview Test DataProcessor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('../../src/js/helpers/dataProcessor.js');

describe('test DataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new DataProcessor();
    });

    describe('_processCategories()', function() {
        it('카테고리에 대해 escaping 처리를 합니다.', function() {
            var actual = dataProcessor._processCategories([
                    '<div>ABC</div>', 'EFG'
                ]),
                expected = ['&lt;div&gt;ABC&lt;/div&gt;', 'EFG'];

            expect(actual).toEqual(expected);
        });
    });

    describe('_pickValues()', function() {
        it('사용자가 입력한 data에서 value를 추출합니다.', function () {
            var result = DataProcessor.prototype._pickValues([
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

    describe('process()', function() {
        it('사용자 data를 사용하기 좋은 형태로 변환하여 반환합니다.', function () {
            var actual;

            dataProcessor.process({
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
                chart: {
                    format: '0.0'
                },
                chartType: 'column'
            });

            actual = dataProcessor.data;

            expect(actual.categories).toEqual(['cate1', 'cate2', 'cate3']);
            expect(actual.values).toEqual([
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ]);
            expect(actual.wholeValues).toEqual([
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ]);

            expect(actual.formattedValues).toEqual([
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0'],
                ['50.0', '60.0', '10.0', '70.0']
            ]);
            expect(actual.legendLabels).toEqual(['Legend1', 'Legend2', 'Legend3', 'Legend4']);
            expect(actual.wholeLegendData).toEqual([
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

    describe('_makeMultilineCategory()', function() {
        it('카테고리의 너비가 limitWidth를 넘어가지 않으면 그대로 반환합니다.', function() {
            var actual = dataProcessor._makeMultilineCategory('ABCDE FGHIJK', 100, {
                    fontSize: 12,
                    fontFamily: 'Verdana'
                }),
                expected = 'ABCDE FGHIJK';
            expect(actual).toBe(expected);
        });

        it('category를 공백으로 나누고 하나씩 붙여가면서 limitWidth를 넘어가는 부분에 대해 개행처리(<br>)하여 반환합니다.', function() {
            var actual = dataProcessor._makeMultilineCategory('ABCDE FGHIJK HIJKLMN', 40, {
                    fontSize: 12,
                    fontFamily: 'Verdana'
                }),
                expected = 'ABCDE<br>FGHIJK<br>HIJKLMN';
            expect(actual).toBe(expected);
        });

        it('category이 없는 경우에는 개행처리를 하지 않습니다.(공백이 없는 개행처리를 css에서 합니다.)', function() {
            var actual = dataProcessor._makeMultilineCategory('ABCDEFGHIJKHIJKLMN', 40, {
                    fontSize: 12,
                    fontFamily: 'Verdana'
                }),
                expected = 'ABCDEFGHIJKHIJKLMN';
            expect(actual).toBe(expected);
        });
    });

    describe('getMultilineCategories()', function() {
        it('category들 중에서 limitWidth를 기준으로 개행처리를 합니다.', function() {
            var actual, expected;

            dataProcessor.data = {
                categories: ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB']
            };

            actual = dataProcessor.getMultilineCategories(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
            expected = ['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];

            expect(actual).toEqual(expected);
        });

        it('캐쉬가 되어있는 경우에는 캐쉬된 결과를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.data = {
                multilineCategories: ['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB']
            };

            actual = dataProcessor.getMultilineCategories(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
            expected = dataProcessor.data.multilineCategories;

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalPercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var actual = dataProcessor._makePercentValues([[20], [40], [80], [120]], {min: 0, max: 160});
            expect(actual).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('라인차트가 아니면서 모든 데이터가 음수일 경우에는 percentValues도 음수로 표현됩니다.', function () {
            var actual = dataProcessor._makePercentValues([[-20], [-40], [-80], [-120]], {min: 0, max: 160});
            expect(actual).toEqual([[-0.125], [-0.25], [-0.5], [-0.75]]);
        });

        it('라인차트이면서 모두 양수일 경우에는 모든 값에서 limit 최소값을 빼고 계산합니다.', function () {
            var actual = dataProcessor._makePercentValues([[60], [40], [80], [120]], {min: 20, max: 180}, true);
            expect(actual).toEqual([[0.25], [0.125], [0.375], [0.625]]);
        });
    });

    describe('_makeNormalStackedPercentValues()', function() {
        it('stacked 옵션이 "normal"이 모든 데이터가 양수인 percent타입의 values를 생성합니다.', function () {
            var actual = dataProcessor._makeNormalStackedPercentValues([[20, 80], [60, 60], [60, 40], [80, 20]], {min: 0, max: 160}),
                expected = [[0.125, 0.5], [0.375, 0.375], [0.375, 0.25], [0.5, 0.125]];

            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 "normal"이며 모든 데이터가 음수인 percent타입의 values를 생성합니다.', function () {
            var actual = dataProcessor._makeNormalStackedPercentValues([[-20, -80], [-60, -60], [-60, -40], [-80, -20]], {min: 0, max: 160}),
                expected = [[-0.125, -0.5], [-0.375, -0.375], [-0.375, -0.25], [-0.5, -0.125]];

            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 "normal"이며 데이터와 양수와 음수가 섞여있는 percent타입의 values를 생성합니다.', function () {
            var actual = dataProcessor._makeNormalStackedPercentValues([[20, 80], [-60, 60], [-60, -40], [80, -20]], {min: -160, max: 160}),
                expected = [[0.0625, 0.25], [-0.1875, 0.1875], [-0.1875, -0.125], [0.25, -0.0625]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makePercentStackedPercentValues()', function() {
        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var actual = dataProcessor._makePercentStackedPercentValues([[20, 80], [40, 60], [60, 40], [80, 20]]);
            expect(actual).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });

    describe('registerPercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var actual;

            dataProcessor.data = {
                values: [[20], [40], [80], [120]],
                percentValues: {}
            };

            dataProcessor.registerPercentValues({min: 0, max: 160}, null, 'column');

            actual = dataProcessor.data.percentValues.column;

            expect(actual).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('stacked 옵션이 "normal"인 percent타입의 values를 생성합니다.', function () {
            var actual;

            dataProcessor.data = {
                values: [[20, 80], [40, 60], [60, 40], [80, 20]],
                percentValues: {}
            };

            dataProcessor.registerPercentValues({min: 0, max: 160}, 'normal', 'column');

            actual = dataProcessor.data.percentValues.column;

            expect(actual).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });

        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var actual;

            dataProcessor.data = {
                values: [[20, 80], [40, 60], [60, 40], [80, 20]],
                percentValues: {}
            };

            dataProcessor.registerPercentValues({min: 0, max: 160}, 'percent', 'column');

            actual = dataProcessor.data.percentValues.column;

            expect(actual).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });
});
