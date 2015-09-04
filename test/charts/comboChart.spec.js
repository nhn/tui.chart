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
        it('옵션이 없을 경우에는 인자로 받은 차트 타입들(data 영역에서 사용하는)을 그대로 반환 함', function () {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line']);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 하나만 있고, chartType 옵션이 포함되지 않았을 경우에는 빈 배열 반환', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], {
                title: 'test'
            });

            expect(result).toEqual([]);
        });

        it('옵션이 하나만 있고, chartType 옵션이 있을 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], {
                chartType: 'line'
            });
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                chartType: 'line'
            }]);
            expect(result).toEqual(['line', 'column']);
        });

        it('옵션에 두가지 차트의 옵션이 배열로 포함되어있고 두번째 배열에 chartType 값을 갖고 있는 경우에는 chartType을 기준으로 인자로 받은 차트 타이틀을 정렬하여 반환', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{}, {
                chartType: 'line'
            }]);
            expect(result).toEqual(['column', 'line']);
        });

        it('옵션이 배열 형태로 첫번째 요소에만 존재하며, chartType 옵션이 포함되지 않았을 경우에는 빈 배열 반환', function() {
            var result = comboChart._getYAxisOptionChartTypes(['column', 'line'], [{
                title: 'test'
            }]);
            expect(result).toEqual([]);
        });
    });


    describe('_makeYAxisData()', function() {
        it('y axis 영역이 하나일 경우의 axis data 생성', function () {
            var result = comboChart._makeYAxisData({
                index: 0,
                convertData: {
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

        it('y axis 영역이 두개일 경우의 axis data 생성', function () {
            var result = comboChart._makeYAxisData({
                index: 0,
                convertData: {
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
        it('y axis 영역이 하나일 경우의 axis data 생성', function () {
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
                    convertData: {
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
        it('chartType 순서 정보 생성', function () {
            var result = comboChart._makeChartTypeOrderInfo(['column', 'line']);
            expect(result).toEqual({
                column: 0,
                line: 1
            });
        });
    });

    describe('_makeOptionsMap()', function() {
        it('옵션이 있을 경우의 chartType별 y축 옵션 정보 맵 생성', function () {
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
                }
            }, {
                column: 0,
                line: 1
            });

            expect(result).toEqual({
                column: {
                    chartType: 'column',
                    yAxis: {
                        title: 'Y Axis'
                    },
                    series: {
                        stacked: 'normal'
                    },
                    tooltip: {
                        suffix: '%'
                    }
                },
                line: {
                    chartType: 'line',
                    yAxis: {
                        title: 'Y Right Axis'
                    },
                    series: {
                        hasDot: true
                    },
                    tooltip: {
                        position: 'left top'
                    }
                }
            });
        });

        it('옵션이 없을 경우의 chartType별 y축 옵션 정보 맵 생성', function() {
            var result = comboChart._makeOptionsMap(['column', 'line'], {}, {
                column: 0,
                line: 1
            });
            expect(result).toEqual({
                column: {
                    chartType: 'column'
                },
                line: {
                    chartType: 'line'
                }
            });
        });
    });

    describe('_makeThemeMap()', function() {
        it('colors가 하나 일 경우의 chartType별 테마 맵 생성', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    title: {
                        fontSize: 12
                    }
                },
                series: {
                    colors: ['red', 'orange', 'green', 'blue', 'green']
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });
            expect(result).toEqual({
                column: {
                    yAxis: {
                        title: {
                            fontSize: 12
                        }
                    },
                    series: {
                        colors: ['red', 'orange', 'green', 'blue', 'green']
                    }
                },
                line: {
                    yAxis: {
                        title: {
                            fontSize: 12
                        }
                    },
                    series: {
                        colors: ['green', 'blue', 'green', 'red', 'orange']
                    }
                }
            });
        });

        it('colors가 두개 일 경우의 chartType별 테마 맵 생성', function () {
            var result = comboChart._makeThemeMap(['column', 'line'], {
                yAxis: {
                    line: {
                        title: {
                            fontSize: 14
                        }
                    }
                },
                series: {
                    column: {
                        colors: ['red', 'orange']
                    },
                    line: {
                        colors: ['black', 'white', 'gray']
                    }
                }
            }, {
                column: ['Legend1', 'Legend2'],
                line: ['Legend1', 'Legend2', 'Legend3']
            });

            expect(result).toEqual({
                column: {
                    yAxis: {
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
                    },
                    series: {
                        colors: ['red', 'orange']
                    }
                },
                line: {
                    yAxis: {
                        title: {
                            fontSize: 14
                        }
                    },
                    series: {
                        colors: ['black', 'white', 'gray']
                    }
                }
            });
        });
    });

    describe('_increaseYAxisScaleMax()', function() {
        it('y axis scale의 최대값을 증가시킴', function () {
            var targetTickInfo = {
                tickCount: 4,
                scale: {
                    min: 0,
                    max: 60
                },
                step: 20
            };

            comboChart._increaseYAxisScaleMax({
                tickCount: 5
            }, targetTickInfo);

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
