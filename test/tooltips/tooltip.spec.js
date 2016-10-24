/**
 * @fileoverview Test for Tooltip.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Tooltip = require('../../src/js/components/tooltips/tooltip'),
    DataProcessor = require('../../src/js/models/data/dataProcessor'),
    SeriesDataModel = require('../../src/js/models/data/seriesDataModel'),
    seriesGroup = require('../../src/js/models/data/seriesGroup');

describe('Tooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = new DataProcessor({}, '', {});
    });

    beforeEach(function() {
        tooltip = new Tooltip({
            dataProcessor: dataProcessor,
            eventBus: new tui.util.CustomEvents(),
            options: {}
        });
    });

    describe('_makeTooltipDatum()', function() {
        it('legend와 seriesItem.label이 모두 존재하면 ":&nbsp"가 앞에 붙은 label을 생성합니다.', function() {
            var actual, expected;
            var legendLabels = {
                'column': ['legend1']
            };
            var seriesItem = {
                label: 'label1',
                pickValueMap: jasmine.createSpy('pickValueMap').and.returnValue({})
            };

            actual = tooltip._makeTooltipDatum(legendLabels, '', 'column', seriesItem, 0);
            expected = ':&nbsp;label1';

            expect(actual.label).toBe(expected);
        });

        it('legend없이 seriesItem.label만 존재하면 prefix없는 label만 생성합니다.', function() {
            var actual, expected;
            var legendLabels = {
                'column': []
            };
            var seriesItem = {
                label: 'label1',
                pickValueMap: jasmine.createSpy('pickValueMap').and.returnValue({})
            };

            actual = tooltip._makeTooltipDatum(legendLabels, '', 'column', seriesItem, 0);
            expected = 'label1';

            expect(actual.label).toBe(expected);
        });

        it('seriesItem의 pickValueMap 함수가 valueMap을 반환하면, 결과값에 추가하여 반환합니다.', function() {
            var actual, expected;
            var legendLabels = {
                'column': ['legend1']
            };
            var seriesItem = {
                label: 'label1',
                pickValueMap: jasmine.createSpy('pickValueMap').and.returnValue({
                    x: 10,
                    y: 20,
                    r: 30
                })
            };

            actual = tooltip._makeTooltipDatum(legendLabels, 'category1', 'column', seriesItem, 0);
            expected = {
                category: 'category1',
                legend: 'legend1',
                label: ':&nbsp;label1',
                x: '10',
                y: '20',
                r: '30'
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTooltipData()', function() {
        it('툴팁 렌더링에 사용될 data를 생성합니다.', function() {
            var actual, expected;
            var seriesDataModel = new SeriesDataModel();
            var pickValueMap = jasmine.createSpy('pickValueMap').and.returnValue({});

            spyOn(dataProcessor, 'makeTooltipCategory').and.returnValue('Silver');
            spyOn(dataProcessor, 'getLegendLabels').and.returnValue(['Density1', 'Density2']);
            seriesDataModel.groups = [
                new seriesGroup([
                    {
                        label: '10',
                        pickValueMap: pickValueMap
                    }, {
                        label: '20',
                        pickValueMap: pickValueMap
                    }
                ])
            ];
            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: seriesDataModel
            };
            tooltip.chartType = 'column';
            tooltip.isVertical = true;

            actual = tooltip._makeTooltipData();
            expected = {
                column: [[
                    {category: 'Silver', label: ':&nbsp;10', legend: 'Density1'},
                    {category: 'Silver', label: ':&nbsp;20', legend: 'Density2'}
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
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ]]
            };
            tooltip.suffix = 'suffix';
            actual = tooltip._makeSingleTooltipHtml('column', {
                groupIndex: 0,
                index: 1
            });
            expected = '<div class="tui-chart-default-tooltip">' +
                '<div class="show">Silver</div>' +
                '<div><span>Density2</span><span>20</span><span>suffix</span></div>' +
                '</div>';
            expect(actual).toBe(expected);
        });

        it('템플릿 옵션으로 툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = {
                'column': [[
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ]]
            };
            tooltip.suffix = 'suffix';
            tooltip.templateFunc = function(category, series) {
                return '<div>' + category + '</div><div>' + series.label + '</div><div>' + series.legend + '</div>';
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
