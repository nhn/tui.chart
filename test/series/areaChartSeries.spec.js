/**
 * @fileoverview Test for area chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AreaChartSeries = require('../../src/js/series/areaChartSeries'),
    chartConst = require('../../src/js/const');

describe('AreaChartSeries', function() {
    var series, boundsMaker;

    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        series = new AreaChartSeries({
            chartType: 'area',
            theme: {},
            options: {},
            boundsMaker: boundsMaker
        });
    });

    describe('_makePositionTopOfZeroPoint', function() {
        it('min이 음수이고 max가 양수일 경우에는 0점에서 max까지의 거리(_getLimitDistanceFromZeroPoint)를 top position 정보에 확장 사이트를 더하여 반환합니다.', function() {
            var limit = {
                    min: -10,
                    max: 10
                },
                height = 100,
                actual, expected;

            series.data = {
                limit: limit
            };

            boundsMaker.getDimension.and.returnValue({
                height: height
            });

            actual = series._makePositionTopOfZeroPoint();
            expected = series._getLimitDistanceFromZeroPoint(height, limit).toMax + chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });

        it('min, max가 모두 양수인 경우에는 입력 높이에 확장 사이즈를 더하여 반환합니다.', function() {
            var limit = {
                    min: 0,
                    max: 10
                },
                height = 100,
                actual, expected;

            series.data = {
                limit: limit
            };

            boundsMaker.getDimension.and.returnValue({
                height: height
            });

            actual = series._makePositionTopOfZeroPoint();
            expected = height + chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });

        it('min, max가 모두 음수인 경우에는 확장 사이즈를 반환합니다.', function() {
            var limit = {
                    min: -20,
                    max: -10
                },
                height = 100,
                actual, expected;

            series.data = {
                limit: limit
            };

            boundsMaker.getDimension.and.returnValue({
                height: height
            });

            actual = series._makePositionTopOfZeroPoint();
            expected = chartConst.SERIES_EXPAND_SIZE;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeStackedPositions()', function() {
        it('영역 chart의 기존 position값에 이전 top을 startTop으로 설정하여 stacked position 정보를 구합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 190
            });

            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makeStackedPositions([[{top: 150}], [{top: 100}], [{top: 180}]]);
            expected = [[{top: 150, startTop: 200}], [{top: 50, startTop: 150}], [{top: 30, startTop: 50}]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalPositions()', function() {
        it('일반 영역 차트의 경우 기본 position값에 0점의 position top을 startTop으로 설정합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 190
            });

            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makeNormalPositions([[{top: 150}], [{top: 100}], [{top: 180}]]);
            expected = [[{top: 150, startTop: 200}], [{top: 100, startTop: 200}], [{top: 180, startTop: 200}]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalPositions()', function() {
        it('영역 차트의 position은 stacked의 경우 기본 position을 구해 _makeStackedPositions를 실행한 결과를 반환합니다.', function() {
            var basicPositions = [[{top: 150}], [{top: 100}], [{top: 180}]],
                actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 190
            });

            spyOn(series, '_makeBasicPositions').and.returnValue(basicPositions);
            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makePositions();
            expected = series._makeStackedPositions(basicPositions);

            expect(actual).toEqual(expected);
        });

        it('영역 차트의 position은 stacked가 아닌경우 경우 기본 position을 구해 _makeNormalPositions 실행한 결과를 반환합니다.', function() {
            var basicPositions = [[{top: 150}], [{top: 100}], [{top: 180}]],
                actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 190
            });

            spyOn(series, '_makeBasicPositions').and.returnValue(basicPositions);
            spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

            actual = series._makePositions();
            expected = series._makeNormalPositions(basicPositions);

            expect(actual).toEqual(expected);
        });
    });
});
