/**
 * @fileoverview test plot
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Plot = require('../../src/js/plots/plot.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('test Plot', function() {
    var bound = {
            dimension: {width: 400, height: 200},
            position: {top: 5, right: 5}
        },
        theme = {
            lineColor: 'black'
        },
        plot;

    beforeEach(function() {
        plot = new Plot({
            vTickCount: 5,
            theme: theme,
            bound: bound
        });
    });

    describe('_renderLines()', function() {
        it('plot 라인 렌더링', function () {
            var el = dom.create('DIV'),
                compareHtml = '<div class="ne-chart-plot-line horizontal" style="bottom:50px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:100px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:149px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:199px;width:400px;background-color:black"></div>',
                elTemp = document.createElement('DIV');

            plot._renderLines(el, bound.dimension);
            elTemp.innerHTML = compareHtml;

            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });
    });

    describe('_makeLineHtml()', function() {
        it('라인 html 생성', function () {
            var positions = [10, 20, 30, 40],
                width = 200,
                className = 'vertical',
                positionType = 'left',
                sizeType = 'height',
                resultHtml = plot._makeLineHtml({
                    positions: positions,
                    size: width,
                    className: className,
                    positionType: positionType,
                    sizeType: sizeType
                }),
                compareHtml = '<div class="ne-chart-plot-line vertical" style="left:10px;height:200px"></div>' +
                    '<div class="ne-chart-plot-line vertical" style="left:20px;height:200px"></div>' +
                    '<div class="ne-chart-plot-line vertical" style="left:30px;height:200px"></div>' +
                    '<div class="ne-chart-plot-line vertical" style="left:40px;height:200px"></div>';
            expect(resultHtml).toEqual(compareHtml);
        });
    });

    describe('_makeVerticalPixelPositions()', function() {
        it('세로 라인들의 pixel타입 위치 정보(position.left) 반환', function () {
            var positions;
            plot.vTickCount = 5;
            positions = plot._makeVerticalPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);
        });

        it('vTickCount 값이 없으면 빈 배열 반환', function () {
            var positions;
            plot.vTickCount = 0;
            positions = plot._makeVerticalPixelPositions(200);
            expect(positions).toEqual([]);
        });
    });

    describe('_makeHorizontalPixelPositions()', function() {
        it('가로 라인들의 pixel타입 위치 정보(position.top) 반환', function () {
            var positions;
            plot.hTickCount = 5;
            positions = plot._makeHorizontalPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);
        });

        it('hTickCount 값이 없으면 빈 배열 반환', function () {
            var positions;
            plot.hTickCount = 0;
            positions = plot._makeHorizontalPixelPositions(200);
            expect(positions).toEqual([]);
        });
    });

    describe('render()', function() {
        it('plot영역 렌더링', function () {
            var el = plot.render(),
                elTemp = document.createElement('DIV'),
                compareHtml = '<div class="ne-chart-plot-line horizontal" style="bottom:50px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:100px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:149px;width:400px;background-color:black"></div>' +
                    '<div class="ne-chart-plot-line horizontal" style="bottom:199px;width:400px;background-color:black"></div>';

            elTemp.innerHTML = compareHtml;

            expect(el.style.width).toEqual('400px');
            expect(el.style.height).toEqual('200px');
            expect(el.style.top).toEqual('5px');
            expect(el.style.right).toEqual('5px');
            expect(el.className).toEqual('ne-chart-plot-area');
            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });
    });
});
