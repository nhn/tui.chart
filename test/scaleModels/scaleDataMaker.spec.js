/**
 * @fileoverview Test for ScaleDataMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ScaleDataMaker = require('../../src/js/models/scale/scaleDataMaker.js');
var chartConst = require('../../src/js/const');
var DataProcessor = require('../../src/js/models/data/dataProcessor.js');
var SeriesDataModel = require('../../src/js/models/data/seriesDataModel');

describe('Test for ScaleDataMaker', function() {
    var scaleDataMaker, boundsMaker;

    beforeEach(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['calculateSeriesHeight', 'calculateSeriesWidth']);
        scaleDataMaker = new ScaleDataMaker({
            dataProcessor: new DataProcessor([], '', {}),
            boundsMaker: boundsMaker
        });
    });

    describe('_getFormatFunctions()', function() {
        it('유효한 percent stack 차트의 경우 %로 formatting 가능한 함수를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_isPercentStackChart').and.returnValue(true);

            actual = scaleDataMaker._getFormatFunctions();
            expected = '10%';

            expect(actual[0](10)).toBe(expected);
        });

        it('유효한 percent stack 차트가 아닌경우 dataProcessor에서 getFormatFunctions를 호출하여 formatting 가능한 함수를 얻어 반환합니다.', function() {
            var actual;

            spyOn(scaleDataMaker, '_isPercentStackChart').and.returnValue(false);
            spyOn(scaleDataMaker.dataProcessor, 'getFormatFunctions').and.returnValue('formatFunctions');

            actual = scaleDataMaker._getFormatFunctions();

            expect(scaleDataMaker.dataProcessor.getFormatFunctions).toHaveBeenCalled();
            expect(actual).toBe('formatFunctions');
        });
    });

    describe('_getScaleValues()', function() {
        it('range정보에서 values를 계산하여 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_getScale').and.returnValue({
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            });
            actual = scaleDataMaker._getScaleValues();
            expected = [-50, -25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });

        it('diverging 옵션이 있으면 음수를 양수로 변환하여 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_getScale').and.returnValue({
                limit: {
                    min: -50,
                    max: 50
                },
                step: 25
            });
            scaleDataMaker.chartType = chartConst.CHART_TYPE_BAR;
            scaleDataMaker.diverging = true;
            actual = scaleDataMaker._getScaleValues();
            expected = [50, 25, 0, 25, 50];

            expect(actual).toEqual(expected);
        });
    });

    describe('getFormattedScaleValues()', function() {
        it('get formatted scale values, when axis type is datetime', function() {
            var actual;

            spyOn(scaleDataMaker, '_getScaleValues').and.returnValue([
                (new Date('01/01/2016')),
                (new Date('04/01/2016')),
                (new Date('08/01/2016'))
            ]);
            scaleDataMaker.type = chartConst.AXIS_TYPE_DATETIME;
            scaleDataMaker.dateFormat = 'YYYY.MM';

            actual = scaleDataMaker.getFormattedScaleValues();

            expect(actual).toEqual([
                '2016.01',
                '2016.04',
                '2016.08'
            ]);
        });

        it('get formatted scale values, when axis type is not datetime', function() {
            var actual;

            spyOn(scaleDataMaker, '_getScaleValues').and.returnValue([10, 20, 30]);
            spyOn(scaleDataMaker, '_getFormatFunctions').and.returnValue([
                function(value) {
                    return 'formatted:' + value;
                }
            ]);

            actual = scaleDataMaker.getFormattedScaleValues();

            expect(actual).toEqual([
                'formatted:10',
                'formatted:20',
                'formatted:30'
            ]);
        });

        it('get cached formatted scale values, when has cached formatted values', function() {
            var actual;

            scaleDataMaker.formattedValues = [
                'cached:10',
                'cached:20',
                'cached:30'
            ];

            actual = scaleDataMaker.getFormattedScaleValues();

            expect(actual).toEqual([
                'cached:10',
                'cached:20',
                'cached:30'
            ]);
        });
    });

    describe('_makeBaseValuesForNormalStackedChart()', function() {
        it('normal stack 차트의 baes values를 생성합니다.', function() {
            var seriesGroup, actual, expected;

            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                bar: new SeriesDataModel()
            };
            seriesGroup = jasmine.createSpyObj('seriesGroup', ['_makeValuesMapPerStack']);
            seriesGroup._makeValuesMapPerStack.and.returnValue({
                st1: [-10, 30, -50],
                st2: [-20, 40, 60]
            });
            scaleDataMaker.dataProcessor.seriesDataModelMap.bar.groups = [
                seriesGroup
            ];
            scaleDataMaker.chartType = chartConst.CHART_TYPE_BAR;

            actual = scaleDataMaker._makeBaseValuesForNormalStackedChart();
            expected = [30, -60, 100, -20];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBaseValues()', function() {
        it('Make base values for making axis scale.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                bar: new SeriesDataModel()
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.bar.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            scaleDataMaker.chartType = chartConst.CHART_TYPE_BAR;

            actual = scaleDataMaker._makeBaseValues();
            expected = [70, 10, 20, 20, 80, 30];

            expect(actual).toEqual(expected);
        });

        it('Make base values, when single yAxis in comboChart.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };

            scaleDataMaker.isSingleYAxis = true;
            scaleDataMaker.chartType = chartConst.CHART_TYPE_COLUMN;

            actual = scaleDataMaker._makeBaseValues();
            expected = [70, 10, 20, 20, 80, 30, 1, 2, 3];

            expect(actual).toEqual(expected);
        });

        it('Make base values, when single yAxis and has stackType option in comboChart.', function() {
            var seriesGroup, actual, expected;

            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            seriesGroup = jasmine.createSpyObj('seriesGroup', ['_makeValuesMapPerStack']);
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.groups = [
                seriesGroup
            ];
            seriesGroup._makeValuesMapPerStack.and.returnValue({
                st1: [70, 10, 20, 20, 80, 30],
            });
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };

            scaleDataMaker.isSingleYAxis = true;
            scaleDataMaker.stackType = chartConst.NORMAL_STACK_TYPE;
            scaleDataMaker.chartType = chartConst.CHART_TYPE_COLUMN;

            actual = scaleDataMaker._makeBaseValues();
            expected = [70, 10, 20, 20, 80, 30, 1, 2, 3, 230, 0];

            expect(actual).toEqual(expected);
        });

        it('Make base values, when stackType is normal.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_makeBaseValuesForNormalStackedChart').and.returnValue([
                80, -10, 20, -30, 80, -40
            ]);

            scaleDataMaker.chartType = chartConst.CHART_TYPE_COLUMN;
            scaleDataMaker.stackType = 'normal';
            actual = scaleDataMaker._makeBaseValues();
            expected = [80, -10, 20, -30, 80, -40];

            expect(actual).toEqual(expected);
        });

        it('Make base values by calling dataProcessor.getValues without arguments, when chartType is map.', function() {
            spyOn(scaleDataMaker.dataProcessor, 'getValues');

            scaleDataMaker.chartType = chartConst.CHART_TYPE_MAP;
            scaleDataMaker._makeBaseValues();

            expect(scaleDataMaker.dataProcessor.getValues).toHaveBeenCalledWith();
        });

        it('Make base values by calling dataProcessor.getValues with arguments(chartType, valueType),' +
            ' when chartType is treemap.', function() {
            spyOn(scaleDataMaker.dataProcessor, 'getValues');

            scaleDataMaker.chartType = chartConst.CHART_TYPE_TREEMAP;
            scaleDataMaker._makeBaseValues();

            expect(scaleDataMaker.dataProcessor.getValues).toHaveBeenCalledWith(chartConst.CHART_TYPE_TREEMAP, 'colorValue');
        });
    });

    describe('_getBaseSize()', function() {
        it('x축일 경우에는 series width를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            boundsMaker.calculateSeriesWidth.and.returnValue(400);

            actual = scaleDataMaker._getBaseSize();
            expected = 400;

            expect(actual).toBe(expected);
        });

        it('y축일 경우에는 series height를 기본 사이즈로 반환합니다.', function() {
            var actual, expected;

            boundsMaker.calculateSeriesHeight.and.returnValue(300);

            scaleDataMaker.isVertical = true;
            actual = scaleDataMaker._getBaseSize();
            expected = 300;

            expect(actual).toBe(expected);
        });
    });

    describe('_getCandidateCountsOfValue()', function() {
        it('너비가 320일 경우에는 320을 40과 60으로 나눈 값인 5와 8 사이의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            boundsMaker.calculateSeriesWidth.and.returnValue(320);

            actual = scaleDataMaker._getCandidateCountsOfValue();
            expected = [4, 5, 6, 7];

            expect(actual).toEqual(expected);
        });

        it('너비가 450일 경우에는 450을 40과 60으로 나눈 값인 7과 11 사이의의 후보 value count 정보를 반환합니다.', function() {
            var actual, expected;

            boundsMaker.calculateSeriesWidth.and.returnValue(450);

            actual = scaleDataMaker._getCandidateCountsOfValue();
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
                    options: {},
                    divisionNumber: 1
                };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수 경우에는 정수 변환 작업된 결과값을 반환합니다.', function() {
            var actual = scaleDataMaker._makeIntegerTypeScale({
                    min: 0.1,
                    max: 0.9
                }),
                expected = {
                    limit: {
                        min: 1,
                        max: 9
                    },
                    options: {},
                    divisionNumber: 10
                };

            expect(actual).toEqual(expected);
        });

        it('min, max가 소수이고 옵션이 있을 경우에는 옵션값 까지 변환 작업된 결과값을 반환합니다.', function() {
            var actual, expected;

            scaleDataMaker.limitOption = {
                min: 0.2,
                max: 0.8
            };
            actual = scaleDataMaker._makeIntegerTypeScale({
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
            var actual = scaleDataMaker._normalizeLimit({
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

            scaleDataMaker.chartType = 'line';

            actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step);
            expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin 모두 음수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var min = -10,
                dataMin = -10,
                step = 20,
                actual, expected;

            actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step);
            expected = -30;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 min값을 그대로 반환합니다.', function() {
            var min = -10,
                dataMin = -10,
                step = 20,
                optionMin = 0,
                actual, expected;

            actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step, optionMin);
            expected = -10;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var min = -10,
                dataMin = -8,
                step = 20,
                actual, expected;

            actual = scaleDataMaker._decreaseMinByStep(min, dataMin, step);
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

            scaleDataMaker.chartType = 'line';

            actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step);
            expected = 10;

            expect(actual).toEqual(expected);
        });

        it('max와 dataMax 모두 양수이면서 옵션이없고 min과 dataMin이 같으면 min을 한 step 만큼 감소시켜 반환합니다.', function() {
            var max = 90,
                dataMax = 90,
                step = 20,
                actual, expected;

            actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step);
            expected = 110;

            expect(actual).toEqual(expected);
        });

        it('옵션(optionMin)이 있으면 max값을 그대로 반환합니다.', function() {
            var max = 90,
                dataMax = 90,
                step = 20,
                optionMax = 80,
                actual, expected;

            actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step, optionMax);
            expected = 90;

            expect(actual).toEqual(expected);
        });

        it('min과 dataMin이 다르면 min값을 그대로 반환합니다.', function() {
            var max = 90,
                dataMax = 85,
                step = 20,
                actual, expected;

            actual = scaleDataMaker._increaseMaxByStep(max, dataMax, step);
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
                },
                baseLimit = scaleDataMaker._makeBaseLimit(dataLimit, {}),
                valueCount = 4,
                actual = scaleDataMaker._makeCandidateScale(baseLimit, dataLimit, valueCount, {});

            expect(actual).toEqual({
                limit: {
                    min: 0,
                    max: 100
                },
                step: 25,
                valueCount: 4
            });
        });
    });

    describe('_makeCandidateScales()', function() {
        it('tickCounts정보에 해당하는 tick info 후보군을 계산하여 반환합니다.', function() {
            var actual = scaleDataMaker._makeCandidateScales({
                    limit: {
                        min: 10,
                        max: 100
                    },
                    options: {}
                }, [3, 4]),
                expected = [
                    {
                        limit: {min: 0, max: 200},
                        step: 100,
                        valueCount: 2
                    },
                    {
                        limit: {min: 0, max: 150},
                        step: 50,
                        valueCount: 3
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
                    valueCount: 4
                }, 0),
                expected = 20;

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
                        valueCount: 4
                    },
                    {
                        limit: {min: 0, max: 100},
                        step: 25,
                        valueCount: 4
                    }
                ], [3, 4]),
                expected = {
                    limit: {min: 0, max: 100},
                    step: 25,
                    valueCount: 4
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
            var actual, expected;

            boundsMaker.calculateSeriesWidth.and.returnValue(400);
            spyOn(scaleDataMaker, '_makeBaseValues').and.returnValue([10, 20, 40, 90]);

            actual = scaleDataMaker._calculateScale();
            expected = {
                limit: {min: 0, max: 100},
                step: 20,
                valueCount: 5
            };

            expect(actual).toEqual(expected);
        });

        it('calculate scale, when axis type is datetime', function() {
            var actual, expected;

            boundsMaker.calculateSeriesWidth.and.returnValue(400);
            spyOn(scaleDataMaker, '_makeBaseValues').and.returnValue([
                (new Date('01/01/2016')).getTime(),
                (new Date('01/03/2016')).getTime(),
                (new Date('01/06/2016')).getTime(),
                (new Date('01/10/2016')).getTime()
            ]);
            scaleDataMaker.type = chartConst.AXIS_TYPE_DATETIME;

            actual = scaleDataMaker._calculateScale();
            expected = {
                limit: {
                    min: (new Date('01/01/2016')).getTime(),
                    max: (new Date('01/11/2016')).getTime()
                },
                step: scaleDataMaker.millisecondMap.date * 2,
                valueCount: 5
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_getValuesForSum()', function() {
        it('axis가 하나 있을 경우에는 chartType을 전달하지 않은 getValues()의 결과를 반환합니다.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };
            scaleDataMaker.isSingleYAxis = true;
            scaleDataMaker.chartType = 'column';

            actual = scaleDataMaker._getValuesForSum();
            expected = scaleDataMaker.dataProcessor.getValues();

            expect(actual).toEqual(expected);
        });

        it('axis가 두개 있을 경우에는 chartType을 전달한 getValues() 결과를 반환합니다.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };

            scaleDataMaker.chartType = 'column';
            actual = scaleDataMaker._getValuesForSum();
            expected = scaleDataMaker.dataProcessor.getValues('column');

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateMinusSum()', function() {
        it('values의 음수값의 합을 계산하여 반환합니다.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [-70, 10, -20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, -3]
            };

            scaleDataMaker.isSingleYAxis = true;
            actual = scaleDataMaker._calculateMinusSum();
            expected = -93;

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculatePlusSum()', function() {
        it('values의 양수값의 합을 계산합니다.', function() {
            var actual, expected;

            scaleDataMaker.dataProcessor.seriesNames = ['column', 'line'];
            scaleDataMaker.dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [-70, 10, -20, 20, 80, 30]
            };
            scaleDataMaker.dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, -3]
            };

            scaleDataMaker.isSingleYAxis = true;
            actual = scaleDataMaker._calculatePlusSum();
            expected = 143;

            expect(actual).toEqual(expected);
        });
    });

    describe('_getPercentStackedScale()', function() {
        it('음수의 합이 0일 경우에는 chartConst.PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_calculateMinusSum').and.returnValue(0);

            actual = scaleDataMaker._getPercentStackedScale();
            expected = chartConst.PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('양수의 합이 0일 경우에는 chartConst.MINUS_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_calculateMinusSum').and.returnValue(-100);
            spyOn(scaleDataMaker, '_calculatePlusSum').and.returnValue(0);

            actual = scaleDataMaker._getPercentStackedScale();
            expected = chartConst.MINUS_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 있을 경우에는 chartConst.DIVERGING_PERCENT_STACKED_AXIS_RANGE를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_calculateMinusSum').and.returnValue(-100);
            spyOn(scaleDataMaker, '_calculatePlusSum').and.returnValue(100);
            scaleDataMaker.chartType = 'bar';
            scaleDataMaker.diverging = true;

            actual = scaleDataMaker._getPercentStackedScale();
            expected = chartConst.DIVERGING_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });

        it('음수의 합과 양수의 합 모두 0이 아니면서 diverging 옵션이 없을 경우에는 chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_calculateMinusSum').and.returnValue(-100);
            spyOn(scaleDataMaker, '_calculatePlusSum').and.returnValue(100);

            actual = scaleDataMaker._getPercentStackedScale();
            expected = chartConst.DUAL_PERCENT_STACKED_AXIS_SCALE;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeScale()', function() {
        it('유효한 percent stack 차트일 경우에는 _getPercentStackedScale()의 수행결과를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_isPercentStackChart').and.returnValue(true);
            spyOn(scaleDataMaker, '_calculateMinusSum').and.returnValue(0);

            actual = scaleDataMaker._makeScale();
            expected = scaleDataMaker._getPercentStackedScale();

            expect(actual).toBe(expected);
        });

        it('유효한 percent stack 차트가 아닌 경우에는 _calculateScale()의 수행결과를 반환합니다.', function() {
            var actual, expected;

            spyOn(scaleDataMaker, '_isPercentStackChart').and.returnValue(false);
            boundsMaker.calculateSeriesWidth.and.returnValue(400);
            spyOn(scaleDataMaker, '_makeBaseValues').and.returnValue([10, 20, 40, 90]);

            actual = scaleDataMaker._makeScale();
            expected = scaleDataMaker._calculateScale();

            expect(actual).toEqual(expected);
        });
    });
});
