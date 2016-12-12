/**
 * @fileoverview Test for ScaleDataMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var scaleDataMaker = require('../../../src/js/models/scaleData/scaleDataMaker.js');
var chartConst = require('../../../src/js/const');
var SeriesDataModel = require('../../../src/js/models/data/seriesDataModel');

describe('Test for ScaleDataMaker', function() {
    var boundsModel;

    describe('_getCandidateCountsOfValue()', function() {
        it('너비가 320일 경우에는 320을 40과 60으로 나눈 값인 5와 8 사이의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            actual = scaleDataMaker._getCandidateCountsOfValue(320);
            expected = [4, 5, 6, 7];

            expect(actual).toEqual(expected);
        });

        it('너비가 450일 경우에는 450을 40과 60으로 나눈 값인 7과 11 사이의의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            actual = scaleDataMaker._getCandidateCountsOfValue(450);
            expected = [6, 7, 8, 9, 10];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLimitForDivergingOption()', function() {
        it('min, max값의 절대값중 큰 숫자를 구해 새로운 min(-max), max를 반환합니다.', function() {
            var actual = scaleDataMaker._makeLimitForDivergingOption({
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

    describe('_makeIntegerTypeScale()', function() {
        it('min, max가 정수인 경우에는 정수 변환 작업 없는 결과값을 반환합니다.', function() {
            var actual = scaleDataMaker._makeIntegerTypeScale({
                    min: 1,
                    max: 100
                }),
                expected = {
                    limit: {
                        min: 1,
                        max: 100
                    },
                    limitOption: {},
                    divisionNumber: 1
                };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수 경우에는 정수 변환 작업된 결과값을 반환합니다.', function() {
            var dataLimit = {
                min: 0.1,
                max: 0.9
            };
            var actual = scaleDataMaker._makeIntegerTypeScale(dataLimit);
            var expected = {
                limit: {
                    min: 1,
                    max: 9
                },
                limitOption: {},
                divisionNumber: 10
            };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수이고 옵션이 있을 경우에는 옵션값 까지 변환 작업된 결과값을 반환합니다.', function() {
            var dataLimit = {
                min: 0.1,
                max: 0.9
            };
            var limitOption = {
                min: 0.2,
                max: 0.8
            };
            var actual = scaleDataMaker._makeIntegerTypeScale(dataLimit, limitOption);
            var expected = {
                limit: {
                    min: 1,
                    max: 9
                },
                limitOption: {
                    min: 2,
                    max: 8
                },
                divisionNumber: 10
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLimitIfEqualMinMax()', function() {
        it('min, max값이 0보다 클 경우에는 min을 0으로 설정합니다.', function() {
            var actual = scaleDataMaker._makeLimitIfEqualMinMax({
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
            var actual = scaleDataMaker._makeLimitIfEqualMinMax({
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
            var actual = scaleDataMaker._makeBaseLimit({
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
            var actual = scaleDataMaker._makeBaseLimit({
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
            var actual = scaleDataMaker._makeBaseLimit({
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
            var actual = scaleDataMaker._makeBaseLimit({
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
            var actual = scaleDataMaker._normalizeMin(1.6, 2);
            expect(actual).toBe(0);
        });

        it('step이 1일때 min 1.6에 대한 정규화 결과는 1입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(1.6, 1);
            expect(actual).toBe(1);
        });

        it('step이 2일때 min 2.3에 대한 정규화 결과는 2입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(2.3, 2);
            expect(actual).toBe(2);
        });

        it('step이 2일때 min 3.3에 대한 정규화 결과는 2입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(3.3, 2);
            expect(actual).toBe(2);
        });

        it('step이 5일때 min 3.3에 대한 정규화 결과는 0입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(3.3, 5);
            expect(actual).toBe(0);
        });

        it('step이 5일때 min 7.3에 대한 정규화 결과는 5입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(7.3, 5);
            expect(actual).toBe(5);
        });

        it('step이 10일때 min 7.3에 대한 정규화 결과는 0입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(7.3, 10);
            expect(actual).toBe(0);
        });

        it('step이 30일때 min -100에 대한 정규화 결과는 -120입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(-100, 30);
            expect(actual).toBe(-120);
        });

        it('step이 30일때 min -10에 대한 정규화 결과는 -30입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(-10, 30);
            expect(actual).toBe(-30);
        });

        it('step이 5일때 min -10에 대한 정규화 결과는 -10입니다.', function() {
            var actual = scaleDataMaker._normalizeMin(-10, 5);
            expect(actual).toBe(-10);
        });
    });

    describe('_makeNormalizedMax()', function() {
        it('정규화된 max 결과 값을 반환합니다.', function() {
            var actual = scaleDataMaker._makeNormalizedMax({
                min: 0,
                max: 110
            }, 20, 5);

            expect(actual).toBe(120);
        });
    });

    describe('_normalizeLimit()', function() {
        it('정규화된 limit 값을 반환합니다.', function() {
            var actual = scaleDataMaker._normalizeLimitIfNeed({
                min: 10,
                max: 110
            }, 20, 5);
            expect(actual.min).toBe(0);
            expect(actual.max).toBe(120);
        });
        it('limitOption의 min, max 값이 있을 경우 option의 min, max를 반환합니다.', function() {
            var actual = scaleDataMaker._normalizeLimitIfNeed({
                min: 10,
                max: 110
            }, 20, 5, {
                min: 90,
                max: 100
            });
            expect(actual.min).toBe(90);
            expect(actual.max).toBe(100);
        });
    });

    describe('_decreaseMinByStep()', function() {
        it('라인차트이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var min = 10;
            var dataMin = 10;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step, chartType);
            var expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin 모두 음수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var min = -10;
            var dataMin = -10;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step, chartType);
            var expected = -30;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 min값을 그대로 반환합니다.', function() {
            var min = -10;
            var dataMin = -10;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var optionMin = 0;
            var actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step, chartType, optionMin);
            var expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var min = -10;
            var dataMin = -8;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step, chartType);
            var expected = -10;

            expect(actual).toEqual(expected);
        });
    });

    describe('_increaseMaxByStep()', function() {
        it('라인차트이면서 옵션이없고 max와 dataMax가 같으면 max을 한 step 만큼 증가시켜 반환합니다.', function() {
            var max = -10;
            var dataMax = -10;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step, chartType);
            var expected = 10;

            expect(actual).toEqual(expected);
        });

        it('max와 dataMax 모두 양수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var max = 90;
            var dataMax = 90;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step, chartType);
            var expected = 110;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 max값을 그대로 반환합니다.', function() {
            var max = 90;
            var dataMax = 90;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var optionMax = 80;
            var actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step, chartType, optionMax);
            var expected = 90;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var max = 90;
            var dataMax = 85;
            var step = 20;
            var chartType = chartConst.CHART_TYPE_LINE;
            var actual, expected;

            actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step, chartType);
            expected = 90;

            expect(actual).toEqual(expected);
        });
    });

    describe('_divideScaleStep()', function() {
        it('step을 반으로 나누었을 때의 valueCount가 후보로 계산된 valueCount와 인접하면 step을 반으로 나누어 반환합니다.', function() {
            var actual = scaleDataMaker._divideScaleStep({
                    min: 0,
                    max: 100
                }, 50, 4),
                expected = 25;

            expect(actual).toEqual(expected);
        });
    });

    describe('_minimizeScaleLimit()', function() {
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
                actual = scaleDataMaker._minimizeScaleLimit(limit, dataLimit, step, valueCount, options),
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
                actual = scaleDataMaker._minimizeScaleLimit(limit, dataLimit, step, valueCount, options),
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
                actual = scaleDataMaker._minimizeScaleLimit(limit, dataLimit, step, valueCount, options),
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
                actual = scaleDataMaker._minimizeScaleLimit(limit, dataLimit, step, valueCount, options),
                expected = {
                    min: 10,
                    max: 110
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCandidateScale()', function() {
        it('입력 data를 기준으로 후고 axis range를 생성합니다.', function() {
            var dataLimit = {
                min: 0,
                max: 80
            };
            var limitMap = {
                dataLimit: dataLimit,
                baseLimit: scaleDataMaker._makeBaseLimit(dataLimit, {})
            };
            var optinons = {
                limitOption: {}
            };
            var valueCount = 4;
            var actual = scaleDataMaker._makeCandidateScale(limitMap, optinons, valueCount);

            expect(actual).toEqual({
                limit: {
                    min: 0,
                    max: 100
                },
                step: 25,
                stepCount: 4
            });
        });
    });

    describe('_makeCandidateScales()', function() {
        it('make candidates for axis scale', function() {
            var integerTypeScale = {
                limit: {
                    min: 10,
                    max: 100
                },
                limitOption: {}
            };
            var valueCounts = [3, 4];
            var actual = scaleDataMaker._makeCandidateScales(integerTypeScale, valueCounts, {});
            var expected = [
                {
                    limit: {min: 0, max: 200},
                    step: 100,
                    stepCount: 2
                },
                {
                    limit: {min: 0, max: 150},
                    step: 50,
                    stepCount: 3
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_getComparingValue()', function() {
        it('axis range를 선정하는 기준이 되는 비교값을 계산하여 반환합니다.', function() {
            var actual = scaleDataMaker._getComparingValue({
                min: 10,
                max: 90
            }, [4], {
                limit: {
                    min: 0,
                    max: 80
                },
                step: 20,
                stepCount: 4
            }, 0);
            var expected = 20;

            expect(actual).toEqual(expected);
        });
    });

    describe('_selectAxisScale()', function() {
        it('후보군들의 비교값 중 비교값이 제일 작은 axis range를 선정하여 반환합니다.', function() {
            var actual = scaleDataMaker._selectAxisScale({
                min: 10,
                max: 90
            }, [
                {
                    limit: {min: 0, max: 105},
                    step: 35,
                    stepCount: 4
                },
                {
                    limit: {min: 0, max: 100},
                    step: 25,
                    stepCount: 4
                }
            ], [3, 4]);
            var expected = {
                limit: {min: 0, max: 100},
                step: 25,
                stepCount: 4
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_restoreNumberState()', function() {
        it('애초에 정수형 변환이 없었던 tick info는 되돌리는 작업이 수행되지 않은 결과값을 반환합니다.', function() {
            var tickInfo = scaleDataMaker._restoreNumberState({
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
            var tickInfo = scaleDataMaker._restoreNumberState({
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

    describe('_findDateType()', function() {
        it('if difference between minimum and maximum value is over year value,' +
                    ' returns chartConst.DATE_TYPE_YEAR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2018, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_YEAR);
        });

        it('if difference between minimum and maximum value is over year value and' +
                    ' it divided by millisecond of year value is less than data count,' +
                    ' returns chartConst.DATE_TYPE_MONTH', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2011, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 24);

            expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
        });

        it('if difference between minimum and maximum value is over month value,' +
            ' returns chartConst.DATE_TYPE_MONTH', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 12, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_MONTH);
        });

        it('if difference between minimum and maximum value is over month value and' +
            ' it divided by millisecond of month value is less than data count,' +
            ' returns chartConst.DATE_TYPE_DATE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 3, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
        });

        it('if difference between minimum and maximum value is over date value,' +
            ' returns chartConst.DATE_TYPE_DATE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 10).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_DATE);
        });

        it('if difference between minimum and maximum value is over date value and' +
            ' it divided by millisecond of date value is less than data count,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1).getTime(),
                max: new Date(2010, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
        });

        it('if difference between minimum and maximum value is over hour value,' +
            ' returns chartConst.DATE_TYPE_HOUR', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 13).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_HOUR);
        });

        it('if difference between minimum and maximum value is over hour value and' +
            ' it divided by millisecond of hour value is less than data count,' +
            ' returns chartConst.DATE_TYPE_MINUTE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
        });

        it('if difference between minimum and maximum value is over minute value,' +
            ' returns chartConst.DATE_TYPE_MINUTE', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 12).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_MINUTE);
        });

        it('if difference between minimum and maximum value is over minute value and' +
            ' it divided by millisecond of minute value is less than data count,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 3).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if difference between minimum and maximum value is over second value,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 12).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if difference between minimum and maximum value is over second value and' +
            ' it divided by millisecond of second value is less than data count,' +
            ' returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 6).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 12);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });

        it('if minimum and maximum value are same, returns chartConst.DATE_TYPE_SECOND', function() {
            var baseLimit = {
                min: new Date(2010, 1, 1, 1, 1, 1).getTime(),
                max: new Date(2010, 1, 1, 1, 1, 1).getTime()
            };
            var actual = scaleDataMaker._findDateType(baseLimit, 6);

            expect(actual).toBe(chartConst.DATE_TYPE_SECOND);
        });
    });

    describe('_calculateScale()', function() {
        it('calculate scale.', function() {
            var baseValues = [10, 20, 40, 90];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual = scaleDataMaker._calculateScale(baseValues, baseSize, chartType, {});
            var expected = {
                limit: {min: 0, max: 100},
                step: 20,
                stepCount: 5
            };

            expect(actual).toEqual(expected);
        });

        it('calculate scale, when axis type is datetime', function() {
            var baseValues = [
                (new Date('01/01/2016')).getTime(),
                (new Date('01/03/2016')).getTime(),
                (new Date('01/06/2016')).getTime(),
                (new Date('01/10/2016')).getTime()
            ];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var options = {
                type: chartConst.AXIS_TYPE_DATETIME
            };
            var actual = scaleDataMaker._calculateScale(baseValues, baseSize, chartType, options);
            var expected = {
                limit: {
                    min: (new Date('01/01/2016')).getTime(),
                    max: (new Date('01/11/2016')).getTime()
                },
                step: scaleDataMaker.millisecondMap.date * 2,
                stepCount: 5
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_getPercentStackedScale()', function() {
        it('음수의 합이 0일 경우에는 chartConst.PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [10, 20, 30, 40];
            var actual = scaleDataMaker._getPercentStackedScale(baseValues);
            var expected = chartConst.PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('양수의 합이 0일 경우에는 chartConst.MINUS_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [-10, -20, -30, -40];
            var actual = scaleDataMaker._getPercentStackedScale(baseValues);
            var expected = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 있을 경우에는 chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var baseValues = [-10, 20, -30, 40];
            var chartType = chartConst.CHART_TYPE_BAR;
            var diverging = true;
            var actual = scaleDataMaker._getPercentStackedScale(baseValues, chartType, diverging);
            var expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 없을 경우에는 chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE 반환합니다.', function() {
            var baseValues = [-10, 20, -30, 40];
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual = scaleDataMaker._getPercentStackedScale(baseValues, chartType);
            var expected = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });
    });

    describe('makeScaleData()', function() {
        it('유효한 percent stack 차트일 경우에는 _getPercentStackedScale()의 수행결과를 반환합니다.', function() {
            var baseValues = [10, 20, 30, 40];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var options = {
                stackType: chartConst.PERCENT_STACK_TYPE
            };
            var actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);
            var expected = scaleDataMaker._getPercentStackedScale(baseValues, baseSize);

            expect(actual).toBe(expected);
        });

        it('If there isn\'t percent stack chart then calculate as coordinate scale', function() {
            var baseValues = [10, 20, 30, 40];
            var baseSize = 400;
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual, expected;

            actual = scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, {});

            expected = {
                limit: {
                    max: 40,
                    min: 10
                },
                step: 5,
                stepCount: 6
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_getFormatFunctions()', function() {
        it('get format functions, when is percent stacked chart', function() {
            var chartType = 'bar';
            var stackType = 'percent';
            var actual, expected;

            scaleDataMaker.chartType = chartConst.CHART_TYPE_BAR;
            scaleDataMaker.stackType = chartConst.PERCENT_STACK_TYPE;
            actual = scaleDataMaker._getFormatFunctions(chartType, stackType);
            expected = '10%';

            expect(actual[0](10)).toBe(expected);
        });

        it('get format functions, when is not percent stacked chart', function() {
            var chartType = chartConst.CHART_TYPE_LINE;
            var stackType = '';
            var formatFunctions = 'formatFunctions';
            var actual;

            actual = scaleDataMaker._getFormatFunctions(chartType, stackType, formatFunctions);

            expect(actual).toBe('formatFunctions');
        });
    });

    describe('_createScaleValues()', function() {
        it('create scale values, when is diverging chart', function() {
            var scaleData = {
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            };
            var chartType = chartConst.CHART_TYPE_BAR;
            var diverging = true;
            var actual = scaleDataMaker._createScaleValues(scaleData, chartType, diverging);
            var expected = [50, 25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });

        it('create scale values, when is not diverging chart', function() {
            var scaleData = {
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            };
            var chartType = chartConst.CHART_TYPE_LINE;
            var diverging = false;
            var actual = scaleDataMaker._createScaleValues(scaleData, chartType, diverging);
            var expected = [-50, -25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });
    });

    describe('createFormattedLabels()', function() {
        it('create formatted scale values, when axis type is datetime', function() {
            var scaleData = {};
            var typeMap = {};
            var options = {
                type: chartConst.AXIS_TYPE_DATETIME,
                dateFormat: 'YYYY.MM'
            };
            var actual;

            spyOn(scaleDataMaker, '_createScaleValues').and.returnValue([
                (new Date('01/01/2016')),
                (new Date('04/01/2016')),
                (new Date('08/01/2016'))
            ]);

            actual = scaleDataMaker.createFormattedLabels(scaleData, typeMap, options);

            expect(actual).toEqual([
                '2016.01',
                '2016.04',
                '2016.08'
            ]);
        });

        it('create formatted scale values, when axis type is not datetime', function() {
            var scaleData = {};
            var typeMap = {
                chartType: chartConst.CHART_TYPE_LINE
            };
            var options = {};
            var formatFunctions = [
                function(value) {
                    return 'formatted:' + value;
                }
            ];
            var actual;

            spyOn(scaleDataMaker, '_createScaleValues').and.returnValue([10, 20, 30]);

            actual = scaleDataMaker.createFormattedLabels(scaleData, typeMap, options, formatFunctions);

            expect(actual).toEqual([
                'formatted:10',
                'formatted:20',
                'formatted:30'
            ]);
        });
    });
});
