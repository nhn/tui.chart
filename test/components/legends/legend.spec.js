/**
 * @fileoverview Test for Legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = require('raphael');
var snippet = require('tui-code-snippet');
var legendFactory = require('../../../src/js/components/legends/legend'),
    chartConst = require('../../../src/js/const'),
    renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for Legend', function() {
    var legend, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getLegendLabels', 'getLegendData', 'findChartType']);
        dataProcessor.getLegendLabels.and.returnValue([
            'legend1',
            'legend2'
        ]);
        dataProcessor.getLegendData.and.returnValue([
            {
                label: 'legend1'
            },
            {
                label: 'legend2'
            }
        ]);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        legend = new legendFactory.Legend({
            dataProcessor: dataProcessor,
            theme: {
                label: {
                    fontSize: 12
                },
                column: {
                    colors: ['red', 'orange']
                }
            },
            chartType: 'column',
            eventBus: new snippet.CustomEvents(),
            options: {}
        });
        spyOn(legend.eventBus, 'fire');
    });

    describe('render()', function() {
        it('should call _renderLegendArea()', function() {
            spyOn(legend, '_renderLegendArea');
            spyOn(legend, '_listenEvents');
            legend.layout = {
                position: {
                    top: 20,
                    right: 10
                }
            };

            legend.render({
                paper: raphael(document.createElement('DIV'), 100, 100),
                layout: {
                    position: {top: 0, left: 0}
                }
            });

            expect(legend._renderLegendArea).toHaveBeenCalled();
        });
    });

    describe('_renderLegendArea()', function() {
        it('already calculated dimension width should be reflected.', function() {
            var paper = raphael(document.createElement('DIV'), 100, 100);
            legend.dataProcessor.options = {series: {}};
            legend.layout = {
                position: {
                    top: 20,
                    right: 10
                },
                dimension: {
                    width: 100, height: 100
                }
            };
            spyOn(legend.graphRenderer, 'render');

            legend._renderLegendArea(paper);

            expect(legend.graphRenderer.render.calls.argsFor(0)[0].dimension.width).toBe(100);
        });
    });

    describe('_fireSelectLegendEvent()', function() {
        it('fire selectLegend event', function() {
            var data = {
                chartType: 'column',
                seriesIndex: 0
            };

            spyOn(legend.legendModel, 'getSelectedIndex').and.returnValue(0);
            dataProcessor.findChartType.and.callFake(function(chartType) {
                return chartType;
            });

            legend._fireSelectLegendEvent(data, true);

            expect(legend.eventBus.fire).toHaveBeenCalledWith('selectLegend', 'column', 0);
        });
    });

    describe('_fireSelectLegendPublicEvent()', function() {
        it('fire select legend public event', function() {
            var data = {
                label: 'legend',
                chartType: 'bar',
                index: 1
            };

            legend._fireSelectLegendPublicEvent(data);

            expect(legend.eventBus.fire).toHaveBeenCalledWith(chartConst.PUBLIC_EVENT_PREFIX + 'selectLegend', {
                legend: 'legend',
                chartType: 'bar',
                index: 1
            });
        });
    });
});
