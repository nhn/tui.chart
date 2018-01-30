/**
 * @fileoverview Test for ChartBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase'),
    DataProcessor = require('../../src/js/models/data/dataProcessor');

describe('Test for ChartBase', function() {
    var chartBase, componentManager, boundsModel;

    beforeAll(function() {
        componentManager = jasmine.createSpyObj('componentManager', ['where']);
        boundsModel = jasmine.createSpyObj('boundsModel', ['initBoundsData', 'getDimension']);
    });

    beforeEach(function() {
        chartBase = new ChartBase({
            chartType: 'chartType',
            rawData: {
                categories: ['cate1', 'cate2', 'cate3'],
                series: {
                    'chartType': [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50]
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60]
                        },
                        {
                            name: 'Legend3',
                            data: [60, 50, 10]
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70]
                        }
                    ]
                }
            },
            theme: {
                title: {
                    fontSize: 14
                }
            },
            options: {
                chart: {
                    title: 'Chart Title'
                }
            }
        });
        chartBase.componentManager = componentManager;
        chartBase.boundsModel = boundsModel;
    });

    describe('_setOffsetProperty()', function() {
        it('set offset property', function() {
            var options = {
                offsetX: 10
            };

            chartBase._setOffsetProperty(options, 'offsetX', 'x');

            expect(options).toEqual({
                offset: {
                    x: 10
                }
            });
        });

        it('if not included fromProperty in option, this function is not working', function() {
            var options = {
                offsetY: 10
            };

            chartBase._setOffsetProperty(options, 'offsetX', 'x');

            expect(options).toEqual({
                offsetY: 10
            });
        });
    });

    describe('initializeOffset', function() {
        it('initialize offset', function() {
            var options = {
                offsetX: 10,
                offsetY: 20
            };

            chartBase._initializeOffset(options);

            expect(options).toEqual({
                offset: {
                    x: 10,
                    y: 20
                }
            });
        });

        it('initialize offset, when has only offsetX property', function() {
            var options = {
                offsetX: 10
            };

            chartBase._initializeOffset(options);

            expect(options).toEqual({
                offset: {
                    x: 10
                }
            });
        });
    });

    describe('_initializeTitleOptions()', function() {
        it('initialize title options, when options.title is string type', function() {
            var options = {
                title: 'Title'
            };

            chartBase._initializeTitleOptions(options);

            expect(options).toEqual({
                title: {
                    text: 'Title'
                }
            });
        });

        it('initialize title options, when has offsetX or offsetY property', function() {
            var options = {
                title: {
                    text: 'Title',
                    offsetX: 10,
                    offsetY: 20
                }
            };

            chartBase._initializeTitleOptions(options);

            expect(options).toEqual({
                title: {
                    text: 'Title',
                    offset: {
                        x: 10,
                        y: 20
                    }
                }
            });
        });

        it('initialize title options, when has two options', function() {
            var optionsSet = [{
                title: {
                    text: 'Title1',
                    offsetX: 10,
                    offsetY: 20
                }
            }, {
                title: {
                    text: 'Title2',
                    offsetX: 30,
                    offsetY: 40
                }
            }];

            chartBase._initializeTitleOptions(optionsSet);

            expect(optionsSet).toEqual([{
                title: {
                    text: 'Title1',
                    offset: {
                        x: 10,
                        y: 20
                    }
                }
            }, {
                title: {
                    text: 'Title2',
                    offset: {
                        x: 30,
                        y: 40
                    }
                }
            }]);
        });
    });

    describe('_initializeTooltipOptions()', function() {
        it('initialize tooltip options. when had grouped property', function() {
            var options = {
                grouped: true
            };

            chartBase._initializeTooltipOptions(options);

            expect(options).toEqual({
                grouped: true
            });
        });

        it('initialize tooltip options, when has offsetX or offsetY property', function() {
            var options = {
                offsetX: 10,
                offsetY: 20
            };

            chartBase._initializeTooltipOptions(options);

            expect(options).toEqual({
                grouped: false,
                offset: {
                    x: 10,
                    y: 20
                }
            });
        });

        it('(deprecated) initialize tooltip options, when has position property', function() {
            var options = {
                position: {
                    left: 20,
                    top: 30
                }
            };

            chartBase._initializeTooltipOptions(options);

            expect(options).toEqual({
                grouped: false,
                offset: {
                    x: 20,
                    y: 30
                }
            });
        });

        it('(deprecated) initialize tooltip options, when has both (offsetX or offsetY) and position', function() {
            var options = {
                offsetX: 50,
                position: {
                    left: 20,
                    top: 30
                }
            };

            chartBase._initializeTooltipOptions(options);

            expect(options).toEqual({
                grouped: false,
                offset: {
                    x: 50
                }
            });
        });
    });

    describe('_makeProcessedData()', function() {
        it('should create easy-to-use data from user data', function() {
            var actual;
            actual = chartBase._createDataProcessor({
                DataProcessor: DataProcessor,
                rawData: {
                    categories: ['a', 'b', 'c']
                },
                options: {}
            });
            expect(actual instanceof DataProcessor).toBe(true);
            expect(actual.originalRawData).toEqual({
                categories: ['a', 'b', 'c']
            });
        });
    });

    describe('_updateChartDimension()', function() {
        it('should update chart width and height using passed dimension', function() {
            chartBase.options = {
                chart: {}
            };
            chartBase._updateChartDimension({
                width: 200,
                height: 100
            });
            expect(chartBase.options.chart.width).toBe(200);
            expect(chartBase.options.chart.height).toBe(100);
        });
    });

    describe('resize()', function() {
        it('should not update dimension, when resize is called without dimension', function() {
            spyOn(chartBase, 'readyForRender');

            chartBase.resize();

            expect(chartBase.readyForRender).not.toHaveBeenCalled();
        });

        it('should update dimension, when resize is called with dimension', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(false);

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(chartBase._updateChartDimension).toHaveBeenCalledWith({
                width: 400,
                height: 300
            });
        });

        it('should not update dimension, when dimension infomation does not change', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(false);
            spyOn(chartBase, 'readyForRender');

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(chartBase.readyForRender).not.toHaveBeenCalled();
        });
    });

    describe('_findSeriesIndexByLabel()', function() {
        it('should return index, if found same label', function() {
            var actual = chartBase._findSeriesIndexByLabel('chartType', 'Legend2');

            expect(actual).toBe(1);
        });

        it('should return -1, if not found', function() {
            var actual = chartBase._findSeriesIndexByLabel('chartType', 'legend2');

            expect(actual).toBe(-1);
        });
    });
});
