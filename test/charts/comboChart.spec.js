/**
 * @fileoverview test ComboChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComboChart = require('../../src/js/charts/comboChart.js'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js');

describe('ComboChart', function() {
    var comboChart;

    beforeEach(function() {
        comboChart = new ComboChart({
            categories: ['cate1', 'cate2', 'cate3'],
            series: {
                column: [
                    ['Legend1', 20, 30, 50],
                    ['Legend2', 40, 40, 60],
                    ['Legend3', 60, 50, 10],
                    ['Legend4', 80, 10, 70]
                ],
                line: [
                    ['Legend2_1', 1, 2, 3]
                ]
            }
        }, defaultTheme, {
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
                    title: 'XX Axis'
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
        });
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
        it('y axis 영역이 하나일 경우의 axis data를 생성합니다.', function () {
            var result = comboChart._makeYAxisData({
                index: 0,
                convertedData: {
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    formatFunctions: []
                },
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
            expect(result).toEqual({
                labels: [0, 30, 60, 90],
                tickCount: 4,
                validTickCount: 4,
                scale: {
                    min: 0,
                    max: 90
                },
                step: 30,
                isVertical: true,
                isPositionRight: false
            });
        });

        it('y axis 영역이 두개일 경우의 axis data 생성합니다.', function () {
            var result = comboChart._makeYAxisData({
                index: 0,
                convertedData: {
                    values: {
                        column: [
                            [20, 30, 50],
                            [40, 40, 60]
                        ],
                        line: [
                            [60, 50, 10],
                            [80, 10, 70]
                        ]
                    },
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    formatFunctions: []
                },
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
            expect(result).toEqual({
                labels: [10, 20, 30, 40, 50, 60, 70],
                tickCount: 7,
                validTickCount: 7,
                scale: {
                    min: 10,
                    max: 70
                },
                step: 10,
                isVertical: true,
                isPositionRight: false
            });
        });
    });

    describe('_makeAxesData()', function() {
        it('y axis가 두개인 Combo차트에서 정렬 순서가 빠른 column차트에는 x axis data를 포함한 기본 axes data를 할당하고,\n' +
            'line차트에는 line차트 y axis data만 생성하여 chartType을 key로 하는 객체를 반환합니다.', function () {
            var baseAxis = {
                    yAxis: {
                        labels: [10, 20, 30, 40, 50, 60, 70],
                        tickCount: 7,
                        validTickCount: 7,
                        scale: {
                            min: 10,
                            max: 70
                        },
                        step: 10,
                        isVertical: true,
                        isPositionRight: false
                    },
                    xAxis: {}
                },
                result = comboChart._makeAxesData(baseAxis, {
                    convertedData: {
                        values: {
                            line: [
                                [60, 50, 10],
                                [80, 10, 70]
                            ]
                        },
                        formatFunctions: []
                    },
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

            expect(result).toEqual({
                column: baseAxis,
                line: {
                    yAxis: {
                        labels: [0, 30, 60, 90, 120, 150, 180],
                        tickCount: 7,
                        validTickCount: 7,
                        scale: {
                            min: 0,
                            max: 180
                        },
                        step: 30,
                        isVertical: true,
                        isPositionRight: true
                    }
                }
            });
        });
    });

    describe('_makeChartTypeOrderInfo()', function() {
        it('전달 인자 배열의 index(0, 1)를 값으로, value(chart type)를 key로 하는 chartType 순서 정보 객체를 생성합니다.', function () {
            var result = comboChart._makeChartTypeOrderInfo(['column', 'line']);
            expect(result).toEqual({
                column: 0,
                line: 1
            });
        });
    });

    describe('_makeOptionsMap()', function() {
        it('옵션이 있을 경우에는 각 chartType에 맞는 옵션을 추출하여 chartType을 key로 하는 y축 옵션 정보 맵을 생성합니다.', function () {
            var result = comboChart._makeOptionsMap(['column', 'line'], {
                yAxis: [
                    {
                        title: 'Y Axis'
                    },
                    {
                        title: 'Y Right Axis'
                    }
                ],
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
            });

            expect(result.column).toEqual({
                chartType: 'column',
                parentChartType: 'combo',
                yAxis: {
                    title: 'Y Axis'
                },
                series: {
                    stacked: 'normal'
                },
                tooltip: {
                    suffix: '%'
                }
            });
            expect(result.line).toEqual({
                chartType: 'line',
                parentChartType: 'combo',
                yAxis: {
                    title: 'Y Right Axis'
                },
                series: {
                    hasDot: true
                },
                tooltip: {
                    position: 'left top'
                }
            });
        });

        it('옵션이 없을 경우에는 chartType 정보만을 담은 y축 옵션 정보 맵을 생성합니다.', function() {
            var result = comboChart._makeOptionsMap(['column', 'line'], {chartType: 'combo'});
            expect(result).toEqual({
                column: {
                    chartType: 'column',
                    parentChartType: 'combo'
                },
                line: {
                    chartType: 'line',
                    parentChartType: 'combo'
                }
            });
        });
    });

    describe('_makeThemeMap()', function() {
        it('chartType을 key로 하는 테마 맵을 생성합니다.', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    title: {
                        fontSize: 12
                    }
                },
                series: {
                    colors: ['red', 'orange', 'green', 'blue', 'gray']
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            expect(result.column).toBeTruthy();
            expect(result.line).toBeTruthy();
        });

        it('yAxis 테마는 차트별로 정의하면 그대로 할당됩니다.', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    column: {
                        title: {
                            fontSize: 16
                        }
                    },
                    line: {
                        title: {
                            fontSize: 14
                        }
                    }
                },
                series: {
                    colors: ['green', 'blue', 'gray', 'red', 'orange']
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            expect(result.column.yAxis.title.fontSize).toBe(16);
            expect(result.line.yAxis.title.fontSize).toBe(14);
        });

        it('테마 정의가 없는 경우에는 기본 테마를 따라갑니다.', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    line: {
                        title: {
                            fontSize: 14
                        }
                    }
                },
                series: {
                    colors: ['green', 'blue', 'gray', 'red', 'orange']
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            // column의 경우에는 yAxis에 대한 테마 설정이 없기 때문에 기본 테마 속성을 복사했습니다.
            expect(result.column.yAxis).toEqual({
                tickColor: '#000000',
                title: {
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: ''
                },
                label: {
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: ''
                }
            });

            // line 설정된 yAxis 테마가 그대로 할당됩니다.
            expect(result.line.yAxis.title.fontSize).toBe(14);
        });

        it('series의 colors를 하나만 설정하게 되면 두번째 차트의 colors 색상 순서는 첫번째 차트 레이블 갯수에 영향을 받습니다.', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    title: {
                        fontSize: 12
                    }
                },
                series: {
                    colors: ['green', 'blue', 'gray', 'red', 'orange']
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            expect(result.column.series.colors).toEqual(['green', 'blue', 'gray', 'red', 'orange']);
            expect(result.line.series.colors).toEqual(['gray', 'red', 'orange', 'green', 'blue']);
        });

        it('series의 colors는 차트별로 설정하게 되면 그대로 할당되게 됩니다.', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    title: {
                        fontSize: 12
                    }
                },
                series: {
                    column: {
                        colors: ['green', 'blue']
                    },
                    line: {
                        colors: ['blue', 'gray', 'red']
                    }
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            expect(result.column.series.colors).toEqual(['green', 'blue']);
            expect(result.line.series.colors).toEqual(['blue', 'gray', 'red']);
        });
    });

    describe('_increaseYAxisScaleMax()', function() {
        it('전달 인자 만큼의 tick count를 증가시킵니다.(label, scale.max 정보도 동시에 업데이트합니다)', function () {
            var targetTickInfo = {
                tickCount: 4,
                validTickCount: 4,
                scale: {
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
                scale: {
                    min: 0,
                    max: 80
                },
                step: 20
            });
        });
    });
});
