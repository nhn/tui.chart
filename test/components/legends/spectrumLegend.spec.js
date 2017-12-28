/**
 * @fileoverview Test for SpectrumLegend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = require('raphael');
var snippet = require('tui-code-snippet');
var spectrumLegendFactory = require('../../../src/js/components/legends/spectrumLegend');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for SpectrumLegend', function() {
    var legend;

    beforeEach(function() {
        legend = new spectrumLegendFactory.SpectrumLegend({
            eventBus: new snippet.CustomEvents(),
            theme: {}
        });
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_renderTickArea()', function() {
        it('주어진 라벨 수 대로 tick을 렌더링 합니다.', function(done) {
            var paper = raphael(document.createElement('div'), 100, 100);
            var legendSet = paper.set();

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

            legend._renderTickArea(legendSet);

            setTimeout(function() {
                expect(legendSet.length).toBe(10);
                done();
            });
        });
    });
});
