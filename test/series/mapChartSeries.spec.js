/**
 * @fileoverview test for MapChartSeries
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartSeries = require('../../src/js/series/mapChartSeries.js');

describe('MapChartSeries', function() {
    var series, dataProcessor, boundsMaker, mapModel;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getValueMap']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
        mapModel = jasmine.createSpyObj('mapModel', ['getMapDimension']);
    });

    beforeEach(function() {
        series = new MapChartSeries({
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            chartType: 'map'
        });
        series.mapModel = mapModel;
    });

    describe('_setMapRatio()', function() {
        it('맵이 그려지는 시리즈의 사이즈 영역의 사이즈를 실제 맵의 사이즈로 나누어 비율값을 구해 mapRatio로 설정합니다. ', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
            series.mapModel.getMapDimension.and.returnValue({
                width: 800,
                height: 600
            });
            series._setMapRatio();
            actual = series.mapRatio;
            expected = 0.5;

            expect(actual).toBe(expected);
        });

        it('너비와 높이의 ratio가 다를 경우 작은 값을 mapRatio로 설정합니다', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 200,
                height: 300
            });
            series.mapModel.getMapDimension.and.returnValue({
                width: 800,
                height: 600
            });
            series._setMapRatio();
            actual = series.mapRatio;
            expected = 0.25;

            expect(actual).toBe(expected);
        });
    });

    describe('_setGraphDimension()', function() {
        it('시리즈 dimension에 zoomMagn를 곱하여 graphDimension을 구합니다', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
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
        it('지도 이동 position의 limit을 설정합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
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
        it('설정된 limit position부터 0까지의 범위를 넘어가는 position값에 대해 넘어가지 않도록 보정합니다', function() {
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
        it('리사이즈 시의 position 정보들을 변경되는 비율만큼 갱신합니다.', function() {
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
        })
    });
});
