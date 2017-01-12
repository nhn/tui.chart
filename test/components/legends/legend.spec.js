/**
 * @fileoverview Test for Legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../../../src/js/components/legends/legend'),
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
        legend = new Legend({
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
            eventBus: new tui.util.CustomEvents(),
            options: {}
        });
        spyOn(legend.eventBus, 'fire');
    });

    describe('render()', function() {
        it('render를 수행하면 legendContainer에 className 설정, _renderLegendArea를 실행한 렌더링, click 이벤트 등록 등을 수행한다.', function() {
            var actual, expected;

            legend.layout = {
                position: {
                    top: 20,
                    right: 10
                }
            };

            actual = legend.render();
            expected = document.createElement('DIV');
            legend._renderLegendArea(expected);

            expect(actual.className).toBe('tui-chart-legend-area');
            expect(legend.legendContainer).toBe(actual);
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

            expect(legend.eventBus.fire).toHaveBeenCalledWith('selectLegend', 'column', 0)
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
