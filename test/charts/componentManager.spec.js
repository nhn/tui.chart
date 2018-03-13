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
        it('should have plot, after register plot', function() {
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

        it('should not have plot component, before register plot', function() {
            expect(componentManager.componentMap.plot).toBeFalsy();
        });
    });

    describe('where()', function() {
        it('should filter components by parameter\'s key value', function() {
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
            }];

            expect(actual).toEqual(expected);
        });
    });
});
