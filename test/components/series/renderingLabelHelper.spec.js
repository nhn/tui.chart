/**
 * @fileoverview Test for renderingLabelHelper.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var labelHelper = require('../../../src/js/components/series/renderingLabelHelper');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var snippet = require('tui-code-snippet');

describe('Test for renderingLabelHelper', function() {
    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_calculateLeftPositionForCenterAlign()', function() {
        it('label을 그래프의 중앙에 위치시키기 위한 left를 계산합니다.', function() {
            var bound = {
                left: 50,
                width: 40
            };
            var actual = labelHelper._calculateLeftPositionForCenterAlign(bound, 60);

            expect(actual).toBe(70);
        });
    });

    describe('_calculateTopPositionForMiddleAlign()', function() {
        it('label을 그래프의 중앙에 위치시키기 위한 top 계산합니다.', function() {
            var bound = {
                top: 50,
                height: 40
            };
            var actual = labelHelper._calculateTopPositionForMiddleAlign(bound, 60);

            expect(actual).toBe(70);
        });
    });

    describe('_makePositionForBoundType()', function() {
        it('bound type 차트의 position을 계산합니다.', function() {
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var actual = labelHelper._makePositionForBoundType(bound, 20, 'label');

            expect(actual.left).toBe(50);
            expect(actual.top).toBe(45);
        });
    });

    describe('_makePositionMap()', function() {
        it('range data가 아닐 경우에는 end로만 구성된 position 맵을 생성합니다.', function() {
            var seriesItem = {
                value: 10
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = snippet.bind(labelHelper._makePositionForBoundType, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 50,
                top: 45
            });
            expect(actual.start).toBeUndefined();
        });

        it('range data인 경우에는 start를 계산하여 position 맵에 추가합니다.', function() {
            var seriesItem = {
                value: 10,
                isRange: true
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = snippet.bind(labelHelper._makePositionForBarChart, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 75,
                top: 45
            });
            expect(actual.start).toEqual({
                left: -25,
                top: 45
            });
        });
    });
});
