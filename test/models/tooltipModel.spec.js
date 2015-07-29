/**
 * @fileoverview test tooltip model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var TooltipModel = require('../../src/js/models/tooltipModel.js');

describe('test legend model', function() {
    var data = {
            labels: [
                'Silver',
                'Gold'
            ],
            values: [
                [10, 20],
                [30, 40]
            ],
            legendLabels: ['Density1', 'Density2']
        },
        compareData = [
            {
                label: 'Silver',
                value: 10,
                legendLabel: 'Density1',
                id: '0-0'
            },
            {
                label: 'Silver',
                value: 20,
                legendLabel: 'Density2',
                id: '0-1'
            },
            {
                label: 'Gold',
                value: 30,
                legendLabel: 'Density1',
                id: '1-0'
            },
            {
                label: 'Gold',
                value: 40,
                legendLabel: 'Density2',
                id: '1-1'
            }
        ];

    describe('test method', function() {
        it('setData', function() {
            var tooltipModel = new TooltipModel();

            tooltipModel._setData(data);

            expect(tooltipModel.data).toEqual(compareData);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var tooltipModel = new TooltipModel(data);

            expect(tooltipModel.data).toEqual(compareData);
        });
    });
});
