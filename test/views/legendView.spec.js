/**
 * @fileoverview test legend view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendView = require('../../src/js/views/legendView.js'),
    LegendModel = require('../../src/js/models/legendModel.js');

describe('test Legend View', function() {
    var labels = [
            'Density',
            'Density2'
        ],
        theme = {
            label: {
                fontSize: 12
            },
            colors: ['red', 'orange']
        },
        legendModel, legendView;
    legendModel = new LegendModel({labels: labels});
    legendView = new LegendView(legendModel, theme);


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
                '<div class="ne-chart-legend-rect" style="background-color:red;margin-top:2px"></div>' +
                '<div class="ne-chart-legend-label" style="height:19px">Density</div>' +
            '</div>' +
            '<div class="ne-chart-legend">' +
                '<div class="ne-chart-legend-rect" style="background-color:orange;margin-top:2px"></div>' +
                '<div class="ne-chart-legend-label" style="height:19px">Density2</div>' +
            '</div>',
            elTemp = document.createElement('DIV'),
            tempChildren;

        elTemp.innerHTML = compareHtml;
        elTemp.style.fontSize = '12px';

        tempChildren = elTemp.childNodes;

        expect(elLegend.className).toEqual('ne-chart-legend-area');
        expect(elLegend.style.cssText).toEqual(elTemp.style.cssText);

        ne.util.forEachArray(elLegend.childNodes, function(child, index) {
            var elTempChild = tempChildren[index];
            expect(child.firstChild.cssText).toEqual(elTempChild.firstChild.cssText);
            expect(child.lastChild.cssText).toEqual(elTempChild.lastChild.cssText);
        });
    });
});