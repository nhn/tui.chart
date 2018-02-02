/**
 * @fileoverview Test for pluginFactory.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var pluginFactory = require('../../src/js/factories/pluginFactory.js');

describe('pluginFactory', function() {
    var BarChart = function() {};
    pluginFactory.register('testRaphael', {
        bar: BarChart
    });

    describe('get()', function() {
        it('should return plugin, if plugin is registered.', function() {
            var graphRenderer = pluginFactory.get('testRaphael', 'bar');

            expect(!!graphRenderer).toBeTruthy();
            expect(graphRenderer instanceof BarChart).toBeTruthy();
        });

        it('should throw errors, if plugin is not registered.', function() {
            expect(function() {
                pluginFactory.get('d3', 'bar');
            }).toThrowError('Not exist d3 plugin.');
        });

        it('should throw errors, if chart renderer is not registered.', function() {
            expect(function() {
                pluginFactory.get('testRaphael', 'line');
            }).toThrowError('Not exist line chart renderer.');
        });
    });
});
