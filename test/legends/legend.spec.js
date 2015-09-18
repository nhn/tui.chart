/**
 * @fileoverview test legend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../../src/js/legends/legend.js');

describe('test Legend', function() {
    var legendLabels = [
            'legend1',
            'legend2'
        ],
        joinLegendLabels = [
            {
                label: 'legend1'
            },
            {
                label: 'legend2'
            }
        ],
        theme = {
            label: {
                fontSize: 12
            },
            colors: ['red', 'orange']
        },
        bound = {
            position: {
                top: 20,
                right: 10
            }
        },
        compareHtml = '<div class="ne-chart-legend">' +
            '<div class="ne-chart-legend-rect" style="background-color:red;margin-top:2px"></div>' +
            '<div class="ne-chart-legend-label" style="height:19px">legend1</div>' +
            '</div>' +
            '<div class="ne-chart-legend">' +
            '<div class="ne-chart-legend-rect" style="background-color:orange;margin-top:2px"></div>' +
            '<div class="ne-chart-legend-label" style="height:19px">legend2</div>' +
            '</div>',
        legend;

    beforeEach(function() {
        legend = new Legend({
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            theme: theme,
            bound: bound
        });
    });

    describe('render()', function() {
        it('legend 영역 렌더링', function () {
            var elLegend = legend.render(),
                elTemp = document.createElement('DIV'),
                tempChildren;

            elTemp.innerHTML = compareHtml;
            elTemp.style.top = '20px';
            elTemp.style.right = '10px';
            elTemp.style.fontSize = '12px';

            tempChildren = elTemp.childNodes;

            expect(elLegend.className).toEqual('ne-chart-legend-area');
            expect(elLegend.style.cssText).toEqual(elTemp.style.cssText);

            ne.util.forEachArray(elLegend.childNodes, function (child, index) {
                var elTempChild = tempChildren[index];
                expect(child.firstChild.cssText).toEqual(elTempChild.firstChild.cssText);
                expect(child.lastChild.cssText).toEqual(elTempChild.lastChild.cssText);
            });
        });
    });

    describe('_setThemeForLabels()', function() {
        it('레이블 렌더링을 위한 위한 테마 정보를 설정합니다.', function () {
            var result = legend._setThemeForLabels([
                {
                    label: 'label1'
                },
                {
                    label: 'label2'
                }
            ], {
                colors: ['black', 'white'],
                singleColors: ['red', 'orange'],
                borderColor: 'blue'
            });

            expect(result).toEqual([
                {
                    label: 'label1',
                    theme: {
                        color: 'black',
                        singleColor: 'red',
                        borderColor: 'blue'
                    }
                },
                {
                    label: 'label2',
                    theme: {
                        color: 'white',
                        singleColor: 'orange',
                        borderColor: 'blue'
                    }
                }
            ]);
        });
    });

    describe('renderLabelTheme()', function() {
        it('레이블 테마를 렌더링합니다.', function () {
            var el = document.createElement('DIV');
            legend._renderLabelTheme(el, {
                fontSize: 14,
                color: 'red'
            });
            expect(el.style.fontSize).toEqual('14px');
            expect(el.style.color).toEqual('red');
        });
    });
});
