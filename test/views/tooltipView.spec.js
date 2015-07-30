/**
 * @fileoverview test tooltip view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var TooltipView = require('../../src/js/views/tooltipView.js');

describe('test Legend View', function() {
    it('test _makeTooltipsHtml', function() {
        var tooltipView = new TooltipView({
                options: {}
            }),
            data = [
                {
                    label: 'Silver',
                    value: 10,
                    percentValue: 0.3,
                    legendLabel: 'Density1',
                    id: '0-0'
                },
                {
                    label: 'Silver',
                    value: 20,
                    percentValue: 0.6,
                    legendLabel: 'Density2',
                    id: '1-0'
                }
            ],
            resultHtml = tooltipView._makeTooltipsHtml(data, 'ne-chart-tooltip-'),
            compareHtml = '<div class="ne-chart-tooltip"><div class="ne-chart-default-tooltip">' +
                    '<div>Silver</div>' +
                    '<div><span>Density1</span>:&nbsp;' +
                    '<span>10</span><span></span></div>' +
                '</div></div>' +
                '<div class="ne-chart-tooltip"><div class="ne-chart-default-tooltip">' +
                    '<div>Silver</div>' +
                    '<div><span>Density2</span>:&nbsp;' +
                    '<span>20</span><span></span></div>' +
                '</div></div>',
            elTemp = document.createElement('DIV');

        elTemp.innerHTML = resultHtml;
        resultHtml = elTemp.innerHTML;

        elTemp.innerHTML = compareHtml;
        elTemp.childNodes[0].id = 'ne-chart-tooltip-0-0';
        elTemp.childNodes[1].id = 'ne-chart-tooltip-1-0';
        expect(resultHtml).toEqual(elTemp.innerHTML);
    });
});