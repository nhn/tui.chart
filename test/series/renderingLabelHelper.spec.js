/**
 * @fileoverview Test for renderingLabelHelper.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var labelHelper = require('../../src/js/series/renderingLabelHelper');
var TreemapChartSeries = require('../../src/js/series/treemapChartSeries');
var SeriesDataModel = require('../../src/js/dataModels/seriesDataModelForTreemap');
var seriesTemplate = require('../../src/js/series/seriesTemplate');
var renderUtil = require('../../src/js/helpers/renderUtil');

describe('Test for renderingLabelHelper', function() {
    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_calculateLeftPositionForCenterAlign()', function() {
        it('label을 그래프의 중앙에 위치시키기 위한 left를 계산합니다.', function() {
            var bound = {
                left: 50,
                width: 40
            };
            var actual = labelHelper._calculateLeftPositionForCenterAlign(bound, 60);

            expect(actual).toBe(40);
        });
    });

    describe('_calculateTopPositionForMiddleAlign()', function() {
        it('label을 그래프의 중앙에 위치시키기 위한 top 계산합니다.', function() {
            var bound = {
                top: 50,
                height: 40
            };
            var actual = labelHelper._calculateTopPositionForMiddleAlign(bound, 60);

            expect(actual).toBe(41);
        });
    });

    describe('_makePositionForBoundType()', function() {
        it('bound type 차트의 position을 계산합니다.', function() {
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var actual = labelHelper._makePositionForBoundType(bound, 20, 'label');

            expect(actual.left).toBe(25);
            expect(actual.top).toBe(36);
        });
    });

    describe('_makePositionMap()', function() {
        it('range data가 아닐 경우에는 end로만 구성된 position 맵을 생성합니다.', function() {
            var seriesItem = {
                value: 10
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = tui.util.bind(labelHelper._makePositionForBoundType, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 25,
                top: 36
            });
            expect(actual.start).toBeUndefined();
        });

        it('range data인 경우에는 start를 계산하여 position 맵에 추가합니다.', function() {
            var seriesItem = {
                value: 10,
                isRange: true
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = tui.util.bind(labelHelper._makePositionForBarChart, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 75,
                top: 36
            });
            expect(actual.start).toEqual({
                left: -25,
                top: 36
            });
        });
    });

    describe('_makeLabelCssText()', function() {
        it('레이블 렌더링을 위한 cssText를 생성합니다.', function() {
            var position = {
                left: 10,
                top: 10
            };
            var theme = {
                fontFamily: 'Verdana',
                fontSize: 12
            };
            var actual = labelHelper._makeLabelCssText(position, theme);

            expect(actual).toBe('left:10px;top:10px;font-family:Verdana;font-size:12px');
        });

        it('선택된 index(selectedIndex)가 있으면서 전달된 index와 같지 않으면 opacity 속성을 추가합니다.', function() {
            var position = {
                left: 10,
                top: 10
            };
            var theme = {
                fontFamily: 'Verdana',
                fontSize: 12
            };
            var index = 0;
            var selectedIndex = 1;
            var actual;

            spyOn(renderUtil, 'makeOpacityCssText').and.returnValue(';opacity:0.3');

            actual = labelHelper._makeLabelCssText(position, theme, index, selectedIndex);

            expect(actual).toBe('left:10px;top:10px;font-family:Verdana;font-size:12px;opacity:0.3');
        });

        it('cssText template을 전달하면 해당 template으로 cssText를 생성합니다.', function() {
            var position = {
                left: 10,
                top: 10
            };
            var theme = {
                fontFamily: 'Verdana',
                fontSize: 12
            };
            var actual = labelHelper._makeLabelCssText(position, theme, null, null, seriesTemplate.tplCssTextForLineType);

            expect(actual).toBe('left:10%;top:10%;font-family:Verdana;font-size:12px');
        });
    });

    describe('makeSeriesLabelHtml()', function() {
        it('make html for series label', function() {
            var position = {
                left: 10,
                top: 10
            };
            var theme = {
                fontFamily: 'Verdana',
                fontSize: 12
            };
            var label = 'label';
            var index = 0;
            var selectedIndex = 1;
            var actual, expected;

            spyOn(renderUtil, 'makeOpacityCssText').and.returnValue(';opacity:0.3');

            actual = labelHelper.makeSeriesLabelHtml(position, label, theme, index, selectedIndex);
            expected = '<div class="tui-chart-series-label"' +
                        ' style="left:10px;top:10px;font-family:Verdana;font-size:12px;opacity:0.3">label</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('makeLabelsHtmlForTreemap', function() {
        it('make labels html for treemap, when make', function() {
            var boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
            var seriesDataModel = new SeriesDataModel([], 'treemap');
            var hoverSeriesItem = {
                id: 'id_0',
                depth: 1
            };
            var series = new TreemapChartSeries({
                boundsMaker: boundsMaker,
                chartType: 'treemap',
                theme: {
                    label: {
                        fontSize: 12,
                        fontFamily: 'Verdana'
                    }
                }
            });
            var makeCompareIndex, seriesItems, boundMap, actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 600,
                height: 400
            });
            seriesDataModel.rawSeriesData = [
                {
                    label: 'label1',
                    children: [
                        {
                            label: 'label1-1',
                            value: 6
                        }, {
                            label: 'label1-2',
                            children: [
                                {
                                    label: 'label1-2-1',
                                    children: [
                                        {
                                            label: 'label1-2-1-1',
                                            value: 2
                                        },
                                        {
                                            label: 'label1-2-1-2',
                                            value: 1
                                        }
                                    ]
                                },
                                {
                                    label: 'label3-2',
                                    value: 3
                                }
                            ]
                        }
                    ]
                },
                {
                    label: 'lable2',
                    value: 4
                }
            ];

            spyOn(series, '_getSeriesDataModel').and.returnValue(seriesDataModel);
            makeCompareIndex = tui.util.bind(series._makeCompareIndex, series, seriesDataModel, hoverSeriesItem);;
            seriesItems = seriesDataModel.findLeafSeriesItems(0);
            boundMap = series._getBoundMap();

            actual = labelHelper.makeLabelsHtmlForTreemap(seriesItems, boundMap, series.theme.label, makeCompareIndex);
            expected = '<div class="tui-chart-series-label"' +
                ' style="left:87.5px;top:191px;font-family:Verdana;font-size:12px">label1-1</div>' +
            '<div class="tui-chart-series-label"' +
                ' style="left:312.5px;top:291px;font-family:Verdana;font-size:12px">label3-2</div>' +
            '<div class="tui-chart-series-label"' +
                ' style="left:275px;top:91px;font-family:Verdana;font-size:12px">label1-2-1-1</div>' +
            '<div class="tui-chart-series-label"' +
                ' style="left:387.5px;top:91px;font-family:Verdana;font-size:12px">label1-2-1-2</div>';

            expect(actual).toBe(expected);

        });
    });
});
