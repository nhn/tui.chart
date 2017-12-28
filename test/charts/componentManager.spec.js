/**
 * @fileoverview Test for ComponentManager.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentManager = require('../../src/js/charts/componentManager');
var snippet = require('tui-code-snippet');

describe('Test for ComponentManager', function() {
    var componentManager;

    beforeEach(function() {
        componentManager = new ComponentManager({
            options: {}
        });
    });

    describe('register()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function() {
            var plot;
            componentManager.options = {
                xAxis: {}
            };
            componentManager.register('plot', 'plot');

            plot = componentManager.componentMap.plot;
            expect(plot).toBeTruthy();
            expect(plot.componentType).toEqual('plot');
            expect(snippet.inArray('plot', snippet.pluck(componentManager.components, 'componentName'))).toBe(0);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function() {
            expect(componentManager.componentMap.plot).toBeFalsy();
        });
    });

    describe('where()', function() {
        it('components에서 전달받은 객체의 key value들을 포함하는 component들을 필터링하여 반환합니다.', function() {
            var actual, expected;
            componentManager.components.push({
                name: 'columnSeries',
                componentType: 'series'
            });
            componentManager.components.push({
                name: 'lineSeries',
                componentType: 'series'
            });
            componentManager.components.push({
                name: 'tooltip',
                componentType: 'tooltip'
            });

            actual = componentManager.where({componentType: 'series'});
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
