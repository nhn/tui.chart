/**
 * @fileoverview test plot view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var PlotView = require('../../src/js/views/plotView.js'),
    PlotModel = require('../../src/js/models/plotModel.js');

describe('test Plot View', function() {
    var bound = {
        dimension: {width: 400, height: 200},
        position: {top: 5, right: 5}
    };

    it('test _makeLineHtml', function() {
        var positions = [10, 20, 30, 40],
            width = 200,
            className = 'vertical',
            positionType = 'left',
            sizeType = 'height',
            plotView = new PlotView(),
            resultHtml = plotView._makeLineHtml(positions, width, className, positionType, sizeType),
            compareHtml = '<div class="plot-line vertical" style="left:10px;height:200px"></div>' +
                '<div class="plot-line vertical" style="left:20px;height:200px"></div>' +
                '<div class="plot-line vertical" style="left:30px;height:200px"></div>' +
                '<div class="plot-line vertical" style="left:40px;height:200px"></div>';
        expect(resultHtml).toEqual(compareHtml);
    });

    it('test _renderLines', function() {
        var plotModel = new PlotModel({vTickCount: 5}),
            plotView = new PlotView(plotModel),
            el = plotView.el,
            compareHtml = '<div class="plot-line horizontal" style="bottom:50px;width:400px"></div>' +
                '<div class="plot-line horizontal" style="bottom:100px;width:400px"></div>' +
                '<div class="plot-line horizontal" style="bottom:149px;width:400px"></div>' +
                '<div class="plot-line horizontal" style="bottom:199px;width:400px"></div>',
            elTemp = document.createElement('DIV');

        plotView._renderLines(bound.dimension);
        elTemp.innerHTML = compareHtml;

        expect(el.innerHTML).toEqual(elTemp.innerHTML);
    });

    it('test vertical render', function() {
        var data = {vTickCount: 3},
            plotModel = new PlotModel(data),
            plotView = new PlotView(plotModel),
            el = plotView.render(bound),
            elTemp = document.createElement('DIV'),
            compareHtml = '<div class="plot-line horizontal" style="bottom:100px;width:400px"></div>' +
                '<div class="plot-line horizontal" style="bottom:199px;width:400px"></div>';

        elTemp.innerHTML = compareHtml;

        expect(el.style.width).toEqual('400px');
        expect(el.style.height).toEqual('200px');
        expect(el.style.top).toEqual('5px');
        expect(el.style.right).toEqual('5px');
        expect(el.className).toEqual('plot-area');
        expect(el.innerHTML).toEqual(elTemp.innerHTML);
    });

});