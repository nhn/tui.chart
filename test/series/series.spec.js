/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('../../src/js/series/series.js'),
    chartConst = require('../../src/js/const.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('Series', function() {
    var groupValues = [[20], [40], [80], [120]],
        groupValues2 = [
            [20, 80], [40, 60], [60, 40], [80, 20]
        ],
        data = {
            values: [[20], [40]],
            formattedValues: [[20], [40]],
            scale: {min: 0, max: 160}
        },
        bound = {
            dimension: {width: 200, height: 100},
            position: {top: 50, right: 50}
        },
        theme = {
            colors: ['blue']
        },
        series;

    beforeEach(function() {
        series = new Series({
            chartType: 'bar',
            tooltipPrefix: 'tooltip-prefix-',
            data: data,
            bound: bound,
            theme: theme,
            options: {}
        });
    });

    describe('_makePercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: groupValues,
                scale: data.scale
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('stacked 옵션이 "normal"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: groupValues2,
                scale: data.scale
            }, 'normal');
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });

        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: groupValues2,
                scale: data.scale
            }, 'percent');
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });

    describe('_makeNormalPercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var result = series._makeNormalPercentValues({
                values: groupValues,
                scale: data.scale
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });
    });

    describe('_makeNormalStackedPercentValues()', function() {
        it('stacked 옵션이 "normal"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makeNormalStackedPercentValues({
                values: groupValues2,
                scale: data.scale
            });
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });
    });

    describe('_makeNormalStackedPercentValues()', function() {
        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentStackedPercentValues({
                values: groupValues2,
                scale: data.scale
            });
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });

    describe('renderBounds()', function() {
        it('series 영역 너비, 높이, 위치를 렌더링 합니다.', function() {
            var elSeries = dom.create('DIV');
            series._renderBounds(elSeries, {
                    width: 200,
                    height: 100
                },
                {
                    top: 20,
                    right: 20
                }
            );

            expect(elSeries.style.width).toEqual('200px');
            expect(elSeries.style.height).toEqual('100px');
            expect(elSeries.style.top).toEqual('19px');
            expect(elSeries.style.right).toEqual('18px');
        });
    });

    describe('render()', function() {
        it('width=200, height=100의 series 영역을 렌더링합니다.', function () {
            var elSeries = series.render();

            expect(elSeries.className.indexOf('series-area') > -1).toBeTruthy();
            expect(elSeries.style.width).toEqual('200px');
            expect(elSeries.style.height).toEqual('100px');

            expect(elSeries.style.top).toEqual('49px');

            if (renderUtil.isIE8()) {
                expect(elSeries.style.right).toEqual('50px');
            } else {
                expect(elSeries.style.right).toEqual('49px');
            }
        });
    });
});
