/**
 * @fileoverview Test Items.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Items = require('../../src/js/dataModels/items'),
    Item = require('../../src/js/dataModels/item');

describe('test Items', function() {
    var items;

    beforeEach(function() {
        items = new Items();
    });

    describe('_makeValuesMapPerStack()', function() {
        it('item에서 value를 추출하여 stack 기준으로 values map을 생성합니다.', function() {
            var actual, expected;

            items.items = [
                new Item(10, 'st1', []),
                new Item(20, 'st2', []),
                new Item(30, 'st1', []),
                new Item(40, 'st2', [])
            ];

            actual = items._makeValuesMapPerStack();
            expected = {
                st1: [10, 30],
                st2: [20, 40]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumMapPerStack()', function() {
        it('stack으로 구성된 valueMap을 값을 values의 합 으로 대체하여 반환합니다.', function() {
            var actual, expected;

            items.items = [
                new Item(10, 'st1', []),
                new Item(20, 'st2', []),
                new Item(30, 'st1', []),
                new Item(40, 'st2', [])
            ];

            actual = items._makeSumMapPerStack();
            expected = {
                st1: 40,
                st2: 60
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('addRatiosWhenPercentStacked()', function() {
        it('percent stacked옵션일 경우에는 dividingNumber를 구하여 baseRatio와 함께 item.addRatio에 전달 합니다.', function() {
            var item = jasmine.createSpyObj('item', ['addRatio']);

            item.value = 20;
            item.stack = 'st';
            items.items = [item];
            items.addRatiosWhenPercentStacked(0.5);

            expect(item.addRatio).toHaveBeenCalledWith(20, 0, 0.5);
        });
    });

    describe('addRatiosWhenDivergingStacked()', function() {
        it('diverging stacked옵션일 경우에는 plusSum, minusSum 중 하나를 선택하여 dividingNumber로 선택한 후 baseRatio 0.5와 함께 item.addRatio에 전달 합니다.', function() {
            var item = jasmine.createSpyObj('item', ['addRatio']);

            item.value = 20;
            items.items = [item];
            items.addRatiosWhenDivergingStacked(30, 20);

            expect(item.addRatio).toHaveBeenCalledWith(30, 0, 0.5);
        });
    });

    describe('addRatios()', function() {
        it('addRatios는 전달 받은 divNumber, subValue를 item.addRatio에 그대로 전달 합니다.', function() {
            var item = jasmine.createSpyObj('item', ['addRatio']);

            item.value = 20;
            items.items = [item];
            items.addRatios(20, 10);

            expect(item.addRatio).toHaveBeenCalledWith(20, 10);
        });
    });
});
