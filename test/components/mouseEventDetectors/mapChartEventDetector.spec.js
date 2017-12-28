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
        it('mousedown 이벤트 발생시에 dragStartMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
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
        it('isDrag가 true일 경우에 mouseEventDetectorContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries';

            mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
            mouseEventDetector.isDrag = true;
            mouseEventDetector._onMouseup();

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
            expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
        });

        it('isDrag가 false일 경우에 _onMouseEvent함수에 "click"문자열과 event object를 전달합니다.', function() {
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
        it('isDown true일 경우에 dragMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
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

        it('isDown true이면서 isDrag가 false이면 추가적으로 container에 darg class를 추가합니다.', function() {
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

        it('isDrag가 false일 경우에 _onMouseEvent함수에 "move"문자열과 event object를 전달합니다.', function() {
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
        it('isDrag가 true일 경우에 mouseEventDetectorContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries';

            mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
            mouseEventDetector.isDrag = true;
            mouseEventDetector._onMouseout();

            expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
            expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
        });
    });
});
