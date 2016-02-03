/**
 * @fileoverview test LegendModel
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('../../src/js/legends/legendModel'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('test Legend', function() {
    var legendModel;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        legendModel = new LegendModel({
            labels: [
                'legend1',
                'legend2'
            ],
            legendData: [
                {
                    label: 'legend1'
                },
                {
                    label: 'legend2'
                }
            ],
            theme: {
                label: {
                    fontSize: 12
                },
                colors: ['red', 'orange']
            }
        });
    });

    describe('_addSendingDatum()', function() {
        it('chartType이 column이고 index가 1인 sending datum을 하나 추가합니다.', function() {
            var actual, expected;

            legendModel.data[1] = {
                chartType: 'column',
                index: 1
            };
            legendModel._addSendingDatum(1);

            actual = legendModel.checkedIndexesMap.column[1];
            expected = true;

            expect(actual).toBe(expected);
        });
    });


    describe('_initCheckedIndexes()', function() {
        it('범례 checkbox 기능에 사용되는 checkedIndexes를 초기화 합니다.', function() {
            var actual,
                expected;

            legendModel.labelInfos = [
                {
                    chartType: 'column',
                    index: 0
                },
                {
                    chartType: 'column',
                    index: 1
                }
            ];

            legendModel._initCheckedIndexes();

            actual = legendModel.checkedWholeIndexes;
            expected = [true, true];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLabelInfoAppliedTheme()', function() {
        it('테마가 전달받은 레이블 정보에 테마 정보와 index를 적용하여 반환합니다.', function() {
            var labelInfos = [{}, {}],
                theme = {
                    colors: ['red', 'blue'],
                    singleColors: ['yellow', 'green'],
                    borderColor: 'black'
                },
                actual = legendModel._makeLabelInfoAppliedTheme(labelInfos, theme);

            expect(actual[0]).toEqual({
                theme: {
                    color: 'red',
                    singleColor: 'yellow',
                    borderColor: 'black'
                },
                index: 0,
                seriesIndex: 0
            });
            expect(actual[1]).toEqual({
                theme: {
                    color: 'blue',
                    singleColor: 'green',
                    borderColor: 'black'
                },
                index: 1,
                seriesIndex: 1
            });
        });

        it('세번째 파라미터(checkedIndexes)에 값이 있을 경우 해당하는 index에 대해서는 증가값을 부여하고 해당하지 않는 index에 대해서는 -1을 할당합니다.', function() {
            var labelInfos = [{}, {}],
                theme = {
                    colors: ['red', 'blue'],
                    singleColors: ['yellow', 'green'],
                    borderColor: 'black'
                },
                checkedIndexes = [],
                actual;

                checkedIndexes[1] = true;
                actual = legendModel._makeLabelInfoAppliedTheme(labelInfos, theme, checkedIndexes);

            expect(actual[0].seriesIndex).toEqual(-1);
            expect(actual[1].seriesIndex).toEqual(0);
        });
    });

    describe('_setData()', function() {
        it('chartTypes 파라미터에 값이 없으면 labelInfos과 theme으로  _makeLabelInfoAppliedTheme 을 실행하여 바로 반환합니다.', function() {
            var legendData = [{}, {}],
                theme = {
                    colors: ['red', 'blue'],
                    singleColors: ['yellow', 'green'],
                    borderColor: 'black'
                },
                actual, expected;

            legendModel.legendData = legendData;
            legendModel.theme = theme;

            legendModel._setData();

            actual = legendModel.data;
            expected = legendModel._makeLabelInfoAppliedTheme(legendData, theme);

            expect(actual).toEqual(expected);
        });

        it('chartTypes값이 있으면 각 chartType에 해당하는 theme정보를 labelInfo 정보에 설정하여 반환합니다. index는 chartType 별로 구분되서 설정됩니다.', function() {
            var legendData = [{}, {}],
                chartTypes = ['column', 'line'],
                labelMap = {
                    column: ['legend1'],
                    line: ['lgend2']
                },
                theme = {
                    column: {
                        colors: ['red']
                    },
                    line: {
                        colors: ['blue']
                    }
                },
                actual, expected;

            legendModel.legendData = legendData;
            legendModel.theme = theme;
            legendModel.chartTypes = chartTypes;
            legendModel.labels = labelMap;

            legendModel._setData();

            actual = legendModel.data;
            expected = [
                {
                    theme: {
                        color: 'red'
                    },
                    index: 0,
                    seriesIndex: 0
                },
                {
                    theme: {
                        color: 'blue'
                    },
                    index: 0,
                    seriesIndex: 0
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('toggleSelectedIndex()', function() {
        it('selectedIndex와 index가 같지 않으면 index를 selectedIndex에 셋팅합니다.', function() {
            var actual, expected;

            legendModel.toggleSelectedIndex(0);
            actual = legendModel.selectedIndex;
            expected = 0;

            expect(actual).toBe(expected);
        });

        it('selectedIndex와 index가 같으면 null을 셋팅합니다.', function() {
            var actual;

            legendModel.selectedIndex = 0;
            legendModel.toggleSelectedIndex(0);
            actual = legendModel.selectedIndex;

            expect(actual).toBeNull();
        });
    });

    describe('getCheckedIndexes()', function() {
        it('단일 차트의 경우는 체크여부 정보가 담겨있는 단순 배열을 반환합니다.', function() {
            var actual, expected;

            legendModel.checkedIndexesMap = {
                'pie': [true, true]
            };
            legendModel.chartType = 'pie';

            actual = legendModel.getCheckedIndexes();
            expected = [true, true];

            expect(actual).toEqual(expected);
        });

        it('콤보 차트의 경우는 차트 종류를 키로하는 체크여부 정보가 담겨있는 배열을 담고있는 객체를 반환합니다.', function() {
            var actual, expected;

            legendModel.checkedIndexesMap = {
                'column': [true, true],
                'line': [true]
            };
            legendModel.chartType = 'combo';

            actual = legendModel.getCheckedIndexes();
            expected = {
                'column': [true, true],
                'line': [true]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('updateCheckedData()', function() {
        it('checkbox 기능에 해당하는 data를 update 합니다.', function() {
            var actualCheckedIndexesMap, actualCheckedWholeIndexes,
                expectedCheckedIndexesMap, expectedCheckedIndexes;

            legendModel.data = [
                {
                    chartType: 'column',
                    index: 0
                },
                {
                    chartType: 'column',
                    index: 1
                },
                {
                    chartType: 'line',
                    index: 0
                }
            ];

            legendModel.updateCheckedData([0, 2]);

            actualCheckedIndexesMap = legendModel.checkedIndexesMap;
            actualCheckedWholeIndexes = legendModel.checkedWholeIndexes;
            expectedCheckedIndexesMap = {column: [true], line: [true]};
            expectedCheckedIndexes = [];
            expectedCheckedIndexes[0] = true;
            expectedCheckedIndexes[2] = true;

            expect(actualCheckedIndexesMap).toEqual(expectedCheckedIndexesMap);
            expect(actualCheckedWholeIndexes).toEqual(expectedCheckedIndexes);
        });
    });
});
