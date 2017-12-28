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
        it('render를 수행하면 _renderLegendArea를 실행한 렌더링, click 이벤트 등록 등을 수행한다.', function() {
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
                    position: {
                        top: 0,
                        left: 0
                    }
                }
            });

            expect(legend._renderLegendArea).toHaveBeenCalled();
            expect(legend._renderLegendArea).toHaveBeenCalled();
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
