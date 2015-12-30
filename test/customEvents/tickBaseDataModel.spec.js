/**
 * @fileoverview Test for TickBaseDataModel.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseDataModel = require('../../src/js/customEvents/tickBaseDataModel');

describe('TickBaseDataModel', function() {
    var dataModel;

    beforeEach(function() {
        dataModel = new TickBaseDataModel({
            width: 200
        }, 3, 'column', true);
    });

    describe('_makeLineTypeData()', function() {
        it('line type 차트의 경우는 tick과 tick 사이를 경계로 분할하여 limit 데이터를 생성합니다.', function() {
            var actual = dataModel._makeLineTypeData(199, 3),
                expected = [{min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 249}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalData()', function() {
        it('line type 차트가 아닌 경우에는 tick 지점을 기준으로 분할하여 limit 데이터를 생성합니다.', function() {
            var actual = dataModel._makeNormalData(200, 3),
                expected = [{min: 0, max: 100}, {min: 100, max: 200}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeData()', function() {
        it('line type 차트의 경우는 _makeLineTypeData의 실행 결과를 반환합니다.', function() {
            var actual = dataModel._makeData({
                    width: 200
                }, 3, 'line', true),
                expected = dataModel._makeLineTypeData(200, 3);
            expect(actual).toEqual(expected);
        });

        it('line type 차트가 아닌 경우는 _makeNormalData 실행 결과를 반환합니다.', function() {
            var actual = dataModel._makeData({
                    width: 200
                }, 3, 'column', true),
                expected = dataModel._makeNormalData(200, 3);
            expect(actual).toEqual(expected);
        });
    });

    describe('findIndex()', function() {
        it('마우스 X좌표값(layerX)으로 groups를 탐색하여 해당하는 group index를 찾아냅니다.', function() {
            var actual, expected;
            actual = dataModel.findIndex(110);
            expected = 1;
            expect(actual).toBe(expected);
        });

        it('그룹 정보에 해당 좌표값이 없을 경우에는 -1을 반환합니다.', function() {
            var actual, exptected;
            dataModel.coordinateData = [
                {
                    min: 0,
                    max: 50
                },
                {
                    min: 50,
                    max: 150
                }
            ];
            actual = dataModel.findIndex(210);
            exptected = -1;
            expect(actual).toBe(exptected);
        });
    });

    describe('makeRange()', function() {
        it('라인타입인 경우에는 index에 해당하는 data(limit)의 중간값을 툴팁 범위로 반환합니다.', function() {
            var actual, expected;
            dataModel.data = [
                {min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 250}
            ];
            actual = dataModel.makeRange(1, 'line');
            expected = {
                start: 100,
                end: 100
            };
            expect(actual).toEqual(expected);
        });

        it('라인타입이 아닌 경우에는 index에 해당하는 data 그대로 반환합니다.', function() {
            var actual, expected;
            dataModel.data = [
                {min: 0, max: 100}, {min: 100, max: 200}
            ];
            actual = dataModel.makeRange(0);
            expected = {
                start: 0,
                end: 100
            };
            expect(actual).toEqual(expected);
        });
    });
});
