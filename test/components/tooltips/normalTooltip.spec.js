/**
 * @fileoverview Test for NormalTooltip.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import normalTooltipFactory from '../../../src/js/components/tooltips/normalTooltip';
import DataProcessor from '../../../src/js/models/data/dataProcessor';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';

describe('NormalTooltip', () => {
    let tooltip, dataProcessor;

    beforeAll(() => {
        dataProcessor = new DataProcessor({}, '', {});
    });

    beforeEach(() => {
        tooltip = new normalTooltipFactory.NormalTooltip({
            chartType: 'column',
            dataProcessor,
            eventBus: new snippet.CustomEvents(),
            options: {}
        });
    });

    describe('_makeTooltipDatum()', () => {
        it('should make tooltip datum ratioLabel for data percentage and label for raw data value.', () => {
            let seriesItem;
            const legendLabels = {
                'pie': ['legend1']
            };

            tooltip = new normalTooltipFactory.NormalTooltip({
                chartType: 'pie',
                dataProcessor,
                eventBus: new snippet.CustomEvents(),
                options: {},
                labelFormatter: (seriesDatum, tooltipDatum) => {
                    tooltipDatum.label = seriesDatum.label;
                    tooltipDatum.ratioLabel = `:&nbsp;${(seriesItem.ratio * 100)}&nbsp;%&nbsp;`;

                    return tooltipDatum;
                }
            });

            seriesItem = {
                label: 'label1',
                ratio: 0.35,
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({})
            };

            const actual = tooltip._makeTooltipDatum(legendLabels.pie[0], '', seriesItem);
            const expected = 'label1';

            expect(actual.label).toBe(expected);
            expect(actual.ratioLabel).toBe(':&nbsp;35&nbsp;%&nbsp;');
        });

        it('should make labels without prefix, if only seriesItem.label exists and no legend.', () => {
            const legendLabels = {
                'column': []
            };
            const seriesItem = {
                label: 'label1',
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({})
            };

            const actual = tooltip._makeTooltipDatum(legendLabels.column[0], '', seriesItem);
            const expected = 'label1';

            expect(actual.label).toBe(expected);
        });

        it('should add label inside return value, if seriesItem.pickValueMapForTooltip() returns valueMap.', () => {
            const legendLabels = {
                'column': ['legend1']
            };
            const seriesItem = {
                label: 'label1',
                pickValueMapForTooltip: jasmine.createSpy('pickValueMapForTooltip').and.returnValue({
                    x: '10',
                    y: '20',
                    r: '30'
                })
            };

            const actual = tooltip._makeTooltipDatum(legendLabels.column[0], 'category1', seriesItem);
            const expected = {
                category: 'category1',
                legend: 'legend1',
                label: 'label1',
                x: '10',
                y: '20',
                r: '30'
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('makeTooltipData()', () => {
        it('should create data for tooltip rendering.', () => {
            const seriesDataModel = new SeriesDataModel();
            const pickValueMapForTooltip = jasmine.createSpy('pickValueMapForTooltip').and.returnValue({});

            spyOn(dataProcessor, 'makeTooltipCategory').and.returnValue('Silver');
            spyOn(dataProcessor, 'getLegendLabels').and.returnValue(['Density1', 'Density2']);
            seriesDataModel.groups = [
                new SeriesGroup([
                    {
                        label: '10',
                        pickValueMapForTooltip
                    }, {
                        label: '20',
                        pickValueMapForTooltip
                    }
                ])
            ];
            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: seriesDataModel
            };
            tooltip.chartType = 'column';
            tooltip.isVertical = true;

            const actual = tooltip.makeTooltipData();
            const expected = {
                column: [[
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ]]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSingleTooltipHtml()', () => {
        it('should create tooltip HTML.', () => {
            tooltip.data = {
                'column': [[
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ]]
            };
            tooltip.dataProcessor = {
                options: {series: {}}
            };
            tooltip.suffix = 'suffix';
            tooltip.colors = ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white'];
            tooltip.tooltipColors = {
                'column': ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white']
            };

            const actual = tooltip._makeSingleTooltipHtml('column', {
                groupIndex: 0,
                index: 1
            });

            const expected = '<div class="tui-chart-default-tooltip">' +
                '<div class="tui-chart-tooltip-head show">Silver</div>' +
                '<div class="tui-chart-tooltip-body"><span class="tui-chart-legend-rect column" style="background-color: blue"></span><span>Density2</span><span class="tui-chart-tooltip-value">20suffix</span></div>' +
                '</div>';
            expect(actual).toBe(expected);
        });

        it('should create tooltip HTML by custom template.', () => {
            tooltip.data = {
                'column': [[
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ]]
            };
            tooltip.dataProcessor = {
                options: {series: {}}
            };
            tooltip.suffix = 'suffix';
            tooltip.colors = ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white'];
            tooltip.tooltipColors = {
                'column': ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white']
            };
            tooltip.templateFunc = (category, series) => (
                `<div>${category}</div><div>${series.label}</div><div>${series.legend}</div>`
            );
            const actual = tooltip._makeSingleTooltipHtml('column', {
                groupIndex: 0,
                index: 1
            });
            const expected = '<div>Silver</div><div>20</div><div>Density2</div>';
            expect(actual).toBe(expected);
        });
    });

    describe('_findTooltipData()', () => {
        it('groupIndex that is equal to the length of the data in the radial chart, you should look for the groupIndex at position 0.', () => {
            tooltip.data = {
                'radial': [[
                    {category: 'Silver', label: '10', legend: 'Density1'},
                    {category: 'Silver', label: '20', legend: 'Density2'}
                ],
                [
                    {category: 'Silver', label: '30', legend: 'Density3'},
                    {category: 'Silver', label: '40', legend: 'Density4'}
                ]]
            };

            const actual = tooltip._findTooltipData('radial', {
                groupIndex: 2,
                index: 1
            });

            expect(actual).toEqual({category: 'Silver', label: '20', legend: 'Density2'});
        });
    });
});
