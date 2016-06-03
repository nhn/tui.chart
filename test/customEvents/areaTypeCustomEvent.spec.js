/**
 * @fileoverview Test for CustomEventBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeCustomEvent = require('../../src/js/customEvents/areaTypeCustomEvent');

describe('Test for AreaTypeCustomEvent', function() {
    var customEvent;

    beforeEach(function() {
        customEvent = new AreaTypeCustomEvent({});
    });

    describe('_calculateLayerPosition()', function() {
        it('clientX에 SERIES_EXPAND_SIZE와 container의 left정보를 감하여 layerX를 구합니다.', function() {
            var actual;

            spyOn(customEvent, '_getContainerBound').and.returnValue({
                left: 50,
                right: 450
            });

            actual = customEvent._calculateLayerPosition(150);

            expect(actual.x).toBe(90);
        });

        it('전달하는 clientX가 container의 bound.left 보다 작을 경우의 x는 0을 반환합니다.', function() {
            var actual;

            spyOn(customEvent, '_getContainerBound').and.returnValue({
                left: 50,
                right: 450
            });

            actual = customEvent._calculateLayerPosition(30);

            expect(actual.x).toBe(0);
        });

        it('전달하는 clientX가 container의 bound.right 보다 클 경우의 x를 구합니다.', function() {
            var actual;

            spyOn(customEvent, '_getContainerBound').and.returnValue({
                left: 50,
                right: 450
            });

            actual = customEvent._calculateLayerPosition(480);

            expect(actual.x).toBe(380);
        });

        it('clientY값이 있는 경우 y값을 계산하여 반환합니다.', function() {
            var actual;

            spyOn(customEvent, '_getContainerBound').and.returnValue({
                left: 50,
                right: 450,
                top: 50
            });

            actual = customEvent._calculateLayerPosition(150, 150);

            expect(actual.y).toBe(100);
        });

        it('clientY값이 없는 경우 y값은 반환하지 않습니다.', function() {
            var actual;

            spyOn(customEvent, '_getContainerBound').and.returnValue({
                left: 50,
                right: 450,
                top: 50
            });

            actual = customEvent._calculateLayerPosition(150);

            expect(actual.y).toBeUndefined();
        });
    });
});
