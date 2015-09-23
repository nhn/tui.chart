/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/axisDataMaker.js'),
    converter = require('../../src/js/helpers/dataConverter.js');

describe('axisDataMaker', function() {

    describe('makeLabelAxisData()', function() {
        it('레이블 타입의 axis data를 생성합니다.', function () {
            var result = maker.makeLabelAxisData({
                labels: ['label1', 'label2', 'label3']
            });
            expect(result).toEqual({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                validTickCount: 0,
                isLabelAxis: true,
                isVertical: false
            });
        });
    });

    describe('_makeBaseValues()', function() {
        it('stacked 옵션이 없는 경우의 기본 값을 생성합니다.', function () {
            var values = maker._makeBaseValues([
                [70, 10],
                [20, 20],
                [80, 30]
            ]);
            expect(values).toEqual([70, 10, 20, 20, 80, 30]);
        });

        it('stacked 옵션이 "normal"인 경우의 기본 값을 생성합니다.', function () {
            var values = maker._makeBaseValues([
                [70, 10],
                [20, 20],
                [80, 30]
            ], 'normal');
            expect(values).toEqual([70, 10, 20, 20, 80, 30, 80, 40, 110]);
        });
    });

    describe('_getBaseSize()', function() {
        it('x축일 경우에는 width를 기본 사이즈 정보로 반환합니다.', function () {
            var baseSize = maker._getBaseSize({
                width: 400,
                height: 300
            });

            expect(baseSize).toBe(400);
        });

        it('y축일 경우에는 height를 기본 사이즈 정보로 반환합니다.', function () {
            var baseSize = maker._getBaseSize({
                width: 400,
                height: 300
            }, true);

            expect(baseSize).toBe(300);
        });
    });

    describe('_getCandidateTickCounts()', function() {
        it('너비가 320일 경우에는 후보 5, 6, 7, 8의 tick count 정보를 반환합니다.', function () {
            var tickCounts = maker._getCandidateTickCounts({
                width: 320
            });
            expect(tickCounts).toEqual([5, 6, 7, 8]);
        });

        it('너비가 450일 경우에는 7, 8, 9, 10, 11의 후보 tick count 정보를 반환합니다.', function () {
            var tickCounts = maker._getCandidateTickCounts({
                width: 450
            });
            expect(tickCounts).toEqual([7, 8, 9, 10, 11]);
        });
    });

    describe('_getComparingValue()', function() {
        it('tick info를 선정하는 기준이 되는 비교값을 계산하여 반환합니다.', function () {
            var value = maker._getComparingValue(10, 90, {
                scale: {
                    min: 0,
                    max: 80
                },
                step: 20
            });
            expect(value).toBe(20);
        });
    });

    describe('_selectTickInfo()', function() {
        it('후보군들의 비교값 중 비교값이 제일 작은 tick info를 선정하여 반환합니다.', function () {
            var tickInfo = maker._selectTickInfo(10, 90, [
                {
                    scale: {min: 0, max: 105},
                    tickCount: 4,
                    step: 35,
                    labels: [0, 35, 70, 105]
                },
                {
                    scale: {min: 0, max: 100},
                    tickCount: 5,
                    step: 25,
                    labels: [0, 25, 50, 75, 100]
                }
            ]);

            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                tickCount: 5,
                step: 25,
                labels: [0, 25, 50, 75, 100]
            });
        });
    });

    describe('_getTickInfo()', function() {
        it('입력 data에 가장 적절한 tick info를 계산하여 반환합니다.', function () {
            var tickInfo = maker._getTickInfo({
                values: [10, 20, 40, 90],
                seriesDimension: {
                    width: 500,
                    height: 400
                }
            }, {});
            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                tickCount: 6,
                step: 20,
                labels: [0, 20, 40, 60, 80, 100]
            });
        });
    });

    describe('_makeIntegerTypeInfo()', function() {
        it('min, max가 정수인 경우에는 정수 변환 작업 없는 결과값을 반환합니다.', function () {
            var intTypeInfo = maker._makeIntegerTypeInfo(1, 100, {});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 100,
                options: {},
                divideNum: 1
            });
        });

        it('min, max가 소수 경우에는 정수 변환 작업된 결과값을 반환합니다.', function () {
            var intTypeInfo = maker._makeIntegerTypeInfo(0.1, 0.9, {});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 9,
                options: {},
                divideNum: 10
            });
        });

        it('min, max가 소수이고 옵션이 있을 경우에는 옵션값 까지 변환 작업된 결과값을 반환합니다.', function () {
            var intTypeInfo = maker._makeIntegerTypeInfo(0.1, 0.9, {min: 0.2, max: 0.8});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 9,
                options: {min: 2, max: 8},
                divideNum: 10
            });
        });
    });

    describe('_revertOriginalTypeTickInfo()', function() {
        it('애초에 정수형 변환이 없었던 tick info는 되돌리는 작업이 수행되지 않은 결과값을 반환합니다.', function () {
            var tickInfo = maker._revertOriginalTypeTickInfo({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            }, 1);
            expect(tickInfo).toEqual({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            });
        });

        it('정수형으로 변환되었던 tick info를 원래 형태의 값으로 되롤린 결과값을 반환합니다.', function () {
            var tickInfo = maker._revertOriginalTypeTickInfo({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            }, 10);
            expect(tickInfo).toEqual({
                step: 0.5,
                scale: {
                    min: 0.1,
                    max: 1
                },
                labels: [0.2, 0.3, 0.9]
            });
        });
    });

    describe('_minimizeTickScale()', function() {
        it('사용자 값 범위를 넘어서는 scale에 대해 범위를 넘어서지 않게 조절된 결과값을 반환합니다.', function () {
            var tickInfo = maker._minimizeTickScale({
                userMin: 10,
                userMax: 90,
                tickInfo: {
                    scale: {min: 0, max: 100},
                    step: 25,
                    tickCount: 6
                },
                options: {}
            });

            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 5,
                labels: [0, 25, 50, 75, 100]
            });
        });

        it('음수가 포함된 경우에 대해 처리한 결과값을 반환합니다.', function () {
            var tickInfo = maker._minimizeTickScale({
                userMin: -6,
                userMax: -1,
                tickInfo: {
                    scale: {min: -10, max: 10},
                    step: 5,
                    tickCount: 6
                },
                options: {min: -10}
            });

            expect(tickInfo).toEqual({
                scale: {min: -10, max: 10},
                step: 5,
                tickCount: 5,
                labels: [-10, -5, 0, 5, 10]
            });
        });
    });

    describe('_divideTickStep()', function() {
        it('step을 반으로 나누었을 때의 tickCount가 초기 tickCount와 인접하면 step을 변경하여 결과값을 반환합니다.', function () {
            var result = maker._divideTickStep({
                step: 50,
                scale: {
                    min: 0,
                    max: 100
                },
                tickCount: 3
            }, 4);

            expect(result).toEqual({
                step: 25,
                scale: {
                    min: 0,
                    max: 100
                },
                tickCount: 5,
                labels: [0, 25, 50, 75, 100]
            });
        });
    });

    describe('_makeTickInfo()', function() {
        it('입력 data를 기준으로 tick info를 생성합니다.', function () {
            var result = maker._makeTickInfo({
                tickCount: 5,
                min: 0,
                max: 100,
                userMin: 10,
                userMax: 90,
                isMinus: false,
                scale: maker._makeBaseScale(0, 100, {}),
                options: {}
            });

            expect(result).toEqual({
                scale: {
                    min: 0,
                    max: 120
                },
                step: 30,
                tickCount: 5,
                labels: [0, 30, 60, 90, 120]
            });
        });
    });

    describe('_addMinPadding()', function() {
        it('Line차트의 경우 min과 userMin이 같으면 한 step 감소시킨 min 값을 반환합니다.', function () {
            var result = maker._addMinPadding({
                min: 0,
                userMin: 0,
                step: 20,
                chartType: 'line'
            });

            expect(result).toEqual(-20);
        });

        it('Bar차트의 경우 min이 0이면서 userMin 같으면 감소 없는 min 값을 반환합니다.', function () {
            var result = maker._addMinPadding({
                min: 0,
                userMin: 0,
                step: 20,
                chartType: 'bar'
            });

            expect(result).toBe(0);
        });
    });

    describe('_addMaxPadding()', function() {
        it('max와 userMax가 같으면 한 step 증가시킨 max 값을 반환합니다.', function () {
            var result = maker._addMaxPadding({
                max: 90,
                userMax: 90,
                step: 20
            });

            expect(result).toBe(110);
        });
    });

    describe('_normalizeMin()', function() {
        it('step이 2일때 min 1.6에 대한 정규화 결과는 0입니다.', function () {
            var result = maker._normalizeMin(1.6, 2);
            expect(result).toBe(0);
        });

        it('step이 1일때 min 1.6에 대한 정규화 결과는 1입니다.', function () {
            var result = maker._normalizeMin(1.6, 1);
            expect(result).toBe(1);
        });

        it('step이 2일때 min 2.3에 대한 정규화 결과는 2입니다.', function () {
            var result = maker._normalizeMin(2.3, 2);
            expect(result).toBe(2);
        });

        it('step이 2일때 min 3.3에 대한 정규화 결과는 2입니다.', function () {
            var result = maker._normalizeMin(3.3, 2);
            expect(result).toBe(2);
        });

        it('step이 5일때 min 3.3에 대한 정규화 결과는 0입니다.', function () {
            var result = maker._normalizeMin(3.3, 5);
            expect(result).toBe(0);
        });

        it('step이 5일때 min 7.3에 대한 정규화 결과는 5입니다.', function () {
            var result = maker._normalizeMin(7.3, 5);
            expect(result).toBe(5);
        });

        it('step이 10일때 min 7.3에 대한 정규화 결과는 0입니다.', function () {
            var result = maker._normalizeMin(7.3, 10);
            expect(result).toBe(0);
        });

        it('step이 30일때 min -100에 대한 정규화 결과는 -120입니다.', function () {
            var result = maker._normalizeMin(-100, 30);
            expect(result).toBe(-120);
        });

        it('step이 30일때 min -10에 대한 정규화 결과는 -30입니다.', function () {
            var result = maker._normalizeMin(-10, 30);
            expect(result).toBe(-30);
        });

        it('step이 5일때 min -10에 대한 정규화 결과는 -10입니다.', function () {
            var result = maker._normalizeMin(-10, 5);
            expect(result).toBe(-10);
        });
    });

    describe('_makeNormalizedMax()', function() {
        it('정규화된 max 결과 값을 반환합니다.', function () {
            var result = maker._makeNormalizedMax({
                min: 0,
                max: 110
            }, 20, 5);

            expect(result).toBe(120);
        });
    });

    describe('_normalizeScale()', function() {
        it('정규화된 scale 값을 반환합니다.', function () {
            var result = maker._makeNormalizedMax({
                min: 0,
                max: 110
            }, 20, 5);
            expect(result).toBe(120);
        });
    });

    describe('_getCandidateTickInfos()', function() {
        it('tickCounts정보에 해당하는 tick info 후보군을 계산하여 반환합니다.', function () {
            var candidates = maker._getCandidateTickInfos({
                min: 10,
                max: 90,
                tickCounts: [4, 5]
            }, {});
            expect(candidates).toEqual([
                {
                    scale: {min: 0, max: 120},
                    tickCount: 4,
                    step: 40,
                    labels: [0, 40, 80, 120]
                },
                {
                    scale: {min: 0, max: 120},
                    tickCount: 5,
                    step: 30,
                    labels: [0, 30, 60, 90, 120]
                }
            ]);
        });
    });

    describe('_makeBaseScale()', function() {
        it('기본 scale 값을 계산하여 반환합니다.', function () {
            var result = maker._makeBaseScale(-90, 0, {});
            expect(result).toEqual({
                min: -94.5,
                max: -0
            });
        });

        it('옵션이 있는 경우에는 계산된 기본 scale에 옵션 정보를 적용하여 반환합니다.', function () {
            var result = maker._makeBaseScale(-90, 0, {min: -90, max: 10});
            expect(result).toEqual({
                min: -90,
                max: 10
            });
        });
    });


    describe('_formatLabels()', function() {
        it('전달된 labels를 "1,000.00"타입으로 포맷팅하여 반환합니다.', function () {
            var fns = converter._findFormatFunctions('1,000.00'),
                result = maker._formatLabels([1000, 2000.2222, 3000.555555, 4, 5.55], fns);
            expect(result).toEqual(['1,000.00', '2,000.22', '3,000.56', '4.00', '5.55']);
        });

        it('전달된 labels를 "0001"타입으로 포맷팅하여 반환합니다.', function () {
            var fns = converter._findFormatFunctions('0001'),
                result = maker._formatLabels([1, 2, 3], fns);
            expect(result).toEqual(['0001', '0002', '0003']);
        });
    });

    describe('makeValueAxisData()', function() {
        it('stacked 옵션이 없는 value 타입 axis data를 생성합니다. scale.max는 입력 값 중 최대값에 영향을 받습니다.', function () {
            var result = maker.makeValueAxisData({
                values: [
                    [70, 10],
                    [20, 20],
                    [80, 30]
                ],
                seriesDimension: {
                    width: 320,
                    height: 320
                },
                options: {}
            });

            expect(result).toEqual({
                labels: [0, 30, 60, 90],
                tickCount: 4,
                validTickCount: 4,
                scale: {
                    min: 0,
                    max: 90
                },
                step: 30,
                isVertical: false,
                isPositionRight: false
            });
        });

        it('stacked 옵션이 "normal"인 value 타입 axis data를 생성합니다. scale.max는 행(ex: [80, 30]) 의 합산값에 영향을 받습니다.', function () {
            var result = maker.makeValueAxisData({
                values: [
                    [70, 10],
                    [20, 20],
                    [80, 30]
                ],
                seriesDimension: {
                    width: 320,
                    height: 320
                },
                stacked: 'normal',
                options: {}
            });

            expect(result).toEqual({
                labels: [0, 30, 60, 90, 120],
                tickCount: 5,
                validTickCount: 5,
                scale: {
                    min: 0,
                    max: 120
                },
                step: 30,
                isVertical: false,
                isPositionRight: false
            });
        });

        it('stacked 옵션이 "percent"인 값 타입의 axis data를 생성합니다. scale은 %에 대한 정보를 제공하며 항상 [0, 25, 50, 70, 100]의 레이블을 제공합니다.', function () {
            var result = maker.makeValueAxisData({
                values: [
                    [70, 10],
                    [20, 20],
                    [80, 30]
                ],
                seriesDimension: {
                    width: 320,
                    height: 320
                },
                stacked: 'percent',
                options: {}
            });

            expect(result).toEqual({
                labels: [0, 25, 50, 75, 100],
                tickCount: 5,
                validTickCount: 5,
                scale: {
                    min: 0,
                    max: 100
                },
                step: 25,
                isVertical: false,
                isPositionRight: false
            });
        });
    });
});
