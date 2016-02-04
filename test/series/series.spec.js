/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('../../src/js/series/series'),
    chartConst = require('../../src/js/const'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('Series', function() {
    var series, boundsMaker;

    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getBound']);
    });

    beforeEach(function() {
        series = new Series({
            chartType: 'bar',
            tooltipPrefix: 'tooltip-prefix-',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                },
                colors: ['blue']
            },
            boundsMaker: boundsMaker,
            options: {}
        });
    });

    describe('_getLimitDistanceFromZeroPoint()', function() {
        it('min, max 사이에 0점이 존재하는 경우에 0점으로 부터 limit min, max까지의 거리를 구합니다.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: -20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 80,
                toMin: 20
            });
        });

        it('min, max 모두 양수인 경우에는 toMax, toMin 모두 0을 반환합니다.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: 20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });

        it('min, max 모두 음수인 경우에는 toMax, toMin 모두 0을 반환합니다.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: -80,
                max: -20
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });
    });

    describe('renderBounds()', function() {
        it('series 영역 너비, 높이, 위치를 렌더링 합니다.', function() {
            var seriesContainer = dom.create('DIV');
            series._renderPosition(seriesContainer, {
                    top: 20,
                    left: 20
                }
            );

            if (renderUtil.isOldBrowser()) {
                expect(seriesContainer.style.top).toBe('18px');
                expect(seriesContainer.style.left).toBe('19px');
            } else {
                expect(seriesContainer.style.top).toBe('20px');
                expect(seriesContainer.style.left).toBe('20px');
            }
        });
    });

    describe('_makeSeriesLabelHtml()', function() {
        it('position, value 정보를 받아 series레이블이 표현될 html을 생성합니다.', function() {
            var result = series._makeSeriesLabelHtml({
                left: 10,
                top: 10
            }, 'label1', 0, 0);

            expect(result).toBe('<div class="tui-chart-series-label" style="left:10px;top:10px;font-family:Verdana;font-size:11px" data-group-index="0" data-index="0">label1</div>');
        });
    });

    describe('render()', function() {
        it('width=200, height=100의 series 영역을 렌더링합니다.', function () {
            var seriesContainer;

            series.hasAxes = true;

            boundsMaker.getBound.and.returnValue({
                dimension: {width: 200, height: 100},
                position: {top: 50, left: 50}
            });

            seriesContainer = series.render({});

            expect(seriesContainer.className.indexOf('series-area') > -1).toBe(true);
            expect(seriesContainer.style.width).toBe('220px');
            expect(seriesContainer.style.height).toBe('120px');

            if (renderUtil.isOldBrowser()) {
                expect(seriesContainer.style.top).toBe('38px');
                expect(seriesContainer.style.left).toBe('39px');
            } else {
                expect(seriesContainer.style.top).toBe('40px');
                expect(seriesContainer.style.left).toBe('40px');
            }
        });
    });

    describe('_findLabelElement()', function() {
        it('대상 엘리먼트가 시리즈 라벨(series label) 엘리먼트이면 대상 엘리먼트를 반환합니다.', function() {
            var elTarget = dom.create('DIV', chartConst.CLASS_NAME_SERIES_LABEL),
                actual = series._findLabelElement(elTarget),
                expected = elTarget;
            expect(actual).toBe(expected);
        });
    });
});
