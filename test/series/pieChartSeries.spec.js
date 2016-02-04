/**
 * @fileoverview test pie chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PieChartSeries = require('../../src/js/series/pieChartSeries.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('PieChartSeries', function() {
    var series, dataProcessor, boundsMaker;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getLegendLabels', 'getFormattedValue']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        series = new PieChartSeries({
            chartType: 'pie',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {},
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker
        });
    });

    describe('_makeSectorData()', function() {
        it('percentValues를 이용하여 angle 정보와 center position, outer position 정보를 계산하여 반환합니다.', function() {
            var actual = series._makeSectorData([0.25, 0.125, 0.1, 0.35, 0.175], {
                cx: 100,
                cy: 100,
                r: 100
            });

            expect(actual.length).toBe(5);
            expect(actual[0].percentValue).toBe(0.25);
            expect(actual[0].angles.start.startAngle).toBe(0);
            expect(actual[0].angles.start.endAngle).toBe(0);
            expect(actual[0].angles.end.startAngle).toBe(0);
            expect(actual[0].angles.end.endAngle).toBe(90);
            expect(actual[0].centerPosition).toEqual({
                left: 142.42640687119285,
                top: 57.57359312880715
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

    describe('_makeCircleBound()', function() {
        it('pie차트의 circle bounds정보를 생성합니다.', function () {
            var actual = series._makeCircleBound({
                width: 400,
                height: 300
            }, {});

            expect(actual).toEqual({
                cx: 200,
                cy: 150,
                r: 120
            });
        });

        it('showLabel=true, legendType=outer일 때에는 pie차트의 circle bounds의 반지름을(r) 작은 크기로 생성합니다.', function () {
            var actual = series._makeCircleBound({
                width: 400,
                height: 300
            }, {
                showLabel: true,
                legendAlign: 'outer'
            });

            expect(actual.r).toBe(97.5);
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

    describe('_getSeriesLabel()', function() {
        it('legendType 옵션만 있을 경우에는 legend만 반환합니다.', function() {
            var actual, expected;

            series.legendAlign = 'outer';
            actual = series._getSeriesLabel({
                legend: 'legend'
            });
            expected = '<span class="tui-chart-series-legend">legend</span>';

            expect(actual).toBe(expected);
        });

        it('showLabel 옵션만 있을 경우에는 label만 반환한다.', function() {
            var actual, expected;

            series.options.showLabel = true;
            actual = series._getSeriesLabel({
                label: 'label'
            });
            expected = 'label';

            expect(actual).toBe(expected);
        });

        it('legendType, showLabel 옵션이 있을 경우에는 legend + separator + label 형태로 반환합니다.', function() {
            var actual, expected;

            series.options.showLabel = true;
            series.legendAlign = 'outer';

            actual = series._getSeriesLabel({
                legend: 'legend',
                label: 'label',
                separator: ':&nbsp;'
            });
            expected = '<span class="tui-chart-series-legend">legend</span>:&nbsp;label';

            expect(actual).toBe(expected);
        });
    });

    describe('_moveToCenterPosition()', function() {
        it('label이 position의 중심에 위치하도록 label position을 계산하여 반환한다.', function() {
            var actual = series._moveToCenterPosition({
                    left: 100,
                    top: 50
                }, 'label1'),
                expected = {
                    left: 80,
                    top: 40
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_renderCenterLegend()', function() {
        it('legend를 전달받은 position 중앙에 위치시킵니다.', function() {
            var elLabelArea = dom.create('div'),
                children;

            dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
            dataProcessor.getFormattedValue.and.returnValue(function(groupIndex, index) {
                var values = ['1.1', '2.2', '3.3'];
                return values[index];
            });
            series.legendAlign = 'center';
            series.seriesData = {
                sectorData: [
                    {
                        centerPosition: {
                            left: 100,
                            top: 50
                        },
                        percentValue: 0.3
                    },
                    {
                        centerPosition: {
                            left: 100,
                            top: 100
                        },
                        percentValue: 0.4
                    },
                    {
                        centerPosition: {
                            left: 100,
                            top: 150
                        },
                        percentValue: 0.4
                    }
                ]
            };
            series._renderCenterLegend(elLabelArea);
            children = elLabelArea.childNodes;

            expect(children[0].style.left).toBe('80px');
            expect(children[0].style.top).toBe('40px');
            expect(children[0].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[0].firstChild.innerHTML).toBe('legend1');
            expect(children[1].style.left).toBe('80px');
            expect(children[1].style.top).toBe('90px');
            expect(children[1].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[1].firstChild.innerHTML).toBe('legend2');
            expect(children[2].style.left).toBe('80px');
            expect(children[2].style.top).toBe('140px');
            expect(children[2].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[2].firstChild.innerHTML).toBe('legend3');
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
                    },
                    {
                        middle: {
                            left: 150,
                            top: 100
                        }
                    },
                    {
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

    describe('_moveToOuterPosition()', function() {
        it('position.left값이 기준 값(centerLeft)보다 작으면 좌측으로 label너비 만큼 이동 시킵니다. position.top은 label높이가 중앙에 위치하도록 조절합니다.', function() {
            var actual = series._moveToOuterPosition(120, {
                    end: {
                        left: 100,
                        top: 50
                    }
                }, 'label1');

            expect(actual.left).toBe(55);
        });

        it('position.left값이 기준 값(centerLeft)보다 크면 이동없이 반환합니다.', function() {
            var actual = series._moveToOuterPosition(120, {
                    end: {
                        left: 140,
                        top: 50
                    }
                }, 'label1');

            expect(actual.left).toBe(145);
        });
    });

    describe('_renderOuterLegend()', function() {
        it('lengend를 전달받은 position 중앙에 위치시킵니다.', function() {
            var labelContainer = dom.create('div'),
                children;

            dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
            dataProcessor.getFormattedValue.and.returnValue(function(groupIndex, index) {
                var values = ['1.1', '2.2', '3.3'];
                return values[index];
            });
            spyOn(series.graphRenderer, 'renderLegendLines');
            boundsMaker.getDimension.and.returnValue({
                width: 220
            });
            series.legendAlign = 'outer';
            series.seriesData = {
                sectorData: [
                    {
                        outerPosition: {
                            middle: {
                                left: 100,
                                top: 50
                            }
                        },
                        percentValue: 0.3
                    },
                    {
                        outerPosition: {
                            middle: {
                                left: 150,
                                top: 100
                            }
                        },
                        percentValue: 0.4
                    },
                    {
                        outerPosition: {
                            middle: {
                                left: 100,
                                top: 150
                            }
                        },
                        percentValue: 0.4
                    }
                ]
            };
            series._renderOuterLegend(labelContainer);

            children = labelContainer.childNodes;

            expect(children[0].style.left).toBe('35px');
            expect(children[0].style.top).toBe('40px');
            expect(children[0].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[0].firstChild.innerHTML).toBe('legend1');
            expect(children[1].style.left).toBe('175px');
            expect(children[1].style.top).toBe('90px');
            expect(children[1].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[1].firstChild.innerHTML).toBe('legend2');
            expect(children[2].style.left).toBe('35px');
            expect(children[2].style.top).toBe('140px');
            expect(children[2].firstChild.className).toBe('tui-chart-series-legend');
            expect(children[2].firstChild.innerHTML).toBe('legend3');
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('options.legendType이 "outer"면 _renderSeriesLabel()이 수행됩니다.', function() {
            var actual = dom.create('div'),
                expected = dom.create('div');

            dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
            dataProcessor.getFormattedValue.and.returnValue(function(groupIndex, index) {
                var values = ['1.1', '2.2', '3.3'];
                return values[index];
            });
            spyOn(series.graphRenderer, 'renderLegendLines');
            boundsMaker.getDimension.and.returnValue({
                width: 220
            });
            series.legendAlign = 'outer';
            series.seriesData = {
                sectorData: [
                    {
                        outerPosition: {
                            middle: {
                                left: 100,
                                top: 50
                            }
                        },
                        percentValue: 0.3
                    },
                    {
                        outerPosition: {
                            middle: {
                                left: 150,
                                top: 100
                            }
                        },
                        percentValue: 0.4
                    },
                    {
                        outerPosition: {
                            middle: {
                                left: 100,
                                top: 150
                            }
                        },
                        percentValue: 0.4
                    }
                ]
            };

            series._renderSeriesLabel(actual);
            series._renderOuterLegend(expected);

            expect(actual.className).toEqual(expected.className);
            expect(actual.innerHTML).toEqual(expected.innerHTML);
        });
        it('options.legendType이 "outer"가 아니면 _renderCenterLegend()이 수행됩니다.', function() {
            var actual = dom.create('div'),
                expected = dom.create('div');

            dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
            dataProcessor.getFormattedValue.and.returnValue(function(groupIndex, index) {
                var values = ['1.1', '2.2', '3.3'];
                return values[index];
            });
            spyOn(series.graphRenderer, 'renderLegendLines');
            boundsMaker.getDimension.and.returnValue({
                width: 220
            });
            series.legendAlign = 'center';
            series.seriesData = {
                sectorData: [
                    {
                        centerPosition: {
                            left: 100,
                            top: 50
                        }
                    },
                    {
                        centerPosition: {
                            left: 100,
                            top: 100
                        }
                    },
                    {
                        centerPosition: {
                            left: 100,
                            top: 150
                        }
                    }
                ]
            };
            series._renderSeriesLabel(actual);
            series._renderCenterLegend(expected);

            expect(actual.className).toEqual(expected.className);
            expect(actual.innerHTML).toEqual(expected.innerHTML);
        });
    });
});
