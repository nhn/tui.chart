/**
 * @fileoverview Test for SpectrumLegend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphael from 'raphael';
import snippet from 'tui-code-snippet';
import spectrumLegendFactory from '../../../src/js/components/legends/spectrumLegend';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for SpectrumLegend', () => {
    let legend;

    beforeEach(() => {
        legend = new spectrumLegendFactory.SpectrumLegend({
            eventBus: new snippet.CustomEvents(),
            theme: {
                label: {
                    fontSize: 11,
                    fontFamily: '',
                    color: '#ffffff',
                    fontWeight: 'normal'
                }
            }
        });
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_renderTickArea()', () => {
        it('should render tick with given labels', done => {
            const paper = raphael(document.createElement('div'), 100, 100);
            const legendSet = paper.set();

            legend.layout = {
                dimension: {
                    height: 200,
                    width: 100
                },
                position: {
                    left: 0,
                    top: 0
                }
            };
            legend.scaleData = {
                labels: [0, 50, 100, 150, 200],
                stepCount: 4
            };
            legend.paper = paper;
            legend.graphRenderer.theme = legend.theme.label;

            legend._renderTickArea(legendSet);

            setTimeout(() => {
                expect(legendSet.length).toBe(5);
                done();
            });
        });

        it('reverse option is true, labels must be in reverse order', () => {
            const paper = raphael(document.createElement('div'), 100, 100);
            const legendSet = paper.set();

            legend.layout = {
                dimension: {
                    height: 200,
                    width: 100
                },
                position: {
                    left: 0,
                    top: 0
                }
            };
            legend.scaleData = {
                labels: [0, 50, 100, 150, 200],
                stepCount: 4
            };
            legend.options.reversed = true;
            legend.paper = paper;
            legend.graphRenderer.theme = legend.theme.label;

            legend._renderTickArea(legendSet);

            expect(legend.scaleData.labels[0]).toBe(200);
        });
    });
    describe('_renderGraph()', () => {
        it('reverse option is true, color should look reversed', () => {
            const paper = raphael(document.createElement('div'), 100, 100);
            const legendSet = paper.set();
            const startColor = '#F4F4F4';
            const endColor = '#345391';

            legend.layout = {
                dimension: {
                    height: 200,
                    width: 100
                },
                position: {
                    left: 0,
                    top: 0
                }
            };
            legend.scaleData = {
                labels: [0, 50, 100, 150, 200],
                stepCount: 4
            };
            legend.options.reversed = true;
            legend.colorSpectrum = {
                start: startColor,
                end: endColor
            };
            legend.paper = paper;

            legend._renderGraph(legendSet);

            expect(legend.colorSpectrum.start).toBe(endColor);
            expect(legend.colorSpectrum.end).toBe(startColor);
        });
    });
});
