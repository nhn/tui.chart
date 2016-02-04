/**
 * @fileoverview test calculator
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../src/js/helpers/calculator.js');

describe('calculator', function() {
    describe('calculateLimit()', function() {
        it('userMin=10, userMax=100의 기본 limit 계산 결과는 min=0, max=104.5입니다.', function () {
            var actual = calculator.calculateLimit(10, 100);
            expect(actual.min).toBe(0);
            expect(actual.max).toBe(104.5);
        });

        it('userMin=20, userMax=100의 기본 limit 계산 결과는 min=16, max=104입니다.', function () {
            var actual = calculator.calculateLimit(20, 100);
            expect(actual.min).toBe(16);
            expect(actual.max).toBe(104);
        });

        it('userMin=-100, userMax=-20의 기본 limit 계산 결과는 min=-100, max=-16입니다.', function () {
            var actual = calculator.calculateLimit(-100, -20);
            expect(actual.min).toBe(-100);
            expect(actual.max).toBe(-16);
        });
    });

    describe('normalizeAxisNumber()', function() {
        it('0에 대한 정규화 결과는 0입니다.', function () {
            var result = calculator.normalizeAxisNumber(0);
            expect(result).toBe(0);
        });

        it('1.6에 대한 정규화 결과는 2입니다.', function () {
            var result = calculator.normalizeAxisNumber(1.6);
            expect(result).toBe(2);
        });

        it('4에 대한 정규화 결과는 5입니다.', function () {
            var result = calculator.normalizeAxisNumber(4);
            expect(result).toBe(5);
        });

        it('6에 대한 정규화 결과는 10입니다.', function () {
            var result = calculator.normalizeAxisNumber(6);
            expect(result).toBe(10);
        });

        it('40에 대한 정규화 결과는 50입니다.', function () {
            var result = calculator.normalizeAxisNumber(40);
            expect(result).toBe(50);
        });

        it('1005에 대한 정규화 결과는 2000입니다.', function () {
            var result = calculator.normalizeAxisNumber(1005);
            expect(result).toBe(1100);
        });

        it('0.4에 대한 정규화 결과는 0.5입니다.', function () {
            var result = calculator.normalizeAxisNumber(0.4);
            expect(result).toBe(0.5);
        });

        it('0.07에 대한 정규화 결과는 0.1입니다.', function () {
            var result = calculator.normalizeAxisNumber(0.07);
            expect(result).toBe(0.1);
        });
    });

    describe('makePixelPositions()', function() {
        it('size=300, count=5인 경우의 pixel 타입의 position정보를 반환합니다.', function () {
            var positions = calculator.makeTickPixelPositions(300, 5);
            expect(positions).toEqual([0, 75, 150, 224, 299]);
        });

        it('size=400, count=6인 경우의 pixel 타입의 position정보를 반환합니다.', function() {
            var positions = calculator.makeTickPixelPositions(400, 6);
            expect(positions).toEqual([0, 80, 160, 239, 319, 399]);
        });
    });

    describe('calculateStepFromLimit()', function() {
        it('limit.min=20, limit.max=100, tickCount=5 의 limit step은 20입니다.', function () {
            var tickCount = 5,
                limit = {min: 20, max: 100},
                step = calculator.calculateStepFromLimit(limit, tickCount);
            expect(step).toBe(20);
        });

        it('limit.min=10, limit.max=130 tickCount=4의 limit step은 30입니다.', function () {
            var tickCount = 4,
                limit = {min: 10, max: 130},
                step = calculator.calculateStepFromLimit(limit, tickCount);
            expect(step).toBe(40);
        });
    });

    describe('makeLabelsFromLimit()', function() {
        it('min=20, max=100, step=20일 때의 labels는 [20, 40, 60, 80, 100] 입니다.', function () {
            var limit = {min: 20, max: 100},
                step = 20,
                result = calculator.makeLabelsFromLimit(limit, step);
            expect(result).toEqual([20, 40, 60, 80, 100]);
        });

        it('min=10, max=130, step=40일 때의 labels는 [10, 50, 90, 130] 입니다.', function () {
            var limit = {min: 10, max: 130},
                step = 40,
                result = calculator.makeLabelsFromLimit(limit, step);
            expect(result).toEqual([10, 50, 90, 130]);
        });
    });

    describe('calculateAdjacent()', function() {
        it('끼인각이 30도이고 빗변이 2일 경우 인접변 너비는 루트3 입니다.', function() {
            var actual = calculator.calculateAdjacent(30, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); //소수점 16째 자리가 다름
        });
    });

    describe('calculateAdjacent()', function() {
        it('끼인각이 30도이고 빗변이 2일 경우 맞은변 너비는 루트3 입니다.', function() {
            var actual = calculator.calculateOpposite(60, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); //소수점 16째 자리가 다름
        });
    });
});
