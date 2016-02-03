/**
 * @fileoverview Test for MapChartCustomEvent.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartCustomEvent = require('../../src/js/customEvents/mapChartCustomEvent'),
    dom = require('../../src/js/helpers/domHandler');

describe('MapChartCustomEvent', function() {
    var customEvent;

    beforeEach(function() {
        customEvent = new MapChartCustomEvent({});
        spyOn(customEvent, 'fire');
        spyOn(customEvent, '_onMouseEvent');
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

            customEvent._onMousedown(eventObject);

            expect(customEvent.fire).toHaveBeenCalledWith(expectedEventName, expectedPosition);
        });
    });

    describe('_onMouseup()', function() {
        it('isDrag가 true일 경우에 customEventContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries';

            customEvent.customEventContainer = dom.create('DIV', 'drag');
            customEvent.isDrag = true;
            customEvent._onMouseup();

            expect(customEvent.fire).toHaveBeenCalledWith(expectedEventName);
            expect(customEvent.customEventContainer.className).toBe('');
        });

        it('isDrag가 false일 경우에 _onMouseEvent함수에 "click"문자열과 event object를 전달합니다.', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedStr = 'click',
                expectedEventObject = eventObject;

            customEvent.isDrag = false;
            customEvent._onMouseup(eventObject);

            expect(customEvent._onMouseEvent).toHaveBeenCalledWith(expectedStr, expectedEventObject);
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

            customEvent.isDown = true;
            customEvent.isDrag = true;
            customEvent._onMousemove(eventObject);

            expect(customEvent.fire).toHaveBeenCalledWith(expectedEventName, expectedPosition);
        });

        it('isDown true이면서 isDrag가 false이면 추가적으로 container에 darg class를 추가합니다.', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                };

            customEvent.customEventContainer = dom.create('DIV');
            customEvent.isDown = true;
            customEvent.isDrag = false;
            customEvent._onMousemove(eventObject);

            expect(customEvent.customEventContainer.className).toBe('drag');
        });

        it('isDrag가 false일 경우에 _onMouseEvent함수에 "move"문자열과 event object를 전달합니다.', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedStr = 'move',
                expectedEventObject = eventObject;

            customEvent.isDown = false;
            customEvent._onMousemove(eventObject);

            expect(customEvent._onMouseEvent).toHaveBeenCalledWith(expectedStr, expectedEventObject);
        });
    });

    describe('_onMouseup()', function() {
        it('isDrag가 true일 경우에 customEventContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries';

            customEvent.customEventContainer = dom.create('DIV', 'drag');
            customEvent.isDrag = true;
            customEvent._onMouseout();

            expect(customEvent.fire).toHaveBeenCalledWith(expectedEventName);
            expect(customEvent.customEventContainer.className).toBe('');
        });
    });
});
