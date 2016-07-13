/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LineTypeSeriesBase = require('../../src/js/series/lineTypeSeriesBase'),
    SeriesDataModel = require('../../src/js/dataModels/seriesDataModel'),
    SeriesGroup = require('../../src/js/dataModels/seriesGroup'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('LineTypeSeriesBase', function() {
    var series, makeSeriesLabelHtml, _getPercentValues, dataProcessor, boundsMaker;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
        makeSeriesLabelHtml = jasmine.createSpy('makeSeriesLabelHtml').and.returnValue('<div></div>');
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFirstItemLabel']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
        series = new LineTypeSeriesBase();
        series._makeSeriesLabelHtml = makeSeriesLabelHtml;
        series.dataProcessor = dataProcessor;
        series.boundsMaker = boundsMaker;
        series._getSeriesDataModel = jasmine.createSpy('_getSeriesDataModel');
    });

    describe('_makeBasicPositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25
                }, {
                    ratio: 0.5
                }, {
                    ratio: 0.4
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
            boundsMaker.getDimension.and.returnValue({
                width: 300,
                height: 200
            });
            series.data = {
                aligned: false
            };
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

        it('aligned 옵션이 true이면 tick라인에 맞춰 시작 left와 step이 변경됩니다.', function() {
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    ratio: 0.25
                }, {
                    ratio: 0.5
                }, {
                    ratio: 0.4
                }])
            ];
            spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
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

    describe('_calculateLabelPositionTop()', function() {
        it('stackType 옵션인 경우의 라벨 position top값을 계산합니다.', function() {
            var actual, expected;

            series.options = {
                stackType: 'normal'
            };

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 20, 16);
            expected = 18;

            expect(actual).toBe(expected);
        });

        it('stack 차트가 아니면서 value가 양수이며 시작값이 아닌 경우의 top값을 계산합니다. ', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 60,
                startTop: 40
            }, 30, 16);
            expected = 39;

            expect(actual).toBe(expected);
        });

        it('stack 차트가 아니면서 value가 음수이며 시작값인 경우의 top값을 계산합니다. ', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 60,
                startTop: 40
            }, -30, 16, true);
            expected = 39;

            expect(actual).toBe(expected);
        });

        it('stack 차트가 아니면서 value가 양수이며 시작값인 경우의 top값을 계산합니다. ', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 30, 16, true);
            expected = 15;

            expect(actual).toBe(expected);
        });

        it('stack 차트가 아니면서 value가 음수이며 시작값이 아닌 경우의 top값을 계산합니다. ', function() {
            var actual, expected;

            series.options = {};

            actual = series._calculateLabelPositionTop({
                top: 10,
                startTop: 40
            }, 30, 16, true);
            expected = 15;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeLabelPosition()', function() {
        it('라벨 너비와 basePostion.left를 이용하여 너비에 비하는 left값 비율을 계산합니다.', function() {
            var position, actual, expected;

            spyOn(series, '_calculateLabelPositionTop');
            series.theme = {};
            boundsMaker.getDimension.and.returnValue({
                width: 200
            });

            position = series._makeLabelPosition({
                left: 60
            });
            actual = position.left;
            expected = 17.5;

            expect(actual).toBe(expected);
        });

        it('라벨 너비와 _calculateLabelPositionTop()의 실행 결과를 영역 높이로 나누어 top을 설정합니다.', function() {
            var position, actual, expected;

            spyOn(series, '_calculateLabelPositionTop').and.returnValue(50);
            series.theme = {};
            boundsMaker.getDimension.and.returnValue({
                height: 200
            });

            position = series._makeLabelPosition({
                left: 60
            });
            actual = position.top;
            expected = 25;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeSeriesLabelHtmlForLineType()', function() {
        it('seriesData.gropuPositions에서 groupIndex와 index에 해당하는 position값을 basePosition으로 설정하고 label은 seriesItem.endLabel로 설정합니다.', function() {
            var groupIndex = 0,
                index = 0,
                seriesItem = {
                    value: 'value',
                    endLabel: 'endLabel'
                },
                labelHeight = 'labelHeight',
                isStart = false;

            series.seriesData = {
                groupPositions: [
                    [{
                        left: 10,
                        top: 20
                    }]
                ]
            };

            spyOn(series, '_makeLabelPosition');
            series._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight, isStart);

            expect(series._makeLabelPosition).toHaveBeenCalledWith({
                left: 10,
                top: 20
            }, 'labelHeight', 'endLabel', 'value', false);
        });

        it('시작값일 경우(isStart=true)에는 startTop을 top으로 변경하여 basePosition을 설정하고 label은 seriesItem.startLabel로 설정합니다.', function() {
            var groupIndex = 0,
                index = 0,
                seriesItem = {
                    value: 'value',
                    endLabel: 'endLabel',
                    startLabel: 'startLabel'
                },
                labelHeight = 'labelHeight',
                isStart = true;

            series.seriesData = {
                groupPositions: [
                    [{
                        left: 10,
                        top: 20,
                        startTop: 5
                    }]
                ]
            };

            spyOn(series, '_makeLabelPosition');
            series._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight, isStart);

            expect(series._makeLabelPosition).toHaveBeenCalledWith({
                left: 10,
                top: 5,
                startTop: 5
            }, 'labelHeight', 'startLabel', 'value', true);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('라인차트에서 series label은 seriesItem 숫자 만큼 렌더링 됩니다.', function() {
            var elLabelArea = dom.create('div');
            var seriesDataModel = new SeriesDataModel();

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            spyOn(seriesDataModel, 'getFirstItemLabel').and.returnValue('1.5');
            seriesDataModel.pivotGroups = [
                new SeriesGroup([{
                    label: '1.5'
                }, {
                    label: '2.2'
                }])
            ];
            series.options = {
                showLabel: true
            };
            series.theme = {
                label: {}
            };
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
            boundsMaker.getDimension.and.returnValue({
                width: 200,
                height: 200
            });

            series._renderSeriesLabel(elLabelArea);

            expect(elLabelArea.childNodes.length).toBe(2);
        });
    });

    describe('_animate()', function() {
        it('캐싱된 limit과 새로 생성된 yAxis의 limit의 min이 다르면 true를 반환합니다.', function() {

        });
    });
});
