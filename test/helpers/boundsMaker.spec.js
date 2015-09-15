/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/boundsMaker.js'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('boundsMaker', function() {
    var getRenderedLabelWidth, getRenderedLabelHeight;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        getRenderedLabelWidth  = renderUtil.getRenderedLabelWidth;
        getRenderedLabelHeight  = renderUtil.getRenderedLabelHeight;

        renderUtil.getRenderedLabelWidth = function() {
            return 50;
        };

        renderUtil.getRenderedLabelHeight = function() {
            return 20;
        };
    });

    afterAll(function() {
        renderUtil.getRenderedLabelWidth = getRenderedLabelWidth;
        renderUtil.getRenderedLabelHeight = getRenderedLabelHeight;
    });

    describe('_getValueAxisMaxLabel()', function() {
        it('단일 차트 value axis의 label 최대값을 반환합니다.', function () {
            var result = maker._getValueAxisMaxLabel({
                values: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ],
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            });
            expect(result).toEqual(90);
        });

        it('Combo 차트 value axis의 label 최대값을 반환합니다.', function () {
            var result = maker._getValueAxisMaxLabel({
                values: {
                    column: [
                        [20, 30, 50],
                        [40, 40, 60]
                    ]
                }
            }, 'column');
            expect(result).toEqual(70);
        });
    });

    describe('_getRenderedLabelsMaxSize()', function() {
        it('인자로 전달하는 레이블들을 보이지 않는 영역에 렌더링 하고 렌더링된 레이블의 사이즈(너비 or 높이)를 구해 레이블들 중 최대 사이즈를 선택하여 반환합니다.', function () {
            var result = maker._getRenderedLabelsMaxSize(['label1', 'label12'], {}, function (label) {
                return label.length;
            });
            expect(result).toEqual(7);
        });
    });

    describe('_getRenderedLabelsMaxWidth()', function() {
        it('인자로 전달하는 레이블들의 렌더링된 레이블의 최대 너비를 반환합니다.', function () {
            var result = maker._getRenderedLabelsMaxWidth(['label1', 'label12']);
            expect(result).toEqual(50);
        });
    });

    describe('_getRenderedLabelsMaxHeight()', function() {
        it('인자로 전달하는 레이블들의 렌더링된 레이블의 최대 높이를 반환합니다.', function () {
            var result = maker._getRenderedLabelsMaxHeight(['label1', 'label12']);
            expect(result).toEqual(20);
        });
    });

    describe('_getXAxisHeight()', function() {
        it('x축 영역의 높이를 계산하여 반환합니다.', function () {
            var result = maker._getXAxisHeight({
                title: 'title'
            }, ['label1', 'label12'], {
                title: {},
                label: {}
            });
            expect(result).toEqual(60);
        });
    });

    describe('_getYAxisWidth()', function() {
        it('y축 영역의 너비를 계산하여 반환합니다.', function() {
            var result = maker._getYAxisWidth({
                    title: 'YAxis title'
                },
                ['label1', 'label12'],
                {
                    title: {},
                    label: {}
                }
            );

            expect(result).toEqual(97);
        });
    });

    describe('_getYRAxisWidth()', function() {
        it('y right 축 영역의 너비를 계산하여 반환합니다.', function () {
            var result = maker._getYRAxisWidth({
                convertData: {
                    values: {
                        line: [
                            [60, 50, 10],
                            [80, 10, 70]
                        ]
                    }
                },
                chartTypes: ['column', 'line'],
                theme: {
                    title: {},
                    label: {}
                },
                options: [
                    {
                        title: 'YAxis title'
                    },
                    {
                        title: 'YRAxis title'
                    }
                ]
            });

            expect(result).toEqual(97);
        });
    });

    describe('_makeAxesDimension()', function() {
        it('axis영역이 없는 차트의 경우에는 axis들의 너비, 높이 값을 0으로 설정하여 반환합니다.', function () {
            var result = maker._makeAxesDimension({});
            expect(result).toEqual({
                yAxis: {
                    width: 0
                },
                yrAxis: {
                    width: 0
                },
                xAxis: {
                    height: 0
                }
            });
        });

        it('axis영역이 있는 차트의 경우 xAxis의 높이, yAxis의 너비, yrAxis의 너비 값을 계산하여 반환합니다.', function() {
            var result = maker._makeAxesDimension({
                convertData: {
                    labels: ['label1', 'label12'],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                optionChartTypes: [],
                isVertical: true,
                hasAxes: true,
                theme: {
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    xAxis: {
                        title: {},
                        label: {}
                    }
                },
                options: {
                    yAxis: {
                        title: 'YAxis title'
                    },
                    xAxis: {
                        title: 'XAxis title'
                    }
                }
            });
            expect(result.yAxis.width).toEqual(97);
            expect(result.yrAxis.width).toEqual(0);
            expect(result.xAxis.height).toEqual(60);
        });
    });

    describe('_getComponentsDimension()', function() {
        it('컴포넌트들의 너비,높이 값을 계산하여 반환합니다.', function () {
            var result = maker._getComponentsDimensions({
                convertData: {
                    labels: ['label1', 'label12'],
                    joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                optionChartTypes: [],
                isVertical: true,
                hasAxes: true,
                theme: {
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    xAxis: {
                        title: {},
                        label: {}
                    },
                    legend: {
                        label: {}
                    }
                },
                options: {
                    yAxis: {
                        title: 'YAxis title'
                    },
                    xAxis: {
                        title: 'XAxis title'
                    }
                }
            });

            expect(result.chart).toEqual({
                width: 500,
                height: 400
            });

            expect(result.title.height).toEqual(40);
            expect(result.series.width).toEqual(296);
            expect(result.series.height).toEqual(280);

            expect(result.legend.width).toEqual(87);

            expect(result.yAxis.width).toEqual(97);
            expect(result.yrAxis.width).toEqual(0);
            expect(result.xAxis.height).toEqual(60);
        });
    });

    describe('_makeAxesBounds()', function() {
        it('axis영역 표현에 필요한 컴포넌트(xAxis, yAxis, plot)들의 bounds 정보를 계산하여 반환합니다.', function () {
            var result = maker._makeAxesBounds({
                convertData: {
                    labels: ['label1', 'label12'],
                    joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                optionChartTypes: [],
                isVertical: true,
                hasAxes: true,
                theme: {
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    xAxis: {
                        title: {},
                        label: {}
                    },
                    legend: {
                        label: {}
                    }
                },
                options: {
                    yAxis: {
                        title: 'YAxis title'
                    },
                    xAxis: {
                        title: 'XAxis title'
                    }
                },
                dimensions: {
                    chart: {width: 500, height: 400},
                    title: {height: 36},
                    plot: {width: 333, height: 294},
                    series: {width: 333, height: 294},
                    legend: {width: 96},
                    tooltip: {width: 333, height: 294},
                    yAxis: {width: 51},
                    yrAxis: {width: 0},
                    xAxis: {height: 50}
                },
                top: 20,
                right: 20
            });

            expect(result).toEqual({
                plot: {dimension: {width: 333, height: 294}, position: {top: 20, right: 20}},
                yAxis: {dimension: {width: 51, height: 294}, position: {top: 20, left: 11}},
                xAxis: {dimension: {width: 333, height: 50}, position: {top: 313, right: 20}}
            });
        });
    });

    describe('_getLegendAreaWidth()', function() {
        it('legend 영역의 너비를 계산하여 반환합니다.', function () {
            var result = maker._getLegendAreaWidth([
                    {
                        label: 'label1'
                    },
                    {
                        label: 'label12'
                    }
                ],
                {});
            expect(result).toEqual(87);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var result = maker._makeSeriesDimension({
                chartDimension: {
                    width: 500,
                    height: 400
                },
                axesDimension: {
                    yAxis: {
                        width: 50
                    },
                    yrAxis: {
                        width: 0
                    },
                    xAxis: {
                        height: 50
                    }
                },
                legendWidth: 50,
                titleHeight: 50
            });
            expect(result).toEqual({
                width: 380,
                height: 280
            });
        });
    });

    describe('make()', function() {
        it('차트를 구성하는 컴포넌트들의 bounds 정보를 계산하여 반환합니다.', function () {
            var result = maker.make({
                convertData: {
                    values: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    labels: ['label1', 'label2', 'label3'],
                    joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                    formatValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                theme: defaultTheme,
                hasAxes: true,
                options: {}
            });
            expect(result.chart.dimension.width).toEqual(500);
            expect(result.chart.dimension.height).toEqual(400);
            expect(result.series.dimension.width).toEqual(296);
            expect(result.series.dimension.height).toEqual(280);
            expect(result.series.position.top).toEqual(50);
            expect(result.series.position.right).toEqual(97);
            expect(result.yAxis.dimension.width).toEqual(97);
            expect(result.yAxis.dimension.height).toEqual(280);
            expect(result.yAxis.position.top).toEqual(50);
            expect(result.xAxis.dimension.width).toEqual(296);
            expect(result.xAxis.dimension.height).toEqual(60);
            expect(result.xAxis.position.top).toEqual(329);
            expect(result.legend.position.top).toEqual(40);
            expect(result.legend.position.left).toEqual(403);
            expect(result.tooltip.position.top).toEqual(50);
            expect(result.tooltip.position.left).toEqual(107);
        });
    });
});
