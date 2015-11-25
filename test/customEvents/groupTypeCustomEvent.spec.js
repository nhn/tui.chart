/**
 * @fileoverview Test for GroupTypeCustomEvent.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTypeCustomEvent = require('../../src/js/customEvents/groupTypeCustomEvent');

describe('GroupTypeCustomEvent', function() {
    var groupTypeCustomEvent;

    beforeEach(function() {
        groupTypeCustomEvent = new GroupTypeCustomEvent({
            bound: {
                dimension: {
                    width: 300,
                    height: 300
                }
            }
        });
        groupTypeCustomEvent.tickBaseDataModel = {
            getLength : jasmine.createSpy('getLength').and.returnValue(5)
        };
    });

    describe('_getLayerPositionValue()', function() {
        it('세로차트에서 마우스 이벤트 지점의 index를 찾기위한 상대 좌표는 clientX와 bound.left의 차입니다.', function() {
            var actual = groupTypeCustomEvent._getLayerPositionValue({
                    clientX: 100
                }, {
                    left: 50
                }, true),
                expected = 40;
            expect(actual).toBe(expected);
        });

        it('가로차트에서 마우스 이벤트 지점의 index를 찾기위한 상대 좌표는 clientY와 bound.top의 차입니다', function() {
            var actual = groupTypeCustomEvent._getLayerPositionValue({
                    clientY: 100
                }, {
                    top: 50
                }),
                expected = 50;
            expect(actual).toBe(expected);
        });
    });
});
