'use strict';

var pluginFactory = require('../../src/js/factories/pluginFactory.js');

describe('test pluginFactory', function() {
    var BarChart = function() {};
    pluginFactory.register('testRaphael', {
        bar: BarChart
    });

    it('get()', function() {
        var graphRenderer = pluginFactory.get('testRaphael', 'bar');

        expect(!!graphRenderer).toBeTruthy();
        expect(graphRenderer instanceof BarChart).toBeTruthy();

        try {
            pluginFactory.get('d3', 'bar');
        } catch(e) {
            expect(e.message).toEqual('Not exist d3 plugin.');
        }

        try {
            pluginFactory.get('raphael', 'line');
        } catch(e) {
            expect(e.message).toEqual('Not exist line chart renderer.');
        }
    });
});
