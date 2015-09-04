'use strict';

var pluginFactory = require('../../src/js/factories/pluginFactory.js');

describe('pluginFactory', function() {
    var BarChart = function() {};
    pluginFactory.register('testRaphael', {
        bar: BarChart
    });

    describe('get()', function() {
        it('등록된 플러그인을 요청했을 경우에는 플러그인을 반환함', function () {
            var graphRenderer = pluginFactory.get('testRaphael', 'bar');

            expect(!!graphRenderer).toBeTruthy();
            expect(graphRenderer instanceof BarChart).toBeTruthy();
        });

        it('등록되지 않은 플러그인을 요청했을 경우에는 예외를 발생시킴', function () {
            try {
                pluginFactory.get('d3', 'bar');
            } catch (e) {
                expect(e.message).toEqual('Not exist d3 plugin.');
            }
        });

        it('등록되지 않은 차트 렌더러를 요청했을 경우에는 예외를 발생시킴', function () {
            try {
                pluginFactory.get('raphael', 'line');
            } catch (e) {
                expect(e.message).toEqual('Not exist line chart renderer.');
            }
        });
    });
});
