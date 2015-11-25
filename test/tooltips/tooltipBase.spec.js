/**
 * @fileoverview test tooltipBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('../../src/js/tooltips/tooltipBase'),
    dom = require('../../src/js/helpers/domHandler');

describe('TooltipBase', function() {
    var tooltip;

    beforeEach(function() {
        tooltip = new TooltipBase({
            options: {}
        });
    });

    describe('_getTooltipElement', function() {
        it('툴팁 엘리먼트를 얻습니다.', function() {
            var elLayout = dom.create('DIV'),
                actual;
            tooltip.elLayout = elLayout;
            actual = tooltip._getTooltipElement();
            expect(actual).toBeDefined();
            expect(actual.className).toBe('tui-chart-tooltip');
        });

        it('this.elTooltip이 존재하면 그대로 반환합니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual, expected;
            tooltip.elTooltip = elTooltip;
            actual = tooltip._getTooltipElement();
            expected = elTooltip;
            expect(actual).toBe(expected);
        });
    });

    describe('getTooltipDimension()', function() {
        it('렌더링된 툴팁의 너비, 높이 정보를 반환합니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual, expected;
            elTooltip.style.width = '100px';
            elTooltip.style.height = '100px';
            document.body.appendChild(elTooltip);
            actual = tooltip.getTooltipDimension(elTooltip);
            expected = {
                width: 100,
                height: 100
            };
            expect(actual).toEqual(expected);
        });
    });
});
