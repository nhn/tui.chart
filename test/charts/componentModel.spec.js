/**
 * @fileoverview test ComponentModel
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentModel = require('../../src/js/charts/componentModel'),
    Plot = require('../../src/js/plots/plot');

describe('test ComponentModel', function() {
    var componentModel;

    beforeEach(function() {
        componentModel = new ComponentModel({});
    });

    describe('register()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function () {
            var plot;
            componentModel.register('plot', Plot, {});

            plot = componentModel.componentMap.plot;
            expect(plot).toBeTruthy();
            expect(plot.constructor).toEqual(Plot);
            expect(tui.util.inArray('plot', tui.util.pluck(componentModel.components, 'name'))).toBe(0);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function () {
            expect(componentModel.componentMap.plot).toBeFalsy();
        });
    });

    describe('where()', function() {
        it('components에서 전달받은 객체의 key value들을 포함하는 component들을 필터링하여 반환합니다.', function() {
            var actual, expected;
            componentModel.components.push({
                name: 'columnSeries',
                componentType: 'series'
            });
            componentModel.components.push({
                name: 'lineSeries',
                componentType: 'series'
            });
            componentModel.components.push({
                name: 'tooltip',
                componentType: 'tooltip'
            });

            actual = componentModel.where({componentType: 'series'});
            expected = [{
                    name: 'columnSeries',
                    componentType: 'series'
                },
                {
                    name: 'lineSeries',
                    componentType: 'series'
                }
            ];

            expect(actual).toEqual(expected);
        });
    });
});
