/**
 * @fileoverview Test for DataProcessor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('../../src/js/dataModels/dataProcessor.js'),
    chartConst = require('../../src/js/const'),
    SeriesDataModel = require('../../src/js/dataModels/seriesDataModel'),
    SeriesGroup = require('../../src/js/dataModels/seriesGroup');

describe('Test for DataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new DataProcessor({}, '', {});
    });

    describe('_processCategories()', function() {
        it('카테고리에 대해 escaping 처리를 합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                categories: ['<div>ABC</div>', 'EFG']
            };

            actual = dataProcessor._processCategories();
            expected = ['&lt;div&gt;ABC&lt;/div&gt;', 'EFG'];

            expect(actual).toEqual(expected);
        });
    });

    describe('isValidAllSeriesDataModel()', function() {
        it('모든 SeriesDataModel이 유효한 seriesGroup을 갖고 있으면 true를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = ['seriesGroup1', 'seriesGroup2'];
            dataProcessor.seriesDataModelMap.line.groups = ['seriesGroup3'];
            dataProcessor.seriesChartTypes = ['column', 'line'];

            actual = dataProcessor.isValidAllSeriesDataModel();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('하나의 그룹이라도 유효한 seriesGroup을 갖고 있지 않으면 false를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = ['seriesGroup1', 'seriesGroup2'];
            dataProcessor.seriesDataModelMap.line.groups = [];
            dataProcessor.seriesChartTypes = ['column', 'line'];

            actual = dataProcessor.isValidAllSeriesDataModel();
            expected = false;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeSeriesGroups()', function() {
        it('객체로 구성된(colum, line) groups의 seriesItem들을 같은 seriesItem index끼리 모아 seriesGroup을 새로 구성하여 반환합니다.', function() {
            var actual;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup(['seriesItem1', 'seriesItem2']),
                new SeriesGroup(['seriesItem3'])
            ];
            dataProcessor.seriesDataModelMap.line.groups = [
                new SeriesGroup(['seriesItem4']),
                new SeriesGroup(['seriesItem5', 'seriesItem6'])
            ];
            dataProcessor.seriesChartTypes = ['column', 'line'];

            actual = dataProcessor._makeSeriesGroups();

            expect(actual.length).toBe(2);
            expect(actual[0].items).toEqual([
                'seriesItem1',
                'seriesItem2',
                'seriesItem4'
            ]);
            expect(actual[1].items).toEqual([
                'seriesItem3',
                'seriesItem5',
                'seriesItem6'
            ]);
        });
    });

    describe('_createValues()', function() {
        it('chartType이 chartConst.DUMMY_KEY일 경우에는 모든 chartType에 속한 sereisItem의 value를 추출 하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.seriesChartTypes = ['column', 'line'];
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: null
                }, {
                    value: 20,
                    start: null
                }])
            ];
            dataProcessor.seriesDataModelMap.line.groups = [
                new SeriesGroup([{
                    value: 30,
                    start: null
                }, {
                    value: 40,
                    start: null
                }])
            ];

            actual = dataProcessor._createValues(chartConst.DUMMY_KEY);
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });

        it('chartType이 정상적인 chart type일 경우에는 해당하는 chartType에 속하는 sereisItem의 value를 추출 하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: null
                }, {
                    value: 30,
                    start: null
                }])
            ];

            actual = dataProcessor._createValues('column');
            expected = [10, 30];

            expect(actual).toEqual(expected);
        });

        it('start값이 null이 아닐경우 포함하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: 5
                }, {
                    value: 30,
                    start: 20
                }])
            ];

            actual = dataProcessor._createValues('column');
            expected = [10, 5, 30, 20];

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

        it('-1000000을 comma형으로 포맷팅하면 "-1,000,000"이 반환됩니다.', function() {
            var result = dataProcessor._formatComma(-1000000);
            expect(result).toBe('-1,000,000');
        });

        it('자리수가 4 미만인 값은 그대로 반환합니다', function() {
            var result = dataProcessor._formatComma(900);
            expect(result).toBe(900);
        });

        it('자리수가 4 미만인 음수 값도 그대로 반환합니다', function() {
            var result = dataProcessor._formatComma(-900);
            expect(result).toBe(-900);
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

            actual = dataProcessor.getMultilineCategories(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            }, ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB']);
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

    describe('_addStartValueToAllSeriesItem()', function() {
        it('limit의 값들이 모두 양수이면 start값을 limit.min으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: 10,
                max: 80
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(10);
        });

        it('limit의 값들이 모두 음수이면 start값을 limit.max으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: -80,
                max: -10
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(-10);
        });

        it('limit의 min은 음수이고 max는 양수이면 start값을 0으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: -40,
                max: 80
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(0);
        });
    });
});
