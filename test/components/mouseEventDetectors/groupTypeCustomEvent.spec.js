/**
 * @fileoverview Test for GroupTypeEventDetector.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTypeEventDetector = require('../../../src/js/components/mouseEventDetectors/groupTypeEventDetector');

describe('Test for GroupTypeEventDetector', function() {
    var groupTypeEventDetector;

    beforeEach(function() {
        groupTypeEventDetector = new GroupTypeEventDetector({
            eventBus: new tui.util.CustomEvents()
        });
    });

    describe('_isOuterPosition()', function() {

        beforeEach(function() {
            groupTypeEventDetector.bound = {
                dimension: {
                    width: 300,
                    height: 200
                }
            };
        });

        it('layerX 값이 음수이면 true를 반환합니다.', function() {
            var actual = groupTypeEventDetector._isOuterPosition(-1, 0),
                expected = true;

            expect(actual).toBe(expected);
        });

        it('layerX 값이 dimension.width보다 크면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeEventDetector.dimension = {
                width: 200
            };
            actual = groupTypeEventDetector._isOuterPosition(301, 0);
            expected = true;

            expect(actual).toBe(expected);
        });

        it('layerY 값이 음수이면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeEventDetector.dimension = {
                width: 200
            };
            actual = groupTypeEventDetector._isOuterPosition(0, -1);
            expected = true;

            expect(actual).toBe(expected);
        });

        it('layerY 값이 dimension.height보다 크면 true를 반환합니다.', function() {
            var actual, expected;

            groupTypeEventDetector.dimension = {
                width: 200,
                height: 100
            };
            actual = groupTypeEventDetector._isOuterPosition(0, 201);
            expected = true;

            expect(actual).toBe(expected);
        });
    });
});
