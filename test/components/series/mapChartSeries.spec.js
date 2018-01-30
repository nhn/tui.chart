/**
 * @fileoverview test for MapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var mapSeriesFactory = require('../../../src/js/components/series/mapChartSeries.js');

describe('MapChartSeries', function() {
    var series, dataProcessor, mapModel;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getValueMap']);
        mapModel = jasmine.createSpyObj('mapModel', ['getMapDimension']);
    });

    beforeEach(function() {
        series = new mapSeriesFactory.MapChartSeries({
            dataProcessor: dataProcessor,
            chartType: 'map',
            theme: {
                heatmap: {}
            },
            eventBus: new snippet.CustomEvents()
        });
        series.mapModel = mapModel;
        series.mapDimension = {
            width: 600,
            height: 400
        };
    });

    describe('_setMapRatio()', function() {
        it('should calculate map ratio by dividing map size to chart area size. ', function() {
            var actual, expected;

            series.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            series.graphDimension = {
                width: 800,
                height: 600
            };
            series._setMapRatio(series.graphDimension);

            actual = series.mapRatio;
            expected = 0.5;

            expect(actual).toBe(expected);
        });

        it('should set map ratio, to smaller ratio of width and height', function() {
            var actual, expected;

            series.layout = {
                dimension: {
                    width: 200,
                    height: 300
                }
            };
            series.graphDimension = {
                width: 800,
                height: 600
            };
            series._setMapRatio(series.graphDimension);

            actual = series.mapRatio;
            expected = 0.25;

            expect(actual).toBe(expected);
        });
    });

    describe('_setGraphDimension()', function() {
        it('should set graph dimension by multiplying series dimension with zoom magnification', function() {
            var actual, expected;

            series.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            series.zoomMagn = 2;
            series._setGraphDimension();

            actual = series.graphDimension;
            expected = {
                width: 800,
                height: 600
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_setLimitPositionToMoveMap', function() {
        it('should limit position of moving map.', function() {
            var actual, expected;

            series.layout = {
                dimension: {
                    width: 400,
                    height: 300
                }
            };
            series.graphDimension = {
                width: 800,
                height: 600
            };
            series._setLimitPositionToMoveMap();

            actual = series.limitPosition;
            expected = {
                left: -400,
                top: -300
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_adjustMapPosition()', function() {
        it('should adjust map position for making position not to over limit or under 0', function() {
            var actual, expected;

            series.limitPosition = {
                left: -400,
                top: -300
            };

            actual = series._adjustMapPosition({
                left: -420,
                top: 10
            });
            expected = {
                left: -400,
                top: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_updatePositionsToResize()', function() {
        it('should update position for resizing.', function() {
            series.mapRatio = 2;
            series.basePosition = {
                left: -10,
                top: -20
            };
            series.limitPosition = {
                left: -100,
                top: -50
            };
            series._updatePositionsToResize(1);

            expect(series.basePosition.left).toBe(-20);
            expect(series.basePosition.top).toBe(-40);
            expect(series.limitPosition.left).toBe(-200);
            expect(series.limitPosition.top).toBe(-100);
        });
    });
});
