/**
 * @fileoverview test column chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnChartSeries = require('../../src/js/series/columnChartSeries.js');

describe('test ColumnChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new ColumnChartSeries({
            chartType: 'column',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
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
            expect(result[0][0].start.top).toEqual(240);
            expect(result[0][0].start.height).toEqual(0);
            expect(result[0][0].end.top).toEqual(240);
            expect(result[0][0].end.height).toEqual(100);

            // 양수의 경우는 top, height 값이 같이 변함
            expect(result[1][0].start.top).toEqual(241);
            expect(result[1][0].start.height).toEqual(0);
            expect(result[1][0].end.top).toEqual(41);
            expect(result[1][0].end.height).toEqual(200);
        });
    });

    describe('_makeStackedColumnBounds()', function() {
        it('stacked 옵션이 있는 Column차트의 bounds 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            bounds = series._makeStackedColumnBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds).toEqual([
                [
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 320,
                            left: 25,
                            width: 50,
                            height: 80
                        }
                    },
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 200,
                            left: 25,
                            width: 50,
                            height: 120
                        }
                    },
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 0,
                            left: 25,
                            width: 50,
                            height: 200
                        }
                    }
                ]
            ]);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없는 Column차트의 bounds 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.25], [0.5]];
            bounds = series._makeBounds({
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

        it('options.stacked를 "normal"로 설정한 Column차트의 bounds 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            series.options.stacked = 'normal';
            bounds = series._makeBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds).toEqual([
                [
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 320,
                            left: 25,
                            width: 50,
                            height: 80
                        }
                    },
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 200,
                            left: 25,
                            width: 50,
                            height: 120
                        }
                    },
                    {
                        start: {
                            top: 400,
                            left: 25,
                            width: 50,
                            height: 0
                        },
                        end: {
                            top: 0,
                            left: 25,
                            width: 50,
                            height: 200
                        }
                    }
                ]
            ]);
        });
    });
});
