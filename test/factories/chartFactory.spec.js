'use strict';

var chartFactory = require('../../src/js/factories/chartFactory.js');

describe('chartFactory', function() {
    var TempClass = function() {};

    chartFactory.register('barChart', TempClass);

    describe('get()', function() {
        it('등록된 차트를 요청했을 경우의 결과 확인', function() {
            var chart = chartFactory.get('barChart');

            expect(!!chart).toBeTruthy();
            expect(chart.constructor).toEqual(TempClass);
        });

        it('등록되지 않은 차트를 요청했을 경우의 결과 확인', function() {
            try {
                chartFactory.get('lineChart');
            } catch(e) {
                expect(e.message).toEqual('Not exist lineChart chart.');
            }
        });
    });
});
