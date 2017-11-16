/**
 * @fileoverview Test for BoundsModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BoundsModel = require('../../../src/js/models/bounds/boundsModel');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var raphaelRenderUtil = require('../../../src/js/plugins/raphaelRenderUtil');

describe('Test for BoundsModel', function() {
    var boundsModel, dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(raphaelRenderUtil, 'getRenderedTextSize').and.returnValue(50);
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormattedMaxValue', 'getFormatFunctions', 'getGroupValues', 'getWholeGroupValues', 'getLegendData', 'getCategories',
                'getFormattedGroupValues', 'getLegendLabels', 'getMultilineCategories', 'getMultilineCategories']);
        dataProcessor.getFormatFunctions.and.returnValue([]);
    });

    beforeEach(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight');
        boundsModel = new BoundsModel({
            dataProcessor: dataProcessor,
            options: {
                legend: {
                    visible: true
                },
                chart: {
                    title: {
                        text: 'This is title'
                    }
                },
                chartExportMenu: {
                    visible: true
                }
            },
            theme: {
                title: {
                    fontSize: 16,
                    fontFamily: 'Verdana'
                }
            }
        });
    });

    describe('_registerChartDimension()', function() {
        it('chart option(width, height) 정보를 받아 chart dimension을 등록합니다.', function() {
            var actual, expected;

            boundsModel.options.chart = {
                width: 300,
                height: 200
            };
            boundsModel._registerChartDimension();
            actual = boundsModel.getDimension('chart');
            expected = {
                width: 300,
                height: 200
            };

            expect(actual).toEqual(expected);
        });

        it('chart option이 없는 경우에는 기본값으로 dimension을 등록합니다.', function() {
            var actual, expected;

            boundsModel._registerChartDimension();
            actual = boundsModel.getDimension('chart');
            expected = {
                width: chartConst.CHART_DEFAULT_WIDTH,
                height: chartConst.CHART_DEFAULT_HEIGHT
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerTitleDimension()', function() {
        it('title dimension 정보를 등록합니다.', function() {
            var actual, expected;

            raphaelRenderUtil.getRenderedTextSize.and.returnValue({
                height: 20
            });
            boundsModel._registerTitleDimension();
            actual = boundsModel.getDimension('title');
            expected = {
                height: 30
            };

            expect(actual).toEqual(expected);
        });
        it('title 옵션이 없는 경우 너비 높이가 0, 0 인 정보를 등록합니다.', function() {
            var actual, expected;

            boundsModel = new BoundsModel({
                dataProcessor: dataProcessor,
                options: {
                    legend: {
                        visible: true
                    },
                    chart: {
                    },
                    chartExportMenu: {
                        visible: true
                    }
                }
            });

            renderUtil.getRenderedLabelHeight.and.returnValue(20);
            boundsModel._registerTitleDimension();
            actual = boundsModel.getDimension('title');
            expected = {
                height: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerChartExportMenuDimension()', function() {
        it('chartExportMenu dimension 정보를 등록합니다.', function() {
            var actual, expected;

            boundsModel._registerChartExportMenuDimension();
            actual = boundsModel.getDimension('chartExportMenu');
            expected = {
                height: 27,
                width: 60
            };

            expect(actual).toEqual(expected);
        });
        it('chartExportMenu 옵션이 없는 경우 너비 높이가 0, 0 인 정보를 등록합니다.', function() {
            var actual, expected;

            boundsModel = new BoundsModel({
                dataProcessor: dataProcessor,
                options: {
                    legend: {
                        visible: true
                    },
                    chart: {
                    },
                    chartExportMenu: {
                        visible: false
                    }
                }
            });

            boundsModel._registerChartExportMenuDimension();
            actual = boundsModel.getDimension('chartExportMenu');
            expected = {
                height: 0,
                width: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('update dimensions width', function() {
            boundsModel.chartLeftPadding = 10;
            boundsModel.dimensionMap = {
                plot: {
                    width: 200
                },
                series: {
                    width: 199
                },
                mouseEventDetector: {
                    width: 199
                },
                xAxis: {
                    width: 200
                }
            };

            boundsModel.chartLeftPadding = 10;

            boundsModel._updateDimensionsWidth({
                overflowLeft: 50,
                overflowRight: 10
            });

            expect(boundsModel.chartLeftPadding).toBe(60);
            expect(boundsModel.getDimension('plot').width).toBe(140);
            expect(boundsModel.getDimension('series').width).toBe(139);
            expect(boundsModel.getDimension('mouseEventDetector').width).toBe(139);
            expect(boundsModel.getDimension('xAxis').width).toBe(140);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('50의 diffHeight를 전달하면 xAxis.heihgt는 50 감소하고, plot.height, series.height는 50 증가합니다.', function() {
            boundsModel.dimensionMap = {
                plot: {
                    height: 200
                },
                series: {
                    height: 200
                },
                mouseEventDetector: {
                    height: 200
                },
                tooltip: {
                    height: 200
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    height: 200
                },
                rightYAxis: {
                    height: 200
                }
            };
            boundsModel._updateDimensionsHeight(50);

            expect(boundsModel.getDimension('plot').height).toBe(150);
            expect(boundsModel.getDimension('series').height).toBe(150);
            expect(boundsModel.getDimension('mouseEventDetector').height).toBe(150);
            expect(boundsModel.getDimension('tooltip').height).toBe(150);
            expect(boundsModel.getDimension('xAxis').height).toBe(100);
            expect(boundsModel.getDimension('yAxis').height).toBe(150);
            expect(boundsModel.getDimension('rightYAxis').height).toBe(150);
        });
    });

    describe('_makePlotDimension()', function() {
        it('plot dimension은 전달하는 series dimension에서 hidden width 1을 더한 수치로 생성합니다.', function() {
            var actual, expected;

            boundsModel.dimensionMap.series = {
                width: 200,
                height: 100
            };

            actual = boundsModel._makePlotDimension();
            expected = {
                width: 200,
                height: 101
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerAxisComponentsDimension()', function() {
        it('plot dimension을 계산하여 axis를 구성하는 component들의 dimension을 등록합니다.', function() {
            spyOn(boundsModel, '_makePlotDimension').and.returnValue({
                width: 300,
                height: 200
            });
            boundsModel._registerAxisComponentsDimension();

            expect(boundsModel.getDimension('plot').width).toBe(300);
            expect(boundsModel.getDimension('plot').height).toBe(200);
            expect(boundsModel.getDimension('xAxis').width).toBe(300);
            expect(boundsModel.getDimension('yAxis').height).toBe(200);
            expect(boundsModel.getDimension('rightYAxis').height).toBe(200);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('세로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                chart: {
                    width: 500,
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    width: 50
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                },
                chartExportMenu: {
                    height: 0
                }
            };

            actual = boundsModel._makeSeriesDimension();
            expected = {
                width: 380,
                height: 280
            };

            expect(actual).toEqual(expected);
        });

        it('가로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                chart: {
                    width: 500,
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                },
                chartExportMenu: {
                    height: 0
                }
            };
            boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_TOP;

            actual = boundsModel._makeSeriesDimension();
            expected = {
                width: 430,
                height: 230
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerCenterComponentsDimension()', function() {
        it('시리즈 dimension을 생성하여 중앙에 위치하는 component들의 dimension을 등록합니다.', function() {
            boundsModel.dimensionMap = {
                series: {
                    width: 300,
                    height: 200
                }
            };
            boundsModel._registerCenterComponentsDimension();

            expect(boundsModel.getDimension('tooltip').width).toBe(300);
            expect(boundsModel.getDimension('tooltip').height).toBe(200);
            expect(boundsModel.getDimension('mouseEventDetector').width).toBe(300);
            expect(boundsModel.getDimension('mouseEventDetector').height).toBe(200);
        });
    });

    describe('_registerAxisComponentsPosition()', function() {
        it('시리즈 position과 leftLegendWidth 정보를 이용하여 axis를 구성하는 components들의 position정보를 등록합니다.', function() {
            var leftLegendWidth = 0;

            boundsModel.dimensionMap.series = {
                width: 300,
                height: 200
            };
            boundsModel.dimensionMap.yAxis = {
                width: 30
            };
            boundsModel.positionMap.series = {
                left: 50,
                top: 50
            };

            boundsModel._registerAxisComponentsPosition(leftLegendWidth);

            expect(boundsModel.getPosition('plot').top).toBe(50);
            expect(boundsModel.getPosition('plot').left).toBe(50);
            expect(boundsModel.getPosition('yAxis').top).toBe(50);
            expect(boundsModel.getPosition('yAxis').left).toBe(10);
            expect(boundsModel.getPosition('xAxis').top).toBe(250);
            expect(boundsModel.getPosition('xAxis').left).toBe(50);
            expect(boundsModel.getPosition('rightYAxis').top).toBe(50);
            expect(boundsModel.getPosition('rightYAxis').left).toBe(339);
        });
    });

    describe('_makeLegendPosition()', function() {
        it('기본 옵션의 legend position정보를 생성합니다.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
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
            };
            actual = boundsModel._makeLegendPosition();
            expected = {
                top: 20,
                left: 270
            };

            expect(actual).toEqual(expected);
        });

        it('align옵션이 bottom인 legend의 position정보를 생성합니다.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                title: {
                    height: 20
                },
                xAxis: {
                    height: 30
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
            };
            actual = boundsModel._makeLegendPosition();
            expected = {
                top: 20,
                left: 270
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCircleLegendPosition()', function() {
        it('series의 left와 너비값 그리고 circleLegend와 legend의 너비 차를 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {
                    width: 100
                },
                legend: {
                    width: 120
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 455;

            expect(actual).toBe(expected);
        });

        it('왼쪽 정렬인 경우에는 circleLegend와 legend의 너비 차만 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_LEFT;

            boundsModel.positionMap = {
                series: {}
            };
            boundsModel.dimensionMap = {
                series: {},
                circleLegend: {
                    width: 100
                },
                legend: {
                    width: 120
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('가로타입의 범례인 경우에는 series의 left와 너비 값 만을 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsModel.options = {
                legend: {
                    align: 'top'
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('범례가 숨겨진 경우에도 series의 left와 너비 값 만을 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsModel.options = {
                legend: {
                    visible: false
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('series의 position.top과 series의 높이 값을 더한 값에 circleLegend의 높이를 빼 circleLegend의 top을 구합니다.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    top: 60
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    height: 300
                },
                circleLegend: {
                    height: 80
                },
                legend: {}
            };

            actual = boundsModel._makeCircleLegendPosition().top;
            expected = 280;

            expect(actual).toBe(expected);
        });
    });

    describe('_registerEssentialComponentsPositions()', function() {
        it('계산된 series position정보를 이용하여 필수 component들의 position을 등록합니다.', function() {
            spyOn(boundsModel, '_makeLegendPosition').and.returnValue({
                top: 30,
                left: 250
            });

            boundsModel.chartType = 'bar';
            boundsModel.hasAxes = true;
            boundsModel.positionMap.series = {
                left: 50,
                top: 50
            };
            boundsModel._registerEssentialComponentsPositions();

            expect(boundsModel.getPosition('mouseEventDetector').top).toBe(50);
            expect(boundsModel.getPosition('mouseEventDetector').left).toBe(50);
            expect(boundsModel.getPosition('legend').top).toBe(30);
            expect(boundsModel.getPosition('legend').left).toBe(250);
            expect(boundsModel.getPosition('tooltip').top).toBe(40);
            expect(boundsModel.getPosition('tooltip').left).toBe(40);
        });
    });

    describe('_updateBoundsForYAxisCenterOption()', function() {
        it('yAxis 중앙정렬을 위해 각종 컴포넌트들의 bounds를 갱신합니다.', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            boundsModel.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                mouseEventDetector: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsModel.positionMap = {
                series: {
                    left: 50
                },
                extendedSeries: {
                    left: 50
                },
                plot: {
                    left: 50
                },
                yAxis: {
                    left: 50
                },
                xAxis: {
                    left: 50
                },
                mouseEventDetector: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsModel.dimensionMap.yAxis = {
                width: 50
            };
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateBoundsForYAxisCenterOption();

            expect(boundsModel.dimensionMap.extendedSeries.width).toBe(350);
            expect(boundsModel.dimensionMap.xAxis.width).toBe(301);
            expect(boundsModel.dimensionMap.plot.width).toBe(351);
            expect(boundsModel.dimensionMap.mouseEventDetector.width).toBe(350);
            expect(boundsModel.dimensionMap.tooltip.width).toBe(350);

            expect(boundsModel.positionMap.series.left).toBe(0);
            expect(boundsModel.positionMap.extendedSeries.left).toBe(1);
            expect(boundsModel.positionMap.plot.left).toBe(1);
            expect(boundsModel.positionMap.yAxis.left).toBe(201);
            expect(boundsModel.positionMap.xAxis.left).toBe(1);
            expect(boundsModel.positionMap.mouseEventDetector.left).toBe(1);
            expect(boundsModel.positionMap.tooltip.left).toBe(1);
        });

        it('구형 브라우저(IE7, IE8)의 경우 series와 extendedSeries의 left값이 1만큼 더 많아야 합니다.', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
            boundsModel.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                mouseEventDetector: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsModel.positionMap = {
                series: {
                    left: 50
                },
                extendedSeries: {
                    left: 50
                },
                plot: {
                    left: 50
                },
                yAxis: {
                    left: 50
                },
                xAxis: {
                    left: 50
                },
                mouseEventDetector: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsModel.dimensionMap.yAxis = {
                width: 50
            };
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateBoundsForYAxisCenterOption();

            expect(boundsModel.positionMap.series.left).toBe(1);
            expect(boundsModel.positionMap.extendedSeries.left).toBe(2);
        });
    });

    describe('_updateLegendAndSeriesWidth()', function() {
        it('update legend width, when has width for vertical type legend', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };
            boundsModel.dimensionMap.legend = {
                width: 0
            };
            boundsModel.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_LEFT
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('legend').width).toBe(80);
        });

        it('update legend width, when has not width for vertical type legend', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };
            boundsModel.dimensionMap.legend = {
                width: 0
            };
            boundsModel.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_TOP
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('legend').width).toBe(0);
        });

        it('update series width', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('series').width).toBe(280);
        });
    });

    describe('getBaseSizeForLimit()', function() {
        it('x축일 경우에는 series width를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            spyOn(boundsModel, 'calculateSeriesWidth').and.returnValue(400);

            actual = boundsModel.getBaseSizeForLimit();
            expected = 400;

            expect(actual).toBe(expected);
        });

        it('y축일 경우에는 series height를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            spyOn(boundsModel, 'calculateSeriesHeight').and.returnValue(300);

            actual = boundsModel.getBaseSizeForLimit(true);
            expected = 300;

            expect(actual).toBe(expected);
        });
    });
});
