/**
 * @fileoverview test legend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../../src/js/legends/legend'),
    chartConst = require('../../src/js/const'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('test Legend', function() {
    var legend, dataProcessor, boundsMaker;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getLegendLabels', 'getWholeLegendData']);
        dataProcessor.getLegendLabels.and.returnValue([
            'legend1',
            'legend2'
        ]);
        dataProcessor.getWholeLegendData.and.returnValue([
            {
                label: 'legend1'
            },
            {
                label: 'legend2'
            }
        ]);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getPosition']);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        legend = new Legend({
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            theme: {
                label: {
                    fontSize: 12
                },
                colors: ['red', 'orange']
            }
        });
    });

    describe('_makeLegendRectCssText()', function() {
        it('범례 앞쪽의 사각 영역에 대한 cssText를 생성합니다.', function() {
            var actual = legend._makeLegendRectCssText({
                    chartType: 'bar',
                    theme: {
                        borderColor: 'black',
                        color: 'red'
                    }
                }, 5),
                expected = 'background-color:red;border:1px solid black;margin-top:5px';
            expect(actual).toBe(expected);
        });

        it('iconType이 line인 경우에는 5px정도 margin-top 값을 더하여 적용합니다.', function() {
            var actual = legend._makeLegendRectCssText({
                    chartType: 'line',
                    theme: {
                        borderColor: 'black',
                        color: 'red'
                    }
                }, 5),
                expected = 'background-color:red;border:1px solid black;margin-top:10px';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeLegendHtml()', function() {
        it('렌더링 될 범례 html을 생성합니다.', function() {
            var actual, expected;
            spyOn(legend, '_makeLegendRectCssText').and.returnValue('');

            actual = legend._makeLegendHtml([
                {
                    label: 'legend1',
                    theme: {}
                },
                {
                    label: 'legend2'
                }
            ], []);

            expected = '<div class="tui-chart-legend" style="height:24px">' +
                '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="0" checked /></div>' +
                '<div class="tui-chart-legend-rect rect" style=""></div>' +
                '<div class="tui-chart-legend-label" style="height:20px" data-index="0">legend1</div>' +
                '</div>' +
                '<div class="tui-chart-legend" style="height:24px">' +
                '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="1" checked /></div>' +
                '<div class="tui-chart-legend-rect rect" style=""></div>' +
                '<div class="tui-chart-legend-label" style="height:20px" data-index="1">legend2</div>' +
            '</div>';

            expect(actual).toBe(expected);
        });

        it('checkedIndex 값이 존재하지 않으면 checked를 표시하지 않습니다.', function() {
            var actual, expected;
            spyOn(legend, '_makeLegendRectCssText').and.returnValue('');
            spyOn(legend.legendModel, 'isCheckedIndex').and.returnValue(false);

            actual = legend._makeLegendHtml([
                {
                    label: 'legend1',
                    theme: {}
                },
                {
                    label: 'legend2'
                }
            ], []);

            expected = '<div class="tui-chart-legend" style="height:24px">' +
                '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="0" /></div>' +
                '<div class="tui-chart-legend-rect rect" style=""></div>' +
                '<div class="tui-chart-legend-label" style="height:20px" data-index="0">legend1</div>' +
                '</div>' +
                '<div class="tui-chart-legend" style="height:24px">' +
                '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="1" /></div>' +
                '<div class="tui-chart-legend-rect rect" style=""></div>' +
                '<div class="tui-chart-legend-label" style="height:20px" data-index="1">legend2</div>' +
            '</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_renderLegendArea()', function() {
        it('legend 영역 렌더링', function () {
            var legendContainer = document.createElement('DIV'),
                expectedElement = document.createElement('DIV'),
                expectedChildren;

            boundsMaker.getPosition.and.returnValues({
                top: 20,
                left: 200
            });

            legend._renderLegendArea(legendContainer);

            expectedElement.innerHTML = '<div class="tui-chart-legend">' +
                '<div class="tui-chart-legend-rect" style="background-color:red;margin-top:2px"></div>' +
                '<div class="tui-chart-legend-label" style="height:19px">legend1</div>' +
            '</div>' +
                '<div class="tui-chart-legend">' +
                '<div class="tui-chart-legend-rect" style="background-color:orange;margin-top:2px"></div>' +
                '<div class="tui-chart-legend-label" style="height:19px">legend2</div>' +
            '</div>';
            expectedElement.style.top = '20px';
            expectedElement.style.left = '200px';
            expectedElement.style.fontSize = '12px';

            expectedChildren = expectedElement.childNodes;

            expect(legendContainer.style.cssText).toBe(expectedElement.style.cssText);

            tui.util.forEachArray(legendContainer.childNodes, function (child, index) {
                var tempChild = expectedChildren[index];
                expect(child.firstChild.cssText).toBe(tempChild.firstChild.cssText);
                expect(child.lastChild.cssText).toBe(tempChild.lastChild.cssText);
            });
        });
    });

    describe('render()', function() {
        it('render를 수행하면 legendContainer에 className 설정, _renderLegendArea를 실행한 렌더링, click 이벤트 등록 등을 수행한다.', function() {
            var actual, expected;

            boundsMaker.getPosition.and.returnValues({
                top: 20,
                right: 10
            });
            actual = legend.render();
            expected = document.createElement('DIV');
            legend._renderLegendArea(expected);

            expect(actual.className).toBe('tui-chart-legend-area');
            expect(actual.innerHTML).toBe(expected.innerHTML);
            expect(legend.legendContainer).toBe(actual);
        });
    });

    describe('_findLegendLabelElement()', function() {
        it('대상 엘리먼트가 범례(legend) label 엘리먼트이면 대상 엘리먼트를 반환합니다.', function() {
            var elTarget = dom.create('DIV', chartConst.CLASS_NAME_LEGEND_LABEL),
                actual = legend._findLegendLabelElement(elTarget),
                expected = elTarget;
            expect(actual).toBe(expected);
        });

        it('대상 엘리먼트의 부모가 범례(legend) label 엘리먼트이면 부모 엘리먼트를 반환합니다.', function() {
            var elParent = dom.create('DIV', chartConst.CLASS_NAME_LEGEND_LABEL),
                elTarget = dom.create('DIV'),
                actual, expected;

            dom.append(elParent, elTarget);

            actual = legend._findLegendLabelElement(elTarget);
            expected = elParent;
            expect(actual).toBe(expected);
        });

        it('대상 엘리먼트와 부모 모두 범례(legend) label 엘리먼트가 아니면 null을 반환합니다.', function() {
            var elParent = dom.create('DIV'),
                elTarget = dom.create('DIV'),
                actual;

            dom.append(elParent, elTarget);

            actual = legend._findLegendLabelElement(elTarget);
            expect(actual).toBeNull();
        });
    });

    describe('_fireLegendSelectionEvent()', function() {
        it('시리즈에 전달할 legend custom event를 발생시킵니다.', function() {
            var data = {
                        chartType: 'column',
                        seriesIndex: 0
                },
                called = false,
                args;

            spyOn(legend, 'fire').and.callFake(function() {
                called = true;
                args = arguments;
            });
            spyOn(legend.legendModel, 'getSelectedIndex').and.returnValue(0);

            legend._fireLegendSelectionEvent(data, true);
            expect(called).toBe(true);
            expect(args[0]).toBe('selectColumnLegend');
            expect(args[1]).toBe('column');
            expect(args[2]).toBe(0);
        });
    });

    describe('_fireUserEvent()', function() {
        it('selectLegend 사용자 이벤트를 발생시킵니다.', function() {
            var data = {
                    label: 'legend',
                    chartType: 'bar',
                    index: 1
                },
                called = false,
                args;

            legend.userEvent = {
                fire: jasmine.createSpy('fire').and.callFake(function () {
                    called = true;
                    args = arguments;
                })
            };

            legend._fireUserEvent(data);

            expect(called).toBe(true);
            expect(args[0]).toBe('selectLegend');
            expect(args[1].legend).toBe(data.label);
            expect(args[1].chartType).toBe(data.chartType);
            expect(args[1].index).toBe(data.index);
        });
    });

    describe('_getCheckedIndexes()', function() {
        it('체크가된 체크박스의 index정보를 모아서 반환합니다.', function() {
            var legendContainer = dom.create('DIV'),
                actual, expected;

            legendContainer.innerHTML = '<input type="checkbox" checked />' +
                '<input type="checkbox" />' +
                '<input type="checkbox" checked />';
            legend.legendContainer = legendContainer;

            actual = legend._getCheckedIndexes();
            expected = [0, 2];

            expect(actual).toEqual(expected);
        });
    });
});
