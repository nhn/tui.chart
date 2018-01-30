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
        // Rendered width, height is different according to browser
        // Spy these functions so that make same test environment
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
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
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
        it('should convert negative angle to positive angle under 360.', function() {
            var actual = series._makeValidAngle(-90);

            expect(actual).toBe(270);
        });

        it('should convert over 360 angle to under 360 angle', function() {
            var actual = series._makeValidAngle(450);

            expect(actual).toBe(90);
        });

        it('should return default angle if angle is undefined.', function() {
            var angle;
            var defaultAngle = 0;
            var actual = series._makeValidAngle(angle, defaultAngle);

            expect(actual).toBe(0);
        });
    });

    describe('_calculateAngleForRendering()', function() {
        it('should calculate angle by subtracting start angle from end angle, if start angle is larger than end angle.', function() {
            var actual;

            series.options = {
                startAngle: 10,
                endAngle: 90
            };

            actual = series._calculateAngleForRendering();

            expect(actual).toBe(80);
        });

        it('should calculate angle by (360 - (start - angle)), if start angle is larger than end angle.', function() {
            var actual;

            series.options = {
                startAngle: 90,
                endAngle: 10
            };

            actual = series._calculateAngleForRendering();

            expect(actual).toBe(280);
        });

        it('should return 360, if start and end angle are same.', function() {
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
        it('should return 1 if angle is more or same to 0, and less than 90.', function() {
            var actual = series._getQuadrantFromAngle(0);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(45);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(90);

            expect(actual).not.toBe(1);
        });

        it('should return 2, if angle is more or same to 90, and less than 180.', function() {
            var actual = series._getQuadrantFromAngle(90);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(135);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(180);

            expect(actual).not.toBe(2);
        });

        it('should return 3, if angle is more or same to 180, and less than 270.', function() {
            var actual = series._getQuadrantFromAngle(180);

            expect(actual).toBe(3);

            actual = series._getQuadrantFromAngle(225);

            expect(actual).toBe(3);

            actual = series._getQuadrantFromAngle(270);

            expect(actual).not.toBe(2);
        });

        it('should return 4, if angle is more or same to 270, and less than 360.', function() {
            var actual = series._getQuadrantFromAngle(270);

            expect(actual).toBe(4);

            actual = series._getQuadrantFromAngle(315);

            expect(actual).toBe(4);

            actual = series._getQuadrantFromAngle(360);

            expect(actual).not.toBe(4);
        });

        it('should subtract 1 from original quadrant, if isEnd is true and angle is multiples of 90', function() {
            var isEnd = true;
            var actual = series._getQuadrantFromAngle(90, isEnd);

            expect(actual).toBe(1);

            actual = series._getQuadrantFromAngle(180, isEnd);

            expect(actual).toBe(2);

            actual = series._getQuadrantFromAngle(270, isEnd);

            expect(actual).toBe(3);
        });

        it('should return 4, if isEnd is true and angle is 0.', function() {
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

        it('should create angle, center position, outer position values using percentValues.', function() {
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
        it('should set base size to smaller of twiced height and width, if it is on 2 ~ 3 quadrant.', function() {
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

        it('should set base size to smaller of twiced height and width, if it is on 4 ~ 1 quadrant.', function() {
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

        it('should set base size to smaller of height and twiced width, if it is on 1 ~ 2 quadrant.', function() {
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

        it('should set base size to smaller of height and twiced width, if it is on 3 ~ 4 quadrant.', function() {
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

        it('should set base size to smaller of twiced width and twiced height, if start quardrant and end quadrant is same.', function() {
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

        it('should return smaller of width and height without any calculation, if it is combo chart.', function() {
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
        it('should calculate radius to min(width, height) * 0.9.', function() {
            var actual;

            series.layout.dimension = {
                width: 500,
                height: 400
            };

            actual = series._calculateRadius();

            expect(actual).toBe(180);
        });

        it('should calculate radius to min(width, height) * 0.75, if isShowOuterLabel is true.', function() {
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
        it('should calculate cx by subtracting half of radius, cy by adding half of radius. if pie sector is only on 1 quadrant', function() {
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

        it('should calculate cx by subtracting half of radius. if pie sector is on 1 ~ 2 quadrant', function() {
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

        it('should calculate cx by subtracting half of radius, cy by substraction half of radius. if pie sector is only on 1 quadrant', function() {
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

        it('should calculate cy by substracting half of radius. if pie sector is on 2 and 3 quadrant', function() {
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

        it('should calculate cx by adding half of radius, cy by substractiong half of radius. if pie sector is only on 3 quadrant', function() {
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

        it('should calculate cx by adding half of radius. if pie sector is on 3 and 4 quadrant', function() {
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

        it('should calculate cy by adding half of radius. if pie sector is on 4 and 1 quadrant.', function() {
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

        it('should calculate cx, cy by adding half of radius, if pie sector is on 4 quadrant', function() {
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

        it('should return cx, cy without any calculation, if it is combo chart', function() {
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
        it('should make circle bounds of pie type chart like pie or donut chart.', function() {
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
        it('should make arc position by using midpoint(cx, cy), radius, angle', function() {
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
        it('should add end position for rendering outer legend line.', function() {
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
