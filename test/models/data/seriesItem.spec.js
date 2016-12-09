/**
 * @fileoverview Test for SeriesItem.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesItem = require('../../../src/js/models/data/seriesItem');

describe('Test for SeriesItem', function() {
    var seriesItem;

    beforeEach(function() {
        seriesItem = new SeriesItem({});
    });

    describe('_initValues()', function() {
        it('initialize values of item, when raw value is number', function() {
            seriesItem.formatFunctions = [function(value) {
                return '00' + value;
            }];
            seriesItem._initValues(10);

            expect(seriesItem.value).toBe(10);
            expect(seriesItem.end).toBe(10);
            expect(seriesItem.label).toBe('0010');
            expect(seriesItem.endLabel).toBe('0010');
            expect(seriesItem.isRange).toBe(false);
        });
        it('initialize values of item, when raw value is null', function() {
            seriesItem._initValues(null);

            expect(seriesItem.value).toBe(null);
            expect(seriesItem.end).toBe(null);
            expect(seriesItem.start).toBe(null);
            expect(seriesItem.label).toBe('');
            expect(seriesItem.endLabel).toBe('');
            expect(seriesItem.startLabel).toBe(null);
            expect(seriesItem.isRange).toBe(false);
        });
        it('initialize values of item, when raw value is array', function() {
            seriesItem.formatFunctions = [function(value) {
                return '00' + value;
            }];
            seriesItem._initValues([10, 40]);

            expect(seriesItem.value).toBe(40);
            expect(seriesItem.end).toBe(40);
            expect(seriesItem.start).toBe(10);
            expect(seriesItem.label).toBe('0010 ~ 0040');
            expect(seriesItem.endLabel).toBe('0040');
            expect(seriesItem.startLabel).toBe('0010');
            expect(seriesItem.isRange).toBe(true);
        });

        it('if diverging chart, label is plus value', function() {
            seriesItem.isDivergingChart = true;
            seriesItem._initValues(-10);

            expect(seriesItem.value).toBe(-10);
            expect(seriesItem.label).toBe('10');
        });
    });

    describe('_createValues()', function() {
        it('전달된 value가 배열여부와 상관없이 무조건 배열로 만들고 내림차순 정렬하여 반환합니다.', function() {
            var actual = seriesItem._createValues([3, 1, 2, 10]),
                expected = [10, 3, 2, 1];

            expect(actual).toEqual(expected);
        });

        it('음수가 포함된 경우도 문제없이 내림차순 정렬하여 반환합니다.', function() {
            var actual = seriesItem._createValues([3, 1, -2, 10]),
                expected = [10, 3, 1, -2];

            expect(actual).toEqual(expected);
        });
    });

    describe('addRatio()', function() {
        it('value값 기준으로 ratio를 계산하여 ratio와 endRatio에 계산된 값을 할당합니다.', function() {
            seriesItem.value = 40;
            seriesItem.addRatio(100);

            expect(seriesItem.ratio).toBe(0.4);
            expect(seriesItem.endRatio).toBe(0.4);
        });

        it('start값이 있을 경우 start값 기준으로 startRatio도 계산하여 할당합니다.', function() {
            seriesItem.hasStart = true;
            seriesItem.start = 20;
            seriesItem.value = 40;
            seriesItem.addRatio(100);

            expect(seriesItem.ratio).toBe(0.4);
            expect(seriesItem.endRatio).toBe(0.4);
            expect(seriesItem.startRatio).toBe(0.2);
        });
    });
});
