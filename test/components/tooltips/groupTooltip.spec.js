/**
 * @fileoverview Test for GroupTooltip.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var groupTooltipFactory = require('../../../src/js/components/tooltips/groupTooltip'),
    SeriesGroup = require('../../../src/js/models/data/seriesGroup'),
    defaultTheme = require('../../../src/js/themes/defaultTheme'),
    dom = require('../../../src/js/helpers/domHandler');

describe('GroupTooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getSeriesGroups', 'getCategory', 'getLegendData', 'getLegendItem', 'getCategoryCount', 'makeTooltipCategory']);
    });

    beforeEach(function() {
        tooltip = new groupTooltipFactory.GroupTooltip({
            dataProcessor: dataProcessor,
            eventBus: new snippet.CustomEvents(),
            options: {}
        });
    });

    describe('makeTooltipData()', function() {
        it('should make data for making group tooltip.', function() {
            var actual, expected;

            dataProcessor.getSeriesGroups.and.returnValue([
                new SeriesGroup([{
                    label: '10'
                }, {
                    label: '20'
                }]),
                new SeriesGroup([{
                    label: '30'
                }, {
                    label: '40'
                }])
            ]);

            dataProcessor.getCategoryCount.and.returnValue(2);
            dataProcessor.makeTooltipCategory.and.callFake(function(index) {
                var categories = [
                    'Silver',
                    'Gold'
                ];

                return categories[index];
            });

            actual = tooltip.makeTooltipData();
            expected = [
                {
                    category: 'Silver',
                    values: [{
                        type: 'data',
                        label: '10'
                    }, {
                        type: 'data',
                        label: '20'
                    }]
                },
                {
                    category: 'Gold',
                    values: [{
                        type: 'data',
                        label: '30'
                    }, {
                        type: 'data',
                        label: '40'
                    }]
                }
            ];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeColors()', function() {
        it('should set colors if there is preset color theme.', function() {
            var actual, expected;

            dataProcessor.getLegendData.and.returnValue([{
                chartType: 'column',
                label: 'legend1'
            }, {
                chartType: 'column',
                label: 'legend2'
            }]);

            actual = tooltip._makeColors({
                colors: ['red', 'blue']
            });
            expected = ['red', 'blue'];

            expect(actual).toEqual(expected);
        });

        it('should set colors to default series color, if there is no preset colors theme.', function() {
            var legendLabels = [{
                    chartType: 'column',
                    label: 'legend1'
                }, {
                    chartType: 'column',
                    label: 'legend2'
                }],
                actual = tooltip._makeColors(legendLabels, {}),
                expected = defaultTheme.series.colors.slice(0, 2);
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeItemRenderingData()', function() {
        it('should make series item model for series rendering.', function() {
            var actual, expected;

            dataProcessor.getLegendItem.and.callFake(function(index) {
                var legendData = [
                    {
                        chartType: 'column',
                        label: 'legend1'
                    },
                    {
                        chartType: 'line',
                        label: 'legend2'
                    }
                ];

                return legendData[index];
            });

            tooltip.suffix = 'suffix';

            actual = tooltip._makeItemRenderingData([{
                label: '20',
                type: 'data'
            }, {
                label: '30',
                type: 'data'
            }]);
            expected = [
                {
                    value: '20',
                    legend: 'legend1',
                    chartType: 'column',
                    suffix: 'suffix',
                    type: 'data'
                },
                {
                    value: '30',
                    legend: 'legend2',
                    chartType: 'line',
                    suffix: 'suffix',
                    type: 'data'
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeGroupTooltipHtml()', function() {
        beforeEach(function() {
            dataProcessor.getLegendItem.and.callFake(function(index) {
                var legendData = [
                    {
                        chartType: 'column',
                        label: 'legend1'
                    },
                    {
                        chartType: 'line',
                        label: 'legend2'
                    }
                ];

                return legendData[index];
            });
        });

        it('return empty string when series data is empty.', function() {
            tooltip.data = [];
            expect(tooltip._makeGroupTooltipHtml(1)).toBe('');
        });
        it('should make default tooltip HTML from data of specific index', function() {
            var actual, expected;
            tooltip.data = [
                {
                    category: 'Silver',
                    values: [{
                        label: '10',
                        type: 'data'
                    }]},
                {
                    category: 'Gold',
                    values: [{
                        label: '30',
                        type: 'data'
                    }]
                }
            ];
            tooltip.theme = {
                colors: ['red']
            };
            actual = tooltip._makeGroupTooltipHtml(1);
            expected = '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
                '<div>Gold</div>' +
                    '<div>' +
                        '<div class="tui-chart-legend-rect column" style="background-color:red"></div>' +
                        '&nbsp;<span>legend1</span>:&nbsp;<span>30</span><span></span>' +
                    '</div>' +
                '</div>';
            expect(actual).toBe(expected);
        });

        it('should make defualt group tooltip HTML from data.', function() {
            var actual, expected;

            tooltip.templateFunc = function(category, items) {
                var head = '<div>' + category + '</div>',
                    body = snippet.map(items, function(item) {
                        return '<div>' + item.legend + ': ' + item.value + '</div>';
                    }).join('');
                return head + body;
            };

            tooltip.data = [
                {
                    category: 'Silver',
                    values: [{
                        label: '10',
                        type: 'data'
                    }]
                },
                {
                    category: 'Gold',
                    values: [{
                        label: '30',
                        type: 'data'
                    }, {
                        label: '20',
                        type: 'data'
                    }]
                }
            ];
            tooltip.theme = {
                colors: ['red']
            };

            actual = tooltip._makeGroupTooltipHtml(1);
            expected = '<div>Gold</div>' +
                '<div>legend1: 30</div>' +
                '<div>legend2: 20</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_getTooltipSectorElement', function() {
        it('should make tooltip selector element.', function() {
            var tooltipContainer = dom.create('DIV'),
                actual;
            tooltip.tooltipContainer = tooltipContainer;
            actual = tooltip._getTooltipSectorElement();
            expect(actual).toBeDefined();
            expect(actual.className).toBe('tui-chart-group-tooltip-sector');
        });

        it('should return existing tooltip element, this.elTooltipSector.', function() {
            var groupTooltipSector = dom.create('DIV'),
                actual, expected;
            tooltip.groupTooltipSector = groupTooltipSector;
            actual = tooltip._getTooltipSectorElement();
            expected = groupTooltipSector;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeVerticalTooltipSectorBound()', function() {
        it('should make vertical tooltip sector bound of line type chart.', function() {
            var actual = tooltip._makeVerticalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, true),
                expected = {
                    dimension: {
                        width: 1,
                        height: 200
                    },
                    position: {
                        left: 0,
                        top: 10
                    }
                };
            expect(actual).toEqual(expected);
        });

        it('should make vertical tooltip sector bound of non-line type chart.', function() {
            var actual = tooltip._makeVerticalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, false),
                expected = {
                    dimension: {
                        width: 50,
                        height: 200
                    },
                    position: {
                        left: 0,
                        top: 10
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeHorizontalTooltipSectorBound()', function() {
        it('should make tooltip sector bound of horizontal chart.', function() {
            var actual = tooltip._makeHorizontalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, false),
                expected = {
                    dimension: {
                        width: 200,
                        height: 50
                    },
                    position: {
                        left: 10,
                        top: 0
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTooltipSectorBound()', function() {
        it('should call _makeVerticalTooltipSectorBound() if vertical chart.', function() {
            var size = 200,
                range = {
                    start: 0,
                    end: 5
                },
                isVertical = true,
                isLine = true,
                actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine),
                expected = tooltip._makeVerticalTooltipSectorBound(size, range, isLine);
            expect(actual).toEqual(expected);
        });

        it('should call _makeHorizontalTooltipSectorBound() if horizontal chart.', function() {
            var size = 200,
                range = {
                    start: 0,
                    end: 5
                },
                isVertical = false,
                isLine = true,
                actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine),
                expected = tooltip._makeHorizontalTooltipSectorBound(size, range, isLine);
            expect(actual).toEqual(expected);
        });
    });
});
