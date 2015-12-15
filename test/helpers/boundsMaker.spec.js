/**
 * @fileoverview Test boundsMaker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/boundsMaker'),
    chartConst = require('../../src/js/const'),
    defaultTheme = require('../../src/js/themes/defaultTheme'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('boundsMaker', function() {
    var dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight');
        maker.chartLeftPadding = chartConst.CHART_PADDING;
        maker.legendCheckboxWidth = chartConst.LEGEND_CHECKBOX_WIDTH;
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormatFunctions', 'getGroupValues', 'getFullGroupValues', 'getFullLegendData', 'getCategories',
                'getFormattedGroupValues', 'getLegendLabels', 'getMultilineCategories', 'getMultilineCategories']);
        dataProcessor.getFormatFunctions.and.returnValue([]);

        maker.dataProcessor = dataProcessor;
    });

    describe('_getValueAxisMaxLabel()', function() {
        it('단일 차트 value axis의 label 최대값을 반환합니다.', function () {
            var actual;

            dataProcessor.getGroupValues.and.returnValue([
                [20, 30, 50],
                [80, 10, 70]
            ]);

            actual = maker._getValueAxisMaxLabel('column');
            expect(actual).toBe(90);
        });

        it('Combo 차트 value axis의 label 최대값을 반환합니다.', function () {
            var actual;

            dataProcessor.getFullGroupValues.and.returnValue([
                [20, 30, 50],
                [40, 40, 60]
            ]);

            actual = maker._getValueAxisMaxLabel('combo');
            expect(actual).toBe(70);
        });
    });

    describe('_getXAxisHeight()', function() {
        it('x축 영역의 높이를 계산하여 반환합니다.', function () {
            var actual;

            renderUtil.getRenderedLabelHeight.and.returnValue(20);

            actual = maker._getXAxisHeight({
                title: 'title'
            }, ['label1', 'label12'], {
                title: {},
                label: {}
            });

            expect(actual).toBe(60);
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

            expect(result).toBe(97);
        });
    });

    describe('_getRightYAxisWidth()', function() {
        it('y right 축 영역의 너비를 계산하여 반환합니다.', function () {
            var actual, expected;

            dataProcessor.getGroupValues.and.returnValue([
                [20, 30, 50],
                [80, 10, 70]
            ]);

            actual = maker._getRightYAxisWidth({
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
                        title: 'RightYAxis title'
                    }
                ]
            });
            expected = 97;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeAxesDimension()', function() {
        it('axis영역이 없는 차트의 경우에는 axis들의 너비, 높이 값을 0으로 설정하여 반환합니다.', function () {
            var result = maker._makeAxesDimension({});
            expect(result).toEqual({
                yAxis: {
                    width: 0
                },
                rightYAxis: {
                    width: 0
                },
                xAxis: {
                    height: 0
                }
            });
        });

        it('axis영역이 있는 차트의 경우 xAxis의 높이, yAxis의 너비, rightYAxis의 너비 값을 계산하여 반환합니다.', function() {
            var result = maker._makeAxesDimension({
                processedData: {
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
                },
                axesLabelInfo: {
                    yAxis: [80],
                    xAxis: ['label1', 'label2']
                }
            });
            expect(result.yAxis.width).toBe(97);
            expect(result.rightYAxis.width).toBe(0);
            expect(result.xAxis.height).toBe(60);
        });
    });

    describe('_makeLegendWidth()', function() {
        it('체크박스, 아이콘, 여백이 포함된 범례 너비를 반환합니다.', function() {
            var actual, expected;

            actual = maker._makeLegendWidth(40);
            expected = 87;

            expect(actual).toBe(expected);
        });
    });

    describe('_calculateLegendsWidthSum()', function() {
        it('여러 범례 길이의 합을 구합니다.', function() {
            var actual = maker._calculateLegendsWidthSum(['legend1', 'legend2']),
                expected = 194;

            expect(actual).toBe(expected);
        });
    });

    describe('_divideLegendLabels()', function() {
        it('입력 배열을 count만큼으로 나누어 2차원 배열로 반환합니다.', function() {
            var actual = maker._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 2),
                expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });

        it('앞쪽에서부터 나추어진 숫자 만큼씩 차례대로 채워나갑니다.', function() {
            var actual = maker._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 3),
                expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']];

            expect(actual).toEqual(expected);
        });

        it('1로 나눌 경우에는 그대로 반환됩니다.', function() {
            var actual = maker._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 1),
                expected = [['ABC1', 'ABC2', 'ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeDividedLabelsAndMaxLineWidth()', function() {
        it('차트의 너비를 넘어서지 않을때 까지 레이블들을 나누고 나눈 결과와 그때의 최대 너비를 반환합니다.', function() {
            var actual = maker._makeDividedLabelsAndMaxLineWidth(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 250),
                expected = {
                    dividedLabels: [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']],
                    maxLineWidth: 194
                };

            expect(actual).toEqual(expected);
        });

        it('차트의 너비가 레이블 너비보다 작다면 현재의 레이블 정보와 최대 너비를 반환합니다.', function() {
            var actual = maker._makeDividedLabelsAndMaxLineWidth(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 100),
                expected = {
                    dividedLabels: [['ABC1'], ['ABC2'], ['ABC3'], ['ABC4'], ['ABC5']],
                    maxLineWidth: 97
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateHorizontalLegendHeight()', function() {
        it('가로 범례의 높이를 구합니다.', function() {
            var actual = maker._calculateHorizontalLegendHeight([['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']]),
                expected = 60;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeHorizontalLegendDimension()', function() {
        it('가로타입 범례의 Dimension을 구합니다.', function() {
            var actual, expected;

            dataProcessor.getFullLegendData.and.returnValue([
                {
                    label: 'label1'
                },
                {
                    label: 'label12'
                }
            ]);

            actual = maker._makeHorizontalLegendDimension(250);
            expected = {
                width: 194,
                height: 40
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeVerticalLegendDimension()', function() {
        it('세로타입 범례의 Dimension을 구합니다.', function() {
            var actual, expected;

            dataProcessor.getFullLegendData.and.returnValue([
                {
                    label: 'label1'
                },
                {
                    label: 'label12'
                }
            ]);

            actual = maker._makeVerticalLegendDimension();
            expected = 97;

            expect(actual.width).toBe(expected);
        });
    });

    describe('_makeLegendDimension()', function() {
        it('_isSkippedLegendSizing()가 true를 반환하면 0을 반환합니다.', function () {
            var actual;

            spyOn(maker, '_isSkippedLegendSizing').and.returnValue(true);

            actual = maker._makeLegendDimension({});
            expect(actual.width).toBe(0);
        });

        it('세로타입 범례의 dimension을 계산하여 반환합니다.', function () {
            var actual, expected;

            dataProcessor.getFullLegendData.and.returnValue([
                {
                    label: 'label1'
                },
                {
                    label: 'label12'
                }
            ]);

            actual = maker._makeLegendDimension({});
            expected = {
                width: 97,
                height: 0
            };

            expect(actual).toEqual(expected);
        });

        it('가로타입 범례의 dimension을 계산하여 반환합니다.', function () {
            var actual, expected;

            dataProcessor.getFullLegendData.and.returnValue([
                {
                    label: 'label1'
                },
                {
                    label: 'label12'
                }
            ]);

            actual = maker._makeLegendDimension({}, 'column', 250, {
                align: 'top'
            });
            expected = {
                width: 194,
                height: 40
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('세로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var actual = maker._makeSeriesDimension({
                    chartDimension: {
                        width: 500,
                        height: 400
                    },
                    axesDimension: {
                        yAxis: {
                            width: 50
                        },
                        rightYAxis: {
                            width: 0
                        },
                        xAxis: {
                            height: 50
                        }
                    },
                    legendDimension: {
                        width: 50
                    },
                    titleHeight: 50
                }),
                expected = {
                    width: 380,
                    height: 280
                };
            expect(actual).toEqual(expected);
        });

        it('가로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var actual = maker._makeSeriesDimension({
                    chartDimension: {
                        width: 500,
                        height: 400
                    },
                    axesDimension: {
                        yAxis: {
                            width: 50
                        },
                        rightYAxis: {
                            width: 0
                        },
                        xAxis: {
                            height: 50
                        }
                    },
                    legendDimension: {
                        height: 50
                    },
                    titleHeight: 50,
                    legendOption: {
                        align: 'bottom'
                    }
                }),
                expected = {
                    width: 430,
                    height: 230
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeChartDimension()', function() {
        it('chart option(width, height) 정보를 받아 chart dimension을 생성합니다.', function() {
            var actual = maker._makeChartDimension({
                    width: 300,
                    height: 200
                }),
                expected = {
                    width: 300,
                    height: 200
                };
            expect(actual).toEqual(expected);
        });

        it('chart option이 없는 경우에는 기본값으로 dimension을 생성합니다.', function() {
            var actual = maker._makeChartDimension({}),
                expected = {
                    width: chartConst.CHART_DEFAULT_WIDTH,
                    height: chartConst.CHART_DEFAULT_HEIGHT
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTitleDimension()', function() {
        it('option정보와 테마 정보를 전달하여 title dimension 정보를 생성합니다.', function() {
            var acutal = maker._makeTitleDimension({}, {}),
                expected = {
                    height: 40
                };
            expect(acutal).toEqual(expected);
        });
    });

    describe('_makePlotDimension', function() {
        it('plot dimension은 전달하는 series dimension에서 hidden width 1을 더한 수치로 생성합니다.', function() {
            var acutal = maker._makePlotDimension({
                    width: 200,
                    height: 100
                }),
                expected = {
                    width: 200 + chartConst.HIDDEN_WIDTH,
                    height: 100 + chartConst.HIDDEN_WIDTH
                };
            expect(acutal).toEqual(expected);
        });
    });

    describe('_makeComponentsDimensions()', function() {
        it('컴포넌트들의 너비,높이 값을 계산하여 반환합니다.', function () {
            var actual;

            dataProcessor.getFullLegendData.and.returnValue([{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}]);
            actual = maker._makeComponentsDimensions({
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
                axesLabelInfo: {
                    yAxis: [80],
                    xAxis: ['label1', 'label2']
                }
            });

            expect(actual.chart).toEqual({
                width: 500,
                height: 400
            });

            expect(actual.title.height).toBe(40);
            expect(actual.series.width).toBe(286);
            expect(actual.series.height).toBe(280);

            expect(actual.legend.width).toBe(97);

            expect(actual.yAxis.width).toBe(97);
            expect(actual.rightYAxis.width).toBe(0);
            expect(actual.xAxis.height).toBe(60);
        });
    });

    describe('_makeBasicBound()', function() {
        it('dimension과 top, left 정보를 전달받아 기본형태의 bound 정보를 생성합니다.', function() {
            var actual = maker._makeBasicBound({
                    width: 100,
                    height: 100
                }, 10, 20),
                expected = {
                    dimension: {
                        width: 100,
                        height: 100
                    },
                    position: {
                        top: 10,
                        left: 20
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYAxisBound()', function() {
       it('yAxis width, plot height, top 정보를 받아 yAxis bound정보를 생성합니다.', function() {
           var actual = maker._makeYAxisBound({
                   yAxis: {
                       width: 100
                   },
                   plot: {
                       height: 200
                   }
               }, 20, 0),
               expected = {
                   dimension: {
                       width: 100,
                       height: 200
                   },
                   position: {
                       top: 20,
                       left: 10
                   }
               };
           expect(actual).toEqual(expected);
       });
    });

    describe('_makeXAxisBound()', function() {
        it('xAxis height, plot width, series height, top, left 정보를 받아 xAxis bound정보를 생성합니다.', function() {
            var actual = maker._makeXAxisBound({
                    xAxis: {
                        height: 100
                    },
                    plot: {
                        width: 200
                    },
                    series: {
                        height: 100
                    }
                }, 10, 20),
                expected = {
                    dimension: {
                        width: 200,
                        height: 100
                    },
                    position: {
                        top: 110,
                        left: 19
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeRightYAxisBound()', function() {
        it('rightYAxis width, plot height, legend width, top 정보를 받아 rightYAxis bound정보를 생성합니다.', function() {
            var actual = maker._makeRightYAxisBound({
                    rightYAxis: {
                        width: 100
                    },
                    yAxis: {
                        width: 100
                    },
                    plot: {
                        height: 200
                    },
                    series: {
                        width: 300
                    },
                    legend: {
                        width: 50
                    }
                }, 20, 0),
                expected = {
                    dimension: {
                        width: 100,
                        height: 200
                    },
                    position: {
                        top: 20,
                        right: 61
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesBounds()', function() {
        it('axis영역 표현에 필요한 컴포넌트(xAxis, yAxis, plot)들의 bounds 정보를 기본 dimension정보를 기반으로 계산하여 반환합니다.', function () {
            var actual = maker._makeAxesBounds({
                hasAxes: true,
                dimensions: {
                    plot: {width: 300, height: 200},
                    series: {width: 299, height: 199},
                    legend: {width: 70},
                    yAxis: {width: 50},
                    rightYAxis: {width: 0},
                    xAxis: {height: 50}
                },
                top: 20,
                left: 20,
                leftLegendWidth: 0
            });

            expect(actual.plot.position).toEqual({top: 20, left: 19});
            expect(actual.yAxis.dimension.height).toBe(200);
            expect(actual.yAxis.position.top).toBe(20);
            expect(actual.yAxis.position.left).toBe(10);
            expect(actual.xAxis.dimension.width).toBe(300);
            expect(actual.xAxis.position.top).toBe(219);
            expect(actual.xAxis.position.left).toBe(19);
        });

        it('hasAxes값이 없을 경우에는 빈 객체를 반환합니다.', function() {
            var actual = maker._makeAxesBounds({});
            expect(actual).toEqual({});
        });

        it('optionChartTypes값이 있을 경우에는 우측 yAxis옵션 정보를 반환합니다.', function() {
            var actual = maker._makeAxesBounds({
                hasAxes: true,
                optionChartTypes: ['line', 'column'],
                dimensions: {
                    plot: {width: 300, height: 200},
                    series: {width: 299, height: 199},
                    legend: {width: 70},
                    yAxis: {width: 50},
                    rightYAxis: {width: 50},
                    xAxis: {height: 50}
                },
                top: 20,
                left: 20,
                leftLegendWidth: 0
            });
            expect(actual.rightYAxis.dimension.height).toBe(200);
            expect(actual.rightYAxis.position.top).toBe(20);
            expect(actual.rightYAxis.position.right).toBe(81);
        });
    });

    describe('_makeChartBound()', function() {
        it('dimension정보를 받아 chart bound정보를 생성합니다.', function() {
            var actual = maker._makeChartBound({
                    width: 100,
                    height: 100
                }),
                expected = {
                    dimension: {
                        width: 100,
                        height: 100
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLegendBound()', function() {
        it('title height, yAxis width, series width, rightYAxis width 정보를 받아 legend bound정보를 생성합니다.', function() {
            var actual = maker._makeLegendBound({
                    title: {
                        height: 20
                    },
                    yAxis: {
                        width: 30
                    },
                    series: {
                        width: 200
                    },
                    rightYAxis: {
                        width: 30
                    },
                    legend: {
                        width: 50
                    }
                }, {}),
                expected = {
                    dimension: {
                        width: 50
                    },
                    position: {
                        top: 20,
                        left: 270
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesLabelInfo()', function() {
        it('세로 타입의 차트에서는 yAxis는 value, xAxis는 category가 label이 됩니다.', function() {
            var actual, expected;

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            dataProcessor.getGroupValues.and.returnValue([10, 20, 30]);

            actual = maker._makeAxesLabelInfo({
                hasAxes: true,
                optionChartTypes: ['column'],
                isVertical: true
            });
            expected = {
                xAxis: ['cate1', 'cate2', 'cate3'],
                yAxis: [40]
            };

            expect(actual).toEqual(expected);
        });

        it('가로 타입의 차트에서는 yAxis는 category, xAxis는 value가 label이 됩니다.', function() {
            var actual, expected;

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            dataProcessor.getGroupValues.and.returnValue([10, 20, 30]);

            actual = maker._makeAxesLabelInfo({
                hasAxes: true,
                optionChartTypes: ['column'],
                isVertical: false
            });
            expected = {
                xAxis: [40],
                yAxis: ['cate1', 'cate2', 'cate3']
            };

            expect(actual).toEqual(expected);
        });

        it('hasAxes가 존재하지 않거나 false이면 null을 반환합니다.', function() {
            var actual = maker._makeAxesLabelInfo({
                    hasAxes: false
                });
            expect(actual).toBeNull();
        });
    });

    describe('_findRotationDegree()', function() {
        it('후보 각(25, 45, 65, 85)을 순회하며 회전된 비교 너비가 제한 너비보다 작으면 해당 각을 반환합니다.', function() {
            var actual = maker._findRotationDegree(50, 60, 20),
                expected = 25;
            expect(actual).toBe(expected);
        });

        it('최대 회전각은 85도 입니다.', function() {
            var actual = maker._findRotationDegree(5, 120, 20),
                expected = 85;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeHorizontalLabelRotationInfo', function() {
        beforeEach(function() {
            renderUtil.getRenderedLabelHeight.and.returnValue(20);
        });

        it('레이블 중 가장 긴 레이블이 제한 너비를 초과하지 않는 적절한 회전각을 반환합니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
            actual = maker._makeHorizontalLabelRotationInfo(100, ['cate1', 'cate2', 'cate3'], {});
            expected = {
                maxLabelWidth: 120,
                labelHeight: 20,
                degree: 25
            };
            expect(actual).toEqual(expected);
        });

        it('최대 회전각은 85도 입니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
            actual = maker._makeHorizontalLabelRotationInfo(5, ['cate1', 'cate2', 'cate3'], {});
            expected = {
                maxLabelWidth: 120,
                labelHeight: 20,
                degree: 85
            };
            expect(actual).toEqual(expected);
        });

        it('회전하지 않는 상태의 가장 긴 레이블의 길이가 제한 너비를 초과하지 않으면 null을 반환합니다.', function() {
            var actual;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(40);
            actual = maker._makeHorizontalLabelRotationInfo(300, ['cate1', 'cate2'], {});

            expect(actual).toBeNull();
        });
    });

    describe('_calculateOverflowLeft()', function() {
        it('회전된 xAxis label이 왼쪽 차트 시작 영역을 얼마나 넘어갔는지 값을 계산하여 반환합니다.', function() {
            var actual = maker._calculateOverflowLeft(50, {
                    degree: 25,
                    maxLabelWidth: 120,
                    labelHeight: 20
                }, 'abcdefghijklmnopqrstuvwxyz', {}),
                expected = 3.7677545866464826;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateXAxisRotatedHeight()', function() {
        it('레이블 dimension과 degree 정보를 이용하여 x axis의 회전된 높이 정보를 구합니다.', function() {
            var actual = maker._calculateXAxisRotatedHeight({
                    degree: 25,
                    maxLabelWidth: 100,
                    labelHeight: 20
                }),
                expected = 60.38798191480294;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateDiffWithRotatedHeight()', function() {
        it('회전된 레이블과 원래의 레이블의 높이 차이를 계산합니다.', function() {
            var actual = maker._calculateDiffWithRotatedHeight({
                    degree: 25,
                    maxLabelWidth: 100,
                    labelHeight: 20
                }),
                expected = 40.38798191480294;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateDiffWithMultilineHeight()', function() {
        it('개행처리된 레이블과 원래의 레이블의 높이 차이를 계산합니다.', function() {
            var actual, expected;

            renderUtil.getRenderedLabelHeight.and.callFake(function(value) {
                if (value.indexOf('</br>') > -1) {
                    return 40;
                } else {
                    return 20;
                }
            });

            dataProcessor.getMultilineCategories.and.returnValue([
               'AAAA</br>BBBB'
            ]);

            actual = maker._calculateDiffWithMultilineHeight(['AAAA BBBB'], 50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
            expected = 20;

            expect(actual).toBe(expected);
        });
    });

    describe('_updateDegree()', function() {
        it('overflowLeft값이 0보다 크면 degree를 재계산하여 rotationInfo.degree의 값을 갱신합니다.', function() {
            var rotationInfo = {
                degree: 25,
                maxLabelWidth: 100,
                labelHeight: 20
            };
            maker._updateDegree(200, rotationInfo, 8, 20);
            expect(rotationInfo.degree).toEqual(85);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('50의 overflowLeft를 전달하면 chartLeftPadding은 50 증가하고 나머지 dimensions의 width들을 50씩 감소합니다.', function() {
            var dimensions = {
                plot: {
                    width: 200
                },
                series: {
                    width: 199
                },
                xAxis: {
                    width: 200
                }
            };

            maker.chartLeftPadding = 10;
            maker._updateDimensionsWidth(dimensions, 50);

            expect(maker.chartLeftPadding).toBe(60);
            expect(dimensions.plot.width).toBe(150);
            expect(dimensions.series.width).toBe(149);
            expect(dimensions.xAxis.width).toBe(150);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('50의 diffHeight를 전달하면 xAxis.heihgt는 50 감소하고, plot.height, series.height는 50 증가합니다.', function() {
            var dimensions = {
                plot: {
                    height: 200
                },
                series: {
                    height: 199
                },
                xAxis: {
                    height: 50
                }
            };

            maker._updateDimensionsHeight(dimensions, 50);

            expect(dimensions.plot.height).toBe(150);
            expect(dimensions.series.height).toBe(149);
            expect(dimensions.xAxis.height).toBe(100);
        });
    });

    describe('make()', function() {
        it('차트를 구성하는 컴포넌트들의 bounds 정보를 계산하여 반환합니다.', function () {
            var actual;

            renderUtil.getRenderedLabelHeight.and.callFake(function(value) {
                if ((value + '').indexOf('</br>') > -1) {
                    return 40;
                } else {
                    return 20;
                }
            });

            dataProcessor.getFullGroupValues.and.returnValue([
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ]);

            dataProcessor.getGroupValues.and.returnValue([
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ]);

            dataProcessor.getFormattedGroupValues.and.returnValue([
                ['20', '30', '50'],
                ['40', '40', '60'],
                ['60', '50', '10'],
                ['80', '10', '70']
            ]);

            dataProcessor.getLegendLabels.and.returnValue(['label1', 'label2', 'label3']);
            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            dataProcessor.getMultilineCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            dataProcessor.getFullLegendData.and.returnValue([{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}]);

            actual = maker.make(dataProcessor,
                {
                    theme: defaultTheme,
                    hasAxes: true,
                    options: {}
                }
            );

            expect(actual.chart.dimension.width).toBe(500);
            expect(actual.chart.dimension.height).toBe(400);
            expect(actual.series.dimension.width).toBe(286);
            expect(actual.series.dimension.height).toBe(280);
            expect(actual.series.position.top).toBe(50);
            expect(actual.series.position.left).toBe(107);
            expect(actual.yAxis.dimension.width).toBe(97);
            expect(actual.yAxis.dimension.height).toBe(281);
            expect(actual.yAxis.position.top).toBe(50);
            expect(actual.xAxis.dimension.width).toBe(287);
            expect(actual.xAxis.dimension.height).toBe(60);
            expect(actual.xAxis.position.top).toBe(330);
            expect(actual.legend.position.top).toBe(40);
            expect(actual.legend.position.left).toBe(393);
            expect(actual.tooltip.position.top).toBe(50);
            expect(actual.tooltip.position.left).toBe(97);
        });
    });
});
