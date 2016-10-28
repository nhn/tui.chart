/**
 * @fileoverview Test for verticalTypeComboChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnLineComboChart = require('../../src/js/charts/columnLineComboChart.js');
var defaultTheme = require('../../src/js/themes/defaultTheme.js');

describe('Test for verticalTypeComboChart', function() {
    var verticalTypeComboChart, scaleDataModel;

    beforeEach(function() {
        scaleDataModel = jasmine.createSpyObj('scaleDataModel', ['addScale']);
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
        verticalTypeComboChart.scaleDataModel = scaleDataModel;
    });

    describe('_getYAxisOptionChartTypes() - y axis 영역 옵션에 설정된 차트 타입을 정렬하여 반환', function() {
        it('옵션이 없을 경우에는 빈 배열을 반환합니다.', function() {
            var result = verticalTypeComboChart._getYAxisOptionChartTypes(['column', 'line']);
            expect(result).toEqual([]);
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
