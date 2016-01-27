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
                },
                actualEventName, actualPosition;

            customEvent.fire.and.callFake(function(eventName, position) {
                actualEventName = eventName;
                actualPosition = position;
            });

            customEvent._onMousedown(eventObject);

            expect(actualEventName).toBe(expectedEventName);
            expect(actualPosition).toEqual(expectedPosition);
        });
    });

    describe('_onMouseup()', function() {
        it('isDrag가 true일 경우에 customEventContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries',
                actualEventName;

            customEvent.fire.and.callFake(function(eventName) {
                actualEventName = eventName;
            });

            customEvent.customEventContainer = dom.create('DIV', 'drag');
            customEvent.isDrag = true;
            customEvent._onMouseup();

            expect(actualEventName).toBe(expectedEventName);
            expect(customEvent.customEventContainer.className).toBe('');
        });

        it('isDrag가 false일 경우에 _onMouseEvent함수에 "click"문자열과 event object를 전달합니다.', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                expectedStr = 'click',
                expectedEventObject = eventObject,
                actualStr, actualEventObject;

            customEvent._onMouseEvent.and.callFake(function(str, _eventObject) {
                actualStr = str;
                actualEventObject = _eventObject;
            });
            customEvent.isDrag = false;
            customEvent._onMouseup(eventObject);

            expect(actualStr).toBe(expectedStr);
            expect(actualEventObject).toBe(expectedEventObject);
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
                },
                actualEventName, actualPosition;

            customEvent.fire.and.callFake(function(eventName, position) {
                actualEventName = eventName;
                actualPosition = position;
            });

            customEvent.isDown = true;
            customEvent.isDrag = true;
            customEvent._onMousemove(eventObject);

            expect(actualEventName).toBe(expectedEventName);
            expect(actualPosition).toEqual(expectedPosition);
        });

        it('isDown true이면서 isDrag가 false이면 추가적으로 container에 darg class를 추가합니다.', function() {
            var eventObject = {
                    clientX: 10,
                    clientY: 20
                },
                addedClassName;

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
                expectedEventObject = eventObject,
                actualStr, actualEventObject;

            customEvent._onMouseEvent.and.callFake(function(str, _eventObject) {
                actualStr = str;
                actualEventObject = _eventObject;
            });
            customEvent.isDown = false;
            customEvent._onMousemove(eventObject);

            expect(actualStr).toBe(expectedStr);
            expect(actualEventObject).toBe(expectedEventObject);
        });
    });

    describe('_onMouseup()', function() {
        it('isDrag가 true일 경우에 customEventContainer에 drag class를 제거하고 dragEndMapSeries 커스텀 이벤트를 발생시킵니다.', function() {
            var expectedEventName = 'dragEndMapSeries',
                actualEventName;

            customEvent.fire.and.callFake(function(eventName) {
                actualEventName = eventName;
            });

            customEvent.customEventContainer = dom.create('DIV', 'drag');
            customEvent.isDrag = true;
            customEvent._onMouseout();

            expect(actualEventName).toBe(expectedEventName);
            expect(customEvent.customEventContainer.className).toBe('');
        });
    });
});
