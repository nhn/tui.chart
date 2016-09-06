/**
 * @fileoverview Test for zoomMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var zoomMixer = require('../../src/js/customEvents/zoomMixer');
var CustomEventBase = require('../../src/js/customEvents/customEventBase');
var chartConst = require('../../src/js/const');
var dom = require('../../src/js/helpers/domHandler');

describe('Test for zoomMixer', function() {
    beforeAll(function() {
        zoomMixer._getContainerBound = jasmine.createSpy('_getContainerBound');
        zoomMixer._calculateLayerPosition = CustomEventBase.prototype._calculateLayerPosition;
    });

    beforeEach(function() {
        zoomMixer.expandSize = 0;
    });

    describe('_showDragSelection()', function() {
        it('clinetX값을 전달하여 layerX를 구해 left와 width를 설정합니다.', function() {
            zoomMixer.dragSelectionElement = dom.create('DIV');
            zoomMixer.startLayerX = 100;
            zoomMixer._getContainerBound.and.returnValue({
                left: 50,
                right: 150
            });
            zoomMixer.expandSize = chartConst.SERIES_EXPAND_SIZE;

            zoomMixer._showDragSelection(50);

            expect(zoomMixer.dragSelectionElement.style.left).toBe('10px');
            expect(zoomMixer.dragSelectionElement.style.width).toBe('100px');
        });

        it('layerX가 startLayerX보다 클 경우에는 left값을 startLayerX로 설정합니다.', function() {
            zoomMixer.dragSelectionElement = dom.create('DIV');
            zoomMixer.startLayerX = 30;
            zoomMixer._getContainerBound.and.returnValue({
                left: 50,
                right: 150
            });

            zoomMixer._showDragSelection(130);

            expect(zoomMixer.dragSelectionElement.style.left).toBe('40px');
            expect(zoomMixer.dragSelectionElement.style.width).toBe('50px');
        });

        it('_showLayerSelection을 수행하면 dragSelectionElement에 show 스타일 클래스가 설정됩니다.', function() {
            zoomMixer.dragSelectionElement = dom.create('DIV');
            zoomMixer.startLayerX = 30;
            zoomMixer._getContainerBound.and.returnValue({
                left: 50,
                right: 150
            });

            zoomMixer._showDragSelection(130);

            expect(zoomMixer.dragSelectionElement.className).toBe('show');
        });
    });

    describe('_adjustIndexRange()', function() {
        it('startIndex와 endIndex값을 받아 index range 배열을 반환합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(2, 5);

            expect(actual).toEqual([2, 5]);
        });

        it('startIndex값이 endIndex값 보다 작을 경우 순서를 변경하여 index range 배열을 반환합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(8, 5);

            expect(actual).toEqual([5, 8]);
        });

        it('startIndex와 endIndex값 모두 0일 경우에 endIndex를 2로 변경합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(0, 0);

            expect(actual).toEqual([0, 2]);
        });

        it('startIndex와 endIndex값 모두 0이 아닌 경우에 startIndex는 1을 빼고 endIndex는 1을 더합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(2, 2);

            expect(actual).toEqual([1, 3]);
        });

        it('startIndex와 endIndex보다 1 작으면서 startIndex가 0일 경우에는 endIndex에 1을 더합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(0, 1);

            expect(actual).toEqual([0, 2]);
        });

        it('startIndex와 endIndex보다 1 작으면서 startIndex가 0이 아닌 경우에는 startIndex에 1을 뺍니다.', function() {
            var actual = zoomMixer._adjustIndexRange(5, 6);

            expect(actual).toEqual([4, 6]);
        });

        it('startIndex와 endIndex의 값의 차이가 1보다 크면 그대로 반환합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(5, 10);

            expect(actual).toEqual([5, 10]);
        });

        it('startIndex가 endIndex보다 크면서 값의 차이가 1보다 두 index의 위치를 바꿔 반환합니다.', function() {
            var actual = zoomMixer._adjustIndexRange(15, 10);

            expect(actual).toEqual([10, 15]);
        });
    });
});
