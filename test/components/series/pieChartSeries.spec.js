/**
 * @fileoverview test pie chart series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = require('raphael');
var snippet = require('tui-code-snippet');
var pieSeriesFactory = require('../../../src/js/components/series/pieChartSeries.js');
var SeriesDataModel = require('../../../src/js/models/data/seriesDataModel');
var SeriesGroup = require('../../../src/js/models/data/seriesGroup');
var dom = require('../../../src/js/helpers/domHandler.js');
var renderUtil = require('../../../src/js/helpers/renderUtil.js');

describe('PieChartSeries', function() {
    var series, dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getLegendLabels', 'getSeriesDataModel', 'getFirstItemLabel']);

        dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
        dataProcessor.getFirstItemLabel.and.returnValue('2.2');
    });

    beforeEach(function() {
        series = new pieSeriesFactory.PieChartSeries({
            chartType: 'pie',
            theme: {
                pie: {
                    label: {
                        fontFamily: 'Verdana',
                        fontSize: 11
                    }
                }
            },
            options: {},
            dataProcessor: dataProcessor,
            eventBus: new snippet.CustomEvents()
        });
        series.layout = {
            position: {
                left: 0,
                top: 0
            }
        };
    });

    describe('_makeValidAngle()', function() {
        it('angle이 음수각인 경우에는 360 이하의 양수각으로 변경하여 반환합니다.', function() {
            var actual = series._makeValidAngle(-90);

            expect(actual).toBe(270);
        });

        it('angle이 양수일 경우에는 360이하의 각으로 변경하여 반환합니다', function() {
            var actual = series._makeValidAngle(450);

            expect(actual).toBe(90);
        });

        it('angle이 undefined인 경우에는 defaultAngle을 반환합니다.', function() {
            var angle;
            var defaultAngle = 0;
            var actual = series._makeValidAngle(angle, defaultAngle);

            expect(actual).toBe(0);
        });
    });

    describe('_calculateAngleForRendering()', function() {
        it('startAngle이 endAngle보다 작으면 endAngle에서 startAngle을 뺀 값을 반환합니다.', function() {
            var actual;

            series.options = {
                startAngle: 10,
                endAngle: 90
            };

            actual = series._calculateAngleForRendering();

            expect(actual).toBe(80);
        });

        it('startAngle이 endAngle보다 크면 360에서 endAngle과 startAngle의 차를 뺀 값을 반환합니다.', function() {
            var actual;

            series.options = {
                startAngle: 90,
                endAngle: 10
            };

            actual = series._calculateAngleForRendering();

            expect(actual).toBe(280);
        });

        it('startAngle과 endAngle이 같으면 360을 반환합니다.', function() {
            var actual;

            series.options = {
                startAngle: 90,
                endAngle: 90
            };

            actual = series._calculateAngleForRendering();

            expect(actual).toBe(360);
        });
    });

    describe('_getQuadrantFromAngle()', function() {
        it('angle이 0 이상 90 미만이면 1을 반환합니다.', function() {
            var actual = series._getQuadrantFromAngle(0);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(45);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(90);

            expect(actual).not.toBe(1);
        });

        it('angle이 90 이상 180 미만이면 2를 반환합니다.', function() {
            var actual = series._getQuadrantFromAngle(90);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(135);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(180);

            expect(actual).not.toBe(2);
        });

        it('angle이 180이상 270 미만이면 3을 반환합니다.', function() {
            var actual = series._getQuadrantFromAngle(180);

            expect(actual).toBe(3);

            actual = series._getQuadrantFromAngle(225);

            expect(actual).toBe(3);

            actual = series._getQuadrantFromAngle(270);

            expect(actual).not.toBe(2);
        });

        it('angle이 270이상 360 미만이면 4를 반환합니다.', function() {
            var actual = series._getQuadrantFromAngle(270);

            expect(actual).toBe(4);

            actual = series._getQuadrantFromAngle(315);

            expect(actual).toBe(4);

            actual = series._getQuadrantFromAngle(360);

            expect(actual).not.toBe(4);
        });

        it('isEnd가 true이면서 angle이 90의 배수이면 기존 결과값에서 1을 빼낸 결과를 반환합니다.', function() {
            var isEnd = true;
            var actual = series._getQuadrantFromAngle(90, isEnd);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(180, isEnd);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(270, isEnd);

            expect(actual).toBe(3);
        });

        it('isEnd가 true이면서 angle이 0인 경우에는 4를 반환합니다.', function() {
            var isEnd = true;
            var actual = series._getQuadrantFromAngle(0, isEnd);

            expect(actual).toBe(4);
        });
    });

    describe('_makeSectorData()', function() {
        it('should create path ratio 0 when seriesItem is null.', function() {
            var seriesDataModel = new SeriesDataModel(),
                actual;

            seriesDataModel.groups = [
                new SeriesGroup([
                    null, {
                        ratio: 0.125
                    }, {
                        ratio: 0.1
                    }, {
                        ratio: 0.35
                    }, {
                        ratio: 0.175
                    }
                ])
            ];
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);

            actual = series._makeSectorData({
                cx: 100,
                cy: 100,
                r: 100
            });

            expect(actual.length).toBe(5);
            expect(actual[0].ratio).toBe(0);
        });

        it('percentValues를 이용하여 angle 정보와 center position, outer position 정보를 계산하여 반환합니다.', function() {
            var seriesDataModel = new SeriesDataModel(),
                actual;

            seriesDataModel.groups = [
                new SeriesGroup([
                    {
                        ratio: 0.25
                    }, {
                        ratio: 0.125
                    }, {
                        ratio: 0.1
                    }, {
                        ratio: 0.35
                    }, {
                        ratio: 0.175
                    }
                ])
            ];
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);

            actual = series._makeSectorData({
                cx: 100,
                cy: 100,
                r: 100
            });

            expect(actual.length).toBe(5);
            expect(actual[0].ratio).toBe(0.25);
            expect(actual[0].angles.start.startAngle).toBe(0);
            expect(actual[0].angles.start.endAngle).toBe(0);
            expect(actual[0].angles.end.startAngle).toBe(0);
            expect(actual[0].angles.end.endAngle).toBe(90);
            expect(actual[0].centerPosition).toEqual({
                left: 135.35533905932738,
                top: 64.64466094067262
            });
            expect(actual[0].outerPosition.start).toEqual({
                left: 170.71067811865476,
                top: 29.289321881345245
            });
            expect(actual[0].outerPosition.middle).toEqual({
                left: 177.78174593052023,
                top: 22.21825406947977
            });
        });
    });

    describe('_calculateBaseSize()', function() {
        it('사분면의 범위가 2 ~ 3 사분면인 경우 높이 값을 두배로 하여 너비와 높이값 중 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 600,
                height: 400
            };
            series.options.startAngle = 120;
            series.options.endAngle = 220;

            actual = series._calculateBaseSize();

            expect(actual).toBe(600);
        });

        it('사분면의 범위가 4 ~ 1 사분면인 경우에도 높이 값을 두배로 하여 너비와 높이 값 중 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 600,
                height: 400
            };
            series.options.startAngle = 320;
            series.options.endAngle = 80;

            actual = series._calculateBaseSize();

            expect(actual).toBe(600);
        });

        it('사분면의 범위가 1 ~ 2 사분면인 경우 너비 값을 두배로 하여 너비와 높이 값 중 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 300,
                height: 400
            };
            series.options.startAngle = 0;
            series.options.endAngle = 180;

            actual = series._calculateBaseSize();

            expect(actual).toBe(400);
        });

        it('사분면의 범위가 3 ~ 4 사분면인 경우에도 너비 값을 두배로 하여 너비와 높이 값 중 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 300,
                height: 400
            };
            series.options.startAngle = 180;
            series.options.endAngle = 360;

            actual = series._calculateBaseSize();

            expect(actual).toBe(400);
        });

        it('시작 사분변과 종료 사분면이 같은 경우에는 너비, 높이 값 모두 두배로 하여 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 20;
            series.options.endAngle = 80;

            actual = series._calculateBaseSize();

            expect(actual).toBe(800);
        });

        it('콤보 차트의 경우 추가적인 계산 없이 너비와 높이 값 중 작은 값을 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.isCombo = true;

            actual = series._calculateBaseSize();

            expect(actual).toBe(400);
        });
    });

    describe('_calculateRadius()', function() {
        it('시리즈 영역의 너비와 높이 중 작은 값의 반의 90%를 반지름으로 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };

            actual = series._calculateRadius();

            expect(actual).toBe(180);
        });

        it('isShowOuterLabel이 true인 경우에는 75%를 반환합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.isShowOuterLabel = true;

            actual = series._calculateRadius();

            expect(actual).toBe(150);
        });
    });

    describe('_calculateCenterXY()', function() {
        it('pie sector가 1사분면에만 존재하면 계산된 cx를 반지름의 반 길이만큼 줄여주고 cy를 반지름의 반 길이만큼 늘여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 20;
            series.options.endAngle = 80;

            actual = series._calculateCenterXY(320);

            expect(actual.cx).toEqual(90);
            expect(actual.cy).toEqual(360);
        });

        it('pie sector가 1 ~ 2 사분면에 존재하면 계산된 cx를 반지름의 반 길이만큼 줄여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 20;
            series.options.endAngle = 160;

            actual = series._calculateCenterXY(160);

            expect(actual.cx).toEqual(170);
            expect(actual.cy).toEqual(200);
        });

        it('pie sector가 2사분면에만 존재하면 계산된 cx, cy 모두 반지름의 반 길이만큼 줄여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 110;
            series.options.endAngle = 180;

            actual = series._calculateCenterXY(320);

            expect(actual.cx).toEqual(90);
            expect(actual.cy).toEqual(40);
        });

        it('pie sector가 2 ~ 3 사분면에 존재하면 계산된 cy를 반지름의 반 길이만큼 줄여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 90;
            series.options.endAngle = 270;

            actual = series._calculateCenterXY(200);

            expect(actual.cx).toEqual(250);
            expect(actual.cy).toEqual(100);
        });

        it('pie sector가 3사분면에만 존재하면 계산된 cx를 반지름의 반 길이만큼 늘여주고 cy를 반지름의 반 길이만큼 줄여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 220;
            series.options.endAngle = 250;

            actual = series._calculateCenterXY(320);

            expect(actual.cx).toEqual(410);
            expect(actual.cy).toEqual(40);
        });

        it('pie sector가 3 ~ 4 사분면에 존재하면 계산된 cx를 반지름의 반 길이만큼 늘여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 250;
            series.options.endAngle = 350;

            actual = series._calculateCenterXY(160);

            expect(actual.cx).toEqual(330);
            expect(actual.cy).toEqual(200);
        });

        it('pie sector가 4 ~ 1 사분면에 존재하면 계산된 cy를 반지름의 반 길이만큼 늘여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 280;
            series.options.endAngle = 50;

            actual = series._calculateCenterXY(200);

            expect(actual.cx).toEqual(250);
            expect(actual.cy).toEqual(300);
        });

        it('pie sector가 4사분면에만 존재하면 계산된 cx, cy 모두 반지름의 반 길이만큼 늘여줍니다', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.options.startAngle = 270;
            series.options.endAngle = 360;

            actual = series._calculateCenterXY(320);

            expect(actual.cx).toEqual(410);
            expect(actual.cy).toEqual(360);
        });

        it('콤보차트 인 경우에는 cx, cy에 대해 추가적인 연산을 수행하지 않습니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };
            series.isCombo = true;

            actual = series._calculateCenterXY(320);

            expect(actual.cx).toEqual(250);
            expect(actual.cy).toEqual(200);
        });
    });

    describe('_makeCircleBound()', function() {
        it('pie 타입 차트(pie, donut)의 circle bounds정보를 생성합니다.', function() {
            var actual;

            series.layout.dimension = {
                width: 400,
                height: 300
            };
            actual = series._makeCircleBound();

            expect(actual).toEqual({
                cx: 200,
                cy: 150,
                r: 135
            });
        });
    });

    describe('_getArcPosition()', function() {
        it('원의 중점(cx, cy), 반지름(r), angle 정보를 계산하여 해당 각의 호 position 값을 얻어낸다.', function() {
            var actual = series._getArcPosition({
                    cx: 100,
                    cy: 100,
                    r: 50,
                    angle: 45
                }),
                expected = {
                    left: 135.35533905932738,
                    top: 64.64466094067262
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_addEndPosition()', function() {
        it('pie 차트의 외곽 legend line을 표현하기 위해 요소에 end position정보를 추가합니다.', function() {
            var positions = [
                {
                    middle: {
                        left: 100,
                        top: 50
                    }
                }, {
                    middle: {
                        left: 150,
                        top: 100
                    }
                }, {
                    middle: {
                        left: 100,
                        top: 150
                    }
                }
            ];

            series._addEndPosition(110, positions);

            expect(positions[0].middle.left).toBe(100);
            expect(positions[0].end.left).toBe(80);

            expect(positions[1].middle.left).toBe(150);
            expect(positions[1].end.left).toBe(170);

            expect(positions[2].middle.left).toBe(100);
            expect(positions[2].end.left).toBe(80);
        });
    });

    describe('_renderSeriesLabel()', function() {
        beforeEach(function() {
            var container = dom.create('div');
            this.seriesDataModel = new SeriesDataModel();
            this.paper = raphael(container, 100, 100);

            spyOn(series.graphRenderer, 'renderLabels');

            this.seriesDataModel.groups = [
                new SeriesGroup([{
                    label: 10
                }, {
                    label: 20
                }, {
                    label: 30
                }])
            ];
        });

        it('showLabel and showLegend options are both true, they should all be displayed.', function() {
            var expectLabelObj;

            series.options.showLabel = true;
            series.options.showLegend = true;

            dataProcessor.getSeriesDataModel.and.returnValue(this.seriesDataModel);
            series._renderSeriesLabel(this.paper, {});

            expectLabelObj = series.graphRenderer.renderLabels.calls.allArgs()[0][2];

            expect(expectLabelObj[0]).toBe('legend1\n10');

            this.paper.remove();
        });

        it('showLabel option is true, only one should be displayed.', function() {
            var expectLabelObj;

            series.options.showLabel = true;
            series.options.showLegend = false;

            dataProcessor.getSeriesDataModel.and.returnValue(this.seriesDataModel);
            series._renderSeriesLabel(this.paper, {});

            expectLabelObj = series.graphRenderer.renderLabels.calls.allArgs()[0][2];

            expect(expectLabelObj[0]).toBe('10');

            this.paper.remove();
        });

        it('showRegend option is true, only one should be displayed.', function() {
            var expectLabelObj;

            series.options.showLabel = false;
            series.options.showLegend = true;

            dataProcessor.getSeriesDataModel.and.returnValue(this.seriesDataModel);
            series._renderSeriesLabel(this.paper, {});

            expectLabelObj = series.graphRenderer.renderLabels.calls.allArgs()[0][2];

            expect(expectLabelObj[0]).toBe('legend1');

            this.paper.remove();
        });
    });
});
