/**
 * @fileoverview Test for CoordinateEventorBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CoordinateEventorBase = require('../../src/js/eventors/coordinateEventorBase');

describe('CoordinateEventorBase', function() {
    var eventor;

    beforeEach(function() {
        eventor = new CoordinateEventorBase({
            bound: {}
        });
    });

    describe('findIndex()', function() {
        it('마우스 X좌표값(layerX)으로 groups를 탐색하여 해당하는 group index를 찾아냅니다.', function() {
            var actual, exptected;
            eventor.coordinateData = [
                {
                    min: 0,
                    max: 50
                },
                {
                    min: 50,
                    max: 150
                }
            ];
            actual = eventor.findIndex(70);
            exptected = 1;
            expect(actual).toBe(exptected);
        });

        it('그룹 정보에 해당 좌표값이 없을 경우에는 -1을 반환합니다.', function() {
            var actual, exptected;
            eventor.coordinateData = [
                {
                    min: 0,
                    max: 50
                },
                {
                    min: 50,
                    max: 150
                }
            ];
            actual = eventor.findIndex(170);
            exptected = -1;
            expect(actual).toBe(exptected);
        });
    });

    describe('makeLineTypeCoordinateData()', function() {
        it('라인 타입 차트의 좌표기반 기본 data를 생성합니다.', function() {
            var actual = eventor.makeLineTypeCoordinateData(200, 3),
                expected = [
                    {
                        min: -50,
                        max: 50
                    },
                    {
                        min: 50,
                        max: 150
                    },
                    {
                        min: 150,
                        max: 250
                    }
                ];
            expect(actual).toEqual(expected);
        });
    });
});
