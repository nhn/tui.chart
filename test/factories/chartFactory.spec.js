var chartFactory = require('../../src/js/factories/chartFactory.js');

describe('test chartFactory', function() {
    var TempClass = function() {},
        chart;

    chartFactory.register('barChart', TempClass);

    it('test get', function() {
        var chart = chartFactory.get('barChart');

        expect(!!chart).toBeTruthy();
        expect(chart.constructor).toEqual(TempClass);

        try{
            chartFactory.get('lineChart');
        } catch(e) {
            expect(e.message).toEqual('Not exist lineChart chart.');
        }
    });
});