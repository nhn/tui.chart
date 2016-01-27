/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LineTypeSeriesBase = require('../../src/js/series/lineTypeSeriesBase'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('LineTypeSeriesBase', function() {
    var series, makeSeriesLabelHtml, _getPercentValues, dataProcessor, boundsMaker;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
        makeSeriesLabelHtml = jasmine.createSpy('makeSeriesLabelHtml').and.returnValue('<div></div>');
        _getPercentValues = jasmine.createSpy('_getPercentValues').and.returnValue([]);
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFormattedGroupValues', 'getFirstFormattedValue']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        series = new LineTypeSeriesBase();
        series._makeSeriesLabelHtml = makeSeriesLabelHtml;
        series._getPercentValues = _getPercentValues;
        series.dataProcessor = dataProcessor;
        series.boundsMaker = boundsMaker;
    });

    describe('_makeBasicPositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function () {
            var actual;

            series._getPercentValues.and.returnValue([[0.25, 0.5, 0.4]]);
            series.data = {
                aligned: false
            };
            boundsMaker.getDimension.and.returnValue({
                width: 300,
                height: 200
            });
            actual = series._makeBasicPositions();
            expect(actual).toEqual([
                [
                    {
                        top: 160,
                        left: 60
                    },
                    {
                        top: 110,
                        left: 160
                    },
                    {
                        top: 130,
                        left: 260
                    }
                ]
            ]);
        });

        it('aligned 옵션이 true이면 tick라인에 맞춰 시작 left와 step이 변경됩니다.', function () {
            var actual;

            series._getPercentValues.and.returnValue([[0.25, 0.5, 0.4]]);
            series.data = {
                aligned: true
            };
            boundsMaker.getDimension.and.returnValue({
                width: 300,
                height: 200
            });
            actual = series._makeBasicPositions();

            expect(actual).toEqual([
                [
                    {
                        top: 160,
                        left: 10
                    },
                    {
                        top: 110,
                        left: 160
                    },
                    {
                        top: 130,
                        left: 310
                    }
                ]
            ]);
        });
    });

    describe('_makeLabelPositionTop()', function() {
        it('stacked인 영역 차트(startTop 존재)의 레이블 top 정보를 생성합니다.', function() {
            var actual, expected;

            series.options = {
                stacked: 'normal'
            };

            actual = series._makeLabelPositionTop({
                top: 10,
                startTop: 40
            }, 20, 16);
            expected = 18;

            expect(actual).toBe(expected);
        });

        it('stacked가 아니면서 value가 음수이며 영역차트(startTop이 존재)인 레이블 top 정보를 생성합니다.', function() {
            var actual, expected;

            series.options = {};

            actual = series._makeLabelPositionTop({
                top: 10,
                startTop: 40
            }, -30);
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('stacked가 아니면서 value가 양수인 라인타입 차트의 레이블 top 정보를 생성합니다.', function() {
            var actual, expected;

            series.options = {};

            actual = series._makeLabelPositionTop({
                top: 60,
                startTop: 40
            }, 30, 16);
            expected = 39;

            expect(actual).toBe(expected);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('라인차트에서 series label은 전달하는 formattedValues의 value숫자 만큼 렌더링 됩니다.', function() {
            var elLabelArea = dom.create('div');
            series.options = {
                showLabel: true
            };
            series.theme = {
                label: {}
            };

            dataProcessor.getFormattedGroupValues.and.returnValue([
                ['1.5'], ['2.2']
            ]);
            dataProcessor.getFirstFormattedValue.and.returnValue('1.5');
            series.seriesData = {
                groupPositions: [
                    [
                        {
                            top: 50,
                            left: 50
                        },
                        {
                            top: 70,
                            left: 150
                        }
                    ]
                ]
            };
            series._renderSeriesLabel(elLabelArea);

            expect(elLabelArea.childNodes.length).toBe(2);
        });
    });
});
