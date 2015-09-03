/**
 * @fileoverview test calculator
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../src/js/helpers/calculator.js');

describe('calculator', function() {
    describe('calculateScale()', function() {
        it('min=10, max=100의 scale 계산 결과 반환', function () {
            var scale = calculator.calculateScale(10, 100);
            expect(scale.max).toEqual(104.5);
            expect(scale.min).toEqual(0);
        });

        it('min=20, max=100의 scale 계산 결과 반환', function () {
            var scale = calculator.calculateScale(20, 100);
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(16);
        });

        it('min=-100, max=-20의 scale 계산 결과 반환', function () {
            var scale = calculator.calculateScale(-100, -20);
            expect(scale.max).toEqual(-16);
            expect(scale.min).toEqual(-100);
        });
    });

    describe('normalizeAxisNumber()', function() {
        it('0에 대한 일반화 결과는 0', function () {
            var result = calculator.normalizeAxisNumber(0);
            expect(result).toEqual(0);
        });

        it('1.6에 대한 일반화 결과는 2', function () {
            var result = calculator.normalizeAxisNumber(1.6);
            expect(result).toEqual(2);
        });

        it('4에 대한 일반화 결과는 5', function () {
            var result = calculator.normalizeAxisNumber(4);
            expect(result).toEqual(5);
        });

        it('6에 대한 일반화 결과는 10', function () {
            var result = calculator.normalizeAxisNumber(6);
            expect(result).toEqual(10);
        });

        it('40에 대한 일반화 결과는 40', function () {
            var result = calculator.normalizeAxisNumber(40);
            expect(result).toEqual(40);
        });

        it('1005에 대한 일반화 결과는 1010', function () {
            var result = calculator.normalizeAxisNumber(1005);
            expect(result).toEqual(1010);
        });

        it('0.4에 대한 일반화 결과는 0.5', function () {
            var result = calculator.normalizeAxisNumber(0.4);
            expect(result).toEqual(0.5);
        });

        it('0.07에 대한 일반화 결과는 0.1', function () {
            var result = calculator.normalizeAxisNumber(0.07);
            expect(result).toEqual(0.1);
        });
    });

    describe('makePixelPositions()', function() {
        it('size=300, count=5인 경우의 pixel 타입의 position정보 반환', function () {
            var positions = calculator.makeTickPixelPositions(300, 5);
            expect(positions).toEqual([0, 75, 150, 224, 299]);
        });

        it('size=400, count=6인 경우의 pixel 타입의 position정보 반환', function() {
            var positions = calculator.makeTickPixelPositions(400, 6);
            expect(positions).toEqual([0, 80, 160, 239, 319, 399]);
        });
    });

    describe('getScaleStep()', function() {
        it('scale step 정보 반환', function () {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = calculator.getScaleStep(scale, tickCount);
            expect(step).toEqual(20);
        });
    });

    describe('makeLabelsFromScale()', function() {
        it('scale 정보로부터 labels 생성', function () {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = calculator.getScaleStep(scale, tickCount),
                result = calculator.makeLabelsFromScale(scale, step);
            expect(result).toEqual([20, 40, 60, 80, 100]);
        });
    });

    describe('arrayPivot()', function() {
        it('배열 회전 결과 반환', function () {
            var result = calculator.arrayPivot([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);

            expect(result).toEqual([
                [1, 4, 7],
                [2, 5, 8],
                [3, 6, 9]
            ]);
        });
    });
});
