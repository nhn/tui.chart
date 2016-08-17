/**
 * @fileoverview Test for ColumnLineComboChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnLineComboChart = require('../../src/js/charts/columnLineComboChart.js');
var chartConst = require('../../src/js/const');
var defaultTheme = require('../../src/js/themes/defaultTheme.js');
var axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('Test for ColumnLineComboChart', function() {
    var verticalTypeComboChart;

    beforeEach(function() {
        verticalTypeComboChart = new ColumnLineComboChart(
            {
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
                        showDot: true
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
        it('옵션이 없을 경우에는 인자로 받은 차트 타입들(data 영역에서 사용하는)을 그대로 반환 합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line']);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 하나만 있고, chartType 옵션이 포함되지 않았을 경우에는 빈 배열을 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line'], {
                title: 'test'
            });

            expect(result).toEqual([]);
        });

        it('옵션이 하나만 있고, chartType 옵션이 있을 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line'], {
                chartType: 'line'
            });
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                chartType: 'line'
            }]);
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션에 두가지 차트의 옵션이 배열로 포함되어있고 두번째 배열에 chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line'], [{}, {
                chartType: 'line'
            }]);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 옵션이 포함되지 않았을 경우에는 빈 배열을 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                title: 'test'
            }]);
            expect(result).toEqual([]);
        });
    });

    describe('_createYAxisScaleMaker()', function() {
        it('create AxisScaleMake for y axis, when single y axis', function() {
            var actual;

            spyOn(verticalTypeComboChart, '_createAxisScaleMaker').and.returnValue('instance of AxisScaleMaker');

            verticalTypeComboChart.chartTypes = ['column', 'line'];
            verticalTypeComboChart.yAxisOptionsMap = {
                column: {
                    title: 'yAxis'
                }
            };
            verticalTypeComboChart.options.series = {
                column: {
                    stackType: chartConst.NORMAL_STACK_TYPE
                }
            };

            actual = verticalTypeComboChart._createYAxisScaleMaker(0, true);

            expect(actual).toBe('instance of AxisScaleMaker');
            expect(verticalTypeComboChart._createAxisScaleMaker).toHaveBeenCalledWith({
                title: 'yAxis'
            }, 'yAxis', null, 'column', {
                isSingleYAxis: true,
                chartType: 'column',
                stackType: chartConst.NORMAL_STACK_TYPE
            });
        });

        it('create AxisScaleMake for y axis, when not single y axis', function() {
            var actual;

            spyOn(verticalTypeComboChart, '_createAxisScaleMaker').and.returnValue('instance of AxisScaleMaker');

            verticalTypeComboChart.chartTypes = ['line'];
            verticalTypeComboChart.yAxisOptionsMap = {
                line: {
                    title: 'yAxis'
                }
            };

            actual = verticalTypeComboChart._createYAxisScaleMaker(0);

            expect(actual).toBe('instance of AxisScaleMaker');
            expect(verticalTypeComboChart._createAxisScaleMaker).toHaveBeenCalledWith({
                title: 'yAxis'
            }, 'yAxis', null, 'line', {
                isSingleYAxis: false
            });
        });
    });

    describe('_makeAxisScaleMakerMap()', function() {
        it('combo chart의 AxisScaleMakerMap을 만듭니다.', function() {
            var actual;

            spyOn(verticalTypeComboChart, '_createYAxisScaleMaker').and.returnValue('instance of AxisScaleMaker');
            verticalTypeComboChart.optionChartTypes = [];

            actual = verticalTypeComboChart._makeAxisScaleMakerMap();

            expect(actual).toEqual({
                yAxis: 'instance of AxisScaleMaker'
            });
            expect(verticalTypeComboChart._createYAxisScaleMaker).toHaveBeenCalledWith(0, true);
        });

        it('optionChartTypes가 두개일 경우에는 axisScaleMakerMap.rightYAxis도 생성합니다.', function() {
            var actual;

            spyOn(verticalTypeComboChart, '_createYAxisScaleMaker').and.returnValue('instance of AxisScaleMaker');
            verticalTypeComboChart.optionChartTypes = ['column', 'line'];

            actual = verticalTypeComboChart._makeAxisScaleMakerMap();

            expect(actual).toEqual({
                yAxis: 'instance of AxisScaleMaker',
                rightYAxis: 'instance of AxisScaleMaker'
            });
            expect(verticalTypeComboChart._createYAxisScaleMaker).toHaveBeenCalledWith(0, false);
            expect(verticalTypeComboChart._createYAxisScaleMaker).toHaveBeenCalledWith(1);
        });
    });

    describe('_makeAxesData()', function() {
        beforeEach(function() {
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue({});
            spyOn(verticalTypeComboChart.dataProcessor, 'getFormatFunctions').and.returnValue([]);
            spyOn(verticalTypeComboChart.dataProcessor, 'getCategories').and.returnValue([]);
        });

        it('y axis 옵션 정보가 하나일 경우에는 xAxis와 더불어 하나의 yAxis data만 생성합니다.', function() {
            var bounds, actual;

            verticalTypeComboChart.optionChartTypes = [];
            bounds = {
                series: {
                    dimension: {}
                }
            };
            actual = verticalTypeComboChart._makeAxesData(bounds);

            expect(actual.xAxis).toBeDefined();
            expect(actual.yAxis).toBeDefined();
            expect(actual.rightYAxis).not.toBeDefined();
        });

        it('y axis 옵션 정보가 하나일 경우에는 rightYAxis data도 생성합니다.', function() {
            var bounds, actual;

            verticalTypeComboChart.optionChartTypes = ['column', 'line'];

            bounds = {
                series: {
                    dimension: {}
                }
            };
            actual = verticalTypeComboChart._makeAxesData(bounds);

            expect(actual.xAxis).toBeDefined();
            expect(actual.yAxis).toBeDefined();
            expect(actual.rightYAxis).toBeDefined();
        });
    });

    describe('_increaseYAxisTickCount()', function() {
        it('전달 인자 만큼의 tick count를 증가시킵니다.(label, limit.max 정보도 동시에 업데이트합니다)', function() {
            var targetTickInfo = {
                tickCount: 4,
                validTickCount: 4,
                limit: {
                    min: 0,
                    max: 60
                },
                step: 20
            };

            verticalTypeComboChart._increaseYAxisTickCount(1, targetTickInfo);

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
