/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChartSeries = require('../../src/js/series/barChartSeries.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('test BarChartSeries', function() {
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
        series = new BarChartSeries({
            chartType: 'bar',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
            },
            options: {}
        });
    });

    describe('_makeNormalBarBounds()', function() {
        it('stacked 옵션이 없는 Bar차트의 bounds 정보를 생성합니다. start, end로 구분한 이유는 애니메이션 시작과 끝의 너비(width)를 구분하기 위함입니다.', function () {
            var result;
            series.percentValues = [[0.2, 0.4, 0.1]];
            result = series._makeNormalBarBounds({
                width: 400,
                height: 200
            }, 1);
            expect(result).toEqual([
                [
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: -1,
                            width: 80,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 76,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 76,
                            left: -1,
                            width: 160,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 126,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 126,
                            left: -1,
                            width: 40,
                            height: 50
                        }
                    }
                ]
            ]);
        });

        it('값에 음수, 양수 모두가 포함되어 있을 경우 bounds 정보는 0점 기준으로 좌우로 설정됩니다.', function () {
            var result;
            series.percentValues = [[-0.2, 0.4, 0.1]];
            series.data.scale = {
                min: -40,
                max: 60
            };
            result = series._makeNormalBarBounds({
                width: 400,
                height: 200
            }, 1);

            // 0점의 위치가 left 159임
            // 음수의 경우 left, width 값이 같이 변함
            expect(result[0][0].start.left).toEqual(159);
            expect(result[0][0].start.width).toEqual(0);
            expect(result[0][0].end.left).toEqual(79);
            expect(result[0][0].end.width).toEqual(80);

            // 양수의 경우는 width만 변화됨
            expect(result[0][1].start.left).toEqual(159);
            expect(result[0][1].start.width).toEqual(0);
            expect(result[0][1].end.left).toEqual(159);
            expect(result[0][1].end.width).toEqual(160);
        });
    });

    describe('_makeStackedBarBounds()', function() {
        it('stacked 옵션이 있는 Bar차트의 bounds 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            bounds = series._makeStackedBarBounds({
                width: 400,
                height: 100
            }, 1);
            expect(bounds).toEqual([
                [
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: -1,
                            width: 80,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: 79,
                            width: 120,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: 199,
                            width: 200,
                            height: 50
                        }
                    }
                ]
            ]);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없는 Bar차트의 bounds 정보를 생성합니다.', function () {
            var result;
            series.percentValues = [[0.2, 0.4, 0.1]];
            result = series._makeBounds({
                width: 400,
                height: 200
            }, 1);
            expect(result).toEqual([
                [
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: -1,
                            width: 80,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 76,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 76,
                            left: -1,
                            width: 160,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 126,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 126,
                            left: -1,
                            width: 40,
                            height: 50
                        }
                    }
                ]
            ]);
        });

        it('options.stacked를 "normal"로 설정한 Bar차트의 bounds 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            series.options.stacked = 'normal';
            bounds = series._makeBounds({
                width: 400,
                height: 100
            }, 1);
            expect(bounds).toEqual([
                [
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: -1,
                            width: 80,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: 79,
                            width: 120,
                            height: 50
                        }
                    },
                    {
                        start: {
                            top: 26,
                            left: -1,
                            width: 0,
                            height: 50
                        },
                        end: {
                            top: 26,
                            left: 199,
                            width: 200,
                            height: 50
                        }
                    }
                ]
            ]);
        });
    });

    describe('_renderNormalSeriesLabel()', function() {
        it('container, bounds, dimension, values, formattedValues정보를 전달하여 일반 series label을 렌더링 합니다.', function() {
            var container = dom.create('div'),
                children;
            series._renderNormalSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 20,
                                left: 0,
                                width: 70,
                                height: 30
                            }
                        },
                        {
                            end: {
                                top: 20,
                                left: 0,
                                width: 100,
                                height: 30
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 140,
                    height: 50
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toEqual('75px');
            expect(children[0].style.top).toEqual('29px');
            expect(children[0].innerHTML).toEqual('1.5');

            expect(children[1].style.left).toEqual('105px');
            expect(children[1].style.top).toEqual('29px');
            expect(children[1].innerHTML).toEqual('2.2');
        });

        it('data가 음수인 경우 series label은 그래프 좌측에 위치합니다.', function() {
            var container = dom.create('div'),
                children;
            series._renderNormalSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 20,
                                left: 70,
                                width: 70,
                                height: 30
                            }
                        },
                        {
                            end: {
                                top: 20,
                                left: 50,
                                width: 90,
                                height: 30
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 140,
                    height: 50
                },
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toEqual('27px');
            expect(children[0].style.top).toEqual('29px');
            expect(children[0].innerHTML).toEqual('-1.5');

            expect(children[1].style.left).toEqual('7px');
            expect(children[1].style.top).toEqual('29px');
            expect(children[1].innerHTML).toEqual('-2.2');
        });
    });

    describe('_renderStackedSeriesLabel()', function() {
        it('container, bounds, dimension, values formattedValues정보를 전달하여 stacked series label을 렌더링 합니다.', function() {
            var container = dom.create('div'),
                children;
            series.options.stacked = 'normal';
            series._renderStackedSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 20,
                                left: 0,
                                width: 40,
                                height: 30
                            }
                        },
                        {
                            end: {
                                top: 20,
                                left: 40,
                                width: 60,
                                height: 30
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 120,
                    height: 50
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toEqual('0px');
            expect(children[0].style.top).toEqual('29px');
            expect(children[0].innerHTML).toEqual('1.5');

            expect(children[1].style.left).toEqual('50px');
            expect(children[1].style.top).toEqual('29px');
            expect(children[1].innerHTML).toEqual('2.2');

            expect(children[2].style.left).toEqual('105px');
            expect(children[2].style.top).toEqual('29px');
            expect(children[2].innerHTML).toEqual('3.7');
        });

        it('stacked=percent일 경우에는 토탈 label은 표시하지 않습니다.', function() {
            var container = dom.create('div'),
                children;
            series.options.stacked = 'percent';
            series._renderStackedSeriesLabel({
                container: container,
                groupBounds: [
                    [
                        {
                            end: {
                                top: 20,
                                left: 0,
                                width: 40,
                                height: 30
                            }
                        },
                        {
                            end: {
                                top: 20,
                                left: 40,
                                width: 60,
                                height: 30
                            }
                        }
                    ]
                ],
                dimension: {
                    width: 120,
                    height: 50
                },
                formattedValues: [
                    ['1.5', '2.2']
                ],
                values: [
                    [1.5, 2.2]
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toEqual('0px');
            expect(children[0].style.top).toEqual('29px');
            expect(children[0].innerHTML).toEqual('1.5');

            expect(children[1].style.left).toEqual('50px');
            expect(children[1].style.top).toEqual('29px');
            expect(children[1].innerHTML).toEqual('2.2');

            expect(children[2]).toBeUndefined();
        });
    });
});
