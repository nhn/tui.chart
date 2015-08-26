/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/boundsMaker.js'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js');

describe('test boundsMaker', function() {
    it('_getValueAxisMaxLabel()', function() {
        var result = maker._getValueAxisMaxLabel({
            values: [
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ],
            joinValues: [
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ]
        });
        expect(result).toEqual(90);
    });

    it('_getValueAxisMaxLabel() for combo chart', function() {
        var result = maker._getValueAxisMaxLabel({
            values: {
                column: [
                    [20, 30, 50],
                    [40, 40, 60]
                ],
                line: [
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            },
            joinValues: [
                [20, 30, 50],
                [40, 40, 60],
                [60, 50, 10],
                [80, 10, 70]
            ]
        }, ['column', 'index'], 0);
        expect(result).toEqual(70);
    });

    it('_getRenderedLabelsMaxSize()', function() {
        var result = maker._getRenderedLabelsMaxSize(['label1', 'label12'], {}, function(label) {
            return label.length;
        });
        expect(result).toEqual(7);
    });

    it('_getRenderedLabelsMaxWidth()', function() {
        var result = maker._getRenderedLabelsMaxWidth(['label1', 'label12'], {
            fontSize: 12,
            fontFamily: 'Verdana'
        });
        expect(result).toBeGreaterThan(42);
        expect(result).toBeLessThan(47);
    });

    it('_getRenderedLabelsMaxHeight()', function() {
        var result = maker._getRenderedLabelsMaxHeight(['label1', 'label12'], {
            fontSize: 12,
            fontFamily: 'Verdana'
        });
        expect(result).toBeGreaterThan(13);
        expect(result).toBeLessThan(16);
    });

    it('_getVerticalAxisWidth()', function() {
        var result = maker._getVerticalAxisWidth('title', ['label1', 'label12'], {
            title: {
                fontSize: 12,
                fontFamily: 'Verdana'
            },
            label: {
                fontSize: 12,
                fontFamily: 'Verdana'
            }
        });
        expect(result).toBeGreaterThan(77);
        expect(result).toBeLessThan(89);
    });

    it('_getHorizontalAxisHeight()', function() {
        var result = maker._getVerticalAxisWidth('title', ['label1', 'label12'], {
            title: {
                fontSize: 12,
                fontFamily: 'Verdana'
            },
            label: {
                fontSize: 12,
                fontFamily: 'Verdana'
            }
        });
        expect(result).toBeGreaterThan(77);
        expect(result).toBeLessThan(89);
    });

    it('_getYRAxisWidth()', function() {
        var result = maker._getYRAxisWidth({
            convertData: {
                values: {
                    column: [
                        [20, 30, 50],
                        [40, 40, 60]
                    ],
                    line: [
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            },
            yAxisChartTypes: ['column', 'index'],
            theme: {
                yAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                xAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                }
            },
            options: {
                yAxis: {
                    title: 'YAxis title'
                },
                xAxis: {
                    title: 'XAxis title'
                }
            }
        });

        expect(result).toBeGreaterThan(56);
        expect(result).toBeLessThan(69);
    });

    it('_makeAxesDimension() has not axes', function() {
        var result = maker._makeAxesDimension({});
        expect(result).toEqual({
            yAxis: {
                width: 0
            },
            yrAxis: {
                width: 0
            },
            xAxis: {
                height: 0
            }
        });
    });

    it('_makeAxesDimension() has axes', function() {
        var result = maker._makeAxesDimension({
            convertData: {
                labels: ['label1', 'label12'],
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            },
            yAxisChartTypes: [],
            isVertical: true,
            hasAxes: true,
            theme: {
                yAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                xAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                }
            },
            options: {
                yAxis: {
                    title: 'YAxis title'
                },
                xAxis: {
                    title: 'XAxis title'
                }
            }
        });
        expect(result.yAxis.width).toBeGreaterThan(49);
        expect(result.yAxis.width).toBeLessThan(59);
        expect(result.yrAxis.width).toEqual(0);
        expect(result.xAxis.height).toBeGreaterThan(47);
        expect(result.xAxis.height).toBeLessThan(51);
    });

    it('_getComponentsDimension()', function() {
        var result = maker._getComponentsDimensions({
            convertData: {
                labels: ['label1', 'label12'],
                joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            },
            yAxisChartTypes: [],
            isVertical: true,
            hasAxes: true,
            theme: {
                yAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                xAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                legend: {
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                }
            },
            options: {
                yAxis: {
                    title: 'YAxis title'
                },
                xAxis: {
                    title: 'XAxis title'
                }
            }
        });

        expect(result.chart).toEqual({
            width: 500,
            height: 400
        });

        expect(result.title.height).toBeGreaterThan(32);
        expect(result.title.height).toBeLessThan(37);
        expect(result.plot.width).toBeGreaterThan(321);
        expect(result.plot.width).toBeLessThan(350);
        expect(result.plot.height).toBeGreaterThan(291);
        expect(result.plot.height).toBeLessThan(299);

        expect(result.legend.width).toBeGreaterThan(84);
        expect(result.legend.width).toBeLessThan(101);

        expect(result.yAxis.width).toBeGreaterThan(49);
        expect(result.yAxis.width).toBeLessThan(59);
        expect(result.yrAxis.width).toEqual(0);
        expect(result.xAxis.height).toBeGreaterThan(47);
        expect(result.xAxis.height).toBeLessThan(51);
    });

    it('_makeAxesBounds()', function() {
        var result = maker._makeAxesBounds({
            convertData: {
                labels: ['label1', 'label12'],
                joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            },
            yAxisChartTypes: [],
            isVertical: true,
            hasAxes: true,
            theme: {
                yAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                xAxis: {
                    title: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                },
                legend: {
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                }
            },
            options: {
                yAxis: {
                    title: 'YAxis title'
                },
                xAxis: {
                    title: 'XAxis title'
                }
            },
            dimensions: {
                chart: {width: 500, height: 400},
                title: {height: 36},
                plot: {width: 333, height: 294},
                series: {width: 333, height: 294},
                legend: {width: 96},
                tooltip: {width: 333, height: 294},
                yAxis: {width: 51},
                yrAxis: {width: 0},
                xAxis: {height: 50}
            },
            top: 20,
            right: 20
        });

        expect(result).toEqual({
            plot: {dimension: {width: 333, height: 294}, position: {top: 20, right: 20}},
            yAxis: {dimension: {width: 51, height: 294}, position: {top: 20, left: 11}},
            xAxis: {dimension: {width: 333, height: 50}, position: {top: 313, right: 20}}
        });
    });

    it('_getLegendAreaWidth()', function() {
        var result = maker._getLegendAreaWidth([
                {
                    label: 'label1'
                },
                {
                    label: 'label12'
                }
            ],
            {
                fontSize: 12,
                fontFamily: 'Verdana'
            });
        expect(result).toBeGreaterThan(79);
        expect(result).toBeLessThan(84);
    })

    it('_makeSeriesDimension()', function() {
        var result = maker._makeSeriesDimension({
            chartDimension: {
                width: 500,
                height: 400
            },
            axesDimension: {
                yAxis: {
                    width: 50
                },
                yrAxis: {
                    width: 0
                },
                xAxis: {
                    height: 50
                }
            },
            legendWidth: 50,
            titleHeight: 50
        });
        expect(result).toEqual({
            width: 380,
            height: 280
        });
    });

    it('make()', function() {
        var result = maker.make({
            convertData: {
                values: [
                   [20, 30, 50],
                   [40, 40, 60],
                   [60, 50, 10],
                   [80, 10, 70]
               ],
               joinValues: [
                   [20, 30, 50],
                   [40, 40, 60],
                   [60, 50, 10],
                   [80, 10, 70]
               ],
               labels: ['label1', 'label2', 'label3'],
               joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
               formatValues: [
                   [20, 30, 50],
                   [40, 40, 60],
                   [60, 50, 10],
                   [80, 10, 70]
               ]
            },
            theme: defaultTheme,
            hasAxes: true,
            options: {}
        });
        expect(result.chart.dimension.width && result.chart.dimension.height).toBeTruthy();
        expect(result.plot.dimension.width && result.plot.dimension.height).toBeTruthy();
        expect(result.plot.position.top && result.plot.position.right).toBeTruthy();
        expect(result.series.dimension.width && result.series.dimension.height).toBeTruthy();
        expect(result.series.position.top && result.series.position.right).toBeTruthy();
        expect(result.yAxis.dimension.width && result.yAxis.dimension.height).toBeTruthy();
        expect(result.yAxis.position.top).toBeTruthy();
        expect(result.xAxis.dimension.width && result.xAxis.dimension.height).toBeTruthy();
        expect(result.xAxis.position.top).toBeTruthy();
        expect(result.legend.position.top && result.legend.position.left).toBeTruthy();
        expect(result.tooltip.dimension.width && result.tooltip.dimension.height).toBeTruthy();
        expect(result.tooltip.position.top && result.tooltip.position.left).toBeTruthy();
    });
});