/**
 * @fileoverview test plot
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Plot = require('../../src/js/plots/plot.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('test Plot', function() {
    var plot, boundsMaker;

    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getPosition', 'getDimension']);
    });
    beforeEach(function() {
        plot = new Plot({
            boundsMaker: boundsMaker,
            theme: {
                lineColor: 'black'
            }
        });

    });

    describe('_renderLines()', function() {
        it('vTickCount=5 width=400인 경우에는 시작 라인을 제외한 4개의 가로라인(horizontal)을 라인을 50px(or 40px) 간격으로 아래에서 부터 렌더링합니다.', function () {
            var el = dom.create('DIV'),
                childNodes;
            plot.bound = {
                dimension: {width: 400, height: 200},
                position: {top: 5, right: 5}
            };
            plot.data = {
                vTickCount: 5
            };
            plot._renderLines(el, plot.bound.dimension);
            childNodes = el.childNodes;

            expect(childNodes.length).toBe(4);
            expect(dom.hasClass(childNodes[0], 'horizontal')).toBe(true);
            expect(dom.hasClass(childNodes[3], 'horizontal')).toBe(true);
            expect(childNodes[0].style.bottom).toBe('50px');
            expect(childNodes[1].style.bottom).toBe('100px');
            expect(childNodes[2].style.bottom).toBe('149px');
            expect(childNodes[3].style.bottom).toBe('199px');
            expect(childNodes[0].style.width).toBe('400px');
            expect(childNodes[3].style.width).toBe('400px');
        });
    });

    describe('_makeLineHtml()', function() {
        it('position(라인 각각의 위치), size(라인 높이 or 너비), className(vertical or horizontal), positionType (left or top), sizeType(width or height) 정보를 이용하여 세로라인 html을 생성합니다.', function () {
            var positions = [10, 20, 30, 40],
                size = 200,
                className = 'vertical',
                positionType = 'left',
                sizeType = 'height',
                resultHtml = plot._makeLineHtml({
                    positions: positions,
                    size: size,
                    className: className,
                    positionType: positionType,
                    sizeType: sizeType
                }),
                compareHtml = '<div class="tui-chart-plot-line vertical" style="left:10px;height:200px"></div>' +
                    '<div class="tui-chart-plot-line vertical" style="left:20px;height:200px"></div>' +
                    '<div class="tui-chart-plot-line vertical" style="left:30px;height:200px"></div>' +
                    '<div class="tui-chart-plot-line vertical" style="left:40px;height:200px"></div>';
            expect(resultHtml).toBe(compareHtml);
        });
    });

    describe('_makeVerticalPixelPositions()', function() {
        it('vTickCount=5, size=200의 세로 라인들의 pixel타입 위치 정보(position.left)를 반환([50, 100, 149, 199])합니다.', function () {
            var positions;
            plot.data = {
                vTickCount: 5
            };
            positions = plot._makeVerticalPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);
        });

        it('vTickCount=0일 경우에는 빈 배열을 반환합니다.', function () {
            var positions;
            plot.data = {
                vTickCount: 0
            };
            positions = plot._makeVerticalPixelPositions(200);
            expect(positions).toEqual([]);
        });
    });

    describe('_makeHorizontalPixelPositions()', function() {
        it('hTickCount=5, size=200의 가로 라인들의 pixel타입 위치 정보(position.top)를 반환([50, 100, 149, 199])합니다.', function () {
            var positions;
            plot.data = {
                hTickCount: 5
            };
            positions = plot._makeHorizontalPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);
        });

        it('hTickCount=0일 경우에는 빈 배열을 반환합니다.', function () {
            var positions;
            plot.data = {
                hTickCount: 0
            };
            positions = plot._makeHorizontalPixelPositions(200);
            expect(positions).toEqual([]);
        });
    });

    describe('render()', function() {
        it('vTickCount=5 width=400, height=200인 plot 영역은 시작 라인을 제외한 4개의 가로라인(horizontal)을 라인을 50px(or 40px) 간격으로 렌더링합니다.', function () {
            var container, childNodes;

            boundsMaker.getPosition.and.returnValue({
                top: 5,
                left: 5
            });
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 200
            });
            container = plot.render({
                vTickCount: 5
            });

            expect(container.style.width).toBe('400px');
            expect(container.style.height).toBe('200px');
            expect(container.style.top).toBe('5px');
            expect(container.style.left).toBe('5px');
            expect(container.className).toBe('tui-chart-plot-area');

            childNodes = container.childNodes;

            expect(childNodes.length).toBe(4);
            expect(dom.hasClass(childNodes[0], 'horizontal')).toBe(true);
            expect(dom.hasClass(childNodes[3], 'horizontal')).toBe(true);
            expect(childNodes[0].style.bottom).toBe('50px');
            expect(childNodes[1].style.bottom).toBe('100px');
            expect(childNodes[2].style.bottom).toBe('149px');
            expect(childNodes[3].style.bottom).toBe('199px');
            expect(childNodes[0].style.width).toBe('400px');
            expect(childNodes[3].style.width).toBe('400px');
        });
    });
});
