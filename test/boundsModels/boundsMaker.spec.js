/**
 * @fileoverview Test for BoundsMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BoundsMaker = require('../../src/js/models/bounds/boundsMaker');
var chartConst = require('../../src/js/const');
var renderUtil = require('../../src/js/helpers/renderUtil');

describe('Test for BoundsMaker', function() {
    var boundsMaker, dataProcessor, scaleModel;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormattedMaxValue', 'getFormatFunctions', 'getGroupValues', 'getWholeGroupValues', 'getLegendData', 'getCategories',
                'getFormattedGroupValues', 'getLegendLabels', 'getMultilineCategories', 'getMultilineCategories']);
        dataProcessor.getFormatFunctions.and.returnValue([]);
        scaleModel = jasmine.createSpyObj('scaleModel', ['getMultilineXAxisLabels', 'getAxisDataMap', 'getAxisData']);
    });

    beforeEach(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight');
        boundsMaker = new BoundsMaker({
            dataProcessor: dataProcessor,
            options: {
                legend: {
                    visible: true
                }
            }
        });
    });

    describe('_registerChartDimension()', function() {
        it('chart option(width, height) 정보를 받아 chart dimension을 등록합니다.', function() {
            var actual, expected;

            boundsMaker.options.chart = {
                width: 300,
                height: 200
            };
            boundsMaker._registerChartDimension();
            actual = boundsMaker.getDimension('chart');
            expected = {
                width: 300,
                height: 200
            };

            expect(actual).toEqual(expected);
        });

        it('chart option이 없는 경우에는 기본값으로 dimension을 등록합니다.', function() {
            var actual, expected;

            boundsMaker._registerChartDimension();
            actual = boundsMaker.getDimension('chart');
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

            renderUtil.getRenderedLabelHeight.and.returnValue(20);
            boundsMaker._registerTitleDimension();
            actual = boundsMaker.getDimension('title');
            expected = {
                height: 30
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('update dimensions width', function() {
            boundsMaker.chartLeftPadding = 10;
            boundsMaker.dimensionMap = {
                plot: {
                    width: 200
                },
                series: {
                    width: 199
                },
                customEvent: {
                    width: 199
                },
                xAxis: {
                    width: 200
                }
            };

            boundsMaker.chartLeftPadding = 10;
            boundsMaker._updateDimensionsWidth(50);

            expect(boundsMaker.chartLeftPadding).toBe(60);
            expect(boundsMaker.getDimension('plot').width).toBe(150);
            expect(boundsMaker.getDimension('series').width).toBe(149);
            expect(boundsMaker.getDimension('customEvent').width).toBe(149);
            expect(boundsMaker.getDimension('xAxis').width).toBe(150);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('50의 diffHeight를 전달하면 xAxis.heihgt는 50 감소하고, plot.height, series.height는 50 증가합니다.', function() {
            boundsMaker.dimensionMap = {
                plot: {
                    height: 200
                },
                series: {
                    height: 200
                },
                customEvent: {
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
            boundsMaker._updateDimensionsHeight(50);

            expect(boundsMaker.getDimension('plot').height).toBe(150);
            expect(boundsMaker.getDimension('series').height).toBe(150);
            expect(boundsMaker.getDimension('customEvent').height).toBe(150);
            expect(boundsMaker.getDimension('tooltip').height).toBe(150);
            expect(boundsMaker.getDimension('xAxis').height).toBe(100);
            expect(boundsMaker.getDimension('yAxis').height).toBe(150);
            expect(boundsMaker.getDimension('rightYAxis').height).toBe(150);
        });
    });

    describe('_makePlotDimension()', function() {
        it('plot dimension은 전달하는 series dimension에서 hidden width 1을 더한 수치로 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensionMap.series = {
                width: 200,
                height: 100
            };

            actual = boundsMaker._makePlotDimension();
            expected = {
                width: 200,
                height: 101
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerAxisComponentsDimension()', function() {
        it('plot dimension을 계산하여 axis를 구성하는 component들의 dimension을 등록합니다.', function() {
            spyOn(boundsMaker, '_makePlotDimension').and.returnValue({
                width: 300,
                height: 200
            });
            boundsMaker._registerAxisComponentsDimension();

            expect(boundsMaker.getDimension('plot').width).toBe(300);
            expect(boundsMaker.getDimension('plot').height).toBe(200);
            expect(boundsMaker.getDimension('xAxis').width).toBe(300);
            expect(boundsMaker.getDimension('yAxis').height).toBe(200);
            expect(boundsMaker.getDimension('rightYAxis').height).toBe(200);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('세로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsMaker.dimensionMap = {
                chart: {
                    width: 500,
                    height: 400
                },
                title: {
                    height: 50
                },
                calculationLegend: {
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
                }
            };
            actual = boundsMaker._makeSeriesDimension();
            expected = {
                width: 380,
                height: 280
            };

            expect(actual).toEqual(expected);
        });

        it('가로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsMaker.dimensionMap = {
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
                }
            };
            boundsMaker.options.legend.align = chartConst.LEGEND_ALIGN_TOP;

            actual = boundsMaker._makeSeriesDimension();
            expected = {
                width: 430,
                height: 230
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerCenterComponentsDimension()', function() {
        it('시리즈 dimension을 생성하여 중앙에 위치하는 component들의 dimension을 등록합니다.', function() {
            boundsMaker.dimensionMap = {
                series: {
                    width: 300,
                    height: 200
                }
            };
            boundsMaker._registerCenterComponentsDimension();

            expect(boundsMaker.getDimension('tooltip').width).toBe(300);
            expect(boundsMaker.getDimension('tooltip').height).toBe(200);
            expect(boundsMaker.getDimension('customEvent').width).toBe(300);
            expect(boundsMaker.getDimension('customEvent').height).toBe(200);
        });
    });

    describe('_registerAxisComponentsPosition()', function() {
        it('시리즈 position과 leftLegendWidth 정보를 이용하여 axis를 구성하는 components들의 position정보를 등록합니다.', function() {
            var leftLegendWidth = 0;

            boundsMaker.dimensionMap.series = {
                width: 300,
                height: 200
            };
            boundsMaker.dimensionMap.yAxis = {
                width: 30
            };
            boundsMaker.positionMap.series = {
                left: 50,
                top: 50
            };

            boundsMaker._registerAxisComponentsPosition(leftLegendWidth);

            expect(boundsMaker.getPosition('plot').top).toBe(50);
            expect(boundsMaker.getPosition('plot').left).toBe(50);
            expect(boundsMaker.getPosition('yAxis').top).toBe(50);
            expect(boundsMaker.getPosition('yAxis').left).toBe(10);
            expect(boundsMaker.getPosition('xAxis').top).toBe(250);
            expect(boundsMaker.getPosition('xAxis').left).toBe(50);
            expect(boundsMaker.getPosition('rightYAxis').top).toBe(50);
            expect(boundsMaker.getPosition('rightYAxis').left).toBe(339);
        });
    });

    describe('_makeLegendPosition()', function() {
        it('기본 옵션의 legend position정보를 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensionMap = {
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
            actual = boundsMaker._makeLegendPosition();
            expected = {
                top: 20,
                left: 270
            };

            expect(actual).toEqual(expected);
        });

        it('align옵션이 bottom인 legend의 position정보를 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensionMap = {
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
            actual = boundsMaker._makeLegendPosition();
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

            boundsMaker.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsMaker.dimensionMap = {
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

            actual = boundsMaker._makeCircleLegendPosition().left;
            expected = 455;

            expect(actual).toBe(expected);
        });

        it('왼쪽 정렬인 경우에는 circleLegend와 legend의 너비 차만 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsMaker.options.legend.align = chartConst.LEGEND_ALIGN_LEFT;

            boundsMaker.positionMap = {
                series: {}
            };
            boundsMaker.dimensionMap = {
                series: {},
                circleLegend: {
                    width: 100
                },
                legend: {
                    width: 120
                }
            };

            actual = boundsMaker._makeCircleLegendPosition().left;
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('가로타입의 범례인 경우에는 series의 left와 너비 값 만을 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsMaker.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsMaker.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsMaker.options = {
                legend: {
                    align: 'top'
                }
            };

            actual = boundsMaker._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('범례가 숨겨진 경우에도 series의 left와 너비 값 만을 이용하여 left를 구합니다.', function() {
            var actual, expected;

            boundsMaker.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsMaker.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsMaker.options = {
                legend: {
                    visible: false
                }
            };

            actual = boundsMaker._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('series의 position.top과 series의 높이 값을 더한 값에 circleLegend의 높이를 빼 circleLegend의 top을 구합니다.', function() {
            var actual, expected;

            boundsMaker.positionMap = {
                series: {
                    top: 60
                }
            };
            boundsMaker.dimensionMap = {
                series: {
                    height: 300
                },
                circleLegend: {
                    height: 80
                },
                legend: {}
            };

            actual = boundsMaker._makeCircleLegendPosition().top;
            expected = 280;

            expect(actual).toBe(expected);
        });
    });

    describe('_registerEssentialComponentsPositions()', function() {
        it('계산된 series position정보를 이용하여 필수 component들의 position을 등록합니다.', function() {
            spyOn(boundsMaker, '_makeLegendPosition').and.returnValue({
                top: 30,
                left: 250
            });

            boundsMaker.chartType = 'bar';
            boundsMaker.hasAxes = true;
            boundsMaker.positionMap.series = {
                left: 50,
                top: 50
            };
            boundsMaker._registerEssentialComponentsPositions();

            expect(boundsMaker.getPosition('customEvent').top).toBe(50);
            expect(boundsMaker.getPosition('customEvent').left).toBe(50);
            expect(boundsMaker.getPosition('legend').top).toBe(30);
            expect(boundsMaker.getPosition('legend').left).toBe(250);
            expect(boundsMaker.getPosition('tooltip').top).toBe(40);
            expect(boundsMaker.getPosition('tooltip').left).toBe(40);
        });
    });

    describe('_updateBoundsForYAxisCenterOption()', function() {
        it('yAxis 중앙정렬을 위해 각종 컴포넌트들의 bounds를 갱신합니다.', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            boundsMaker.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                customEvent: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsMaker.positionMap = {
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
                customEvent: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsMaker.dimensionMap.yAxis = {
                width: 50
            };
            boundsMaker.dimensionMap.series = {
                width: 300
            };

            boundsMaker._updateBoundsForYAxisCenterOption();

            expect(boundsMaker.dimensionMap.extendedSeries.width).toBe(350);
            expect(boundsMaker.dimensionMap.xAxis.width).toBe(301);
            expect(boundsMaker.dimensionMap.plot.width).toBe(351);
            expect(boundsMaker.dimensionMap.customEvent.width).toBe(350);
            expect(boundsMaker.dimensionMap.tooltip.width).toBe(350);

            expect(boundsMaker.positionMap.series.left).toBe(0);
            expect(boundsMaker.positionMap.extendedSeries.left).toBe(1);
            expect(boundsMaker.positionMap.plot.left).toBe(1);
            expect(boundsMaker.positionMap.yAxis.left).toBe(201);
            expect(boundsMaker.positionMap.xAxis.left).toBe(1);
            expect(boundsMaker.positionMap.customEvent.left).toBe(1);
            expect(boundsMaker.positionMap.tooltip.left).toBe(1);
        });

        it('구형 브라우저(IE7, IE8)의 경우 series와 extendedSeries의 left값이 1만큼 더 많아야 합니다.', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
            boundsMaker.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                customEvent: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsMaker.positionMap = {
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
                customEvent: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsMaker.dimensionMap.yAxis = {
                width: 50
            };
            boundsMaker.dimensionMap.series = {
                width: 300
            };

            boundsMaker._updateBoundsForYAxisCenterOption();

            expect(boundsMaker.positionMap.series.left).toBe(1);
            expect(boundsMaker.positionMap.extendedSeries.left).toBe(2);
        });
    });

    describe('_updateLegendAndSeriesWidth()', function() {
        it('update legend width, when has width for vertical type legend', function() {
            boundsMaker.dimensionMap.series = {
                width: 300
            };
            boundsMaker.dimensionMap.legend = {
                width: 0
            };
            boundsMaker.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_LEFT
            };

            boundsMaker._updateLegendAndSeriesWidth(80, 20);

            expect(boundsMaker.getDimension('legend').width).toBe(80);
        });

        it('update legend width, when has not width for vertical type legend', function() {
            boundsMaker.dimensionMap.series = {
                width: 300
            };
            boundsMaker.dimensionMap.legend = {
                width: 0
            };
            boundsMaker.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_TOP
            };

            boundsMaker._updateLegendAndSeriesWidth(80, 20);

            expect(boundsMaker.getDimension('legend').width).toBe(0);
        });

        it('update series width', function() {
            boundsMaker.dimensionMap.series = {
                width: 300
            };

            boundsMaker._updateLegendAndSeriesWidth(80, 20);

            expect(boundsMaker.getDimension('series').width).toBe(280);
        });
    });
});
