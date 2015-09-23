'use strict';

var chartFactory = require('../../src/js/factories/chartFactory.js');

describe('chartFactory', function() {
    var TempClass = function() {};

    chartFactory.register('barChart', TempClass);

    describe('get()', function() {
        it('등록된 차트를 요청했을 경우에는 차트를 반환합니다.', function() {
            var chart = chartFactory.get('barChart');
            expect(chart).toEqual(jasmine.any(TempClass));
        });

        it('등록되지 않은 차트를 요청했을 경우에는 예외를 발생시킵니다.', function() {
            expect(function() {
                chartFactory.get('lineChart');
            }).toThrowError('Not exist lineChart chart.');
        });
    });
});
