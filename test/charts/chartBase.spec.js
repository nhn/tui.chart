/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase.js'),
    Legend = require('../../src/js/legends/legend.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('test ChartBase', function() {
    var chartBase;

    beforeEach(function() {
        chartBase = new ChartBase({}, {
            title: {
                fontSize: 14
            }
        }, {
            chart: {
                title: 'Chart Title'
            }
        });
    });

    it('addComponent()', function() {
        chartBase.addComponent('legend', Legend, {});
        expect(!!chartBase.componentMap.legend).toBeTruthy();
        expect(!!chartBase.componentMap.plot).toBeFalsy();
    });

    it('_renderTitle()', function() {
        var el = dom.create('DIV');
        chartBase._renderTitle(el);
        expect(el.firstChild.innerHTML).toEqual('Chart Title');
        expect(el.firstChild.style.fontSize).toEqual('14px');
    });
});
