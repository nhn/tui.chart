/**
 * @fileoverview test zoom
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strick';

var Zoom = require('../../src/js/series/zoom');

describe('Zoom', function() {
    var zoom;

    beforeEach(function() {
        zoom = new Zoom({});
        spyOn(zoom, 'fire');
    });

    describe('_zoom()', function() {
        it('2배율 값을 넣으면 2배율로 확대됩니다.', function() {
            var expectedEventName = 'zoom',
                expectedMagn = 2;

            zoom.magn = 1;
            zoom._zoom(2);

            expect(zoom.magn).toBe(expectedMagn);
            expect(zoom.fire).toHaveBeenCalledWith(expectedEventName, expectedMagn);
        });

        it('0.5배율 값을 넣으면 0.5배율로 축소됩니다.', function() {
            var expectedEventName = 'zoom',
                expectedMagn = 1;

            zoom.magn = 2;
            zoom._zoom(0.5);

            expect(zoom.magn).toBe(expectedMagn);
            expect(zoom.fire).toHaveBeenCalledWith(expectedEventName, expectedMagn);
        });

        it('1배율에서 축소를 시도하면 변경되지 않습니다.', function() {
            var expectedMagn = 1;

            zoom.magn = 1;
            zoom._zoom(0.5);

            expect(zoom.magn).toBe(expectedMagn);
        });
    });

    describe('_calculateMagn()', function() {
        it('wheel의 기본 tick 값인 120을 전달하게 되면 2배율의 값을 반환합니다.', function() {
            var actual = zoom._calculateMagn(120),
                expected = 2;

            expect(actual).toBe(expected);
        });

        it('120 이상의 양수를 전달하면 2에 대해 120으로 나눈값에 제곱하여 반환합니다.', function() {
            var actual = zoom._calculateMagn(360),
                expected = 8;

            expect(actual).toBe(expected);
        });

        it('-120을 전달하면 0.5배율 값을 반환합니다.', function() {
            var actual = zoom._calculateMagn(-120),
                expected = 0.5;

            expect(actual).toBe(expected);
        });

        it('-120 이하의 음수를 전달하면 0.5에 대해 120으로 나눈값을 제곱하여 반환합니다.', function() {
            var actual = zoom._calculateMagn(-360),
                expected = 0.125;

            expect(actual).toBe(expected);
        });
    });

    describe('onWheel()', function() {
        it('마우스를 휠하여 발생한 wheelDelta값을 전달받아 zoom을 수행합니다.', function() {
            var expectedMagn = 2;

            zoom.magn = 1;
            zoom.onWheel(120);

            expect(zoom.magn).toBe(expectedMagn);
        });

        it('터치패드를 휠하여 발생되는 절대값 120보다 작은 wheelDelta에 대해서는 stackedWheelDelta에 누적시킵니다.', function() {
            var expectedStackedWheelDelta = 4;

            zoom.stackedWheelDelta = 0;
            zoom.onWheel(4);

            expect(zoom.stackedWheelDelta).toBe(expectedStackedWheelDelta);
        });

        it('누적된 stackedWheelDelta값이 절대값 120을 넘어가면 zoom을 수행하고 수행하고 남은 값을 stackedWheelDelta에 저장합니다', function() {
            var expectedMagn = 2,
                expectedStackedWheelDelta = 2;

            zoom.stackedWheelDelta = 118;
            zoom.magn = 1;
            zoom.onWheel(4);

            expect(zoom.magn).toBe(expectedMagn);
            expect(zoom.stackedWheelDelta).toBe(expectedStackedWheelDelta);
        });
    });
});
