/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase'),
    chartConst = require('../../src/js/const'),
    Legend = require('../../src/js/legends/legend'),
    dom = require('../../src/js/helpers/domHandler'),
    dataConverter = require('../../src/js/helpers/dataConverter'),
    boundsMaker = require('../../src/js/helpers/boundsMaker'),
    UserEventListener = require('../../src/js/helpers/UserEventListener');

describe('ChartBase', function() {
    var chartBase;

    beforeEach(function() {
        chartBase = new ChartBase({
            userData: {
                categories: ['cate1', 'cate2', 'cate3'],
                series: [
                    {
                        name: 'Legend1',
                        data: [20, 30, 50]
                    },
                    {
                        name: 'Legend2',
                        data: [40, 40, 60]
                    },
                    {
                        name: 'Legend3',
                        data: [60, 50, 10]
                    },
                    {
                        name: 'Legend4',
                        data: [80, 10, 70]
                    }
                ]
            },
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

    describe('_makeConvertedData()', function() {
        it('전달되 사용자 데이터를 이용하여 차트에서 사용이 용이한 변환 데이터를 생성합니다.', function() {
            var actual;
            spyOn(dataConverter, 'convert').and.returnValue({'values': [1, 2, 3]});
            actual = chartBase._makeConvertedData({
                userData: {},
                options: {}
            });
            expect(actual.values).toEqual([1, 2, 3]);
        });
    });

    describe('_makeChartId', function() {
        it('차트 아이디를 생성합니다.', function() {
            var actual = chartBase._makeChartId();
            expect(actual.indexOf(chartConst.CHAR_ID_PREFIX)).toBeGreaterThan(-1);
        });
    });

    describe('_initUserEventListener()', function() {
        it('사용자 이벤트를 등록할 수 있는 userEventListener 객체를 생성합니다.', function() {
            var actual = chartBase._initUserEventListener();
            expect(actual.constructor).toBe(UserEventListener);
        });
    });

    describe('addComponent()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function () {
            var legend;
            chartBase.addComponent('legend', Legend, {});

            legend = chartBase.componentMap.legend;
            expect(legend).toBeTruthy();
            expect(legend.constructor).toEqual(Legend);
            expect(tui.util.inArray('legend', tui.util.pluck(chartBase.components, 'name'))).toBe(0);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function () {
            expect(chartBase.componentMap.plot).toBeFalsy();
        });
    });


    describe('_makeBounds()', function() {
        it('차트의 요소들의 bounds 정보를 생성합니다.', function() {
            var actual;
            spyOn(boundsMaker, 'make').and.returnValue({'chart': {dimension: {width: 100, height: 100}}});
            actual = chartBase._makeBounds({});
            expect(actual.chart.dimension).toEqual({width: 100, height: 100});
        });

        it('부모로 부터 전달받은 bounds정보가 있으면, 그대로 반환합니다..', function() {
            var actual;
            actual = chartBase._makeBounds({}, {
                'bounds': {
                    'chart': {dimension: {width: 200, height: 200}}
                }
            });
            expect(actual.chart.dimension).toEqual({width: 200, height: 200});
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
