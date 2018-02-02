/**
 * @fileoverview Test for BoundsModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BoundsModel = require('../../../src/js/models/bounds/boundsModel');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var raphaelRenderUtil = require('../../../src/js/plugins/raphaelRenderUtil');

describe('Test for BoundsModel', function() {
    var boundsModel, dataProcessor;

    beforeAll(function() {
        // Spy to produce consistence results
        // Because calculated width and hight might be differ for each browsers
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(raphaelRenderUtil, 'getRenderedTextSize').and.returnValue(50);
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormattedMaxValue', 'getFormatFunctions', 'getGroupValues', 'getWholeGroupValues', 'getLegendData', 'getCategories',
                'getFormattedGroupValues', 'getLegendLabels', 'getMultilineCategories', 'getMultilineCategories']);
        dataProcessor.getFormatFunctions.and.returnValue([]);
    });

    beforeEach(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight');
        boundsModel = new BoundsModel({
            dataProcessor: dataProcessor,
            options: {
                legend: {
                    visible: true
                },
                chart: {
                    title: {
                        text: 'This is title'
                    }
                },
                chartExportMenu: {
                    visible: true
                }
            },
            theme: {
                title: {
                    fontSize: 16,
                    fontFamily: 'Verdana'
                }
            }
        });
    });

    describe('_registerChartDimension()', function() {
        it('should register chart dimension from chart option(width, height)', function() {
            var actual, expected;

            boundsModel.options.chart = {
                width: 300,
                height: 200
            };
            boundsModel._registerChartDimension();
            actual = boundsModel.getDimension('chart');
            expected = {
                width: 300,
                height: 200
            };

            expect(actual).toEqual(expected);
        });

        it('should register default dimension when there is no chart option.', function() {
            var actual, expected;

            boundsModel._registerChartDimension();
            actual = boundsModel.getDimension('chart');
            expected = {
                width: chartConst.CHART_DEFAULT_WIDTH,
                height: chartConst.CHART_DEFAULT_HEIGHT
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerTitleDimension()', function() {
        it('should register title dimension.', function() {
            var actual, expected;

            raphaelRenderUtil.getRenderedTextSize.and.returnValue({
                height: 20
            });
            boundsModel._registerTitleDimension();
            actual = boundsModel.getDimension('title');
            expected = {
                height: 30
            };

            expect(actual).toEqual(expected);
        });
        it('should register 0 dimension, if not have title option title.', function() {
            var actual, expected;

            boundsModel = new BoundsModel({
                dataProcessor: dataProcessor,
                options: {
                    legend: {
                        visible: true
                    },
                    chart: {
                    },
                    chartExportMenu: {
                        visible: true
                    }
                }
            });

            renderUtil.getRenderedLabelHeight.and.returnValue(20);
            boundsModel._registerTitleDimension();
            actual = boundsModel.getDimension('title');
            expected = {
                height: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerChartExportMenuDimension()', function() {
        it('should register chartExportMenu dimension.', function() {
            var actual, expected;

            boundsModel._registerChartExportMenuDimension();
            actual = boundsModel.getDimension('chartExportMenu');
            expected = {
                height: 27,
                width: 60
            };

            expect(actual).toEqual(expected);
        });
        it('should register 0 dimension, if chartExportMenu option is not exist', function() {
            var actual, expected;

            boundsModel = new BoundsModel({
                dataProcessor: dataProcessor,
                options: {
                    legend: {
                        visible: true
                    },
                    chart: {
                    },
                    chartExportMenu: {
                        visible: false
                    }
                }
            });

            boundsModel._registerChartExportMenuDimension();
            actual = boundsModel.getDimension('chartExportMenu');
            expected = {
                height: 0,
                width: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('update dimensions width', function() {
            boundsModel.chartLeftPadding = 10;
            boundsModel.dimensionMap = {
                plot: {
                    width: 200
                },
                series: {
                    width: 199
                },
                mouseEventDetector: {
                    width: 199
                },
                xAxis: {
                    width: 200
                }
            };

            boundsModel.chartLeftPadding = 10;

            boundsModel._updateDimensionsWidth({
                overflowLeft: 50,
                overflowRight: 10
            });

            expect(boundsModel.chartLeftPadding).toBe(60);
            expect(boundsModel.getDimension('plot').width).toBe(140);
            expect(boundsModel.getDimension('series').width).toBe(139);
            expect(boundsModel.getDimension('mouseEventDetector').width).toBe(139);
            expect(boundsModel.getDimension('xAxis').width).toBe(140);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('should increase plot.height, series.height by 50, and descrease xAxis.heigth by 50.', function() {
            boundsModel.dimensionMap = {
                plot: {
                    height: 200
                },
                series: {
                    height: 200
                },
                mouseEventDetector: {
                    height: 200
                },
                tooltip: {
                    height: 200
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    height: 200
                },
                rightYAxis: {
                    height: 200
                }
            };
            boundsModel._updateDimensionsHeight(50);

            expect(boundsModel.getDimension('plot').height).toBe(150);
            expect(boundsModel.getDimension('series').height).toBe(150);
            expect(boundsModel.getDimension('mouseEventDetector').height).toBe(150);
            expect(boundsModel.getDimension('tooltip').height).toBe(150);
            expect(boundsModel.getDimension('xAxis').height).toBe(100);
            expect(boundsModel.getDimension('yAxis').height).toBe(150);
            expect(boundsModel.getDimension('rightYAxis').height).toBe(150);
        });
    });

    describe('_makePlotDimension()', function() {
        it('should make plot dimension from series dimension by adding hidden height 1', function() {
            var actual, expected;

            boundsModel.dimensionMap.series = {
                width: 200,
                height: 100
            };

            actual = boundsModel._makePlotDimension();
            expected = {
                width: 200,
                height: 101
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerAxisComponentsDimension()', function() {
        it('should register component dimension from plot dimension', function() {
            spyOn(boundsModel, '_makePlotDimension').and.returnValue({
                width: 300,
                height: 200
            });
            boundsModel._registerAxisComponentsDimension();

            expect(boundsModel.getDimension('plot').width).toBe(300);
            expect(boundsModel.getDimension('plot').height).toBe(200);
            expect(boundsModel.getDimension('xAxis').width).toBe(300);
            expect(boundsModel.getDimension('yAxis').height).toBe(200);
            expect(boundsModel.getDimension('rightYAxis').height).toBe(200);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('should make series dimesion using dimension of virtical legend, series', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                chart: {
                    width: 500,
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    width: 50
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                },
                chartExportMenu: {
                    height: 0
                }
            };

            actual = boundsModel._makeSeriesDimension();
            expected = {
                width: 380,
                height: 280
            };

            expect(actual).toEqual(expected);
        });

        it('should calculate series dimension using horizontal legend width.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                chart: {
                    width: 500,
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                },
                chartExportMenu: {
                    height: 0
                }
            };
            boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_TOP;

            actual = boundsModel._makeSeriesDimension();
            expected = {
                width: 430,
                height: 230
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_registerCenterComponentsDimension()', function() {
        it('should register tooltip and event detector dimension from series dimension.', function() {
            boundsModel.dimensionMap = {
                series: {
                    width: 300,
                    height: 200
                }
            };
            boundsModel._registerCenterComponentsDimension();

            expect(boundsModel.getDimension('tooltip').width).toBe(300);
            expect(boundsModel.getDimension('tooltip').height).toBe(200);
            expect(boundsModel.getDimension('mouseEventDetector').width).toBe(300);
            expect(boundsModel.getDimension('mouseEventDetector').height).toBe(200);
        });
    });

    describe('_registerAxisComponentsPosition()', function() {
        it('should set position related to axis using dimension of series, leftLegendWidth, yAxis.', function() {
            var leftLegendWidth = 0;

            boundsModel.dimensionMap.series = {
                width: 300,
                height: 200
            };
            boundsModel.dimensionMap.yAxis = {
                width: 30
            };
            boundsModel.positionMap.series = {
                left: 50,
                top: 50
            };

            boundsModel._registerAxisComponentsPosition(leftLegendWidth);

            expect(boundsModel.getPosition('plot').top).toBe(50);
            expect(boundsModel.getPosition('plot').left).toBe(50);
            expect(boundsModel.getPosition('yAxis').top).toBe(50);
            expect(boundsModel.getPosition('yAxis').left).toBe(10);
            expect(boundsModel.getPosition('xAxis').top).toBe(250);
            expect(boundsModel.getPosition('xAxis').left).toBe(50);
            expect(boundsModel.getPosition('rightYAxis').top).toBe(50);
            expect(boundsModel.getPosition('rightYAxis').left).toBe(339);
        });
    });

    describe('_makeLegendPosition()', function() {
        it('should make legend position of default align(left).', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                title: {
                    height: 20
                },
                yAxis: {
                    width: 30
                },
                series: {
                    width: 200
                },
                rightYAxis: {
                    width: 30
                },
                legend: {
                    width: 50
                }
            };
            actual = boundsModel._makeLegendPosition();
            expected = {
                top: 20,
                left: 270
            };

            expect(actual).toEqual(expected);
        });

        it('should make legend position of bottom align.', function() {
            var actual, expected;

            boundsModel.dimensionMap = {
                title: {
                    height: 20
                },
                xAxis: {
                    height: 30
                },
                yAxis: {
                    width: 30
                },
                series: {
                    width: 200
                },
                rightYAxis: {
                    width: 30
                },
                legend: {
                    width: 50
                }
            };
            actual = boundsModel._makeLegendPosition();
            expected = {
                top: 20,
                left: 270
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCircleLegendPosition()', function() {
        it('should calculate left position of circle legend using width fo series, circle legend, legend', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {
                    width: 100
                },
                legend: {
                    width: 120
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 455;

            expect(actual).toBe(expected);
        });

        it('should calculate left position of circle legend, using width of circle legend and legend, when circle aligns left.', function() {
            var actual, expected;

            boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_LEFT;

            boundsModel.positionMap = {
                series: {}
            };
            boundsModel.dimensionMap = {
                series: {},
                circleLegend: {
                    width: 100
                },
                legend: {
                    width: 120
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('should calculate left position using series.left and series.width, when horizontal circle legend', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsModel.options = {
                legend: {
                    align: 'top'
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('should calculate left position using series.left and series.width, when circle legend is hidden.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    left: 40
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    width: 400
                },
                circleLegend: {}
            };
            boundsModel.options = {
                legend: {
                    visible: false
                }
            };

            actual = boundsModel._makeCircleLegendPosition().left;
            expected = 440;

            expect(actual).toBe(expected);
        });

        it('should set circleLegend.top to position.top + series.height - circleLegend.height.', function() {
            var actual, expected;

            boundsModel.positionMap = {
                series: {
                    top: 60
                }
            };
            boundsModel.dimensionMap = {
                series: {
                    height: 300
                },
                circleLegend: {
                    height: 80
                },
                legend: {}
            };

            actual = boundsModel._makeCircleLegendPosition().top;
            expected = 280;

            expect(actual).toBe(expected);
        });
    });

    describe('_registerEssentialComponentsPositions()', function() {
        it('should set position of event detector and legend, tooltip using series position.', function() {
            spyOn(boundsModel, '_makeLegendPosition').and.returnValue({
                top: 30,
                left: 250
            });

            boundsModel.chartType = 'bar';
            boundsModel.hasAxes = true;
            boundsModel.positionMap.series = {
                left: 50,
                top: 50
            };
            boundsModel._registerEssentialComponentsPositions();

            expect(boundsModel.getPosition('mouseEventDetector').top).toBe(50);
            expect(boundsModel.getPosition('mouseEventDetector').left).toBe(50);
            expect(boundsModel.getPosition('legend').top).toBe(30);
            expect(boundsModel.getPosition('legend').left).toBe(250);
            expect(boundsModel.getPosition('tooltip').top).toBe(40);
            expect(boundsModel.getPosition('tooltip').left).toBe(40);
        });
    });

    describe('_updateBoundsForYAxisCenterOption()', function() {
        it('should update bounds for center align yAxis.', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            boundsModel.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                mouseEventDetector: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsModel.positionMap = {
                series: {
                    left: 50
                },
                extendedSeries: {
                    left: 50
                },
                plot: {
                    left: 50
                },
                yAxis: {
                    left: 50
                },
                xAxis: {
                    left: 50
                },
                mouseEventDetector: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsModel.dimensionMap.yAxis = {
                width: 50
            };
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateBoundsForYAxisCenterOption();

            expect(boundsModel.dimensionMap.extendedSeries.width).toBe(350);
            expect(boundsModel.dimensionMap.xAxis.width).toBe(301);
            expect(boundsModel.dimensionMap.plot.width).toBe(351);
            expect(boundsModel.dimensionMap.mouseEventDetector.width).toBe(350);
            expect(boundsModel.dimensionMap.tooltip.width).toBe(350);

            expect(boundsModel.positionMap.series.left).toBe(0);
            expect(boundsModel.positionMap.extendedSeries.left).toBe(1);
            expect(boundsModel.positionMap.plot.left).toBe(1);
            expect(boundsModel.positionMap.yAxis.left).toBe(201);
            expect(boundsModel.positionMap.xAxis.left).toBe(1);
            expect(boundsModel.positionMap.mouseEventDetector.left).toBe(1);
            expect(boundsModel.positionMap.tooltip.left).toBe(1);
        });

        it('should add series.left and extendedSeries.left by 1 for older browsers(IE7, IE8)', function() {
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
            boundsModel.dimensionMap = {
                extendedSeries: {
                    width: 300
                },
                xAxis: {
                    width: 300
                },
                plot: {
                    width: 300
                },
                mouseEventDetector: {
                    width: 300
                },
                tooltip: {
                    width: 300
                }
            };
            boundsModel.positionMap = {
                series: {
                    left: 50
                },
                extendedSeries: {
                    left: 50
                },
                plot: {
                    left: 50
                },
                yAxis: {
                    left: 50
                },
                xAxis: {
                    left: 50
                },
                mouseEventDetector: {
                    left: 50
                },
                tooltip: {
                    left: 50
                }
            };

            boundsModel.dimensionMap.yAxis = {
                width: 50
            };
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateBoundsForYAxisCenterOption();

            expect(boundsModel.positionMap.series.left).toBe(1);
            expect(boundsModel.positionMap.extendedSeries.left).toBe(2);
        });
    });

    describe('_updateLegendAndSeriesWidth()', function() {
        it('update legend width, when has width for vertical type legend', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };
            boundsModel.dimensionMap.legend = {
                width: 0
            };
            boundsModel.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_LEFT
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('legend').width).toBe(80);
        });

        it('update legend width, when has not width for vertical type legend', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };
            boundsModel.dimensionMap.legend = {
                width: 0
            };
            boundsModel.options.legend = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_TOP
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('legend').width).toBe(0);
        });

        it('update series width', function() {
            boundsModel.dimensionMap.series = {
                width: 300
            };

            boundsModel._updateLegendAndSeriesWidth(80, 20);

            expect(boundsModel.getDimension('series').width).toBe(280);
        });
    });

    describe('getBaseSizeForLimit()', function() {
        it('should return series.width to default size, when value axis is x.', function() {
            var actual, expected;

            spyOn(boundsModel, 'calculateSeriesWidth').and.returnValue(400);

            actual = boundsModel.getBaseSizeForLimit();
            expected = 400;

            expect(actual).toBe(expected);
        });

        it('should set series.height to default size, when value axis is y.', function() {
            var actual, expected;

            spyOn(boundsModel, 'calculateSeriesHeight').and.returnValue(300);

            actual = boundsModel.getBaseSizeForLimit(true);
            expected = 300;

            expect(actual).toBe(expected);
        });
    });
});
