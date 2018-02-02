/**
 * @fileoverview test zoom
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Zoom = require('../../../src/js/components/series/zoom');
var snippet = require('tui-code-snippet');

describe('Zoom', function() {
    var zoom;

    beforeEach(function() {
        zoom = new Zoom({
            eventBus: new snippet.CustomEvents()
        });

        spyOn(zoom.eventBus, 'fire');
    });

    describe('_zoom()', function() {
        it('should send position to zoom event handler.', function() {
            var magn = 2,
                position = {
                    left: 10,
                    top: 20
                };

            zoom.magn = 2;
            zoom._zoom(magn, position);

            expect(zoom.magn).toBe(2);
            expect(zoom.eventBus.fire).toHaveBeenCalledWith('zoomMap', 2, {
                left: 10,
                top: 20
            });
        });

        it('should not zoom-out at 1 magnification.', function() {
            var magn = 0.5;

            zoom.magn = 1;
            zoom._zoom(magn);

            expect(zoom.magn).toBe(1);
        });
    });

    describe('_calculateMagn()', function() {
        it('return "magn += 0.1" when wheel data is positive number', function() {
            zoom.magn = 1;

            expect(zoom._calculateMagn(1)).toBe(1.1);
        });
        it('return "magn -= 0.1" when wheel data is negetive number', function() {
            zoom.magn = 2;

            expect(zoom._calculateMagn(-1)).toBe(1.9);
        });
    });

    describe('onWheel()', function() {
        it('should zoom using wheelDelta value made with mouse wheel movement', function() {
            var expectedMagn = 1.1;

            zoom.magn = 1;
            zoom.onWheel(120);

            expect(zoom.magn).toBe(expectedMagn);
        });
    });
});
