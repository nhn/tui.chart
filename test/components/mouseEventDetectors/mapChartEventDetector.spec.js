/**
 * @fileoverview Test for MapChartEventDetector.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var MapChartEventDetector = require('../../../src/js/components/mouseEventDetectors/mapChartEventDetector'),
    dom = require('../../../src/js/helpers/domHandler');

describe('Test for MapChartEventDetector', function() {
    var mouseEventDetector;

    beforeEach(function() {
        mouseEventDetector = new MapChartEventDetector({
            eventBus: new snippet.CustomEvents()
        });
        spyOn(mouseEventDetector.eventBus, 'fire');
        spyOn(mouseEventDetector, '_onMouseEvent');
    });

    describe('_onMouseDown()', function() {
        it('should trigger `dragStartMapSeries` custom event on mousedown event', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedEventName = 'dragStartMapSeries',
                expectedPosition = {
                    left: 10,
                    top: 20
                };

            mouseEventDetector._onMousedown(eventObject);

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName, expectedPosition);
        });
    });

    describe('_onMouseup()', function() {
        it('should reset drag state and trigger `dragEndMapSeries` custom event, on mouse up while dragging', function() {
            var expectedEventName = 'dragEndMapSeries';

            mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
            mouseEventDetector.isDrag = true;
            mouseEventDetector._onMouseup();

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
            expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
        });

        it('should think mouse up without dragging to click event, then pass click object to series', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedStr = 'click',
                expectedEventObject = eventObject;

            mouseEventDetector.isDrag = false;
            mouseEventDetector._onMouseup(eventObject);

            expect(mouseEventDetector._onMouseEvent).toHaveBeenCalledWith(expectedStr, expectedEventObject);
        });
    });

    describe('_onMousemove()', function() {
        it('should trigger `dragMapSeries` custom event, when after mousedown', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedEventName = 'dragMapSeries',
                expectedPosition = {
                    left: 10,
                    top: 20
                };

            mouseEventDetector.isDown = true;
            mouseEventDetector.isDrag = true;
            mouseEventDetector._onMousemove(eventObject);

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName, expectedPosition);
        });

        it('should set state of mouse event detector to dragging, when mousedown and not yet dragging', function() {
            var eventObject = {
                clientX: 10,
                clientY: 20
            };

            mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV');
            mouseEventDetector.isDown = true;
            mouseEventDetector.isDrag = false;
            mouseEventDetector._onMousemove(eventObject);

            expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('drag');
        });

        it('should think no drag event trigger, if mouse moved without isDrag frag, and then pass event target coordinate', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedStr = 'move',
                expectedEventObject = eventObject;

            mouseEventDetector.isDown = false;
            mouseEventDetector._onMousemove(eventObject);

            expect(mouseEventDetector._onMouseEvent).toHaveBeenCalledWith(expectedStr, expectedEventObject);
        });
    });

    describe('_onMouseup()', function() {
        it('should judge dragging is end and trigger `dragEndMapSeries` custom event, when mouse up after dragging', function() {
            var expectedEventName = 'dragEndMapSeries';

            mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
            mouseEventDetector.isDrag = true;
            mouseEventDetector._onMouseout();

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
            expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
        });
    });
});
