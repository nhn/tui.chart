/**
 * @fileoverview Test DataProcessor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('../../src/js/helpers/dataProcessor.js'),
    chartConst = require('../../src/js/const');

describe('test DataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new DataProcessor({}, {});
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

    describe('_createItems()', function() {
        it('rawSeriesDatum에서 stack, value를 추출하고 formattedValue를 생성하여 추가합니다.', function() {
            var actual, expected;

            spyOn(dataProcessor, 'getFormatFunctions').and.returnValue([
                function(value) {
                    return '00' + value;
                }
            ]);

            actual = dataProcessor._createItems({
                stack: 'st',
                data: [1, 2]
            });
            expected = [{
                stack: 'st',
                value: 1,
                formattedValue: '001'
            }, {
                stack: 'st',
                value: 2,
                formattedValue: '002'
            }];

            expect(actual).toEqual(expected);
        });

        it('stack이 없을 경우에는 DEFAULT_STACK을 추가합니다.', function() {
            var actual, expected;

            spyOn(dataProcessor, 'getFormatFunctions').and.returnValue([
                function(value) {
                    return '00' + value;
                }
            ]);

            actual = dataProcessor._createItems({
                data: [1, 2]
            });
            expected = [{
                stack: chartConst.DEFAULT_STACK,
                value: 1,
                formattedValue: '001'
            }, {
                stack: chartConst.DEFAULT_STACK,
                value: 2,
                formattedValue: '002'
            }];

            expect(actual).toEqual(expected);
        });
    });

    describe('_pickGroupItemsFromRawData()', function() {
        it('rawData.series에서 전달한 callback function에 해당하는 item을 추출합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
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
            };

            spyOn(dataProcessor, '_createItems').and.callFake(function(item) {
                return item.data;
            });
            actual = dataProcessor._pickGroupItemsFromRawData();
            expected = [
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ];

            expect(actual).toEqual(expected);
        });

        it('rawData.series가 객체로 구성된 경우(combo chart)에는 객체 형태로 반환합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                series: {
                    column: [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50]
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60]
                        }
                    ],
                    line: [
                        {
                            name: 'Legend3',
                            data: [60, 50, 10]
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70]
                        }
                    ]
                }
            };

            spyOn(dataProcessor, '_createItems').and.callFake(function(item) {
                return item.data;
            });
            actual = dataProcessor._pickGroupItemsFromRawData();
            expected = {
                column: [
                    [20, 40],
                    [30, 40],
                    [50, 60]
                ],
                line: [
                    [60, 80],
                    [50, 10],
                    [10, 70]
                ]
            };

            expect(actual).toEqual(expected);
        });
    });


    describe('_makeWholeGroupItems()', function() {
        it('차트 타입별로 분리된 gropuItems를 하나로 모아서 반환합니다.', function() {
            var actual, expected;

            dataProcessor.groupItems = {
                column: [[{
                    value: 40
                }]],
                line: [[{
                    value: 60
                }]]
            };

            dataProcessor.seriesChartTypes = ['column', 'line'];
            actual = dataProcessor._makeWholeGroupItems();
            expected = [[{
                value: 40
            },
            {
                value: 60
            }]];

            expect(actual).toEqual(expected);
        });

        it('분리되지 않은 gropuItems는 그대로 반환합니다.', function() {
            var actual, expected;

            dataProcessor.groupItems = [[{
                value: 40
            },
            {
                value: 60
            }]];

            actual = dataProcessor._makeWholeGroupItems();
            expected = [[{
                value: 40
            },
            {
                value: 60
            }]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeWholeItems()', function() {
        it('차트 타입별로 분리된 gropuItems의 item들을 1차원 배열로 만들어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.groupItems = {
                column: [[{
                    value: 40
                }]],
                line: [[{
                    value: 60
                }]]
            };

            dataProcessor.seriesChartTypes = ['column', 'line'];
            actual = dataProcessor._makeWholeItems();
            expected = [{
                value: 40
            },
            {
                value: 60
            }];

            expect(actual).toEqual(expected);
        });

        it('분리되지 않은 gropuItems의 item들을 1차원 배열로 만들어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.groupItems = [[{
                value: 40
            },
            {
                value: 60
            }]];

            actual = dataProcessor._makeWholeItems();
            expected = [{
                value: 40
            },
            {
                value: 60
            }];

            expect(actual).toEqual(expected);
        });
    });

    describe('_pickLegendLabels()', function() {
        it('사용자가 입력한 data에서 legend label을 추출합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
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
            };
            actual = dataProcessor._pickLegendLabels();
            expected = ['Legend1', 'Legend2', 'Legend3', 'Legend4'];

            expect(actual).toEqual(expected);
        });
    });

    describe('_formatZeroFill()', function() {
        it('1을 길이 3으로 zero fill하면 "001"이 반환됩니다.', function() {
            var result = dataProcessor._formatZeroFill(3, 1);
            expect(result).toBe('001');
        });

        it('22을 길이 4로 zero fill하면 "0022"가 반환됩니다.', function() {
            var result = dataProcessor._formatZeroFill(4, 22);
            expect(result).toBe('0022');
        });
    });

    describe('_formatDecimal()', function() {
        it('1.1111을 소수점 둘째 자리로 포맷팅하면 "1.11"이 반환됩니다.', function() {
            var result = dataProcessor._formatDecimal(2, 1.1111);
            expect(result).toBe('1.11');
        });

        it('1을 소수점 첫째 자리로 포맷팅하면 "1.0"이 반환됩니다.', function() {
            var result = dataProcessor._formatDecimal(1, 1);
            expect(result).toBe('1.0');
        });
    });

    describe('_formatComma()', function() {
        it('1000을 comma형으로 포맷팅하면 "1,000"이 반환됩니다.', function() {
            var result = dataProcessor._formatComma(1000);
            expect(result).toBe('1,000');
        });

        it('100000을 comma형으로 포맷팅하면 "100,000"이 반환됩니다.', function() {
            var result = dataProcessor._formatComma(100000);
            expect(result).toBe('100,000');
        });

        it('1000000을 comma형으로 포맷팅하면 "1,000,000"이 반환됩니다.', function() {
            var result = dataProcessor._formatComma(1000000);
            expect(result).toBe('1,000,000');
        });

        it('자리수가 4 미만인 값은 그대로 반환합니다', function() {
            var result = dataProcessor._formatComma(900);
            expect(result).toBe(900);
        });

        it('소수점이 포함된 경우 소수점을 고려하여 포맷팅합니다', function() {
            var result = dataProcessor._formatComma(1000.123);
            expect(result).toBe('1,000.123');
        });
    });

    describe('_pickMaxLenUnderPoint()', function() {
        it('입력받은 인자 [1.12, 2.2, 3.33, 4.456]중에 소수점 이하의 길이를 비교하여 제일 긴 길이 3(4.456의 소수점 이하 길이)을 반환합니다.', function() {
            var point = dataProcessor._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
            expect(point).toBe(3);
        });
    });

    describe('_findFormatFunctions()', function() {
        it('포맷 정보가 없을 경우에는 빈 배열을 반환합니다.', function() {
            var result = dataProcessor._findFormatFunctions();
            expect(result).toEqual([]);
        });

        it('포맷이 0.000인 경우에는 [_formatDecimal] 반환합니다.(currying되어있는 함수이기 때문에 함수 실행 결과로 테스트 했습니다)', function() {
            var actual, expected;

            dataProcessor.options = {
                chart: {
                    format: '0.000'
                }
            };
            actual = dataProcessor._findFormatFunctions();
            expected = '1000.000';

            expect(actual[0](1000)).toBe(expected);
        });

        it('포맷이 1,000인 경우에는 [_formatComma] 반환합니다.', function() {
            var actual, expected;

            dataProcessor.options = {
                chart: {
                    format: '1,000'
                }
            };
            actual = dataProcessor._findFormatFunctions();
            expected = '1,000';

            expect(actual[0](1000)).toBe(expected);
        });

        it('포맷이 1,000.00인 경우에는 [_formatDecimal, _formatComma] 반환합니다.', function() {
            var actual, expected;

            dataProcessor.options = {
                chart: {
                    format: '1,000.00'
                }
            };
            actual = dataProcessor._findFormatFunctions();
            expected = '1,000.00';

            expect(actual.length).toBe(2);
            expect(actual[1](actual[0](1000))).toBe(expected);
        });

        it('포맷이 0001인 경우에는 [_formatZeroFill] 반환합니다.', function() {
            var actual, expected;

            dataProcessor.options = {
                chart: {
                    format: '0001'
                }
            };
            actual = dataProcessor._findFormatFunctions();
            expected = '0011';

            expect(actual[0](11)).toBe(expected);
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

            dataProcessor.categories = ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];

            actual = dataProcessor.getMultilineCategories(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
            expected = ['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];

            expect(actual).toEqual(expected);
        });

        it('캐쉬가 되어있는 경우에는 캐쉬된 결과를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.multilineCategories = ['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];

            actual = dataProcessor.getMultilineCategories(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
            expected = dataProcessor.multilineCategories;

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatios()', function() {
        it('옵션이 없는 차트의 groupItems에 ratio 정보를 추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: 20
                },
                {
                    value: 40
                }]
            ];
            dataProcessor._addRatios('bar', {min: 0, max: 80});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(0.25);
            expect(items[1].ratio).toBe(0.5);
        });

        it('라인차트가 아니면서 모든 데이터가 음수일 경우에는 모든 값에 limit.max값을 더하여 ratio를 계산합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: -40
                },
                {
                    value: -60
                }]
            ];
            dataProcessor._addRatios('bar', {min: -100, max: -20});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(-0.25);
            expect(items[1].ratio).toBe(-0.5);
        });

        it('라인차트이면서 모두 양수일 경우에는 모든 값에서 limit 최소값을 빼고 계산합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: 20
                },
                {
                    value: 40
                }]
            ];
            dataProcessor._addRatios('bar', {min: 10, max: 90});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(0.125);
            expect(items[1].ratio).toBe(0.375);
        });
    });

    describe('_addRatiosWhenNormalStacked()', function() {
        it('normal stacked 옵션이며 라인타입 차트가 아닌 경우에는 _addRatios()와 동일하게 limit.min, limit.max의 간격 기준으로 ratio를 구하여 추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: 20
                },
                {
                    value: 40
                }]
            ];

            dataProcessor._addRatiosWhenNormalStacked('bar', {min: 0, max: 80});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(0.25);
            expect(items[1].ratio).toBe(0.5);
        });

        it('라인타입 차트(영역)가 아니며 음수인 경우에는 _addRatios()와 달리 limit.min, limit.max의 간격 기준으로 ratio를 구하여 추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: -20
                },
                {
                    value: -40
                }]
            ];

            dataProcessor._addRatiosWhenNormalStacked('bar', {min: 0, max: 80});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(-0.25);
            expect(items[1].ratio).toBe(-0.5);
        });

        it('영역(라인타입) 차트이면서 모두 양수인 경우에는 _addRatios()와 달리 limit.min, limit.max의 간격 기준으로 ratio를 구하여 추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: 20
                },
                {
                    value: 40
                }]
            ];

            dataProcessor._addRatiosWhenNormalStacked('area', {min: 0, max: 80});
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(0.25);
            expect(items[1].ratio).toBe(0.5);
        });
    });

    describe('_makeFlattenValues()', function() {
        it('groupItems에서 value를 추출한 후 1차원 배열로 만들어 반환합니다.', function() {
            var groupItems = [[{
                    value: 20
                },
                {
                    value: 40
                }]],
                actual = dataProcessor._makeFlattenValues(groupItems),
                expected = [20, 40];

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateBaseRatio()', function() {
        it('groupItems에서 values 추출한 후 values에 음수와 양수 모두 포함되어있으면 0.5를 반환합니다.', function() {
            var groupItems = [[{
                    value: -20
                },
                {
                    value: 40
                }]],
                actual = dataProcessor._calculateBaseRatio(groupItems),
                expected = 0.5;

            expect(actual).toEqual(expected);
        });

        it('groupItems에서 values 추출한 후 values에 음수와 양수 중 하나만 존재하면 1을 반환합니다.', function() {
            var groupItems = [[{
                    value: 20
                },
                {
                    value: 40
                }]],
                actual = dataProcessor._calculateBaseRatio(groupItems),
                expected = 1;

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumMapPerStack()', function() {
        it('items에서 stack 기준으로 합산하여 sum map을 생성한 후 반환합니다.', function() {
            var items = [{
                    value: 20,
                    stack: 'st1'
                },
                {
                    value: 40,
                    stack: 'st1'
                },
                {
                    value: 10,
                    stack: 'st2'
                },
                {
                    value: 30,
                    stack: 'st2'
                }],
                actual = dataProcessor._makeSumMapPerStack(items),
                expected = {
                    st1: 60,
                    st2: 40
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatiosWhenPercentStacked()', function() {
        it('percent stacked 옵션인 경우의 ratio를 계산하여 추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: 40
                },
                {
                    value: 60
                }]
            ];

            dataProcessor._addRatiosWhenPercentStacked('bar');
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(0.4);
            expect(items[1].ratio).toBe(0.6);
        });

        it('음수와 양수가 섞인 경우에는 계산된 ratio의 50%에 해당하는 ratio를  추가합니다.', function() {
            var items;

            dataProcessor.groupItems = [
                [{
                    value: -40
                },
                {
                    value: 60
                }]
            ];

            dataProcessor._addRatiosWhenPercentStacked('bar');
            items = dataProcessor.groupItems[0];

            expect(items[0].ratio).toBe(-0.2);
            expect(items[1].ratio).toBe(0.3);
        });
    });

    describe('addDataRatios()', function() {
        it('옵션이 없는 경우에는 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatios');

            dataProcessor.addDataRatios({min: 0, max: 160}, null, 'column');

            expect(dataProcessor._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 normal stacked인 경우에는 _addRatiosWhenNormalStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatiosWhenNormalStacked');

            dataProcessor.addDataRatios({min: 0, max: 160}, 'normal', 'bar');

            expect(dataProcessor._addRatiosWhenNormalStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 normal stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatios');

            dataProcessor.addDataRatios({min: 0, max: 160}, 'normal', 'line');

            expect(dataProcessor._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 diverging percent stacked인 경우에는 _addRatiosWhenDivergingStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatiosWhenDivergingStacked');

            dataProcessor.divergingOption = true;
            dataProcessor.addDataRatios({min: 0, max: 160}, 'percent', 'bar');

            expect(dataProcessor._addRatiosWhenDivergingStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 percent stacked인 경우에는 _addRatiosWhenPercentStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatiosWhenPercentStacked');

            dataProcessor.addDataRatios({min: 0, max: 160}, 'percent', 'bar');

            expect(dataProcessor._addRatiosWhenPercentStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 percent stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(dataProcessor, '_addRatios');

            dataProcessor.addDataRatios({min: 0, max: 160}, 'percent', 'line');

            expect(dataProcessor._addRatios).toHaveBeenCalled();
        });
    });
});
