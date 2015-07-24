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
        var popupView = new PopupView({
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
            resultHtml = popupView._makePopupsHtml(data, 'ne-chart-popup-'),
            compareHtml = '<div class="ne-chart-popup">' +
                    '<div>Silver</div>' +
                    '<div><span>Density1</span>:&nbsp;<span>10</span></div>' +
                '</div>' +
                '<div class="ne-chart-popup">' +
                    '<div>Silver</div>' +
                    '<div><span>Density2</span>:&nbsp;' +
                '<span>20</span></div>' +
                '</div>',
            elTemp = document.createElement('DIV');

        elTemp.innerHTML = resultHtml;
        resultHtml = elTemp.innerHTML;

        elTemp.innerHTML = compareHtml;
        elTemp.childNodes[0].id = 'ne-chart-popup-0-0';
        elTemp.childNodes[1].id = 'ne-chart-popup-1-0';

        expect(resultHtml).toEqual(elTemp.innerHTML);
    });
});