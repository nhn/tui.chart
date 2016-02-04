/**
 * @fileoverview Test for BarTypeSeriesBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarTypeSeriesBase = require('../../src/js/series/barTypeSeriesBase.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('BarTypeSeriesBase', function() {
    var series, dataProcessor, makeSeriesRenderingPosition, makeSeriesLabelHtml, makePlusSumLabelHtml, makeMinusSumLabelHtml;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormatFunctions', 'getFirstFormattedValue', 'getGroupValues', 'getFormattedValue']);

        dataProcessor.getFormatFunctions.and.returnValue([]);

        makeSeriesRenderingPosition = jasmine.createSpy('_makeSeriesRenderingPosition').and.returnValue({
            left: 0,
            top: 0
        });
        makeSeriesLabelHtml = jasmine.createSpy('makeSeriesLabelHtml').and.returnValue('<div></div>');
        makePlusSumLabelHtml = jasmine.createSpy('_makePlusSumLabelHtml').and.returnValue('<div></div>');
        makeMinusSumLabelHtml = jasmine.createSpy('_makeMinusSumLabelHtml').and.returnValue('<div></div>');
    });

    beforeEach(function() {
        series = new BarTypeSeriesBase();
        series.theme = {
            label: {
                fontFamily: 'Verdana',
                fontSize: 11
            }
        };
        series.dataProcessor = dataProcessor;
        series.makeSeriesRenderingPosition = makeSeriesRenderingPosition;
        series._makeSeriesLabelHtml = makeSeriesLabelHtml;
        series._makePlusSumLabelHtml = makePlusSumLabelHtml;
        series._makeMinusSumLabelHtml = makeMinusSumLabelHtml;
    });

    describe('_makeBarGutter()', function() {
        it('계산되는 bar의 사이즈(group bar 너비 / (itemCount + 1) / 2)가 2보다 작거나 같다면 bar gutter(bar와 bar 사이의 간격)은 0입니다.', function() {
            var actual = series._makeBarGutter(20, 5),
                expected = 0;
            expect(actual).toBe(expected);
        });

        it('계산되는 bar의 사이즈가 2보다 크고 6보다 작거나 같다면 bar gutter는 2입니다.', function() {
            var actual = series._makeBarGutter(60, 5),
                expected = 2;
            expect(actual).toBe(expected);
        });

        it('계산되는 bar의 사이즈가 6보다 크다면 bar gutter는 4입니다.', function() {
            var actual = series._makeBarGutter(100, 5),
                expected = 4;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeBarSize()', function() {
        it('bar size는 bar group size에서 간격정보를 빼고 아이템수 + 1로 나누어 계산됩니다.', function() {
            var actual = series._makeBarSize(100, 4, 5),
                expected = 14;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeOptionSize()', function() {
        it('optionBarWidth(옵션값,두번째인자)가 barSize(첫번째 인자)보다 작을 경우에는 옵션 값을 반환합니다.', function() {
            var actual = series._makeOptionSize(14, 10),
                expected = 10;
            expect(actual).toBe(expected);
        });

        it('optionBarWidth가 barSize보다 클 경우에는 barSize를 반환합니다.', function() {
            var actual = series._makeOptionSize(14, 20),
                expected = 14;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeAdditionPadding()', function() {
        it('시리즈 양쪽 사이드 영역의 추가적인 padding값을 구합니다. 옵션이 없을 경우에는 barSize(첫번째인자)을 반으로 나눈 값을 반환합니다.', function() {
            var actual = series._makeAdditionPadding(14),
                expected = 7;
            expect(actual).toBe(expected);
        });

        it('optionsSize(두번째인자) 값이 있으면서 barSize보다 작으면 barSize(첫번째인자)을 반으로 나눈 값에 barSize와의 차를 itemCount(세번째인자)로 곱하고 2로 나눈 값을 더하여 반환합니다.', function() {
            var actual = series._makeAdditionPadding(14, 10, 4),
                expected = 15;
            expect(actual).toBe(expected);
        });
    });

    describe('_renderNormalSeriesLabel()', function() {
        it('bar type(bar, column) 일반(normal) 차트의 series label을 전달하는 values의 수만큼 랜더링 합니다.', function() {
            var labelContainer = dom.create('div');

            dataProcessor.getFirstFormattedValue.and.returnValue('1.5');
            dataProcessor.getGroupValues.and.returnValue([[1.5, 2.2]]);
            dataProcessor.getFormattedValue.and.returnValue('1.5');
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };
            series._renderNormalSeriesLabel(labelContainer);

            expect(labelContainer.childNodes.length).toEqual(2);
        });
    });

    describe('_makeSumValues()', function() {
        it('[10, 20, 30] values의 합은 60입니다.', function() {
            var actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe(60);
        });

        it('두번째 인자에 포맷팅 함수 배열을 넘기면 합한 결과를 전달한 함수 배열들로 포맷팅 하여 반환합니다.', function() {
            var actual;

            dataProcessor.getFormatFunctions.and.returnValue([function(value) { return '00' + value; }]);

            actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe('0060');
        });
    });

    describe('_makeStackedLabelsHtml()', function() {
        it('bar type(bar, column) stacked 차트의 series label html을 전달하는 values의 수만큼 생성합니다.', function() {
            var container = dom.create('div'),
                html;
            series.options = {
                stacked: 'percent'
            };

            html = series._makeStackedLabelsHtml({
                values: [1.5, 2.2],
                formattedValues: ['1.5', '2.2'],
                bounds: [
                    {
                        end: {}
                    },
                    {
                        end: {}
                    }
                ],
                labelHeight: 10
            });
            container.innerHTML = html;
            expect(container.childNodes.length).toBe(2);
        });

        it('stacked옵션이 normal일 경우에는 series label html을 전달하는 values + 1(sum)만큼 생성합니다.', function() {
            var container = dom.create('div'),
                html;
            series.options = {
                stacked: 'normal'
            };

            html = series._makeStackedLabelsHtml({
                values: [1.5, 2.2],
                formattedValues: ['1.5', '2.2'],
                bounds: [
                    {
                        end: {}
                    },
                    {
                        end: {}
                    }
                ],
                labelHeight: 10
            });
            container.innerHTML = html;
            expect(container.childNodes.length).toBe(4);
        });
    });

    describe('_renderStackedSeriesLabel()', function() {
        it('bar type(bar, column) stacked=normal 차트의 series label을 전달하는 values의 수 + 1(sum)만큼 랜더링 합니다.', function() {
            var elLabelArea = dom.create('div');

            dataProcessor.getFirstFormattedValue.and.returnValue('1.5');
            dataProcessor.getGroupValues.and.returnValue([[1.5, 2.2]]);
            series.options = {
                stacked: 'normal'
            };
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };
            series._renderStackedSeriesLabel(elLabelArea);

            expect(elLabelArea.childNodes.length).toBe(4);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('stacked 옵션이 없으면 _renderNormalSeriesLabel()이 수행됩니다.', function () {
            var elLabelArea = dom.create('div'),
                elExpected = dom.create('div'),
                params;

            series.options = {};
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };
            params = {
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ]
            };
            series._renderSeriesLabel(params, elLabelArea);
            series._renderNormalSeriesLabel(params, elExpected);

            expect(elLabelArea.className).toEqual(elExpected.className);
            expect(elLabelArea.innerHTML).toEqual(elExpected.innerHTML);
        });

        it('stacked 옵션이 있으면 _renderStackedSeriesLabel()이 수행됩니다.', function () {
            var elLabelArea = dom.create('div'),
                elExpected = dom.create('div'),
                params;

            series.options = {
                stacked: 'normal'
            };
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };
            params = {
                formattedValues: [
                    ['-1.5', '-2.2']
                ],
                values: [
                    [-1.5, -2.2]
                ]
            };

            series._renderSeriesLabel(params, elLabelArea);
            series._renderStackedSeriesLabel(params, elExpected);

            expect(elLabelArea.className).toEqual(elExpected.className);
            expect(elLabelArea.innerHTML).toEqual(elExpected.innerHTML);
        });
    });
});
