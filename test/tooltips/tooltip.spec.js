/**
 * @fileoverview Test for Tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Tooltip = require('../../src/js/tooltips/tooltip');

describe('Tooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'getFormattedGroupValues', 'getLegendLabels', 'getValue']);
    });

    beforeEach(function() {
        tooltip = new Tooltip({
            dataProcessor: dataProcessor,
            options: {}
        });
    });

    describe('_makeTooltipData()', function() {
        it('툴팁 렌더링에 사용될 data를 생성합니다.', function () {
            var actual, expected;

            dataProcessor.getCategories.and.returnValue(['Silver', 'Gold']);
            dataProcessor.getFormattedGroupValues.and.returnValue([['10', '20']]);
            dataProcessor.getLegendLabels.and.returnValue(['Density1', 'Density2']);
            tooltip.chartType = 'column';
            actual = tooltip._makeTooltipData();
            expected = {
                column: [[
                    {category: 'Silver', value: '10', legend: 'Density1'},
                    {category: 'Silver', value: '20', legend: 'Density2'}
                ]]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSingleTooltipHtml()', function() {
        it('툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = {
                'column': [[
                    {category: 'Silver', value: 10, legend: 'Density1'},
                    {category: 'Silver', value: 20, legend: 'Density2'}
                ]]
            };
            tooltip.suffix = 'suffix';
            actual = tooltip._makeSingleTooltipHtml('column', {
                groupIndex: 0,
                index: 1
            });
            expected = '<div class="tui-chart-default-tooltip">' +
                '<div>Silver</div>' +
                '<div><span>Density2</span>:&nbsp;<span>20</span><span>suffix</span></div>' +
                '</div>';
            expect(actual).toBe(expected);
        });

        it('템플릿 옵션으로 툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = {
                'column': [[
                    {category: 'Silver', value: 10, legend: 'Density1'},
                    {category: 'Silver', value: 20, legend: 'Density2'}
                ]]
            };
            tooltip.suffix = 'suffix';
            tooltip.templateFunc = function(category, series) {
                return '<div>' + category + '</div><div>' + series.value + '</div><div>' + series.legend + '</div>';
            };
            actual = tooltip._makeSingleTooltipHtml('column', {
                groupIndex: 0,
                index: 1
            });
            expected = '<div>Silver</div><div>20</div><div>Density2</div>';
            expect(actual).toBe(expected);
        });
    });
});
