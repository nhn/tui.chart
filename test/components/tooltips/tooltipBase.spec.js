/**
 * @fileoverview Test for TooltipBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var TooltipBase = require('../../../src/js/components/tooltips/tooltipBase'),
    dom = require('../../../src/js/helpers/domHandler');

describe('TooltipBase', function() {
    var tooltip;

    beforeEach(function() {
        tooltip = new TooltipBase({
            eventBus: new snippet.CustomEvents(),
            options: {}
        });
    });

    describe('_getTooltipElement', function() {
        it('툴팁 엘리먼트를 얻습니다.', function() {
            var actual;
            actual = tooltip._getTooltipElement();
            expect(actual).toBeDefined();
            expect(actual.className).toBe('tui-chart-tooltip');
        });

        it('this.tooltipElement이 존재하면 그대로 반환합니다.', function() {
            var tooltipElement = dom.create('DIV'),
                actual, expected;
            tooltip.tooltipElement = tooltipElement;
            actual = tooltip._getTooltipElement();
            expected = tooltipElement;
            expect(actual).toBe(expected);
        });
    });

    describe('getTooltipDimension()', function() {
        it('렌더링된 툴팁의 너비, 높이 정보를 반환합니다.', function() {
            var tooltipElement = dom.create('DIV'),
                actual, expected;
            tooltipElement.style.width = '100px';
            tooltipElement.style.height = '100px';
            document.body.appendChild(tooltipElement);
            actual = tooltip.getTooltipDimension(tooltipElement);
            expected = {
                width: 100,
                height: 100
            };
            expect(actual).toEqual(expected);
        });
    });
});
