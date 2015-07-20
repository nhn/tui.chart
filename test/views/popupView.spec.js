/**
 * @fileoverview test popup view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var PopupView = require('../../src/js/views/popupView.js'),
    PopupModel = require('../../src/js/models/popupModel.js');

describe('test Legend View', function() {

    it('test _makePopupsHtml', function() {
        var popupView = new PopupView(),
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
            html = popupView._makePopupsHtml(data, 'ne-chart-popup-'),
            compareHtml = '<div class="ne-chart-popup" id="ne-chart-popup-0-0">' +
                    '<div>Silver</div>' +
                    '<div><span>Density1</span>:<span>10</span></div>' +
                '</div>' +
                '<div class="ne-chart-popup" id="ne-chart-popup-1-0">' +
                    '<div>Silver</div>' +
                    '<div><span>Density2</span>:<span>20</span></div>' +
                '</div>';
        expect(html).toEqual(compareHtml);
    });
});