/**
 * @fileoverview Test for BarTypeSeriesBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarTypeSeriesBase = require('../../src/js/series/barTypeSeriesBase.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('BarTypeSeriesBase', function() {
    var series, makeSeriesRenderingPosition, makeSeriesLabelHtml, makeSumLabelHtml;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
        makeSeriesRenderingPosition = jasmine.createSpy('_makeSeriesRenderingPosition').and.returnValue({
            left: 0,
            top: 0
        });
        makeSeriesLabelHtml = jasmine.createSpy('makeSeriesLabelHtml').and.returnValue('<div></div>');
        makeSumLabelHtml = jasmine.createSpy('makeSumLabelHtml').and.returnValue('<div></div>');
    });

    beforeEach(function() {
        series = new BarTypeSeriesBase();
        series.theme = {
            label: {
                fontFamily: 'Verdana',
                fontSize: 11
            }
        };
        series.makeSeriesRenderingPosition = makeSeriesRenderingPosition;
        series.makeSumLabelHtml = makeSumLabelHtml;
        series.makeSeriesLabelHtml = makeSeriesLabelHtml;
    });

    describe('makeBarGutter()', function() {
        it('계산되는 bar의 사이즈(group bar 너비 / (itemCount + 1) / 2)가 2보다 작거나 같다면 bar gutter(bar와 bar 사이의 간격)은 0입니다.', function() {
            var actual = series.makeBarGutter(20, 5),
                expected = 0;
            expect(actual).toBe(expected);
        });

        it('계산되는 bar의 사이즈가 2보다 크고 6보다 작거나 같다면 bar gutter는 2입니다.', function() {
            var actual = series.makeBarGutter(60, 5),
                expected = 2;
            expect(actual).toBe(expected);
        });

        it('계산되는 bar의 사이즈가 6보다 크다면 bar gutter는 4입니다.', function() {
            var actual = series.makeBarGutter(100, 5),
                expected = 4;
            expect(actual).toBe(expected);
        });
    });

    describe('makeBarSize()', function() {
        it('bar size는 bar group size에서 간격정보를 빼고 아이템수 + 1로 나누어 계산됩니다.', function() {
            var actual = series.makeBarSize(100, 4, 5),
                expected = 14;
            expect(actual).toBe(expected);
        });
    });

    describe('_renderNormalSeriesLabel()', function() {
        it('bar type(bar, column) 일반(normal) 차트의 series label을 전달하는 values의 수만큼 랜더링 합니다.', function() {
            var container = dom.create('div'),
                elLabelArea = series._renderNormalSeriesLabel({
                    container: container,
                    groupBounds: [
                        [
                            {
                                end: {}
                            },
                            {
                                end: {}
                            }
                        ]
                    ],
                    formattedValues: [
                        ['1.5', '2.2']
                    ],
                    values: [
                        [1.5, 2.2]
                    ]
                });
            expect(elLabelArea.childNodes.length).toEqual(2);
        });
    });

    describe('makeSumValues()', function() {
        it('[10, 20, 30] values의 합은 60입니다.', function() {
            var actual = series.makeSumValues([10, 20, 30]);
            expect(actual).toBe(60);
        });

        it('두번째 인자에 포맷팅 함수 배열을 넘기면 합한 결과를 전달한 함수 배열들로 포맷팅 하여 반환합니다.', function() {
            var actual = series.makeSumValues(
                [10, 20, 30],
                [function(value) { return '00' + value; }]
            );
            expect(actual).toBe('0060');
        });
    });

    describe('_makeStackedLabelsHtml()', function() {
        it('bar type(bar, column) stacked 차트의 series label html을 전달하는 values의 수만큼 생성합니다.', function() {
            var container = dom.create('div'),
                html;
            series.options = {
                stacked: 'percent'
            };

            html = series._makeStackedLabelsHtml({
                values: [1.5, 2.2],
                formattedValues: ['1.5', '2.2'],
                bounds: [
                    {
                        end: {}
                    },
                    {
                        end: {}
                    }
                ],
                labelHeight: 10
            });
            container.innerHTML = html;
            expect(container.childNodes.length).toBe(2);
        });

        it('stacked옵션이 normal일 경우에는 series label html을 전달하는 values + 1(sum)만큼 생성합니다.', function() {
            var container = dom.create('div'),
                html;
            series.options = {
                stacked: 'normal'
            };

            html = series._makeStackedLabelsHtml({
                values: [1.5, 2.2],
                formattedValues: ['1.5', '2.2'],
                bounds: [
                    {
                        end: {}
                    },
                    {
                        end: {}
                    }
                ],
                labelHeight: 10
            });
            container.innerHTML = html;
            expect(container.childNodes.length).toBe(3);
        });
    });

    describe('_renderStackedSeriesLabel()', function() {
        it('bar type(bar, column) stacked=normal 차트의 series label을 전달하는 values의 수 + 1(sum)만큼 랜더링 합니다.', function() {
            var container = dom.create('div'),
                elLabelArea;
            series.options = {
                stacked: 'normal'
            };

            elLabelArea = series._renderStackedSeriesLabel({
                container: container,
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ],
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            });
            expect(elLabelArea.childNodes.length).toBe(3);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('stacked 옵션이 없으면 _renderNormalSeriesLabel()이 수행됩니다.', function () {
            var container = dom.create('div'),
                params, actual, expected;
            series.options = {
                showLabel: true
            };
            params = {
                container: container,
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ],
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };

            actual = series._renderSeriesLabel(params);
            expected = series._renderNormalSeriesLabel(params);
            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 있으면 _renderStackedSeriesLabel()이 수행됩니다.', function () {
            var container = dom.create('div'),
                params, actual, expected;

            series.options = {
                showLabel: true,
                stacked: 'normal'
            };

            params = {
                container: container,
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ],
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };

            actual = series._renderSeriesLabel(params);
            expected = series._renderStackedSeriesLabel(params);
            expect(actual).toEqual(expected);
        });

        it('showLabel 옵션이 없으면 null을 반환합니다.', function () {
            var actual;
            series.options = {
                stacked: 'normal'
            };
            actual = series._renderSeriesLabel({});

            expect(actual).toBeNull();
        });
    });
});
