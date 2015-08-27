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

    it('_renderLines()', function() {
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


    it('_makeLineHtml()', function() {
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

    it('makeVPixelPositions', function() {
        var positions;
        plot.vTickCount = 5;
        positions = plot.makeVerticalPixelPositions(200);
        expect(positions).toEqual([50, 100, 149, 199]);

        plot.vTickCount = 0;
        positions = plot.makeVerticalPixelPositions(200);
        expect(positions).toEqual([]);
    });

    it('makeHPixelPositions', function() {
        var positions;
        plot.hTickCount = 0;
        positions = plot.makeHorizontalPixelPositions(200);
        expect(positions).toEqual([]);

        plot.hTickCount = 5;
        positions = plot.makeHorizontalPixelPositions(200);
        expect(positions).toEqual([50, 100, 149, 199]);
    });

    it('render()', function() {
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
