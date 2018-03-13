/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var LineTypeSeriesBase = require('../../../src/js/components/series/lineTypeSeriesBase'),
    SeriesDataModel = require('../../../src/js/models/data/seriesDataModel'),
    SeriesGroup = require('../../../src/js/models/data/seriesGroup'),
    renderUtil = require('../../../src/js/helpers/renderUtil');

describe('LineTypeSeriesBase', function() {
    var series, dataProcessor;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFirstItemLabel', 'isCoordinateType']);
        series = new LineTypeSeriesBase();
        series.dataProcessor = dataProcessor;
        series._getSeriesDataModel = jasmine.createSpy('_getSeriesDataModel');
        series.layout = {
            dimension: {
                width: 300,
                height: 200
            },
            position: {
                top: 0,
                left: 0
            }
        };
    });

    describe('_makePositionsForDefaultType()', function() {
        it('make positions for default data type, when not aligned.', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25
                }, {
                    ratio: 0.5
                }, {
                    ratio: 0.4
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
            series.axisDataMap = {
                xAxis: {}
            };
            series.aligned = false;
            actual = series._makePositionsForDefaultType();

            expect(actual).toEqual([
                [
                    {
                        top: 150,
                        left: 50
                    },
                    {
                        top: 100,
                        left: 150
                    },
                    {
                        top: 120,
                        left: 250
                    }
                ]
            ]);
        });

        it('should not create position when serieItem.end equals null.', function() {
            var seriesDataModel = new SeriesDataModel();
            var expected = [[]];
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25,
                    end: null
                }, {
                    ratio: 0.5
                }, {
                    ratio: 0.4
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
            series.axisDataMap = {
                xAxis: {}
            };
            series.aligned = false;
            actual = series._makePositionsForDefaultType();

            expected[0][1] = {
                top: 100,
                left: 150
            };
            expected[0][2] = {
                top: 120,
                left: 250
            };
            expect(actual).toEqual(expected);
        });

        it('make positions for default data type, when aligned & single data', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(1);
            series.aligned = true;
            series.layout = {
                dimension: {
                    width: 300,
                    height: 200
                },
                position: {
                    top: 10,
                    left: 10
                }
            };
            series.axisDataMap = {
                xAxis: {}
            };

            actual = series._makePositionsForDefaultType();

            expect(actual).toEqual([
                [
                    {
                        top: 160,
                        left: 10
                    }
                ]
            ]);
        });

        it('make positions for default data type, when aligned & single null data', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25,
                    end: null
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(1);
            series.aligned = true;
            series.layout = {
                dimension: {
                    width: 300,
                    height: 200
                },
                position: {
                    top: 10,
                    left: 10
                }
            };
            series.axisDataMap = {
                xAxis: {}
            };

            actual = series._makePositionsForDefaultType();

            expect(actual.length).toBe(1);
            expect(actual[0].length).toBe(1);
            expect(actual[0][0]).toBeUndefined();
        });

        it('make positions for default data type, when aligned & null', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25
                }, {
                    ratio: 0.5
                }, {
                    ratio: 0.4
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
            series.aligned = true;
            series.axisDataMap = {
                xAxis: {}
            };

            actual = series._makePositionsForDefaultType();

            expect(actual).toEqual([
                [
                    {
                        top: 150,
                        left: 0
                    },
                    {
                        top: 100,
                        left: 150
                    },
                    {
                        top: 120,
                        left: 300
                    }
                ]
            ]);
        });
    });

    describe('_makePositionForCoordinateType()', function() {
        it('make positions for coordinate data type', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratioMap: {
                        x: 0,
                        y: 0.2
                    }
                }, {
                    ratioMap: {
                        x: 0.5,
                        y: 0.7
                    }
                }, {
                    ratioMap: {
                        x: 1,
                        y: 0.4
                    }
                }])
            ];
            series.layout = {
                dimension: {
                    width: 300,
                    height: 200
                },
                position: {
                    top: 0,
                    left: 0
                }
            };
            series.axisDataMap = {
                xAxis: {
                    sizeRatio: 0.8,
                    positionRatio: 0.08
                }
            };
            actual = series._makePositionForCoordinateType();

            expect(actual).toEqual([
                [
                    {
                        top: 160,
                        left: 24
                    },
                    {
                        top: 60,
                        left: 144
                    },
                    {
                        top: 120,
                        left: 264
                    }
                ]
            ]);
        });
    });

    describe('_calculateLabelPositionTop()', function() {
        it('should calculate label top position if stack type chart.', function() {
            var actual, expected;

            series.options = {
                stackType: 'normal'
            };

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 20, 16);
            expected = 18;

            expect(actual).toBe(expected);
        });

        it('should calculates top when the value is positive and not the starting value, not stack chart', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 60,
                startTop: 40
            }, 30, 16);
            expected = 39;

            expect(actual).toBe(expected);
        });

        it('should calculate top when the value is negative and start value, not stack chart', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 60,
                startTop: 40
            }, -30, 16, true);
            expected = 39;

            expect(actual).toBe(expected);
        });

        it('should calculate top when the value is positive and start value, not stack chart', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 30, 16, true);
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('should calculate top when the value is negative and not start value, not stack chart', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 30, 16, true);
            expected = 15;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeLabelPosition()', function() {
        it('should calculate left using labe.width and basePostion.left', function() {
            var position, actual, expected;

            spyOn(series, '_calculateLabelPositionTop');
            series.theme = {};
            series.dimensionMap = {
                extendedSeries: {
                    width: 200
                }
            };

            position = series._makeLabelPosition({
                left: 60
            });
            actual = position.left;
            expected = 60;

            expect(actual).toBe(expected);
        });

        it('should calculate top using label.width and result of _calculateLabelPositionTop().', function() {
            var position, actual, expected;

            spyOn(series, '_calculateLabelPositionTop').and.returnValue(50);
            series.theme = {};
            series.dimensionMap = {
                extendedSeries: {
                    height: 200
                }
            };

            position = series._makeLabelPosition({
                left: 60
            });
            actual = position.top;
            expected = 50;

            expect(actual).toBe(expected);
        });
    });
});
