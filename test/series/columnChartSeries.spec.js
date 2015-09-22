/**
 * @fileoverview test column chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnChartSeries = require('../../src/js/series/columnChartSeries.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('test ColumnChartSeries', function() {
    var series;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        series = new ColumnChartSeries({
            chartType: 'column',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
            },
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {}
        });
    });

    describe('_makeNormalColumnBounds()', function() {
        it('stacked 옵션이 없는 Column차트의 bounds 정보를 생성합니다. start, end로 구분한 이유는 애니메이션 시작과 끝의 높이(height)와 위치(top)를 구분하기 위함입니다.', function () {
            var bounds;
            series.percentValues = [[0.25], [0.5]];
            bounds = series._makeNormalColumnBounds({
                width: 200,
                height: 400
            });
            expect(bounds).toEqual([
                [{
                    start: {
                        top: 401,
                        left: 24,
                        width: 50,
                        height: 0
                    },
                    end: {
                        top: 301,
                        left: 24,
                        width: 50,
                        height: 100
                    }
                }],
                [{
                    start: {
                        top: 401,
                        left: 124,
                        width: 50,
                        height: 0
                    },
                    end: {
                        top: 201,
                        left: 124,
                        width: 50,
                        height: 200
                    }
                }]
            ]);
        });

        it('값에 음수, 양수 모두가 포함되어 있을 경우 bounds 정보는 0점 기준으로 위아래로 설정됩니다.', function () {
            var result;
            series.percentValues = [[-0.25], [0.5]];
            series.data.scale = {
                min: -40,
                max: 60
            };
            result = series._makeNormalColumnBounds({
                width: 200,
                height: 400
            }, 1);

            // 0점의 위치가 top 240임
            // 음수의 경우 height만 변화됨
            expect(result[0][0].start.top).toBe(240);
            expect(result[0][0].start.height).toBe(0);
            expect(result[0][0].end.top).toBe(240);
            expect(result[0][0].end.height).toBe(100);

            // 양수의 경우는 top, height 값이 같이 변함
            expect(result[1][0].start.top).toBe(241);
            expect(result[1][0].start.height).toBe(0);
            expect(result[1][0].end.top).toBe(41);
            expect(result[1][0].end.height).toBe(200);
        });
    });

    describe('_makeStackedColumnBounds()', function() {
        it('stacked 옵션이 있는 Column차트의 bounds 정보는 end.top이 end.height 만큼씩 감소합니다.', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            bounds = series._makeStackedColumnBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds[0][0].end.top).toBe(320);
            expect(bounds[0][0].end.height).toBe(80);

            expect(bounds[0][1].end.top).toBe(200);
            expect(bounds[0][1].end.height).toBe(120);

            expect(bounds[0][2].end.top).toBe(0);
            expect(bounds[0][2].end.height).toBe(200);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없으면 _makeNormalColumnBounds()가 수행됩니다.', function () {
            var actual, expected;
            series.percentValues = [[0.25], [0.5]];
            actual = series._makeBounds({
                width: 200,
                height: 400
            });
            expected = series._makeNormalColumnBounds({
                width: 200,
                height: 400
            });
            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 있으면 _makeStackedColumnBounds()가 수행됩니다.', function () {
            var actual, expected;
            series.percentValues = [[0.2, 0.3, 0.5]];
            series.options.stacked = 'normal';
            actual = series._makeBounds({
                width: 100,
                height: 400
            }, 1);
            expected = series._makeStackedColumnBounds({
                width: 100,
                height: 400
            }, 1);
            expect(actual).toEqual(expected);
        });
    });

    describe('_renderNormalSeriesLabel()', function() {
        it('일반 series label을 렌더링 하면 label은 막대 그래프 상단에 5px 간격을 두고 좌우 정렬하여 위치하게 됩니다.', function() {
            var container = dom.create('div'),
                children;
            series._renderNormalSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 70,
                                left: 20,
                                width: 30,
                                height: 70
                            }
                        },
                        {
                            end: {
                                top: 40,
                                left: 55,
                                width: 30,
                                height: 100
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.top).toBe('45px');
            expect(children[0].style.left).toBe('15px');
            expect(children[0].innerHTML).toBe('1.5');

            expect(children[1].style.top).toBe('15px');
            expect(children[1].style.left).toBe('50px');
            expect(children[1].innerHTML).toBe('2.2');
        });

        it('series의 data가 음수인 경우 series label은 막대 그래프 하단에 위치하게 됩니다.', function() {
            var container = dom.create('div'),
                children;
            series._renderNormalSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 0,
                                left: 20,
                                width: 30,
                                height: 70
                            }
                        },
                        {
                            end: {
                                top: 0,
                                left: 55,
                                width: 30,
                                height: 100
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.top).toBe('75px');
            expect(children[0].style.left).toBe('15px');
            expect(children[0].innerHTML).toBe('-1.5');

            expect(children[1].style.top).toBe('105px');
            expect(children[1].style.left).toBe('50px');
            expect(children[1].innerHTML).toBe('-2.2');
        });
    });

    describe('_renderStackedSeriesLabel()', function() {
        it('stacked=normal인 series label을 렌더링 하면 label은 각 막대의 중앙에 위치하게 되며, 합산된 label은 5px 간격을 두고 마지막 막대 상단에 위치하게 됩니다..', function() {
            var container = dom.create('div'),
                children;
            series.options.stacked = 'normal';
            series._renderStackedSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 100,
                                left: 20,
                                width: 30,
                                height: 40
                            }
                        },
                        {
                            end: {
                                top: 40,
                                left: 20,
                                width: 30,
                                height: 60
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.top).toBe('111px');
            expect(children[0].style.left).toBe('16px');
            expect(children[0].innerHTML).toBe('1.5');

            expect(children[1].style.top).toBe('61px');
            expect(children[1].style.left).toBe('16px');
            expect(children[1].innerHTML).toBe('2.2');

            expect(children[2].style.top).toBe('15px');
            expect(children[2].style.left).toBe('16px');
            expect(children[2].innerHTML).toBe('3.7');
        });

        it('stacked=percent일 경우에는 합산 label은 표시하지 않습니다.', function() {
            var container = dom.create('div'),
                children;

            series.options.stacked = 'percent';

            series._renderStackedSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 100,
                                left: 20,
                                width: 30,
                                height: 40
                            }
                        },
                        {
                            end: {
                                top: 40,
                                left: 20,
                                width: 30,
                                height: 60
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.top).toBe('111px');
            expect(children[0].style.left).toBe('16px');
            expect(children[0].innerHTML).toBe('1.5');

            expect(children[1].style.top).toBe('61px');
            expect(children[1].style.left).toBe('16px');
            expect(children[1].innerHTML).toBe('2.2');

            expect(children[2]).toBeUndefined();
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('stacked 옵션이 없으면 _renderNormalSeriesLabel()이 수행됩니다.', function () {
            var container = dom.create('div'),
                params, actual, expected;

            params = {
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 70,
                                left: 20,
                                width: 35,
                                height: 70
                            }
                        },
                        {
                            end: {
                                top: 40,
                                left: 55,
                                width: 35,
                                height: 100
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            };

            series.options.showLabel = true;
            actual = series._renderSeriesLabel(params);
            expected = series._renderNormalSeriesLabel(params);
            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 있으면 _renderStackedSeriesLabel()이 수행됩니다.', function () {
            var container = dom.create('div'),
                params, actual, expected;

            params = {
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 100,
                                left: 20,
                                width: 35,
                                height: 40
                            }
                        },
                        {
                            end: {
                                top: 40,
                                left: 20,
                                width: 35,
                                height: 60
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 140
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            };

            series.options.showLabel = true;
            series.options.stacked = 'normal';
            actual = series._renderSeriesLabel(params);
            expected = series._renderStackedSeriesLabel(params);
            expect(actual).toEqual(expected);
        });
    });
});
