/**
 * @fileoverview Test boundsMaker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BoundsMaker = require('../../src/js/helpers/boundsMaker'),
    chartConst = require('../../src/js/const'),
    defaultTheme = require('../../src/js/themes/defaultTheme'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('boundsMaker', function() {
    var boundsMaker, dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormatFunctions', 'getGroupValues', 'getWholeGroupValues', 'getWholeLegendData', 'getCategories',
                'getFormattedGroupValues', 'getLegendLabels', 'getMultilineCategories', 'getMultilineCategories']);
        dataProcessor.getFormatFunctions.and.returnValue([]);
    });

    beforeEach(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight');
        boundsMaker = new BoundsMaker({
            dataProcessor: dataProcessor
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
                height: 40
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateXAxisLabelLimitWidth()', function() {
        it('x축 label이 렌더링 될 수있는 영역의 너비를 계산합니다.', function() {
            var actual, expected;

            boundsMaker.axesData = {
                xAxis: {
                    labels: ['cate1', 'cate2', 'cate3']
                }
            };
            boundsMaker.dimensions.series = {
                width: 300
            };

            actual = boundsMaker._calculateXAxisLabelLimitWidth();
            expected = 100;

            expect(actual).toBe(expected);
        });

        it('라인타입 차트의 label 영역 너비를 계산합니다.', function() {
            var actual, expected;

            boundsMaker.chartType = chartConst.CHART_TYPE_LINE;
            boundsMaker.axesData = {
                xAxis: {
                    labels: ['cate1', 'cate2', 'cate3']
                }
            };
            boundsMaker.dimensions.series = {
                width: 300
            };

            actual = boundsMaker._calculateXAxisLabelLimitWidth();
            expected = 150;

            expect(actual).toBe(expected);
        });
    });

    describe('_findRotationDegree()', function() {
        it('후보 각(25, 45, 65, 85)을 순회하며 회전된 비교 너비가 제한 너비보다 작으면 해당 각을 반환합니다.', function() {
            var actual = boundsMaker._findRotationDegree(50, 60, 20),
                expected = 25;
            expect(actual).toBe(expected);
        });

        it('최대 회전각은 85도 입니다.', function() {
            var actual = boundsMaker._findRotationDegree(5, 120, 20),
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
            boundsMaker.axesData = {
                xAxis: {
                    labels: ['cate1', 'cate2', 'cate3']
                }
            };
            boundsMaker.theme = {
                xAxis: {}
            };
            actual = boundsMaker._makeHorizontalLabelRotationInfo(100);
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
            boundsMaker.axesData = {
                xAxis: {
                    labels: ['cate1', 'cate2', 'cate3']
                }
            };
            boundsMaker.theme = {
                xAxis: {}
            };
            actual = boundsMaker._makeHorizontalLabelRotationInfo(5);
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
            boundsMaker.axesData = {
                xAxis: {
                    labels: ['cate1', 'cate2']
                }
            };
            boundsMaker.theme = {
                xAxis: {}
            };
            actual = boundsMaker._makeHorizontalLabelRotationInfo(300);

            expect(actual).toBeNull();
        });
    });

    describe('_calculateOverflowLeft()', function() {
        it('회전된 xAxis label이 왼쪽 차트 시작 영역을 얼마나 넘어갔는지 값을 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsMaker.theme = {
                xAxis: {}
            };
            boundsMaker.dimensions = {
                yAxis: {
                    width: 50
                }
            };
            actual = boundsMaker._calculateOverflowLeft({
                degree: 25,
                maxLabelWidth: 120,
                labelHeight: 20
            }, 'abcdefghijklmnopqrstuvwxyz');
            expected = 3.7677545866464826;

            expect(actual).toBe(expected);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('50의 overflowLeft를 전달하면 chartLeftPadding은 50 증가하고 나머지 dimensions의 width들을 50씩 감소합니다.', function() {
            boundsMaker.chartLeftPadding = 10;
            boundsMaker.dimensions = {
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

            boundsMaker.chartLeftPadding = 10;
            boundsMaker._updateDimensionsWidth(50);

            expect(boundsMaker.chartLeftPadding).toBe(60);
            expect(boundsMaker.getDimension('plot').width).toBe(150);
            expect(boundsMaker.getDimension('series').width).toBe(149);
            expect(boundsMaker.getDimension('xAxis').width).toBe(150);
        });
    });

    describe('_updateDegree()', function() {
        it('overflowLeft값이 0보다 크면 degree를 재계산하여 rotationInfo.degree의 값을 갱신합니다.', function() {
            var rotationInfo = {
                degree: 25,
                maxLabelWidth: 100,
                labelHeight: 20
            };

            boundsMaker.dimensions.series = {
                width: 200
            };

            boundsMaker._updateDegree(rotationInfo, 8, 20);
            expect(rotationInfo.degree).toEqual(85);
        });
    });

    describe('_calculateXAxisRotatedHeight()', function() {
        it('레이블 dimension과 degree 정보를 이용하여 x axis의 회전된 높이 정보를 구합니다.', function() {
            var actual = boundsMaker._calculateXAxisRotatedHeight({
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
            var actual = boundsMaker._calculateDiffWithRotatedHeight({
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
            boundsMaker.theme = {
                xAxis: {}
            };

            actual = boundsMaker._calculateDiffWithMultilineHeight(['AAAA BBBB'], 50);
            expected = 20;

            expect(actual).toBe(expected);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('50의 diffHeight를 전달하면 xAxis.heihgt는 50 감소하고, plot.height, series.height는 50 증가합니다.', function() {
            boundsMaker.dimensions = {
                plot: {
                    height: 200
                },
                series: {
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
            expect(boundsMaker.getDimension('xAxis').height).toBe(100);
            expect(boundsMaker.getDimension('yAxis').height).toBe(150);
            expect(boundsMaker.getDimension('rightYAxis').height).toBe(150);
        });
    });

    describe('_makePlotDimension()', function() {
        it('plot dimension은 전달하는 series dimension에서 hidden width 1을 더한 수치로 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensions.series = {
                width: 200,
                height: 100
            };

            actual = boundsMaker._makePlotDimension();
            expected = {
                width: 200 + chartConst.HIDDEN_WIDTH,
                height: 100 + chartConst.HIDDEN_WIDTH
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

    describe('makeSeriesWidth()', function() {
        it('시리즈 영역의 너비를 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensions = {
                chart: {
                    width: 500
                },
                legend: {
                    width: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            actual = boundsMaker.makeSeriesWidth();
            expected = 380;

            expect(actual).toBe(expected);
        });

        it('legend align옵션이 가로(top, bottom) 옵션이면 legend 너비는 계산하지 않습니다.', function() {
            var actual, expected;

            boundsMaker.options = {
                legend: {
                    align: chartConst.LEGEND_ALIGN_TOP
                }
            };
            boundsMaker.dimensions = {
                chart: {
                    width: 500
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            actual = boundsMaker.makeSeriesWidth();
            expected = 430;

            expect(actual).toBe(expected);
        });
    });

    describe('makeSeriesHeight()', function() {
        it('시리즈 영역의 높이를 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensions = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                xAxis: {
                    height: 50
                }
            };
            actual = boundsMaker.makeSeriesHeight();
            expected = 280;

            expect(actual).toBe(expected);
        });

        it('legend align옵션이 가로(top, bottom) 옵션이면 legend 높이를 추가적으로 빼줍니다.', function() {
            var actual, expected;

            boundsMaker.options = {
                legend: {
                    align: chartConst.LEGEND_ALIGN_TOP
                }
            };
            boundsMaker.dimensions = {
                chart: {
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
                }
            };
            actual = boundsMaker.makeSeriesHeight();
            expected = 230;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('세로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var actual, expected;

            boundsMaker.dimensions = {
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
                }
            };
            actual = boundsMaker._makeSeriesDimension();
            expected = {
                width: 380,
                height: 280
            };

            expect(actual).toEqual(expected);
        });

        it('가로 범례의 series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var actual, expected;

            boundsMaker.dimensions = {
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
            boundsMaker.options = {
                legend: {
                    align: chartConst.LEGEND_ALIGN_TOP
                }
            };
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
            spyOn(boundsMaker, '_makeSeriesDimension').and.returnValue({
                width: 300,
                height: 200
            });

            boundsMaker._registerCenterComponentsDimension();

            expect(boundsMaker.getDimension('series').width).toBe(300);
            expect(boundsMaker.getDimension('series').height).toBe(200);
            expect(boundsMaker.getDimension('tooltip').width).toBe(300);
            expect(boundsMaker.getDimension('tooltip').height).toBe(200);
            expect(boundsMaker.getDimension('customEvent').width).toBe(300);
            expect(boundsMaker.getDimension('customEvent').height).toBe(200);
        });
    });

    describe('_registerAxisComponentsPosition()', function() {
        it('시리즈 position과 leftLegendWidth 정보를 이용하여 axis를 구성하는 components들의 position정보를 등록합니다.', function() {
            var seriesPosition = {
                    left: 50,
                    top: 50
                },
                leftLegendWidth = 0;

            boundsMaker.dimensions.series = {
                width: 300,
                height: 200
            };
            boundsMaker.dimensions.yAxis = {
                width: 30
            };

            boundsMaker._registerAxisComponentsPosition(seriesPosition, leftLegendWidth);

            expect(boundsMaker.getPosition('plot').top).toBe(50);
            expect(boundsMaker.getPosition('plot').left).toBe(49);
            expect(boundsMaker.getPosition('yAxis').top).toBe(50);
            expect(boundsMaker.getPosition('yAxis').left).toBe(10);
            expect(boundsMaker.getPosition('xAxis').top).toBe(250);
            expect(boundsMaker.getPosition('xAxis').left).toBe(49);
            expect(boundsMaker.getPosition('rightYAxis').top).toBe(50);
            expect(boundsMaker.getPosition('rightYAxis').left).toBe(339);
        });
    });

    describe('_makeLegendPosition()', function() {
        it('기본 옵션의 legend position정보를 생성합니다.', function() {
            var actual, expected;

            boundsMaker.dimensions = {
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

            boundsMaker.dimensions = {
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

    describe('_registerEssentialComponentsPositions()', function() {
        it('계산된 series position정보를 이용하여 필수 component들의 position을 등록합니다.', function() {
            var seriesPosition = {
                left: 50,
                top: 50
            };

            spyOn(boundsMaker, '_makeLegendPosition').and.returnValue({
                top: 30,
                left: 250
            });

            boundsMaker.hasAxes = true;
            boundsMaker._registerEssentialComponentsPositions(seriesPosition);

            expect(boundsMaker.getPosition('series').top).toBe(50);
            expect(boundsMaker.getPosition('series').left).toBe(50);
            expect(boundsMaker.getPosition('customEvent').top).toBe(50);
            expect(boundsMaker.getPosition('customEvent').left).toBe(50);
            expect(boundsMaker.getPosition('legend').top).toBe(30);
            expect(boundsMaker.getPosition('legend').left).toBe(250);
            expect(boundsMaker.getPosition('tooltip').top).toBe(40);
            expect(boundsMaker.getPosition('tooltip').left).toBe(40);
        });
    });
});
