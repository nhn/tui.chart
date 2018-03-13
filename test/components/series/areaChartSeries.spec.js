/**
 * @fileoverview Test for area chart series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var areaSeriesFactory = require('../../../src/js/components/series/areaChartSeries'),
    chartConst = require('../../../src/js/const');

describe('AreaChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new areaSeriesFactory.AreaChartSeries({
            chartType: 'area',
            theme: {},
            options: {},
            eventBus: new snippet.CustomEvents()
        });
        series.layout = {
            position: {
                top: 10,
                left: 10
            }
        };
    });

    describe('_makePositionTopOfZeroPoint', function() {
        it('should make postion to _getLimitDistanceFromZeroPoint().toMax + EXPAND_SIZE, when min is negative and max is positive', function() {
            var limit = {
                min: -10,
                max: 10
            };
            var height = 100;
            var actual, expected;

            series.layout.dimension = {
                height: height
            };
            series.axisDataMap = {
                yAxis: {
                    limit: limit
                }
            };

            actual = series._makePositionTopOfZeroPoint();
            expected = series._getLimitDistanceFromZeroPoint(height, limit).toMax + chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });

        it('should return height + EXPAND_SIZE, if min, max are positive.', function() {
            var limit = {
                min: 0,
                max: 10
            };
            var height = 100;
            var actual, expected;

            series.layout.dimension = {
                height: height
            };
            series.axisDataMap = {
                yAxis: {
                    limit: limit
                }
            };

            actual = series._makePositionTopOfZeroPoint();
            expected = height + chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });

        it('should return EXPAND_SIZE if min, max are negatives.', function() {
            var limit = {
                min: -20,
                max: -10
            };
            var height = 100;
            var actual, expected;

            series.layout.dimension = {
                height: height
            };
            series.axisDataMap = {
                yAxis: {
                    limit: limit
                }
            };

            actual = series._makePositionTopOfZeroPoint();
            expected = chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeStackedPositions()', function() {
        it('should make stack type position by setting the previous top to startTop.', function() {
            var actual, expected;

            series.layout.dimension = {
                height: 190
            };

            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makeStackedPositions([[{top: 150}], [{top: 100}], [{top: 180}]]);
            expected = [[{top: 150, startTop: 200}], [{top: 50, startTop: 150}], [{top: 30, startTop: 50}]];

            expect(actual).toEqual(expected);
        });
        it('use prevTop if position is null.', function() {
            var actual, expected;

            series.layout.dimension = {
                height: 190
            };

            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makeStackedPositions([
                [{top: 150}, {top: 100}],
                [null, {top: 150}],
                [{top: 180}, {top: 150}]
            ]);
            expected = [
                [{top: 150, startTop: 200}, {top: 100, startTop: 200}],
                [null, {top: 50, startTop: 100}],
                [{top: 130, startTop: 150}, {top: 0, startTop: 50}]
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makePositions()', function() {
        it('should make stack type position by using _makeBasicPositions() and _makeStackedPosition().', function() {
            var basicPositions = [[{top: 150}], [{top: 100}], [{top: 180}]],
                actual, expected;

            series.layout.dimension = {
                height: 190
            };

            spyOn(series, '_makeBasicPositions').and.returnValue(basicPositions);
            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makePositions();
            expected = series._makeStackedPositions(basicPositions);

            expect(actual).toEqual(expected);
        });

        it('should make non stack type position by using _makeBasicPosition().', function() {
            var actual, expected;

            series.layout.dimension = {
                height: 190
            };

            spyOn(series, '_makeBasicPositions').and.returnValue([[{top: 150}], [{top: 100}], [{top: 180}]]);
            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makePositions();
            expected = series._makeBasicPositions();

            expect(actual).toEqual(expected);
        });
    });
});
