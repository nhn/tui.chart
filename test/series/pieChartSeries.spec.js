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
    var getRenderedLabelWidth, getRenderedLabelHeight, series;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        getRenderedLabelWidth  = renderUtil.getRenderedLabelWidth;
        getRenderedLabelHeight  = renderUtil.getRenderedLabelHeight;

        renderUtil.getRenderedLabelWidth = function() {
            return 40;
        };

        renderUtil.getRenderedLabelHeight = function() {
            return 20;
        };
    });

    afterAll(function() {
        renderUtil.getRenderedLabelWidth = getRenderedLabelWidth;
        renderUtil.getRenderedLabelHeight = getRenderedLabelHeight;
    });

    beforeEach(function() {
        series = new PieChartSeries({
            chartType: 'pie',
            data: {
                values: [],
                formatttedValues: []
            },
            options: {}
        });
    });

    describe('_makePercentValues()', function() {
        it('pie차트의 percent타입 value를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: [[20, 30, 50]]
            });
            expect(result).toEqual([[0.2, 0.3, 0.5]]);
        });
    });

    describe('_makeCircleBound()', function() {
        it('pie차트의 circle bounds정보를 생성합니다.(cx: center x, cy: center y, r: radius)', function () {
            var result = series._makeCircleBound({
                width: 400,
                height: 300
            });

            expect(result).toEqual({
                cx: 200,
                cy: 150,
                r: 120
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

    describe('_makeSectorsInfo()', function() {
        it('percentValues를 이용하여 angle 정보와 center position 정보를 계산하여 반환합니다.', function() {
            var actual = series._makeSectorsInfo([0.25, 0.125, 0.1, 0.35, 0.175], {
                    cx: 100,
                    cy: 100,
                    r: 100
                });

            expect(actual.length).toEqual(5);
            expect(actual[0].percentValue).toEqual(0.25);
            expect(actual[0].angles.start.startAngle).toEqual(0);
            expect(actual[0].angles.start.endAngle).toEqual(0);
            expect(actual[0].angles.end.startAngle).toEqual(0);
            expect(actual[0].angles.end.endAngle).toEqual(90);
            expect(actual[0].popupPosition).toEqual({
                left: 177.78174593052023,
                top: 22.21825406947977
            });
            expect(actual[0].centerPosition).toEqual({
                left: 142.42640687119285,
                top: 57.57359312880715
            });
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
        it('lengend를 전달받은 position 중앙에 위치시킨다.', function() {
            var container = dom.create('div'),
                elLabelArea, children;

            elLabelArea = series._renderCenterLegend({
                container: container,
                legendLabels: ['legend1', 'legend2', 'legend3'],
                centerPositions: [
                    {
                        left: 100,
                        top: 50
                    },
                    {
                        left: 100,
                        top: 100
                    },
                    {
                        left: 100,
                        top: 150
                    }
                ]
            });

            children = elLabelArea.childNodes;

            expect(children[0].style.left).toEqual('80px');
            expect(children[0].style.top).toEqual('40px');
            expect(children[1].style.left).toEqual('80px');
            expect(children[1].style.top).toEqual('90px');
            expect(children[2].style.left).toEqual('80px');
            expect(children[2].style.top).toEqual('140px');
        });
    });
});
