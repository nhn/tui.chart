/**
 * @fileoverview test legend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../../src/js/legends/legend'),
    chartConst = require('../../src/js/const'),
    dom = require('../../src/js/helpers/domHandler');

describe('test Legend', function() {
    var legend;

    beforeEach(function() {
        legend = new Legend({
            legendLabels: [
                'legend1',
                'legend2'
            ],
            joinLegendLabels: [
                {
                    label: 'legend1'
                },
                {
                    label: 'legend2'
                }
            ],
            theme: {
                label: {
                    fontSize: 12
                },
                colors: ['red', 'orange']
            }
        });
    });

    describe('render()', function() {
        it('legend 영역 렌더링', function () {
            var elLegend = legend.render({
                    position: {
                        top: 20,
                        right: 10
                    }
                }),
                elTemp = document.createElement('DIV'),
                tempChildren;

            elTemp.innerHTML = '<div class="tui-chart-legend">' +
                '<div class="tui-chart-legend-rect" style="background-color:red;margin-top:2px"></div>' +
                '<div class="tui-chart-legend-label" style="height:19px">legend1</div>' +
            '</div>' +
                '<div class="tui-chart-legend">' +
                '<div class="tui-chart-legend-rect" style="background-color:orange;margin-top:2px"></div>' +
                '<div class="tui-chart-legend-label" style="height:19px">legend2</div>' +
            '</div>';
            elTemp.style.top = '20px';
            elTemp.style.right = '10px';
            elTemp.style.fontSize = '12px';

            tempChildren = elTemp.childNodes;

            expect(elLegend.className).toBe('tui-chart-legend-area');
            expect(elLegend.style.cssText).toBe(elTemp.style.cssText);

            tui.util.forEachArray(elLegend.childNodes, function (child, index) {
                var elTempChild = tempChildren[index];
                expect(child.firstChild.cssText).toBe(elTempChild.firstChild.cssText);
                expect(child.lastChild.cssText).toBe(elTempChild.lastChild.cssText);
            });
        });
    });

    describe('_setThemeForLabels()', function() {
        it('레이블 렌더링을 위한 위한 테마 정보를 설정합니다.', function () {
            var actual = legend._setThemeForLabels(
                    [
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
                    }
                ),
                expected = [
                    {
                        label: 'label1',
                        theme: {
                            color: 'black',
                            singleColor: 'red',
                            borderColor: 'blue'
                        },
                        index: 0
                    },
                    {
                        label: 'label2',
                        theme: {
                            color: 'white',
                            singleColor: 'orange',
                            borderColor: 'blue'
                        },
                        index: 1
                    }
                ];

            expect(actual).toEqual(expected);
        });
    });

    describe('renderLabelTheme()', function() {
        it('레이블 테마를 렌더링합니다.', function () {
            var el = document.createElement('DIV');
            legend._renderLabelTheme(el, {
                fontSize: 14,
                color: 'red'
            });
            expect(el.style.fontSize).toBe('14px');
            expect(el.style.color).toBe('red');
        });
    });

    describe('_findLegendElement()', function() {
        it('대상 엘리먼트가 범례(legend) 엘리먼트이면 대상 엘리먼트를 반환합니다.', function() {
            var elTarget = dom.create('DIV', chartConst.CLASS_NAME_LEGEND),
                actual = legend._findLegendElement(elTarget),
                expected = elTarget;
            expect(actual).toBe(expected);
        });

        it('대상 엘리먼트의 부모가 범례(legend) 엘리먼트이면 부모 엘리먼트를 반환합니다.', function() {
            var elParent = dom.create('DIV', chartConst.CLASS_NAME_LEGEND),
                elTarget = dom.create('DIV'),
                actual, expected;

            dom.append(elParent, elTarget);

            actual = legend._findLegendElement(elTarget);
            expected = elParent;
            expect(actual).toBe(expected);
        });

        it('대상 엘리먼트와 부모 모두 범례(legend) 엘리먼트가 아니면 null을 반환합니다.', function() {
            var elParent = dom.create('DIV'),
                elTarget = dom.create('DIV'),
                actual;

            dom.append(elParent, elTarget);

            actual = legend._findLegendElement(elTarget);
            expect(actual).toBeNull();
        });
    });
});
