/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase.js'),
    Legend = require('../../src/js/legends/legend.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('ChartBase', function() {
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

    describe('addComponent()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function () {
            var legend;
            chartBase.addComponent('legend', Legend, {});

            legend = chartBase.componentMap.legend;
            expect(legend).toBeTruthy();
            expect(legend.constructor).toEqual(Legend);
            expect(ne.util.inArray(legend, chartBase.components)).toBeGreaterThan(-1);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function () {
            expect(chartBase.componentMap.plot).toBeFalsy();
        });
    });

    describe('_renderTitle()', function() {
        it('글꼴크기가 14px이고 타이틀이 "Chart Title"인 차트 타이틀을 렌더링 합니다.', function () {
            var el = dom.create('DIV');
            chartBase._renderTitle(el);
            expect(el.firstChild.innerHTML).toEqual('Chart Title');
            expect(el.firstChild.style.fontSize).toEqual('14px');
        });
    });
});
