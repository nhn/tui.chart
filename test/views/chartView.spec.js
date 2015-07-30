/**
 * @fileoverview test chart view
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartView = require('../../src/js/views/chartView.js');

describe('test ChartView', function() {
    var chartView = new ChartView();
    chartView.model = {
        title: 'Test title'
    };
    chartView.theme = {
        title: {
            fontSize: 12,
            color: 'orange',
            background: 'white'
        }
    };

    it('test renderTitleArea', function() {
        var elTitle = chartView.renderTitleArea();
        expect(elTitle.innerHTML).toEqual('Test title');
        expect(elTitle.style.fontSize).toEqual('12px');
        expect(elTitle.style.color).toEqual('orange');
        expect(elTitle.style.backgroundColor).toEqual('white');
    });

    it('test getRenderedTitleHeight', function() {
        var height = chartView.getRenderedTitleHeight();
        expect(height).toBeGreaterThan(32);
    });
});