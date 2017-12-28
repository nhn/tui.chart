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
        it('min이 음수이고 max가 양수일 경우에는 0점에서 max까지의 거리(_getLimitDistanceFromZeroPoint)를' +
            ' top position 정보에 확장 사이트를 더하여 반환합니다.', function() {
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

        it('min, max가 모두 양수인 경우에는 입력 높이에 확장 사이즈를 더하여 반환합니다.', function() {
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

        it('min, max가 모두 음수인 경우에는 확장 사이즈를 반환합니다.', function() {
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
        it('영역 chart의 기존 position값에 이전 top을 startTop으로 설정하여 stackType position 정보를 구합니다.', function() {
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
        it('영역 차트의 position은 stack 차트의 경우 _makeBasicPositions 실행 결과를 전달하여 _makeStackedPositions를 실행한 결과를 반환합니다.', function() {
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

        it('영역 차트의 position은 stack 차트가 아닌경우 경우 _makeBasicPositions 실행한 결과를 반환합니다.', function() {
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
