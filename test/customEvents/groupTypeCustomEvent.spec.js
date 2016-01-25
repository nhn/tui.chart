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
        groupTypeCustomEvent = new GroupTypeCustomEvent({});
    });

    describe('_isOutPosition()', function() {

        beforeEach(function() {
            groupTypeCustomEvent.bound = {
                dimension: {
                    width: 300,
                    height: 200
                }
            };
        });

        it('layerX 값이 음수이면 true를 반환합니다.', function() {
            var actual = groupTypeCustomEvent._isOutPosition(-1, 0),
                expected = true;

            expect(actual).toBe(expected);
        });

        it('layerX 값이 dimension.width보다 크면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeCustomEvent.dimension = {
                width: 200
            };
            actual = groupTypeCustomEvent._isOutPosition(301, 0);
            expected = true;

            expect(actual).toBe(expected);
        });

        it('layerY 값이 음수이면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeCustomEvent.dimension = {
                width: 200
            };
            actual = groupTypeCustomEvent._isOutPosition(0, -1);
            expected = true;

            expect(actual).toBe(expected);
        });

        it('layerY 값이 dimension.height보다 크면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeCustomEvent.dimension = {
                width: 200,
                height: 100
            };
            actual = groupTypeCustomEvent._isOutPosition(0, 201);
            expected = true;

            expect(actual).toBe(expected);
        });
    });
});
