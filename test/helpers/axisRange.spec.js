/**
 * @fileoverview test AxisRange
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisRange = require('../../src/js/helpers/axisRange.js'),
    chartConst = require('../../src/js/const'),
    DataProcessor = require('../../src/js/helpers/dataProcessor.js');

describe('AxisRange', function() {
    var axisRange, boundsMaker;

    beforeEach(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['makeSeriesHeight', 'makeSeriesWidth']);
        axisRange = new AxisRange({
            dataProcessor: new DataProcessor([], {}),
            boundsMaker: boundsMaker
        });
    });

    describe('_getFormatFunctions()', function() {
        it('유효한 percent stacked 차트의 경우 %로 formatting 가능한 함수를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_isPercentStackedChart').and.returnValue(true);

            actual = axisRange._getFormatFunctions();
            expected = '10%';

            expect(actual[0](10)).toBe(expected);
        });

        it('유효한 percent stacked 차트가 아닌경우 dataProcessor에서 formatting 가능한 함수를 얻어 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_isPercentStackedChart').and.returnValue(false);
            spyOn(axisRange.dataProcessor, 'getFormatFunctions').and.returnValue([
                function(value) {
                    return '00' + value;
                }
            ]);

            actual = axisRange._getFormatFunctions();
            expected = '0010';

            expect(actual[0](10)).toBe(expected);
        });
    });

    describe('_getRangeValues()', function() {
        it('range정보에서 vlaues를 계산하여 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_getRange').and.returnValue({
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            });
            actual = axisRange._getRangeValues();
            expected = [-50, -25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });

        it('diverging 옵션이 있으면 음수를 양수로 변환하여 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_getRange').and.returnValue({
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            });
            axisRange.chartType = 'bar';
            axisRange.options.diverging = true;
            actual = axisRange._getRangeValues();
            expected = [50, 25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });

    });

    describe('_makeBaseValues()', function() {
        it('baseValues를 생성합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.groupValues = [
                [70, 10],
                [20, 20],
                [80, 30]
            ];

            actual = axisRange._makeBaseValues();
            expected = [70, 10, 20, 20, 80, 30];

            expect(actual).toEqual(expected);
        });

        it('comboChart에서 yAxis가 두개 있을 때, line차트의 baseValues를 생성합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.groupValues = {
                column: [
                    [70, 10],
                    [20, 20],
                    [80, 30]
                ],
                line: [
                    [1, 2, 3]
                ]
            };

            axisRange.chartType = 'line';
            actual = axisRange._makeBaseValues();
            expected = [1, 2, 3];

            expect(actual).toEqual(expected);
        });

        it('comboChart에서 yAxis가 하나 있을 경우의 baseValues를 생성합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.groupValues = {
                column: [
                    [70, 10],
                    [20, 20],
                    [80, 30]
                ],
                line: [
                    [1, 2, 3]
                ]
            };

            axisRange.dataProcessor.seriesChartTypes = ['column', 'line'];
            axisRange.isSingleYAxis = true;
            actual = axisRange._makeBaseValues();
            expected = [70, 10, 1, 2, 3, 20, 20, 80, 30];

            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 normal인 경우에 그룹별로 양수와 음수 각각의 합을 구하여 baseValues를 생성합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.groupValues = [
                [70, -10, 10],
                [-20, 20, -10],
                [80, -30, -10]
            ];

            axisRange.chartType = 'column';
            axisRange.options.stacked = 'normal';
            actual = axisRange._makeBaseValues();
            expected = [80, -10, 20, -30, 80, -40];

            expect(actual).toEqual(expected);
        });
    });

    describe('_getBaseSize()', function() {
        it('x축일 경우에는 series width를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            boundsMaker.makeSeriesWidth.and.returnValue(400);

            actual = axisRange._getBaseSize();
            expected = 400;

            expect(actual).toBe(expected);
        });

        it('y축일 경우에는 series height를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            boundsMaker.makeSeriesHeight.and.returnValue(300);

            axisRange.isVertical = true;
            actual = axisRange._getBaseSize();
            expected = 300;

            expect(actual).toBe(expected);
        });
    });

    describe('_getCandidateValueCounts()', function() {
        it('너비가 320일 경우에는 320을 40과 60으로 나눈 값인 5와 8 사이의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            boundsMaker.makeSeriesWidth.and.returnValue(320);

            actual = axisRange._getCandidateValueCounts();
            expected = [5, 6, 7, 8];

            expect(actual).toEqual(expected);
        });

        it('너비가 450일 경우에는 450을 40과 60으로 나눈 값인 7과 11 사이의의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            boundsMaker.makeSeriesWidth.and.returnValue(450);

            actual = axisRange._getCandidateValueCounts();
            expected = [7, 8, 9, 10, 11];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLimitForDivergingOption()', function() {
        it('min, max값의 절대값중 큰 숫자를 구해 새로운 min(-max), max를 반환합니다.', function() {
            var actual = axisRange._makeLimitForDivergingOption({
                    min: -20,
                    max: 10
                }),
                expected = {
                    min: -20,
                    max: 20
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeIntegerTypeRange()', function() {
        it('min, max가 정수인 경우에는 정수 변환 작업 없는 결과값을 반환합니다.', function() {
            var actual = axisRange._makeIntegerTypeRange({
                    min: 1,
                    max: 100
                }),
                expected = {
                    limit: {
                        min: 1,
                        max: 100
                    },
                    options: {},
                    divideNum: 1
                };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수 경우에는 정수 변환 작업된 결과값을 반환합니다.', function() {
            var actual = axisRange._makeIntegerTypeRange({
                    min: 0.1,
                    max: 0.9
                }),
                expected = {
                    limit: {
                        min: 1,
                        max: 9
                    },
                    options: {},
                    divideNum: 10
                };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수이고 옵션이 있을 경우에는 옵션값 까지 변환 작업된 결과값을 반환합니다.', function() {
            var actual, expected;

            axisRange.options.limit = {
                min: 0.2,
                max: 0.8
            };
            actual = axisRange._makeIntegerTypeRange({
                min: 0.1,
                max: 0.9
            });
            expected = {
                limit: {
                    min: 1,
                    max: 9
                },
                options: {
                    min: 2,
                    max: 8
                },
                divideNum: 10
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLimitIfEqualMinMax()', function() {
        it('min, max값이 0보다 클 경우에는 min을 0으로 설정합니다.', function() {
            var actual = axisRange._makeLimitIfEqualMinMax({
                    min: 5,
                    max: 5
                }),
                expected = {
                    min: 0,
                    max: 5
                };

            expect(actual).toEqual(expected);
        });

        it('min, max값이 0보다 작을 경우에는 max를 0으로 설정합니다.', function() {
            var actual = axisRange._makeLimitIfEqualMinMax({
                    min: -5,
                    max: -5
                }),
                expected = {
                    min: -5,
                    max: 0
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBaseLimit()', function() {
        it('기본 limit 값을 계산하여 반환합니다.', function() {
            var actual = axisRange._makeBaseLimit({
                    min: -90,
                    max: 0
                }, {}),
                expected = {
                    min: -94.5,
                    max: -0
                };

            expect(actual).toEqual(expected);
        });

        it('옵션이 있는 경우에는 계산된 기본 limit에 옵션 정보를 적용하여 반환합니다.', function() {
            var actual = axisRange._makeBaseLimit({
                    min: -90,
                    max: 0
                }, {
                    min: -90, max: 10
                }),
                expected = {
                    min: -90,
                    max: 10
                };

            expect(actual).toEqual(expected);
        });

        it('min, max값이 같고 양수라면 min을 0으로 변경하고 그대로 반환합니다.', function() {
            var actual = axisRange._makeBaseLimit({
                    min: 20,
                    max: 20
                }, {}),
                expected = {
                    min: 0,
                    max: 20
                };

            expect(actual).toEqual(expected);
        });

        it('min, max값이 같고 음수라면 max을 0으로 변경하고 그대로 반환합니다.', function() {
            var actual = axisRange._makeBaseLimit({
                    min: -20,
                    max: -20
                }, {}),
                expected = {
                    min: -20,
                    max: 0
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_normalizeMin()', function() {
        it('step이 2일때 min 1.6에 대한 정규화 결과는 0입니다.', function() {
            var actual = axisRange._normalizeMin(1.6, 2);
            expect(actual).toBe(0);
        });

        it('step이 1일때 min 1.6에 대한 정규화 결과는 1입니다.', function() {
            var actual = axisRange._normalizeMin(1.6, 1);
            expect(actual).toBe(1);
        });

        it('step이 2일때 min 2.3에 대한 정규화 결과는 2입니다.', function() {
            var actual = axisRange._normalizeMin(2.3, 2);
            expect(actual).toBe(2);
        });

        it('step이 2일때 min 3.3에 대한 정규화 결과는 2입니다.', function() {
            var actual = axisRange._normalizeMin(3.3, 2);
            expect(actual).toBe(2);
        });

        it('step이 5일때 min 3.3에 대한 정규화 결과는 0입니다.', function() {
            var actual = axisRange._normalizeMin(3.3, 5);
            expect(actual).toBe(0);
        });

        it('step이 5일때 min 7.3에 대한 정규화 결과는 5입니다.', function() {
            var actual = axisRange._normalizeMin(7.3, 5);
            expect(actual).toBe(5);
        });

        it('step이 10일때 min 7.3에 대한 정규화 결과는 0입니다.', function() {
            var actual = axisRange._normalizeMin(7.3, 10);
            expect(actual).toBe(0);
        });

        it('step이 30일때 min -100에 대한 정규화 결과는 -120입니다.', function() {
            var actual = axisRange._normalizeMin(-100, 30);
            expect(actual).toBe(-120);
        });

        it('step이 30일때 min -10에 대한 정규화 결과는 -30입니다.', function() {
            var actual = axisRange._normalizeMin(-10, 30);
            expect(actual).toBe(-30);
        });

        it('step이 5일때 min -10에 대한 정규화 결과는 -10입니다.', function() {
            var actual = axisRange._normalizeMin(-10, 5);
            expect(actual).toBe(-10);
        });
    });

    describe('_makeNormalizedMax()', function() {
        it('정규화된 max 결과 값을 반환합니다.', function() {
            var actual = axisRange._makeNormalizedMax({
                min: 0,
                max: 110
            }, 20, 5);

            expect(actual).toBe(120);
        });
    });

    describe('_normalizeLimit()', function() {
        it('정규화된 limit 값을 반환합니다.', function() {
            var actual = axisRange._normalizeLimit({
                min: 10,
                max: 110
            }, 20, 5);
            expect(actual.min).toBe(0);
            expect(actual.max).toBe(120);
        });
    });

    describe('_decreaseMinByStep()', function() {
        it('라인차트이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var min = 10,
                dataMin = 10,
                step = 20,
                actual, expected;

            axisRange.chartType = 'line';

            actual = axisRange._decreaseMinByStep(min, dataMin, step);
            expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin 모두 음수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var min = -10,
                dataMin = -10,
                step = 20,
                actual, expected;

            actual = axisRange._decreaseMinByStep(min, dataMin, step);
            expected = -30;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 min값을 그대로 반환합니다.', function() {
            var min = -10,
                dataMin = -10,
                step = 20,
                optionMin = 0,
                actual, expected;

            actual = axisRange._decreaseMinByStep(min, dataMin, step, optionMin);
            expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var min = -10,
                dataMin = -8,
                step = 20,
                actual, expected;

            actual = axisRange._decreaseMinByStep(min, dataMin, step);
            expected = -10;

            expect(actual).toEqual(expected);
        });
    });

    describe('_increaseMaxByStep()', function() {
        it('라인차트이면서 옵션이없고 max와 dataMax가 같으면 max을 한 step 만큼 증가시켜 반환합니다.', function() {
            var max = -10,
                dataMax = -10,
                step = 20,
                actual, expected;

            axisRange.chartType = 'line';

            actual = axisRange._increaseMaxByStep(max, dataMax, step);
            expected = 10;

            expect(actual).toEqual(expected);
        });

        it('max와 dataMax 모두 양수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var max = 90,
                dataMax = 90,
                step = 20,
                actual, expected;

            actual = axisRange._increaseMaxByStep(max, dataMax, step);
            expected = 110;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 max값을 그대로 반환합니다.', function() {
            var max = 90,
                dataMax = 90,
                step = 20,
                optionMax = 80,
                actual, expected;

            actual = axisRange._increaseMaxByStep(max, dataMax, step, optionMax);
            expected = 90;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var max = 90,
                dataMax = 85,
                step = 20,
                actual, expected;

            actual = axisRange._increaseMaxByStep(max, dataMax, step);
            expected = 90;

            expect(actual).toEqual(expected);
        });
    });

    describe('_divideRangeStep()', function() {
        it('step을 반으로 나누었을 때의 valueCount가 후보로 계산된 valueCount와 인접하면 step을 반으로 나누어 반환합니다.', function() {
            var actual = axisRange._divideRangeStep({
                    min: 0,
                    max: 100
                }, 50, 4),
                expected = 25;

            expect(actual).toEqual(expected);
        });
    });

    describe('_minimizeRangeLimit()', function() {
        it('예상보다 작게 계산된 limit.min에 대해 options.min이 없는 경우,dataLimit.min보다 작은 범위에서 step 단위로 증가 시킵니다.', function() {
            var limit = {
                    min: -20,
                    max: 100
                },
                dataLimit = {
                    min: 10,
                    max: 90
                },
                step = 20,
                valueCount = 6,
                options = {},
                actual = axisRange._minimizeRangeLimit(limit, dataLimit, step, valueCount, options),
                expected = {
                    min: 0,
                    max: 100
                };

            expect(actual).toEqual(expected);
        });

        it('예상보다 크게 계산된 limit.max에 대해 options.max가 없는 경우 dataLimit.max보다 큰 범위에서 step 단위로 감소 시킵니다.', function() {
            var limit = {
                    min: 0,
                    max: 120
                },
                dataLimit = {
                    min: 10,
                    max: 90
                },
                step = 20,
                valueCount = 6,
                options = {},
                actual = axisRange._minimizeRangeLimit(limit, dataLimit, step, valueCount, options),
                expected = {
                    min: 0,
                    max: 100
                };

            expect(actual).toEqual(expected);
        });

        it('예상보다 작게 계산된 limit.min에 대해 options.min이 있는 경우, option.min보다 크지 않은 범위에서 step 단위로 증가 시킵니다.', function() {
            var limit = {
                    min: -10,
                    max: 110
                },
                dataLimit = {
                    min: 20,
                    max: 90
                },
                step = 20,
                valueCount = 6,
                options = {
                    min: 10
                },
                actual = axisRange._minimizeRangeLimit(limit, dataLimit, step, valueCount, options),
                expected = {
                    min: 10,
                    max: 110
                };

            expect(actual).toEqual(expected);
        });

        it('예상보다 크게 계산된 limit.max에 대해 options.max가 있는 경우 option.max보다 작지 않은 범위에서 step 단위로 감소 시킵니다.', function() {
            var limit = {
                    min: 10,
                    max: 130
                },
                dataLimit = {
                    min: 20,
                    max: 90
                },
                step = 20,
                valueCount = 6,
                options = {
                    max: 110
                },
                actual = axisRange._minimizeRangeLimit(limit, dataLimit, step, valueCount, options),
                expected = {
                    min: 10,
                    max: 110
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCandidateRange()', function() {
        it('입력 data를 기준으로 후고 axis range를 생성합니다.', function() {
            var dataLimit = {
                    min: 0,
                    max: 80
                },
                baseLimit = axisRange._makeBaseLimit(dataLimit, {}),
                valueCount = 4,
                actual = axisRange._makeCandidateRange(baseLimit, dataLimit, valueCount, {});

            expect(actual).toEqual({
                limit: {
                    min: 0,
                    max: 100
                },
                step: 25
            });
        });
    });

    describe('_makeCandidateRanges()', function() {
        it('tickCounts정보에 해당하는 tick info 후보군을 계산하여 반환합니다.', function() {
            var actual = axisRange._makeCandidateRanges({
                    limit: {
                        min: 10,
                        max: 100
                    },
                    options: {}
                }, [3, 4]),
                expected = [
                    {
                        limit: {min: 0, max: 200},
                        step: 100
                    },
                    {
                        limit: {min: 0, max: 150},
                        step: 50
                    }
                ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_getComparingValue()', function() {
        it('axis range를 선정하는 기준이 되는 비교값을 계산하여 반환합니다.', function() {
            var actual = axisRange._getComparingValue({
                    min: 10,
                    max: 90
                }, {
                    limit: {
                        min: 0,
                        max: 80
                    },
                    step: 20
                }),
                expected = 20;

            expect(actual).toEqual(expected);
        });
    });

    describe('_selectAxisRange()', function() {
        it('후보군들의 비교값 중 비교값이 제일 작은 axis range를 선정하여 반환합니다.', function() {
            var actual = axisRange._selectAxisRange({
                    min: 10,
                    max: 90
                }, [
                    {
                        limit: {min: 0, max: 105},
                        step: 35
                    },
                    {
                        limit: {min: 0, max: 100},
                        step: 25
                    }
                ]),
                expected = {
                    limit: {min: 0, max: 100},
                    step: 25
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_restoreNumberState()', function() {
        it('애초에 정수형 변환이 없었던 tick info는 되돌리는 작업이 수행되지 않은 결과값을 반환합니다.', function() {
            var tickInfo = axisRange._restoreNumberState({
                step: 5,
                limit: {
                    min: 1,
                    max: 10
                }
            }, 1);
            expect(tickInfo).toEqual({
                step: 5,
                limit: {
                    min: 1,
                    max: 10
                }
            });
        });

        it('정수형으로 변환되었던 tick info를 원래 형태의 값으로 되롤린 결과값을 반환합니다.', function() {
            var tickInfo = axisRange._restoreNumberState({
                step: 5,
                limit: {
                    min: 1,
                    max: 10
                }
            }, 10);
            expect(tickInfo).toEqual({
                step: 0.5,
                limit: {
                    min: 0.1,
                    max: 1
                }
            });
        });
    });

    describe('_calculateRange()', function() {
        it('입력 data에 가장 적절한 tick info를 계산하여 반환합니다.', function() {
            var actual, expected;

            boundsMaker.makeSeriesWidth.and.returnValue(400);
            axisRange.dataProcessor.groupValues = [
                [10, 20],
                [40, 90]
            ];

            actual = axisRange._calculateRange();
            expected = {
                limit: {min: 0, max: 100},
                step: 20
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateMinusSum()', function() {
        it('axis가 하나 있을 경우에는 차트타입 구분없이 전체 음수값의 합을 계산합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.seriesChartTypes = ['column', 'line'];
            axisRange.dataProcessor.groupValues = {
                column: [
                    [70, 10],
                    [20, 20],
                    [-80, 30]
                ],
                line: [
                    [10, -20, 30]
                ]
            };

            axisRange.isSingleYAxis = true;
            actual = axisRange._calculateMinusSum();
            expected = -100;

            expect(actual).toEqual(expected);
        });

        it('axis가 두개 있을 경우에는 chartType에 해당하는 음수값의 합을 계산합니다.', function() {
            var actual, expected;

            axisRange.dataProcessor.seriesChartTypes = ['column', 'line'];
            axisRange.dataProcessor.groupValues = {
                column: [
                    [70, 10],
                    [20, 20],
                    [-80, 30]
                ],
                line: [
                    [10, -20, 30]
                ]
            };

            axisRange.chartType = 'column';
            actual = axisRange._calculateMinusSum();
            expected = -80;

            expect(actual).toEqual(expected);
        });
    });

    describe('_getPercentStackedRange()', function() {
        it('음수의 합이 0일 경우에는 chartConst.PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_calculateMinusSum').and.returnValue(0);

            actual = axisRange._getPercentStackedRange();
            expected = chartConst.PERCENT_STACKED_AXIS_RANGE;

            expect(actual).toBe(expected);
        });

        it('음수의 합이 0이 아니면서 diverging 옵션이 있을 경우에는 chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_calculateMinusSum').and.returnValue(-100);
            axisRange.chartType = 'bar';
            axisRange.options.diverging = true;

            actual = axisRange._getPercentStackedRange();
            expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE;

            expect(actual).toBe(expected);
        });

        it('음수의 합이 0이 아니면서 diverging 옵션이 없을 경우에는 chartConst.NEGATIVE_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_calculateMinusSum').and.returnValue(-100);

            actual = axisRange._getPercentStackedRange();
            expected = chartConst.NEGATIVE_PERCENT_STACKED_AXIS_RANGE;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeRange()', function() {
        it('유효한 percent stacked 차트일 경우에는 _getPercentStackedRange()의 수행결과를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_isPercentStackedChart').and.returnValue(true);
            spyOn(axisRange, '_calculateMinusSum').and.returnValue(0);

            actual = axisRange._makeRange();
            expected = axisRange._getPercentStackedRange();

            expect(actual).toBe(expected);
        });

        it('유효한 percent stacked 차트가 아닌 경우에는 _calculateRange()의 수행결과를 반환합니다.', function() {
            var actual, expected;

            spyOn(axisRange, '_isPercentStackedChart').and.returnValue(false);
            boundsMaker.makeSeriesWidth.and.returnValue(400);
            axisRange.dataProcessor.groupValues = [
                [10, 20],
                [40, 90]
            ];

            actual = axisRange._makeRange();
            expected = axisRange._calculateRange();

            expect(actual).toEqual(expected);
        });
    });
});
