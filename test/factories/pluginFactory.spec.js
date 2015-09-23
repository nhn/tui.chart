'use strict';

var pluginFactory = require('../../src/js/factories/pluginFactory.js');

describe('pluginFactory', function() {
    var BarChart = function() {};
    pluginFactory.register('testRaphael', {
        bar: BarChart
    });

    describe('get()', function() {
        it('등록된 플러그인을 요청했을 경우에는 플러그인을 반환합니다.', function () {
            var graphRenderer = pluginFactory.get('testRaphael', 'bar');

            expect(!!graphRenderer).toBeTruthy();
            expect(graphRenderer instanceof BarChart).toBeTruthy();
        });

        it('등록되지 않은 플러그인을 요청했을 경우에는 예외를 발생시킵니다.', function () {
            expect(function() {
                pluginFactory.get('d3', 'bar');
            }).toThrowError('Not exist d3 plugin.');
        });


        it('등록되지 않은 차트 렌더러를 요청했을 경우에는 예외를 발생시킵니다.', function () {
            expect(function() {
                pluginFactory.get('testRaphael', 'line');
            }).toThrowError('Not exist line chart renderer.');
        });
    });
});
