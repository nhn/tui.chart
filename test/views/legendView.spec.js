/**
 * @fileoverview test legend view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendView = require('../../src/js/views/legendView.js'),
    LegendModel = require('../../src/js/models/legendModel.js'),
    chartConst = require('../../src/js/const.js');

describe('test Legend View', function() {
    var labels = [
            'Density',
            'Density2'
        ],
        colors = Array.prototype.slice.call(chartConst.DEFAUlT_COLORS),
        data, legendModel, legendView;

    colors.length = labels.length;
    legendModel = new LegendModel({labels: labels, colors: colors});
    legendView = new LegendView(legendModel)


    it('test getLegendAreaHeight', function() {
        var result = legendView.getLegendAreaHeight();
        expect(result).toBeGreaterThan(20);
    });

    it('test getLegendAreaWidth', function() {
        var result = legendView.getLegendAreaWidth();
        expect(result).toBeGreaterThan(70);
    });

    it('test render', function() {
        var elLegend = legendView.render(200),
            compareHtml = '<div class="ne-chart-legend">' +
                '<div class="ne-chart-legend-rect" style="background-color:red"></div>' +
                '<div class="ne-chart-legend-label">Density</div>' +
            '</div>' +
            '<div class="ne-chart-legend">' +
                '<div class="ne-chart-legend-rect" style="background-color:orange"></div>' +
                '<div class="ne-chart-legend-label">Density2</div>' +
            '</div>',
            elTemp = document.createElement('DIV');
        elTemp.innerHTML = compareHtml;

        expect(elLegend.className).toEqual('ne-chart-legend-area');
        expect(elLegend.innerHTML).toEqual(elTemp.innerHTML);
    });
});