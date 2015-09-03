/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChartSeries = require('../../src/js/series/barChartSeries.js');

describe('test BarChartSeries', function() {
    var series;

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
        it('stacked 옵션이 없는 Bar차트의 bounds 정보 생성', function () {
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
    });

    describe('_makeStackedBarBounds()', function() {
        it('stacked 옵션이 있는 Bar차트의 bounds 정보 생성', function () {
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
        it('stacked 옵션이 없는 Bar차트의 bounds 정보 생성', function () {
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

        it('stacked 옵션이 있는 Bar차트의 bounds 정보 생성', function () {
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
});
