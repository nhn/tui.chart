/**
 * @fileoverview test column chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnChartSeries = require('../../src/js/series/columnChartSeries.js');

describe('test ColumnChartSeries', function() {
    var data = {
            values: [[20], [40]],
            formattedValues: [[20], [40]],
            scale: {min: 0, max: 160}
        },
        series;

    beforeEach(function() {
        series = new ColumnChartSeries({
            chartType: 'column',
            data: data,
            options: {}
        });
    });

    describe('_makeNormalColumnBounds()', function() {
        it('stacked 옵션이 없는 Column차트의 bounds 정보 생성', function () {
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
    });

    describe('_makeStackedColumnBounds()', function() {
        it('stacked 옵션이 있는 Column차트의 bounds 정보 생성', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            bounds = series._makeStackedColumnBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds).toEqual([
                [{
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
                    }]
            ]);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없는 Column차트의 bounds 정보 생성', function () {
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

        it('stacked 옵션이 있는 Column차트의 bounds 정보 생성', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            series.options.stacked = 'normal';
            bounds = series._makeBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds).toEqual([
                [{
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
                    }]
            ]);
        });
    });
});
