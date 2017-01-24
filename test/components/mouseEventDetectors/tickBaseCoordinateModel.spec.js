/**
 * @fileoverview Test for TickBaseCoordinateModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('../../../src/js/components/mouseEventDetectors/tickBaseCoordinateModel');

describe('Test for TickBaseCoordinateModel', function() {
    var coordinateModel;

    beforeEach(function() {
        coordinateModel = new TickBaseCoordinateModel({
            dimension: {
                width: 200,
                height: 100
            },
            position: {
                top: 0,
                left: 0
            }}, 3, 'column', true);
    });

    describe('_makeLineTypeData()', function() {
        it('line type 차트의 경우는 tick과 tick 사이를 경계로 분할하여 limit 데이터를 생성합니다.', function() {
            var actual = coordinateModel._makeLineTypeData(199, 3),
                expected = [{min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 249}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalData()', function() {
        it('line type 차트가 아닌 경우에는 tick 지점을 기준으로 분할하여 limit 데이터를 생성합니다.', function() {
            var actual = coordinateModel._makeNormalData(200, 3),
                expected = [{min: 0, max: 100}, {min: 100, max: 200}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeData()', function() {
        it('line type 차트의 경우는 _makeLineTypeData의 실행 결과를 반환합니다.', function() {
            var actual, expected;

            coordinateModel.isLineType = true;

            actual = coordinateModel._makeData({
                dimension: {
                    width: 200,
                    height: 100
                },
                position: {
                    top: 0,
                    left: 0
                }}, 3, 'line', true);
            expected = coordinateModel._makeLineTypeData(200, 3);

            expect(actual).toEqual(expected);
        });

        it('line type 차트가 아닌 경우는 _makeNormalData 실행 결과를 반환합니다.', function() {
            var actual, expected;

            coordinateModel.isLineType = false;

            actual = coordinateModel._makeData({
                dimension: {
                    width: 200,
                    height: 100
                },
                position: {
                    top: 0,
                    left: 0
                }
            }, 3, 'column', true);
            expected = coordinateModel._makeNormalData(200, 3);

            expect(actual).toEqual(expected);
        });
    });

    describe('findIndex()', function() {
        it('마우스 X좌표값(layerX)으로 groups를 탐색하여 해당하는 group index를 찾아냅니다.', function() {
            var actual, expected;
            actual = coordinateModel.findIndex(110);
            expected = 1;
            expect(actual).toBe(expected);
        });

        it('그룹 정보에 해당 좌표값이 없을 경우에는 -1을 반환합니다.', function() {
            var actual, exptected;
            coordinateModel.coordinateData = [
                {
                    min: 0,
                    max: 50
                },
                {
                    min: 50,
                    max: 150
                }
            ];
            actual = coordinateModel.findIndex(210);
            exptected = -1;
            expect(actual).toBe(exptected);
        });
    });

    describe('makeRange()', function() {
        it('라인타입인 경우에는 index에 해당하는 data(limit)의 중간값을 툴팁 범위로 반환합니다.', function() {
            var actual, expected;

            coordinateModel.isLineType = true;
            coordinateModel.data = [
                {min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 250}
            ];

            actual = coordinateModel.makeRange(1, 'line');
            expected = {
                start: 100,
                end: 100
            };

            expect(actual).toEqual(expected);
        });

        it('라인타입이 아닌 경우에는 index에 해당하는 data 그대로 반환합니다.', function() {
            var actual, expected;

            coordinateModel.isLineType = false;
            coordinateModel.data = [
                {min: 0, max: 100}, {min: 100, max: 200}
            ];

            actual = coordinateModel.makeRange(0);
            expected = {
                start: 0,
                end: 100
            };

            expect(actual).toEqual(expected);
        });
    });
});
