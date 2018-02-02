/**
 * @fileoverview Test for NormalTooltip.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var normalTooltipFactory = require('../../../src/js/components/tooltips/normalTooltip'),
    DataProcessor = require('../../../src/js/models/data/dataProcessor'),
    SeriesDataModel = require('../../../src/js/models/data/seriesDataModel'),
    SeriesGroup = require('../../../src/js/models/data/seriesGroup');

describe('NormalTooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = new DataProcessor({}, '', {});
    });

    beforeEach(function() {
        tooltip = new normalTooltipFactory.NormalTooltip({
            chartType: 'column',
            dataProcessor: dataProcessor,
            eventBus: new snippet.CustomEvents(),
            options: {}
        });
    });

    describe('_makeTooltipDatum()', function() {
        it('should generate labels with ":&nbsp" prepended, if both legend and seriesItem.label exist.', function() {
            var actual, expected;
            var legendLabels = {
                'column': ['legend1']
            };
            var seriesItem = {
                label: 'label1',
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({})
            };

            actual = tooltip._makeTooltipDatum(legendLabels.column[0], '', seriesItem);
            expected = ':&nbsp;label1';

            expect(actual.label).toBe(expected);
        });

        it('should make tooltip datum ratioLabel for data percentage and label for raw data value.', function() {
            var actual, expected, seriesItem;
            var legendLabels = {
                'pie': ['legend1']
            };

            tooltip = new normalTooltipFactory.NormalTooltip({
                chartType: 'pie',
                dataProcessor: dataProcessor,
                eventBus: new snippet.CustomEvents(),
                options: {},
                labelFormatter: function(seriesDatum, tooltipDatum) {
                    tooltipDatum.label = seriesDatum.label;
                    tooltipDatum.ratioLabel = ':&nbsp;' + (seriesItem.ratio * 100) + '&nbsp;%&nbsp;';

                    return tooltipDatum;
                }
            });

            seriesItem = {
                label: 'label1',
                ratio: 0.35,
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({})
            };

            actual = tooltip._makeTooltipDatum(legendLabels.pie[0], '', seriesItem);
            expected = 'label1';

            expect(actual.label).toBe(expected);
            expect(actual.ratioLabel).toBe(':&nbsp;35&nbsp;%&nbsp;');
        });

        it('should make labels without prefix, if only seriesItem.label exists and no legend.', function() {
            var actual, expected;
            var legendLabels = {
                'column': []
            };
            var seriesItem = {
                label: 'label1',
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({})
            };

            actual = tooltip._makeTooltipDatum(legendLabels.column[0], '', seriesItem);
            expected = 'label1';

            expect(actual.label).toBe(expected);
        });

        it('should add label inside return value, if seriesItem.pickValueMapForTooltip() returns valueMap.', function() {
            var actual, expected;
            var legendLabels = {
                'column': ['legend1']
            };
            var seriesItem = {
                label: 'label1',
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({
                    x: '10',
                    y: '20',
                    r: '30'
                })
            };

            actual = tooltip._makeTooltipDatum(legendLabels.column[0], 'category1', seriesItem);
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

    describe('makeTooltipData()', function() {
        it('should create data for tooltip rendering.', function() {
            var actual, expected;
            var seriesDataModel = new SeriesDataModel();
            var pickValueMapForTooltip = jasmine.createSpy('pickValueMapForTooltip').and.returnValue({});

            spyOn(dataProcessor, 'makeTooltipCategory').and.returnValue('Silver');
            spyOn(dataProcessor, 'getLegendLabels').and.returnValue(['Density1', 'Density2']);
            seriesDataModel.groups = [
                new SeriesGroup([
                    {
                        label: '10',
                        pickValueMapForTooltip: pickValueMapForTooltip
                    }, {
                        label: '20',
                        pickValueMapForTooltip: pickValueMapForTooltip
                    }
                ])
            ];
            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: seriesDataModel
            };
            tooltip.chartType = 'column';
            tooltip.isVertical = true;

            actual = tooltip.makeTooltipData();
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
        it('should create tooltip HTML.', function() {
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

        it('should create tooltip HTML by custom template.', function() {
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
