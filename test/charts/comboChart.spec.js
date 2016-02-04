/**
 * @fileoverview test ComboChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComboChart = require('../../src/js/charts/comboChart.js'),
    DataProcessor = require('../../src/js/helpers/dataProcessor'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js'),
    axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('ComboChart', function() {
    var comboChart;

    beforeAll(function() {
        spyOn(DataProcessor.prototype, 'init').and.returnValue();
    });

    beforeEach(function() {
        comboChart = new ComboChart({
                series: {
                    column: [],
                    line: []
                }
            },
            defaultTheme, {
                chart: {
                    width: 500,
                    height: 400,
                    title: 'Stacked Bar Chart'
                },
                yAxis: [
                    {
                        title: 'Y Axis',
                        chartType: 'line'
                    },
                    {
                        title: 'Right Y Axis'
                    }
                ],
                series: {
                    line: {
                        hasDot: true
                    }
                },
                xAxis: {
                    title: 'X Axis'
                },
                tooltip: {
                    line: {
                        suffix: 'px'
                    },
                    column: {
                        suffix: '%'
                    }
                }
            }
        );
    });

    describe('_getYAxisOptionChartTypes() - y axis 영역 옵션에 설정된 차트 타입을 정렬하여 반환', function() {
        it('옵션이 없을 경우에는 인자로 받은 차트 타입들(data 영역에서 사용하는)을 그대로 반환 합니다.', function () {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line']);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 하나만 있고, chartType 옵션이 포함되지 않았을 경우에는 빈 배열을 반환합니다.', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], {
                title: 'test'
            });

            expect(result).toEqual([]);
        });

        it('옵션이 하나만 있고, chartType 옵션이 있을 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], {
                chartType: 'line'
            });
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                chartType: 'line'
            }]);
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션에 두가지 차트의 옵션이 배열로 포함되어있고 두번째 배열에 chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{}, {
                chartType: 'line'
            }]);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 옵션이 포함되지 않았을 경우에는 빈 배열을 반환합니다.', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                title: 'test'
            }]);
            expect(result).toEqual([]);
        });
    });

    describe('_makeYAxisData()', function() {
        beforeEach(function() {
            spyOn(comboChart.dataProcessor, 'getFormatFunctions').and.returnValue([]);
        });

        it('y axis 영역이 하나일 경우의 axis data를 생성합니다.', function () {
            var actual, expected;

            spyOn(comboChart.dataProcessor, 'getWholeGroupValues').and.returnValue([
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ]);

            comboChart.yAxisOptionsMap = {
                'column': 'yAxisOptions'
            };

            actual = comboChart._makeYAxisData({
                index: 0,
                seriesDimension: {
                    width: 300,
                    height: 300
                },
                chartTypes: ['column', 'line'],
                isOneYAxis: true,
                options: {
                    yAxis: {
                        title: 'Y Axis'
                    }
                }
            });
            expected = {
                labels: [0, 25, 50, 75, 100],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 0,
                    max: 100
                },
                step: 25,
                isVertical: true,
                isPositionRight: false,
                aligned: false,
                options: 'yAxisOptions'
            };

            expect(actual).toEqual(expected);
        });

        it('y axis 영역이 두개일 경우의 axis data 생성합니다.', function () {
            var actual, expected;

            spyOn(comboChart.dataProcessor, 'getGroupValues').and.returnValue([
                [20, 30, 50],
                [40, 40, 60]
            ]);

            comboChart.yAxisOptionsMap = {
                'column': 'yAxisOptions'
            };

            actual = comboChart._makeYAxisData({
                index: 0,
                seriesDimension: {
                    width: 300,
                    height: 300
                },
                chartTypes: ['column', 'line'],
                isOneYAxis: false,
                options: {
                    yAxis: [
                        {
                            title: 'Y Axis'
                        },
                        {
                            title: 'Y Right Axis'
                        }
                    ]
                }
            });

            expected = {
                labels: [10, 20, 30, 40, 50, 60, 70],
                tickCount: 7,
                validTickCount: 7,
                limit: {
                    min: 10,
                    max: 70
                },
                step: 10,
                isVertical: true,
                isPositionRight: false,
                aligned: false,
                options: 'yAxisOptions'
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesData()', function() {
        beforeEach(function() {
            spyOn(comboChart, '_makeYAxisData').and.returnValue({});
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue({});
            spyOn(comboChart.dataProcessor, 'getFormatFunctions').and.returnValue([]);
            spyOn(comboChart.dataProcessor, 'getCategories').and.returnValue([]);
        });

        it('y axis 옵션 정보가 하나일 경우에는 xAxis와 더불어 하나의 yAxis data만 생성합니다.', function() {
            var bounds, actual;

            comboChart.optionChartTypes = [];
            bounds = {
                series: {
                    dimension: {}
                }
            };
            actual = comboChart._makeAxesData(bounds);

            expect(actual.xAxis).toBeDefined();
            expect(actual.yAxis).toBeDefined();
            expect(actual.rightYAxis).not.toBeDefined();
        });

        it('y axis 옵션 정보가 하나일 경우에는 rightYAxis data도 생성합니다.', function() {
            var bounds, actual;

            comboChart.optionChartTypes = ['column', 'line'];

            bounds = {
                series: {
                    dimension: {}
                }
            };
            actual = comboChart._makeAxesData(bounds);

            expect(actual.xAxis).toBeDefined();
            expect(actual.yAxis).toBeDefined();
            expect(actual.rightYAxis).toBeDefined();
        });
    });

    describe('_makeOptionsMap()', function() {
        it('옵션이 있을 경우에는 각 chartType에 맞는 옵션을 추출하여 chartType을 key로 하는 y축 옵션 정보 맵을 생성합니다.', function () {
            var actual;

            comboChart.options = {
                series: {
                    column: {
                        stacked: 'normal'
                    },
                    line: {
                        hasDot: true
                    }
                },
                tooltip: {
                    column: {
                        suffix: '%'
                    },
                    line: {
                        position: 'left top'
                    }
                },
                chartType: 'combo'
            };

            actual = comboChart._makeOptionsMap(['column', 'line']);

            expect(actual.column).toEqual({
                stacked: 'normal'
            });
            expect(actual.line).toEqual({
                hasDot: true
            });
        });
    });

    describe('_makeThemeMap()', function() {
        it('chartType을 key로 하는 테마 맵을 생성합니다.', function () {
            var actual;

            comboChart.theme = {
                series: {
                    colors: ['red', 'orange', 'green', 'blue', 'gray']
                }
            };

            actual = comboChart._makeThemeMap(['column', 'line']);

            expect(actual.column).toBeTruthy();
            expect(actual.line).toBeTruthy();
        });

        it('series의 colors를 하나만 설정하게 되면 두번째 차트의 colors 색상 순서는 첫번째 차트 레이블 갯수에 영향을 받습니다.', function () {
            var actual;

            spyOn(comboChart.dataProcessor, 'getLegendLabels').and.callFake(function(chartType) {
                var legendMap = {
                    column: ['Legend1', 'Legend2'],
                    line: ['Legend1', 'Legend2', 'Legend3']
                };
                return legendMap[chartType];
            });

            comboChart.theme = {
                series: {
                    colors: ['green', 'blue', 'gray', 'red', 'orange']
                }
            };

            actual = comboChart._makeThemeMap(['column', 'line']);

            expect(actual.column.colors).toEqual(['green', 'blue', 'gray', 'red', 'orange']);
            expect(actual.line.colors).toEqual(['gray', 'red', 'orange', 'green', 'blue']);
        });

        it('series의 colors는 차트별로 설정하게 되면 그대로 할당되게 됩니다.', function () {
            var actual;

            comboChart.theme = {
                series: {
                    column: {
                        colors: ['green', 'blue']
                    },
                    line: {
                        colors: ['blue', 'gray', 'red']
                    }
                }
            };

            actual = comboChart._makeThemeMap(['column', 'line']);

            expect(actual.column.colors).toEqual(['green', 'blue']);
            expect(actual.line.colors).toEqual(['blue', 'gray', 'red']);
        });
    });

    describe('_increaseYAxisTickCount()', function() {
        it('전달 인자 만큼의 tick count를 증가시킵니다.(label, limit.max 정보도 동시에 업데이트합니다)', function () {
            var targetTickInfo = {
                tickCount: 4,
                validTickCount: 4,
                limit: {
                    min: 0,
                    max: 60
                },
                step: 20
            };

            comboChart._increaseYAxisTickCount(1, targetTickInfo);

            expect(targetTickInfo).toEqual({
                labels: [0, 20, 40, 60, 80],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 0,
                    max: 80
                },
                step: 20
            });
        });
    });
});
