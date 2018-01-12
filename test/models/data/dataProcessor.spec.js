/**
 * @fileoverview Test for DataProcessor.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('../../../src/js/models/data/dataProcessor.js');
var chartConst = require('../../../src/js/const');
var SeriesDataModel = require('../../../src/js/models/data/seriesDataModel');
var SeriesGroup = require('../../../src/js/models/data/seriesGroup');

describe('Test for DataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new DataProcessor({}, '', {});
    });

    describe('_filterSeriesDataByIndexRange()', function() {
        it('filter seriesData by index range', function() {
            var seriesData = [
                {
                    data: [1, 2, 3, 4, 5]
                },
                {
                    data: [11, 12, 13, 14, 15]
                }
            ];
            var actual = dataProcessor._filterSeriesDataByIndexRange(seriesData, 1, 3);
            var expected = [
                {
                    data: [2, 3, 4]
                },
                {
                    data: [12, 13, 14]
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_filterRawDataByIndexRange()', function() {
        it('filter raw data(category and series) by index range, when single chart', function() {
            var rawData = {
                categories: ['cate1', 'cate2', 'cate3', 'cate4', 'cate5'],
                series: {
                    line: [
                        {
                            data: [1, 2, 3, 4, 5]
                        },
                        {
                            data: [11, 12, 13, 14, 15]
                        }
                    ]
                }
            };
            var actual = dataProcessor._filterRawDataByIndexRange(rawData, [1, 3]);
            var expected = {
                categories: ['cate2', 'cate3', 'cate4'],
                series: {
                    line: [
                        {
                            data: [2, 3, 4]
                        },
                        {
                            data: [12, 13, 14]
                        }
                    ]
                }
            };

            expect(actual).toEqual(expected);
        });

        it('filter raw data(category and series) by index range, when combo chart', function() {
            var rawData = {
                categories: ['cate1', 'cate2', 'cate3', 'cate4', 'cate5'],
                series: {
                    line: [
                        {
                            data: [1, 2, 3, 4, 5]
                        }
                    ],
                    area: [
                        {
                            data: [11, 12, 13, 14, 15]
                        }
                    ]
                }
            };
            var actual = dataProcessor._filterRawDataByIndexRange(rawData, [1, 3]);
            var expected = {
                categories: ['cate2', 'cate3', 'cate4'],
                series: {
                    line: [
                        {
                            data: [2, 3, 4]
                        }
                    ],
                    area: [
                        {
                            data: [12, 13, 14]
                        }
                    ]
                }
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_escapeCategories()', function() {
        it('카테고리에 대해 escaping 처리를 합니다.', function() {
            var actual = dataProcessor._escapeCategories(['<div>ABC</div>', 'EFG']);
            var expected = ['&lt;div&gt;ABC&lt;/div&gt;', 'EFG'];

            expect(actual).toEqual(expected);
        });

        it('숫자형인 경우, 문자형으로 변환하여 처리 합니다.', function() {
            var actual = dataProcessor._escapeCategories([1, 2]);
            var expected = ['1', '2'];

            expect(actual).toEqual(expected);
        });
    });

    describe('_mapCategories()', function() {
        it('if x axis is datetime type, return excaped categories', function() {
            var actual;

            dataProcessor.options = {
                xAxis: {
                    type: chartConst.AXIS_TYPE_DATETIME
                }
            };

            actual = dataProcessor._mapCategories([
                '01/02/2016',
                '01/04/2016',
                '01/07/2016'
            ], 'x');

            expect(actual).toEqual([
                new Date('01/02/2016').getTime(),
                new Date('01/04/2016').getTime(),
                new Date('01/07/2016').getTime()
            ]);
        });

        it('if x axis is not datetime type, return escaped categories', function() {
            var actual;

            dataProcessor.options = {
                xAxis: {}
            };

            actual = dataProcessor._mapCategories(['<div>ABC</div>', 'EFG']);

            expect(actual).toEqual(['&lt;div&gt;ABC&lt;/div&gt;', 'EFG']);
        });
    });

    describe('_processCategories()', function() {
        it('rawData.categories가 배열 형태이면 전달받은 type을 키로하는 map으로 생성하여 반환합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: ['cate1', 'cate2', 'cate3']
            };
            dataProcessor.options.xAxis = {};

            actual = dataProcessor._processCategories('y');

            expect(actual).toEqual({
                y: ['cate1', 'cate2', 'cate3']
            });
        });

        it('rawData.categories가 객체 형태이면 y값에 대해 역순으로 정렬하여 반환합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: {
                    x: ['ABC', 'EFG'],
                    y: [1, 2]
                }
            };
            dataProcessor.options.xAxis = {};

            actual = dataProcessor._processCategories();

            expect(actual.y).toEqual(['2', '1']);
        });

        it('rawData.categories가 객체 형태이면서 x, y이외의 key값을 갖고 있다면 무시합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: {
                    z: ['ABC', 'EFG']
                }
            };

            actual = dataProcessor._processCategories();

            expect(actual.z).toBeUndefined();
        });

        it('rawData.categories가 없다면 빈 객체를 반환합니다.', function() {
            var actual;

            dataProcessor.rawData = {};

            actual = dataProcessor._processCategories();

            expect(actual).toEqual({});
        });
    });

    describe('getCategories()', function() {
        it('캐싱된 categoriesMap이 없는 세로형 카테고리의 경우 y를 key로하는 categories map을 캐싱합니다.', function() {
            var isVertical = true;

            dataProcessor.rawData = {
                categories: ['cate1', 'cate2', 'cate3']
            };
            dataProcessor.options.xAxis = {};

            dataProcessor.getCategories(isVertical);

            expect(dataProcessor.categoriesMap.y).toEqual(['cate1', 'cate2', 'cate3']);
            expect(dataProcessor.categoriesMap.x).toBeUndefined();
        });

        it('캐싱된 categoriesMap이 없는 가로형 카테고리의 경우 x를 key로하는 categories map을 캐싱합니다.', function() {
            var isVertical = false;

            dataProcessor.rawData = {
                categories: ['cate1', 'cate2', 'cate3']
            };
            dataProcessor.options.xAxis = {};

            dataProcessor.getCategories(isVertical);

            expect(dataProcessor.categoriesMap.x).toEqual(['cate1', 'cate2', 'cate3']);
            expect(dataProcessor.categoriesMap.y).toBeUndefined();
        });

        it('세로형 카테고리의 경우 캐싱된 categorieMap에서 y에 해당하는 categories를 반환합니다.', function() {
            var isVertical = true;
            var actual;

            dataProcessor.categoriesMap = {
                y: ['cate1', 'cate2', 'cate3']
            };

            actual = dataProcessor.getCategories(isVertical);

            expect(actual).toEqual(['cate1', 'cate2', 'cate3']);
        });

        it('가로형 카테고리의 경우 x를 key로하여 categories map을 생성하고 categories를 반환합니다.', function() {
            var isVertical = false;
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3']
            };

            actual = dataProcessor.getCategories(isVertical);

            expect(actual).toEqual(['cate1', 'cate2', 'cate3']);
        });

        it('isVertical 값이 없다면 categoriesMap에서 한가지 카테고리를 추출하여 반환합니다(hasCategories에서 존재 여부 체크에 사용).', function() {
            var actual;

            dataProcessor.categoriesMap = {
                y: ['cate1', 'cate2', 'cate3']
            };

            actual = dataProcessor.getCategories();

            expect(actual).toEqual(['cate1', 'cate2', 'cate3']);
        });
    });

    describe('findCategoryIndex()', function() {
        it('find category index by category value', function() {
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3']
            };

            actual = dataProcessor.findCategoryIndex('cate2');

            expect(actual).toBe(1);
        });

        it('if not found category index, returns null', function() {
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3']
            };

            actual = dataProcessor.findCategoryIndex('cate4');

            expect(actual).toBeNull();
        });
    });

    describe('makeTooltipCategory()', function() {
        it('가로형 차트의 경우 세로형 카테고리를 기본 값으로 합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: ['cate1', 'cate2', 'cate3']
            };
            dataProcessor.options.xAxis = {};

            actual = dataProcessor.makeTooltipCategory(0, null, false);

            expect(dataProcessor.categoriesMap.y).toEqual(['cate1', 'cate2', 'cate3']);
            expect(actual).toBe('cate1');
        });

        it('세로형 차트의 경우 가로형 카테고리를 기본 값으로 합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: ['cate1', 'cate2', 'cate3']
            };
            dataProcessor.options.xAxis = {};

            actual = dataProcessor.makeTooltipCategory(0, null, true);

            expect(dataProcessor.categoriesMap.x).toEqual(['cate1', 'cate2', 'cate3']);
            expect(actual).toBe('cate1');
        });

        it('세로형 차트의 경우 세로형 카테고리도 존재하면 가로형 카테고리와 ","연결하여 반환합니다.', function() {
            var actual;

            dataProcessor.rawData = {
                categories: {
                    x: ['cate1', 'cate2', 'cate3'],
                    y: [1, 2, 3]
                }
            };
            dataProcessor.options.xAxis = {};

            actual = dataProcessor.makeTooltipCategory(0, 2, true);

            expect(dataProcessor.categoriesMap.x).toEqual(['cate1', 'cate2', 'cate3']);
            expect(actual).toBe('cate1, 3');
        });

        describe('category type is datetime', function() {
            it('should return categories formatted by xAxis.dateFormat, when xAxis.type is datetime and vertical chart type', function() {
                var actual;

                dataProcessor.rawData = {
                    categories: ['12/01/2017', '01/01/2017', '02/01/2018']
                };
                dataProcessor.options = {
                    xAxis: {},
                    yAxis: {
                        type: 'datetime',
                        dateFormat: 'YYYY-MM'
                    }
                };
                actual = dataProcessor.makeTooltipCategory(2, null, false);
                expect(dataProcessor.categoriesMap.y).toEqual([
                    new Date('12/01/2017').getTime(),
                    new Date('01/01/2017').getTime(),
                    new Date('02/01/2018').getTime()
                ]);
                expect(actual).toBe('2018-02');
            });

            it('should return categories formatted by xAxis.dateFormat, when yAxis.type is datetime and horizontal chart type', function() {
                var actual;

                dataProcessor.rawData = {
                    categories: ['12/01/2017', '01/01/2017', '02/01/2018']
                };
                dataProcessor.options = {
                    xAxis: {
                        type: 'datetime',
                        dateFormat: 'YYYY-MM'
                    },
                    yAxis: {}
                };
                actual = dataProcessor.makeTooltipCategory(2, null, true);

                expect(dataProcessor.categoriesMap.x).toEqual([new Date('12/01/2017').getTime(), new Date('01/01/2017').getTime(), new Date('02/01/2018').getTime()]);
                expect(actual).toBe('2018-02');
            });

            it('should return categories formatted by tooltip.dateFormat, when tooltip.type is datetime', function() {
                var actual;

                dataProcessor.rawData = {
                    categories: ['12/01/2017', '01/01/2017', '02/01/2018']
                };
                dataProcessor.options = {
                    xAxis: {},
                    yAxis: {
                        type: 'datetime',
                        dateFormat: 'YYYY-MM'
                    },
                    tooltip: {
                        type: 'datetime',
                        dateFormat: 'MM'
                    }
                };
                actual = dataProcessor.makeTooltipCategory(2, null, false);

                expect(dataProcessor.categoriesMap.y).toEqual([
                    new Date('12/01/2017').getTime(),
                    new Date('01/01/2017').getTime(),
                    new Date('02/01/2018').getTime()
                ]);
                expect(actual).toBe('02');
            });
        });
    });

    describe('_pushCategory', function() {
        it('전달된 category를 rawData와 originalRawData의 categories에 추가합니다.', function() {
            dataProcessor.rawData.categories = ['cate1', 'cate2'];
            dataProcessor.originalRawData.categories = ['cate1', 'cate2'];

            dataProcessor._pushCategory('new cate');

            expect(dataProcessor.rawData.categories).toEqual(['cate1', 'cate2', 'new cate']);
            expect(dataProcessor.originalRawData.categories).toEqual(['cate1', 'cate2', 'new cate']);
        });
    });

    describe('_shiftCategory', function() {
        it('rawData와 originalRawData의 categories에서 첫번째 요소를 삭제합니다.', function() {
            dataProcessor.rawData.categories = ['cate1', 'cate2', 'cate3'];
            dataProcessor.originalRawData.categories = ['cate1', 'cate2', 'cate3'];

            dataProcessor._shiftCategory();

            expect(dataProcessor.rawData.categories).toEqual(['cate2', 'cate3']);
            expect(dataProcessor.originalRawData.categories).toEqual(['cate2', 'cate3']);
        });
    });

    describe('_findRawSeriesDatumByName()', function() {
        it('find raw series datum by legend name, when single chart', function() {
            var actual;

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    },
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            actual = dataProcessor._findRawSeriesDatumByName('legend2', 'line');

            expect(actual).toEqual({
                name: 'legend2',
                data: [3, 4]
            });
        });

        it('find raw series datum by legend name, when combo chart', function() {
            var actual;

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ],
                area: [
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            actual = dataProcessor._findRawSeriesDatumByName('legend2', 'area');

            expect(actual).toEqual({
                name: 'legend2',
                data: [3, 4]
            });
        });

        it('if not found data, returns null', function() {
            var actual;

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ],
                area: [
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            actual = dataProcessor._findRawSeriesDatumByName('legend2', 'line');

            expect(actual).toBeNull();
        });
    });

    describe('_pushValue()', function() {
        it('push value to data property of series', function() {
            var originalRawSeriesDatum = {
                name: 'legend1',
                data: [1, 2]
            };

            var value = 5;

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ]
            };

            dataProcessor._pushValue(originalRawSeriesDatum, value, 'line');

            expect(originalRawSeriesDatum.data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([1, 2, 5]);
        });

        it('push value to data property of series, when combo chart', function() {
            var originalRawSeriesDatum = {
                name: 'legend1',
                data: [1, 2]
            };
            var value = 5;

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ],
                area: [
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            dataProcessor._pushValue(originalRawSeriesDatum, value, 'line');

            expect(originalRawSeriesDatum.data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.area[0].data).toEqual([3, 4]);
        });
    });

    describe('_pushValues()', function() {
        it('push values to series of originalRawData and series of rawData', function() {
            var originalRawSeriesData = [
                {
                    name: 'legend1',
                    data: [1, 2]
                },
                {
                    name: 'legend2',
                    data: [3, 4]
                }
            ];
            var values = [5, 6];

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ]
            };

            dataProcessor._pushValues(originalRawSeriesData, values, 'line');

            expect(originalRawSeriesData[0].data).toEqual([1, 2, 5]);
            expect(originalRawSeriesData[1].data).toEqual([3, 4, 6]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([1, 2, 5]);
        });

        it('push values to series of originalRawData and series of rawData, when combo chart', function() {
            var originalRawSeriesData = [
                {
                    name: 'legend1',
                    data: [1, 2]
                }
            ];
            var values = [5];

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    }
                ],
                area: [
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            dataProcessor._pushValues(originalRawSeriesData, values, 'line');

            expect(originalRawSeriesData[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.area[0].data).toEqual([3, 4]);
        });
    });

    describe('_pushSeriesData()', function() {
        it('rawData와 originalRawData의 series배열 각 항목의 data요소에 전달된 values를 순서에 맞춰 추가합니다.', function() {
            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    },
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };
            dataProcessor.originalRawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    },
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            dataProcessor.chartType = 'line';
            dataProcessor._pushSeriesData([5, 6]);

            expect(dataProcessor.rawData.series.line[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.rawData.series.line[1].data).toEqual([3, 4, 6]);
            expect(dataProcessor.originalRawData.series.line[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.originalRawData.series.line[1].data).toEqual([3, 4, 6]);
        });

        it('rawData에 선택된 legend만 남은 경우 originalRawData name 기준으로 value를 설정합니다.', function() {
            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };
            dataProcessor.originalRawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2]
                    },
                    {
                        name: 'legend2',
                        data: [3, 4]
                    }
                ]
            };

            dataProcessor.chartType = 'line';
            dataProcessor._pushSeriesData([5, 6]);

            expect(dataProcessor.rawData.series.line[0].data).toEqual([3, 4, 6]);
            expect(dataProcessor.originalRawData.series.line[0].data).toEqual([1, 2, 5]);
            expect(dataProcessor.originalRawData.series.line[1].data).toEqual([3, 4, 6]);
        });
    });

    describe('_shiftValues()', function() {
        it('shift value of series data, when single chart', function() {
            var originalRawSeriesData = [
                {
                    name: 'legend1',
                    data: [1, 2, 3]
                },
                {
                    name: 'legend2',
                    data: [4, 5, 6]
                }
            ];

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2, 3]
                    },
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };

            dataProcessor._shiftValues(originalRawSeriesData, 'line');

            expect(originalRawSeriesData[0].data).toEqual([2, 3]);
            expect(originalRawSeriesData[1].data).toEqual([5, 6]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([2, 3]);
            expect(dataProcessor.rawData.series.line[1].data).toEqual([5, 6]);
        });

        it('shift value of series data, when combo chart', function() {
            var originalRawSeriesData = [
                {
                    name: 'legend1',
                    data: [1, 2, 3]
                }
            ];

            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2, 3]
                    }
                ],
                area: [
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };

            dataProcessor._shiftValues(originalRawSeriesData, 'line');

            expect(originalRawSeriesData[0].data).toEqual([2, 3]);
            expect(dataProcessor.rawData.series.line[0].data).toEqual([2, 3]);
            expect(dataProcessor.rawData.series.area[0].data).toEqual([4, 5, 6]);
        });
    });

    describe('_shiftSeriesData', function() {
        it('rawData와 originalRawData의 series배열 각 항목의 data요소 첫번째 항목을 삭제합니다.', function() {
            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2, 3]
                    },
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };
            dataProcessor.originalRawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2, 3]
                    },
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };

            dataProcessor._shiftSeriesData();

            expect(dataProcessor.rawData.series.line[0].data).toEqual([2, 3]);
            expect(dataProcessor.rawData.series.line[1].data).toEqual([5, 6]);
            expect(dataProcessor.originalRawData.series.line[0].data).toEqual([2, 3]);
            expect(dataProcessor.originalRawData.series.line[1].data).toEqual([5, 6]);
        });

        it('rawData에 선택된 legend만 남은 경우 originalRawData name 기준으로 data요소 첫번째 항목을 삭제합니다.', function() {
            dataProcessor.rawData.series = {
                line: [
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };
            dataProcessor.originalRawData.series = {
                line: [
                    {
                        name: 'legend1',
                        data: [1, 2, 3]
                    },
                    {
                        name: 'legend2',
                        data: [4, 5, 6]
                    }
                ]
            };

            dataProcessor._shiftSeriesData();

            expect(dataProcessor.rawData.series.line[0].data).toEqual([5, 6]);
            expect(dataProcessor.originalRawData.series.line[0].data).toEqual([2, 3]);
            expect(dataProcessor.originalRawData.series.line[1].data).toEqual([5, 6]);
        });
    });

    describe('addDataFromDynamicData()', function() {
        it('Add data from dynamic data, when coordinate type', function() {
            var actual;

            dataProcessor.dynamicData = [
                {
                    values: {
                        'legend1': [10, 20]
                    }
                }
            ];

            spyOn(dataProcessor, 'isCoordinateType').and.returnValue(true);
            spyOn(dataProcessor, '_pushDynamicDataForCoordinateType');
            spyOn(dataProcessor, 'initData');

            actual = dataProcessor.addDataFromDynamicData();

            expect(dataProcessor._pushDynamicDataForCoordinateType).toHaveBeenCalledWith({
                'legend1': [10, 20]
            });
            expect(dataProcessor.initData).toHaveBeenCalled();
            expect(actual).toBe(true);
        });

        it('Add data from dynamic data, when not coordinate type', function() {
            var actual;

            dataProcessor.dynamicData = [
                {
                    category: 'cate',
                    values: [1, 2]
                }
            ];
            spyOn(dataProcessor, 'isCoordinateType').and.returnValue(false);
            spyOn(dataProcessor, '_pushDynamicData');
            spyOn(dataProcessor, 'initData');

            actual = dataProcessor.addDataFromDynamicData();

            expect(dataProcessor._pushDynamicData).toHaveBeenCalledWith({
                category: 'cate',
                values: [1, 2]
            });
            expect(dataProcessor.initData).toHaveBeenCalled();
            expect(actual).toBe(true);
        });

        it('if dynamicData is empty, returns false', function() {
            var actual;

            dataProcessor.dynamicData = [];
            spyOn(dataProcessor, '_pushDynamicDataForCoordinateType');
            spyOn(dataProcessor, '_pushDynamicData');
            spyOn(dataProcessor, 'initData');

            actual = dataProcessor.addDataFromDynamicData();

            expect(dataProcessor._pushDynamicDataForCoordinateType).not.toHaveBeenCalled();
            expect(dataProcessor._pushDynamicData).not.toHaveBeenCalled();
            expect(dataProcessor.initData).not.toHaveBeenCalled();
            expect(actual).toBe(false);
        });
    });

    describe('addDataFromRemainDynamicData', function() {
        it('남은 동적 데이터 모두 기존 data에 추가합니다.', function() {
            dataProcessor.dynamicData = [
                {
                    category: 'cate1',
                    values: [1, 2]
                },
                {
                    category: 'cate2',
                    values: [3, 4]
                }
            ];
            spyOn(dataProcessor, '_pushCategory');
            spyOn(dataProcessor, '_pushSeriesData');
            spyOn(dataProcessor, 'initData');

            dataProcessor.addDataFromRemainDynamicData();

            expect(dataProcessor._pushCategory).toHaveBeenCalledTimes(2);
            expect(dataProcessor._pushSeriesData).toHaveBeenCalledTimes(2);
            expect(dataProcessor.initData).toHaveBeenCalled();
            expect(dataProcessor.dynamicData.length).toBe(0);
        });

        it('shifting옵션이 있을 경우 기존 데이터의 첫 항목들을 제거합니다.', function() {
            var shiftingOption = true;

            dataProcessor.dynamicData = [
                {
                    category: 'cate1',
                    values: [1, 2]
                },
                {
                    category: 'cate2',
                    values: [3, 4]
                }
            ];
            spyOn(dataProcessor, '_pushCategory');
            spyOn(dataProcessor, '_pushSeriesData');
            spyOn(dataProcessor, '_shiftCategory');
            spyOn(dataProcessor, '_shiftSeriesData');
            spyOn(dataProcessor, 'initData');

            dataProcessor.addDataFromRemainDynamicData(shiftingOption);

            expect(dataProcessor._shiftCategory).toHaveBeenCalledTimes(2);
            expect(dataProcessor._shiftSeriesData).toHaveBeenCalledTimes(2);
        });
    });

    describe('isValidAllSeriesDataModel()', function() {
        it('모든 SeriesDataModel이 유효한 seriesGroup을 갖고 있으면 true를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = ['seriesGroup1', 'seriesGroup2'];
            dataProcessor.seriesDataModelMap.line.groups = ['seriesGroup3'];
            dataProcessor.seriesTypes = ['column', 'line'];

            actual = dataProcessor.isValidAllSeriesDataModel();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('하나의 그룹이라도 유효한 seriesGroup을 갖고 있지 않으면 false를 반환합니다.', function() {
            var actual, expected;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = ['seriesGroup1', 'seriesGroup2'];
            dataProcessor.seriesDataModelMap.line.groups = [];
            dataProcessor.seriesTypes = ['column', 'line'];

            actual = dataProcessor.isValidAllSeriesDataModel();
            expected = false;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeSeriesGroups()', function() {
        it('객체로 구성된(colum, line) groups의 seriesItem들을 같은 seriesItem index끼리 모아 seriesGroup을 새로 구성하여 반환합니다.', function() {
            var actual;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup(['seriesItem1', 'seriesItem2']),
                new SeriesGroup(['seriesItem3'])
            ];
            dataProcessor.seriesDataModelMap.line.groups = [
                new SeriesGroup(['seriesItem4']),
                new SeriesGroup(['seriesItem5', 'seriesItem6'])
            ];
            dataProcessor.seriesTypes = ['column', 'line'];

            actual = dataProcessor._makeSeriesGroups();

            expect(actual.length).toBe(2);
            expect(actual[0].items).toEqual([
                'seriesItem1',
                'seriesItem2',
                'seriesItem4'
            ]);
            expect(actual[1].items).toEqual([
                'seriesItem3',
                'seriesItem5',
                'seriesItem6'
            ]);
        });
    });

    describe('_createValues()', function() {
        it('combo 차트 경우에는 모든 chartType에 속한 sereisItem의 value를 추출 하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.chartType = chartConst.CHART_TYPE_COMBO;
            dataProcessor.seriesTypes = ['column', 'line'];
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: null
                }, {
                    value: 20,
                    start: null
                }])
            ];
            dataProcessor.seriesDataModelMap.line.groups = [
                new SeriesGroup([{
                    value: 30,
                    start: null
                }, {
                    value: 40,
                    start: null
                }])
            ];

            actual = dataProcessor._createValues(chartConst.CHART_TYPE_COMBO);
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });

        it('single chart인 경우에는 해당하는 chartType에 속하는 sereisItem의 value를 추출 하여 반환합니다.', function() {
            var actual;
            var expected = [10, 5, 30, 20];

            dataProcessor.rawData.series = {
                column: expected
            };
            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: null
                }, {
                    value: 30,
                    start: null
                }])
            ];

            actual = dataProcessor._createValues('column');
            expected = [10, 30];

            expect(actual).toEqual(expected);
        });

        it('start값이 null이 아닐경우 포함하여 반환합니다.', function() {
            var actual;
            var expected = [10, 5, 30, 20];

            dataProcessor.rawData.series = {
                column: expected
            };
            dataProcessor.chartType = 'column';
            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.column.groups = [
                new SeriesGroup([{
                    value: 10,
                    start: 5
                }, {
                    value: 30,
                    start: 20
                }])
            ];

            actual = dataProcessor._createValues('column');

            expect(actual).toEqual(expected);
        });

        it('create temporary values of line/area chart without series data.', function() {
            var values = [new Date('01/01/2017'), new Date('02/01/2017')];

            spyOn(dataProcessor, 'getDefaultDatetimeValues').and.returnValue(values);

            expect(dataProcessor._createValues('line', 'x', 'xAxis')).toEqual(dataProcessor.defaultValues);
            expect(dataProcessor._createValues('line', 'y', 'yAxis')).toEqual(dataProcessor.defaultValues);

            dataProcessor.options.xAxis = {
                type: 'datetime'
            };

            expect(dataProcessor._createValues('line', 'x', 'xAxis')).toEqual(values);
        });

        it('create temporary values of line/area chart without series data but plot lines & bands.', function() {
            var values = [new Date('01/01/2017'), new Date('02/01/2017')];
            var lineValue = new Date('03/01/2017');
            var bandRange = [new Date('05/01/2017'), new Date('08/01/2017')];

            spyOn(dataProcessor, 'getDefaultDatetimeValues').and.returnValue(values);

            dataProcessor.options.xAxis = {
                type: 'datetime'
            };
            dataProcessor.options.plot = {
                lines: [{value: lineValue}],
                bands: [{range: bandRange}]
            };

            expect(dataProcessor._createValues('line', 'x', 'xAxis'))
                .toEqual(values.concat([lineValue].concat(bandRange)));
        });
    });

    describe('_pickLegendData()', function() {
        it('사용자가 입력한 data에서 legend label을 추출합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                series: {
                    line: [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50]
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60]
                        },
                        {
                            name: 'Legend3',
                            data: [60, 50, 10]
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70]
                        }
                    ]
                }
            };

            actual = dataProcessor._pickLegendData('label');
            expected = {
                line: ['Legend1', 'Legend2', 'Legend3', 'Legend4']
            };

            expect(actual).toEqual(expected);
        });
        it('pick legend visibilities.', function() {
            var actual;

            dataProcessor.rawData = {
                series: {
                    line: [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50],
                            visible: true
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60],
                            visible: true
                        },
                        {
                            name: 'Legend3',
                            data: [60, 50, 10],
                            visible: true
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70],
                            visible: true
                        }
                    ]
                }
            };

            actual = dataProcessor._pickLegendData('visibility');

            expect(actual.line).toEqual([true, true, true, true]);
        });

        it('pick legend visibility true when `visible` is undefined.', function() {
            var actual;

            dataProcessor.rawData = {
                series: {
                    line: [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50],
                            visible: true
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60],
                            visible: false
                        },
                        {
                            name: 'Legend3',
                            data: [60, 50, 10],
                            visible: true
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70],
                            visible: true
                        }
                    ]
                }
            };

            actual = dataProcessor._pickLegendData('visibility');

            expect(actual.line).toEqual([true, false, true, true]);
        });

        it('pick legend visibility true when `visible` is undefined.', function() {
            var actual;

            dataProcessor.rawData = {
                series: {
                    line: [
                        {
                            name: 'Legend1',
                            data: [20, 30, 50]
                        },
                        {
                            name: 'Legend2',
                            data: [40, 40, 60],
                            visible: false
                        },
                        {
                            name: 'Legend3',
                            data: [60, 50, 10],
                            visible: true
                        },
                        {
                            name: 'Legend4',
                            data: [80, 10, 70],
                            visible: true
                        }
                    ]
                }
            };

            actual = dataProcessor._pickLegendData('visibility');

            expect(actual.line).toEqual([true, false, true, true]);
        });
    });

    describe('_formatToZeroFill()', function() {
        it('1을 길이 3으로 zero fill하면 "001"이 반환됩니다.', function() {
            var result = dataProcessor._formatToZeroFill(3, 1);
            expect(result).toBe('001');
        });

        it('22을 길이 4로 zero fill하면 "0022"가 반환됩니다.', function() {
            var result = dataProcessor._formatToZeroFill(4, 22);
            expect(result).toBe('0022');
        });
    });

    describe('_pickMaxLenUnderPoint()', function() {
        it('입력받은 인자 [1.12, 2.2, 3.33, 4.456]중에 소수점 이하의 길이를 비교하여 제일 긴 길이 3(4.456의 소수점 이하 길이)을 반환합니다.', function() {
            var point = dataProcessor._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
            expect(point).toBe(3);
        });
    });

    describe('_findFormatFunctions()', function() {
        it('포맷이 function인 경우에는 해당 function을 배열에 담아 반환합니다.', function() {
            var format = function() {};
            var actual;

            dataProcessor.options = {
                chart: {
                    format: format
                }
            };

            actual = dataProcessor._findFormatFunctions(format);

            expect(actual).toEqual([format]);
        });

        it('포맷이 string인 경우에는 _findSimpleTypeFormatFunctions의 수행 결과를 반환합니다.', function() {
            var format = '1,000';

            dataProcessor.options = {
                chart: {
                    format: format
                }
            };
            spyOn(dataProcessor, '_findSimpleTypeFormatFunctions');

            dataProcessor._findFormatFunctions(format);

            expect(dataProcessor._findSimpleTypeFormatFunctions).toHaveBeenCalledWith(format);
        });

        it('포맷 정보가 없을 경우에는 빈 배열을 반환합니다.', function() {
            var actual = dataProcessor._findFormatFunctions();
            expect(actual).toEqual([]);
        });
    });

    describe('_findSimpleTypeFormatFunctions()', function() {
        it('포맷이 0.000인 경우에는 [_formatDecimal] 반환합니다.(currying되어있는 함수이기 때문에 함수 실행 결과로 테스트 했습니다)', function() {
            var actual, expected;
            var format = '0.000';

            actual = dataProcessor._findSimpleTypeFormatFunctions(format);
            expected = '1000.000';

            expect(actual[0](1000)).toBe(expected);
        });

        it('포맷이 1,000인 경우에는 [_formatComma] 반환합니다.', function() {
            var format = '1,000';
            var actual, expected;

            actual = dataProcessor._findSimpleTypeFormatFunctions(format);
            expected = '1,000';

            expect(actual[0](1000)).toBe(expected);
        });

        it('포맷이 1,000.00인 경우에는 [_formatDecimal, _formatComma] 반환합니다.', function() {
            var format = '1,000.00';
            var actual, expected;

            actual = dataProcessor._findSimpleTypeFormatFunctions(format);
            expected = '1,000.00';

            expect(actual.length).toBe(2);
            expect(actual[1](actual[0](1000))).toBe(expected);
        });

        it('포맷이 0001인 경우에는 [_formatToZeroFill] 반환합니다.', function() {
            var format = '0001';
            var actual, expected;

            actual = dataProcessor._findSimpleTypeFormatFunctions(format);
            expected = '0011';

            expect(actual[0](11)).toBe(expected);
        });
    });

    describe('_addStartValueToAllSeriesItem()', function() {
        it('limit의 값들이 모두 양수이면 start값을 limit.min으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: 10,
                max: 80
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(10);
        });

        it('limit의 값들이 모두 음수이면 start값을 limit.max으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: -80,
                max: -10
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(-10);
        });

        it('limit의 min은 음수이고 max는 양수이면 start값을 0으로 설정하여 seriesDataModel.addStartValueToAllSeriesItem에 전달합니다.', function() {
            dataProcessor.seriesDataModelMap = {
                bar: jasmine.createSpyObj('seriesDataModel', ['addStartValueToAllSeriesItem'])
            };
            dataProcessor._addStartValueToAllSeriesItem({
                min: -40,
                max: 80
            }, 'bar');

            expect(dataProcessor.seriesDataModelMap.bar.addStartValueToAllSeriesItem).toHaveBeenCalledWith(0);
        });
    });

    describe('_createBaseValuesForNormalStackedChart()', function() {
        it('create base values for normal stacked chart', function() {
            var seriesGroup, actual, expected;

            dataProcessor.seriesDataModelMap = {
                bar: new SeriesDataModel()
            };
            seriesGroup = jasmine.createSpyObj('seriesGroup', ['_makeValuesMapPerStack']);
            seriesGroup._makeValuesMapPerStack.and.returnValue({
                st1: [-10, 30, -50],
                st2: [-20, 40, 60]
            });
            dataProcessor.seriesDataModelMap.bar.groups = [
                seriesGroup
            ];

            actual = dataProcessor._createBaseValuesForNormalStackedChart(chartConst.CHART_TYPE_BAR);
            expected = [30, -60, 100, -20];

            expect(actual).toEqual(expected);
        });
    });

    describe('createBaseValuesForLimit()', function() {
        it('create base values for limit.', function() {
            var chartType = chartConst.CHART_TYPE_BAR;
            var values = [70, 10, 20, 20, 80, 30];

            dataProcessor.rawData.series = {
                bar: values
            };
            dataProcessor.seriesDataModelMap = {
                bar: new SeriesDataModel()
            };
            dataProcessor.seriesDataModelMap.bar.valuesMap = {
                value: values
            };

            expect(dataProcessor.createBaseValuesForLimit(chartType)).toEqual(values);
        });

        it('create base values for limit, when single yAxis in comboChart.', function() {
            var chartType = chartConst.CHART_TYPE_COMBO;
            var isSingleYAxis = true;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };

            dataProcessor.seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
            dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };

            expect(dataProcessor.createBaseValuesForLimit(chartType, isSingleYAxis))
                .toEqual([70, 10, 20, 20, 80, 30, 1, 2, 3]);
        });

        it('Make base values, when single yAxis and has stackType option in comboChart.', function() {
            var isSingleYAxis = true;
            var stackType = chartConst.NORMAL_STACK_TYPE;
            var seriesGroup, actual, expected;

            dataProcessor.seriesDataModelMap = {
                column: new SeriesDataModel(),
                line: new SeriesDataModel()
            };

            dataProcessor.chartType = chartConst.CHART_TYPE_COMBO;
            dataProcessor.seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
            seriesGroup = jasmine.createSpyObj('seriesGroup', ['_makeValuesMapPerStack']);
            dataProcessor.seriesDataModelMap.column.groups = [
                seriesGroup
            ];
            seriesGroup._makeValuesMapPerStack.and.returnValue({
                st1: [70, 10, 20, 20, 80, 30]
            });
            dataProcessor.seriesDataModelMap.column.valuesMap = {
                value: [70, 10, 20, 20, 80, 30]
            };
            dataProcessor.seriesDataModelMap.line.valuesMap = {
                value: [1, 2, 3]
            };

            actual = dataProcessor.createBaseValuesForLimit(chartConst.CHART_TYPE_COLUMN, isSingleYAxis, stackType);
            expected = [70, 10, 20, 20, 80, 30, 1, 2, 3, 230, 0];

            expect(actual).toEqual(expected);
        });

        it('Make base values, when stackType is normal.', function() {
            var chartType = chartConst.CHART_TYPE_COLUMN;
            var isSingleYAxis = false;
            var stackType = chartConst.NORMAL_STACK_TYPE;
            var actual, expected;

            spyOn(dataProcessor, '_createBaseValuesForNormalStackedChart').and.returnValue([
                80, -10, 20, -30, 80, -40
            ]);

            actual = dataProcessor.createBaseValuesForLimit(chartType, isSingleYAxis, stackType);
            expected = [80, -10, 20, -30, 80, -40];

            expect(actual).toEqual(expected);
        });

        it('Make base values by calling dataProcessor.getValues with arguments(chartType, valueType),' +
            ' when chartType is treemap.', function() {
            var chartType = chartConst.CHART_TYPE_TREEMAP;

            spyOn(dataProcessor, 'getValues');

            dataProcessor.createBaseValuesForLimit(chartType);

            expect(dataProcessor.getValues).toHaveBeenCalledWith(chartConst.CHART_TYPE_TREEMAP, 'colorValue');
        });
    });

    describe('getValuesFromPlotOptions()', function() {
        it('create values from plotOptions.', function() {
            expect(dataProcessor.getValuesFromPlotOptions({
                lines: [{value: 100}],
                bands: [{range: [20, 40]}, {range: [10, 15]}]
            })).toEqual([100, 20, 40, 10, 15]);
        });

        it('create datetime values from plotOptions.', function() {
            expect(dataProcessor.getValuesFromPlotOptions({
                lines: [{value: '06/01/2016'}],
                bands: [{range: ['01/01/2016', '03/01/2016']}, {range: ['06/01/2017', '09/01/2017']}]
            }, 'datetime')).toEqual([new Date('06/01/2016'), new Date('01/01/2016'), new Date('03/01/2016'), new Date('06/01/2017'), new Date('09/01/2017')]);
        });
    });
});
