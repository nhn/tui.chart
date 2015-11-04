/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase.js'),
    Legend = require('../../src/js/legends/legend.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    UserEventListener = require('../../src/js/helpers/UserEventListener');

describe('ChartBase', function() {
    var chartBase;

    beforeEach(function() {
        chartBase = new ChartBase({
            bounds: {},
            theme: {
                title: {
                    fontSize: 14
                }
            },
            options: {
                chart: {
                    title: 'Chart Title'
                }
            }
        });
    });

    describe('_initUserEventListener()', function() {
        it('사용자 이벤트를 등록할 수 있는 userEventListener 객체를 생성합니다.', function() {
            var actual = chartBase._initUserEventListener();
            expect(actual.constructor).toBe(UserEventListener);
        });

        it('부모 차트에서 userEvent객체를 전달 받았다면 전달받은 객체를 반환합니다.', function() {
            var userEvent = new UserEventListener(),
                actual = chartBase._initUserEventListener({
                    userEvent: userEvent
                });
            expect(actual).toBe(userEvent);
        });
    });

    describe('addComponent()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function () {
            var legend;
            chartBase.addComponent('legend', Legend, {});

            legend = chartBase.componentMap.legend;
            expect(legend).toBeTruthy();
            expect(legend.constructor).toEqual(Legend);
            expect(tui.util.inArray(legend, chartBase.components)).toBeGreaterThan(-1);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function () {
            expect(chartBase.componentMap.plot).toBeFalsy();
        });
    });

    describe('_renderTitle()', function() {
        it('글꼴크기가 14px이고 타이틀이 "Chart Title"인 차트 타이틀을 렌더링 합니다.', function () {
            var el = dom.create('DIV');
            chartBase._renderTitle(el);
            expect(el.firstChild.innerHTML).toBe('Chart Title');
            expect(el.firstChild.style.fontSize).toBe('14px');
        });
    });
});
