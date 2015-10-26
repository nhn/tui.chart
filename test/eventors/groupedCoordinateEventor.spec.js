/**
 * @fileoverview Test for GroupedCoordinateEventor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var GroupedCoordinateEventor = require('../../src/js/eventors/groupedCoordinateEventor');

describe('GroupedCoordinateEventor', function() {
    var eventor;

    beforeEach(function() {
        eventor = new GroupedCoordinateEventor({
            bound: {
                dimension: {
                    width: 300,
                    height: 300
                }
            }
        });
    });

    describe('_makeNormalCoordinateData()', function() {
        it('라인 타입이 아닌 차트의 좌표기반 기본 data를 생성합니다.', function() {
            var actual = eventor._makeNormalCoordinateData(200, 3),
                expected = [
                    {
                        min: 0,
                        max: 100
                    },
                    {
                        min: 100,
                        max: 200
                    }
                ];
            expect(actual).toEqual(expected);
        });
    });

    describe('makeCoordinateData()', function() {
        it('라인차트의 경우는 makeLineTypeCoordinateData() 실행 결과를 반환합니다.', function() {
            var dimension = {
                    height: 200
                },
                tickCount = 3,
                actual = eventor.makeCoordinateData(dimension, tickCount, 'line'),
                expected = eventor.makeLineTypeCoordinateData(dimension.height, tickCount);
            expect(actual).toEqual(expected);
        });

        it('라인차트가 아닌 경우는 _makeNormalCoordinateData() 실행 결과를 반환합니다.', function() {
            var dimension = {
                    height: 200
                },
                tickCount = 3,
                actual = eventor.makeCoordinateData(dimension, tickCount, 'column'),
                expected = eventor._makeNormalCoordinateData(dimension.height, tickCount);
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeRange()', function() {
        it('라인타입인 경우에는 입력 scale의 중간값을 툴팁 범위로 반환합니다.', function() {
            var actual = eventor._makeRange({
                    min: 0,
                    max: 100
                }, 'line'),
                expected = {
                    start: 50,
                    end: 50
                };
            expect(actual).toEqual(expected);
        });

        it('라인타입이 아닌 경우에는 입력 scale을 그대로 반환합니다.', function() {
            var actual = eventor._makeRange({
                    min: 0,
                    max: 100
                }),
                expected = {
                    start: 0,
                    end: 100
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_getLayerPositionValue()', function() {
        it('세로차트에서 마우스 이벤트 지점의 index를 찾기위한 상대 좌표는 clientX와 bound.left의 차입니다.', function() {
            var actual = eventor._getLayerPositionValue({
                    clientX: 100
                }, {
                    left: 50
                }, true),
                expected = 50;
            expect(actual).toBe(expected);
        });

        it('가로차트에서 마우스 이벤트 지점의 index를 찾기위한 상대 좌표는 clientY와 bound.top의 차입니다', function() {
            var actual = eventor._getLayerPositionValue({
                    clientY: 100
                }, {
                    top: 50
                }),
                expected = 50;
            expect(actual).toBe(expected);
        });
    });
});
