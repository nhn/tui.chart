/**
 * @fileoverview Test for axisDataMaker
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var maker = require('../../../src/js/models/scaleData/axisDataMaker');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var geometric = require('../../../src/js/helpers/geometric');

describe('Test for axisDataMaker', function() {
    describe('_makeLabelsByIntervalOption()', function() {
        it('labelInterval option 위치에 해당하는 label을 제외하고 모두 EMPTY_AXIS_LABEL로 대체합니다.', function() {
            var actual = maker._makeLabelsByIntervalOption(['label1', 'label2', 'label3', 'label4', 'label5'], 2, 0);
            var expected = ['label1', chartConst.EMPTY_AXIS_LABEL, 'label3', chartConst.EMPTY_AXIS_LABEL, 'label5'];

            expect(actual).toEqual(expected);
        });

        it('추가된 data가 있으면 추가된 data를 interval로 나눈 나머지 만큼을 건너 띄고 label을 생성합니다.', function() {
            var actual = maker._makeLabelsByIntervalOption(['label1', 'label2', 'label3', 'label4', 'label5'], 2, 1);
            var expected = [chartConst.EMPTY_AXIS_LABEL, 'label2', chartConst.EMPTY_AXIS_LABEL, 'label4', chartConst.EMPTY_AXIS_LABEL];

            expect(actual).toEqual(expected);
        });
    });

    describe('makeLabelAxisData()', function() {
        it('make axis data for label type', function() {
            var actual = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3']
            });
            expect(actual).toEqual({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                validTickCount: 0,
                options: {},
                isLabelAxis: true,
                isVertical: false,
                isPositionRight: false,
                aligned: false
            });
        });

        it('if has labelInterval option, returns filtered label by labelInterval option', function() {
            var actual = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3', 'label4', 'label5'],
                options: {
                    labelInterval: 2
                }
            });

            expect(actual.labels).toEqual(['label1', '', 'label3', '', 'label5']);
        });

        it('if has aligned option, tickCount is label length', function() {
            var actual = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3'],
                aligned: true
            });
            expect(actual.tickCount).toBe(3);
        });

        it('if axis type is datetime, returns formatted label by dateFormat', function() {
            var actual;

            actual = maker.makeLabelAxisData({
                labels: ['01/01/2016', '02/01/2016', '03/01/2016'],
                options: {
                    type: chartConst.AXIS_TYPE_DATETIME,
                    dateFormat: 'YYYY.MM'
                }
            });

            expect(actual.labels).toEqual(['2016.01', '2016.02', '2016.03']);
        });
    });

    describe('makeAdditionalDataForCoordinateLineType()', function() {
        it('make additional axis data for coordinate line type chart', function() {
            var labels = [5, 10, 15, 20, 25, 30, 35];
            var values = [8, 20, 33, 23, 15];
            var limit = {
                min: 5,
                max: 35
            };
            var step = 5;
            var tickCount = 7;
            var actual = maker.makeAdditionalDataForCoordinateLineType(labels, values, limit, step, tickCount);
            var expected = {
                labels: [10, 15, 20, 25, 30],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 10,
                    max: 30
                },
                dataMin: 8,
                distance: 25,
                positionRatio: 0.08,
                sizeRatio: 0.8
            };

            expect(actual).toEqual(expected);
        });

        it('make additional axis data, when included minus value', function() {
            var labels = [-5, 0, 5, 10, 15, 20, 25];
            var values = [-2, 20, 5, 23, 15];
            var limit = {
                min: -5,
                max: 25
            };
            var step = 5;
            var tickCount = 7;
            var actual = maker.makeAdditionalDataForCoordinateLineType(labels, values, limit, step, tickCount);
            var expected = {
                labels: [0, 5, 10, 15, 20],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 0,
                    max: 20
                },
                dataMin: -2,
                distance: 25,
                positionRatio: 0.08,
                sizeRatio: 0.8
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('makeValueAxisData()', function() {
        it('make data for value type axis.', function() {
            var actual = maker.makeValueAxisData({
                labels: [0, 25, 50, 75, 100],
                tickCount: 5,
                limit: {
                    min: 0,
                    max: 100
                },
                step: 25,
                options: 'options',
                isVertical: true,
                isPositionRight: true,
                aligned: true
            });
            var expected = {
                labels: [0, 25, 50, 75, 100],
                tickCount: 5,
                validTickCount: 5,
                limit: {
                    min: 0,
                    max: 100
                },
                dataMin: 0,
                distance: 100,
                step: 25,
                options: 'options',
                isVertical: true,
                isPositionRight: true,
                aligned: true
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAdjustingIntervalInfo()', function() {
        it('이전 블럭수와 영역 너비 새로운 block너비 정보를 계산하여 조정된 interval 정보를 반환합니다.', function() {
            var actual = maker._makeAdjustingIntervalInfo(30, 300, 50);

            expect(actual.blockCount).toBe(6);
            expect(actual.beforeRemainBlockCount).toBe(0);
            expect(actual.interval).toBe(5);
        });

        it('새로 계산된 block수가 이전 블럭수보다 많을 경우 null을 반환합니다.', function() {
            var actual = maker._makeAdjustingIntervalInfo(4, 300, 50);

            expect(actual).toBeNull();
        });

        it('interval이 1인 경우 null을 반환합니다.', function() {
            var actual = maker._makeAdjustingIntervalInfo(7, 300, 50);

            expect(actual).toBeNull();
        });

        it('남은 이전 block가 계산된 interval 수보다 크다면 새로 계산된 block count를 늘려줍니다.', function() {
            var actual = maker._makeAdjustingIntervalInfo(15, 300, 50);

            expect(actual.blockCount).toBe(7);
            expect(actual.beforeRemainBlockCount).toBe(1);
            expect(actual.interval).toBe(2);
        });
    });

    describe('_makeCandidatesForAdjustingInterval()', function() {
        it('block의 한칸이 90 ~ 120px(90, 95, 100, 105, 110, 115, 120)인 범위에서 tick interval 후보를 생성합니다.', function() {
            var actual = maker._makeCandidatesForAdjustingInterval(15, 300);

            expect(actual.length).toBe(7);
        });

        it('후보 모두가 null이라면 빈 배열을 반환합니다.', function() {
            var actual;

            spyOn(maker, '_makeAdjustingIntervalInfo').and.returnValue(null);
            actual = maker._makeCandidatesForAdjustingInterval(15, 300);

            expect(actual.length).toBe(0);
        });
    });

    describe('_calculateAdjustingIntervalInfo()', function() {
        it('현재의 블럭 수(tick개수 - 1)와 시리즈 영역의 너비 정보를 이용하여 interval과 블럭 정보 계산하고 그 결과를 반환합니다.', function() {
            var actual = maker._calculateAdjustingIntervalInfo(73, 400);

            expect(actual.blockCount).toBe(3);
            expect(actual.beforeRemainBlockCount).toBe(1);
            expect(actual.interval).toBe(24);
        });

        it('후보가 없다면 null을 반환합니다.', function() {
            var actual;

            spyOn(maker, '_makeCandidatesForAdjustingInterval').and.returnValue([]);
            actual = maker._calculateAdjustingIntervalInfo(73, 400);

            expect(actual).toBeNull();
        });
    });

    describe('_makeFilteredLabelsByInterval()', function() {
        it('inteval에 해당하는 label만 걸러냅니다.', function() {
            var actual = maker._makeFilteredLabelsByInterval(['label1', 'label2', 'label3', 'label4'], 0, 2);

            expect(actual).toEqual(['label1', 'label3']);
        });

        it('startIndex 지점부터 inteval에 해당하는 label만 걸러냅니다.', function() {
            var actual = maker._makeFilteredLabelsByInterval(['label1', 'label2', 'label3', 'label4'], 1, 2);

            expect(actual).toEqual(['label2', 'label4']);
        });
    });

    describe('updateLabelAxisDataForAutoTickInterval()', function() {
        it('보기좋은 tick inertval을 계산하여 axisData 정보의 tick interval관련 부분을 추가 갱신 합니다.', function() {
            var axisData = {
                tickCount: 20,
                labels: snippet.range(10, 201, 10)
            };
            maker.updateLabelAxisDataForAutoTickInterval(axisData, 400, 0);

            expect(axisData.tickCount).toBe(4);
            expect(axisData.eventTickCount).toBe(20);
            expect(axisData.labels).toEqual([20, 80, 140, 200]);
            expect(axisData.startIndex).toBe(1);
            expect(axisData.positionRatio).toBe(0.05263157894736842);
            expect(axisData.sizeRatio).toBe(0.9473684210526316);
            expect(axisData.interval).toBe(6);
        });
    });

    describe('updateLabelAxisDataForStackingDynamicData()', function() {
        it('이전에 갱신된 prevUpdatedData 정보와 새로 생성된 axisData를 이용하여 axisData의 tick interval관련 부분을 갱신합니다.', function() {
            var axisData = {
                tickCount: 21,
                labels: snippet.range(10, 211, 10)
            };
            var prevUpdatedData = {
                interval: 6,
                startIndex: 1
            };

            maker.updateLabelAxisDataForStackingDynamicData(axisData, prevUpdatedData, 4);

            expect(axisData.tickCount).toBe(4);
            expect(axisData.eventTickCount).toBe(21);
            expect(axisData.labels).toEqual([20, 80, 140, 200]);
            expect(axisData.startIndex).toBe(1);
            expect(axisData.positionRatio).toBe(0.05);
            expect(axisData.sizeRatio).toBe(0.9);
            expect(axisData.interval).toBe(6);
        });
    });

    describe('_createMultilineLabel()', function() {
        it('create multiline labels, when label width shorter than limitWidth', function() {
            var actual = maker._createMultilineLabel('ABCDE FGHIJK', 100, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDE FGHIJK');
        });

        it('create multiline labels, when label width longer than limitWidth', function() {
            var actual = maker._createMultilineLabel('ABCDE FGHIJK HIJKLMN', 40, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDE<br>FGHIJK<br>HIJKLMN');
        });

        it('create multiline labels, when has not empty char)', function() {
            var actual = maker._createMultilineLabel('ABCDEFGHIJKHIJKLMN', 40, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDEFGHIJKHIJKLMN');
        });
    });

    describe('_createMultilineLabels()', function() {
        it('create multiline labels', function() {
            var labels = ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];
            var labelTheme = {
                fontSize: 12,
                fontFamily: 'Verdana'
            };
            var labelWidth = 50;
            var actual = maker._createMultilineLabels(labels, labelTheme, labelWidth);

            expect(actual).toEqual(['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB']);
        });
    });

    describe('_calculateMultilineHeight()', function() {
        beforeAll(function() {
            spyOn(renderUtil, 'getRenderedLabelHeight').and.callFake(function(value) {
                if (value.indexOf('</br>') > -1) {
                    return 40;
                }

                return 20;
            });
        });
        it('calculate multiple line height', function() {
            var multilineLables = [
                'AAAA</br>BBBB'
            ];
            var labelAraeWidth = 50;
            var actual;

            actual = maker._calculateMultilineHeight(multilineLables, labelAraeWidth);

            expect(actual).toBe(40);
        });

        it('calculate multiple line height, when not multiple line label', function() {
            var multilineLables = [
                'AAAA'
            ];
            var labelAraeWidth = 50;
            var actual;

            actual = maker._calculateMultilineHeight(multilineLables, labelAraeWidth);

            expect(actual).toBe(20);
        });
    });

    describe('_findRotationDegree()', function() {
        it('find rotation degree', function() {
            var actual = maker._findRotationDegree(50, 60, 20);

            expect(actual).toBe(25);
        });

        it('max degree is 85', function() {
            var actual = maker._findRotationDegree(5, 120, 20);

            expect(actual).toBe(85);
        });
    });

    describe('_calculateRotatedWidth()', function() {
        it('calculate rotated width', function() {
            var degree = 25;
            var firstLabel = 'abcdefghijklmnopqrstuvwxyz';
            var labelHeight = 20;
            var actual;

            spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(140);
            actual = maker._calculateRotatedWidth(degree, firstLabel, labelHeight);

            expect(actual).toBe(131.109272802538);
        });
    });

    describe('makeAdditionalDataForRotatedLabels', function() {
        beforeEach(function() {
            spyOn(renderUtil, 'getRenderedLabelsMaxHeight').and.returnValue(20);
        });

        it('make additional data for rotated labels', function() {
            var validLabels = ['cate1', 'cate2', 'cate3'];
            var validLabelCount = 3;
            var labelTheme = {};
            var isLabelAxis = true;
            var dimensionMap = {
                series: {
                    width: 300
                },
                yAxis: {
                    width: 100
                },
                chart: {
                    width: 500
                }
            };
            var actual;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
            spyOn(geometric, 'calculateRotatedHeight').and.returnValue(30);
            spyOn(maker, '_calculateRotatedWidth').and.returnValue(110);

            actual = maker.makeAdditionalDataForRotatedLabels(
                validLabels, validLabelCount, labelTheme, isLabelAxis, dimensionMap
            );

            expect(actual).toEqual({
                degree: 25,
                overflowHeight: 10,
                overflowLeft: -40,
                overflowRight: 20
            });
        });

        it('make additional data for rotated labels, when has not rotated label', function() {
            var validLabels = ['cate1', 'cate2', 'cate3'];
            var validLabelCount = 3;
            var labelTheme = {};
            var isLabelAxis = true;
            var dimensionMap = {
                series: {
                    width: 400
                },
                yAxis: {
                    width: 100
                },
                chart: {
                    width: 500
                }
            };
            var actual;

            spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(120);

            actual = maker.makeAdditionalDataForRotatedLabels(
                validLabels, validLabelCount, labelTheme, isLabelAxis, dimensionMap
            );

            expect(actual).toEqual({
                overflowLeft: -40,
                overflowRight: 130
            });
        });
    });
});
