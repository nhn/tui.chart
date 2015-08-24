/**
 * @fileoverview test ComboChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComboChart = require('../../src/js/charts/comboChart.js'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js');

describe('test ComboChart', function() {
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
                    hasDot: true,
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

    it('_getYAxisChartTypes()', function() {
        var result = comboChart._getYAxisChartTypes(['column', 'line']);
        expect(result).toEqual(['column', 'line']);
    });

    it('_getYAxisChartTypes() contained object option', function() {
        var result = comboChart._getYAxisChartTypes(['column', 'line'], {
            chartType: 'line'
        });

        expect(result).toEqual(['line', 'column']);

        result = comboChart._getYAxisChartTypes(['column', 'line'], {
            title: 'test'
        });

        expect(result).toEqual([]);
    });

    it('_getYAxisChartTypes() contained array options', function() {
        var result = comboChart._getYAxisChartTypes(['column', 'line'], [{
            chartType: 'line'
        }]);

        expect(result).toEqual(['line', 'column']);

        result = comboChart._getYAxisChartTypes(['column', 'line'], [{}, {
            chartType: 'line'
        }]);

        expect(result).toEqual(['column', 'line']);

        result = comboChart._getYAxisChartTypes(['column', 'line'], [{
            title: 'test'
        }]);

        expect(result).toEqual([]);
    });

    it('_makeYAxisData() one yAxis', function() {
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

    it('_makeYAxisData() two yAxis', function() {
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

    it('_makeAxesData()', function() {
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

    it('_makeChartTypeOrderInfo()', function() {
        var result = comboChart._makeChartTypeOrderInfo(['column', 'line']);
        expect(result).toEqual({
            column: 0,
            line: 1
        });
    });

    it('_makeOptionsMap()', function() {
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

    it('_makeOptionsMap() no options', function() {
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

    it('_makeThemeMap() one colors', function() {
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

    it('_makeThemeMap() tow colors', function() {
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

    it('_increaseYAxisScaleMax()', function() {
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
        })
    });
});