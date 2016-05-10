/**
 * @fileoverview Test for SeriesDataModel.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('../../src/js/dataModels/seriesDataModel'),
    SeriesGroup = require('../../src/js/dataModels/seriesGroup'),
    SeriesItem = require('../../src/js/dataModels/seriesItem'),
    SeriesItemForCoordinateType = require('../../src/js/dataModels/seriesItemForCoordinateType');

describe('Test for SeriesDataModel', function() {
    var seriesDataModel;

    beforeEach(function() {
        seriesDataModel = new SeriesDataModel([]);
    });

    describe('_removeRangeValue()', function() {
        it('range형의 seriesItem에서 data의 첫번째 인자만 남기고 나머지는 지웁니다.', function() {
            seriesDataModel.rawSeriesData = [
                {
                    data: [[10, 20], [20, 30]]
                }, {
                    data: [[-20, 10], [30, 40]]
                }
            ];

            seriesDataModel._removeRangeValue();

            expect(seriesDataModel.rawSeriesData[0].data).toEqual([10, 20]);
            expect(seriesDataModel.rawSeriesData[1].data).toEqual([-20, 30]);
        });

        it('range형의 차트(bar, column, area)의 경우 range value를 삭제하지 않습니다.', function() {
            seriesDataModel.rawSeriesData = [
                {
                    data: [[10, 20], [20, 30]]
                }, {
                    data: [[-20, 10], [30, 40]]
                }
            ];

            seriesDataModel.chartType = 'area';
            seriesDataModel._removeRangeValue();

            expect(seriesDataModel.rawSeriesData[0].data).toEqual([[10, 20], [20, 30]]);
            expect(seriesDataModel.rawSeriesData[1].data).toEqual([[-20, 10], [30, 40]]);
        });

        it('range형의 차트(bar, column, area)가 아니더라도 stacked옵션이 있다면 range value를 삭제하지 않습니다.', function() {
            seriesDataModel.rawSeriesData = [
                {
                    data: [[10, 20], [20, 30]]
                }, {
                    data: [[-20, 10], [30, 40]]
                }
            ];

            seriesDataModel.chartType = 'pie';
            seriesDataModel.options = {
                stacked: 'normal'
            };
            seriesDataModel._removeRangeValue();

            expect(seriesDataModel.rawSeriesData[0].data).toEqual([10, 20]);
            expect(seriesDataModel.rawSeriesData[1].data).toEqual([-20, 30]);
        });
    });

    describe('_createBaseGroups()', function() {
        it('rawData.series를 이용하여 SeriesItem을 2차원 배열로 들고있는 baseGroups를 생성합니다.', function() {
            var actual;

            seriesDataModel.rawSeriesData = [{
                data: [10, 20, 30],
                stack: 'st1'
            }, {
                data: [40, 50, 60],
                stack: 'st2'
            }];
            actual = seriesDataModel._createBaseGroups();

            expect(actual.length).toBe(2);
            expect(actual[0].length).toBe(3);
            expect(actual[0][0].value).toBe(10);
            expect(actual[0][0].stack).toBe('st1');
            expect(actual[1][2].value).toBe(60);
            expect(actual[1][2].stack).toBe('st2');
        });

        it('data가 숫자인 파이차트형의 경우의 baseGroups를 생성합니다.', function() {
            var actual;

            seriesDataModel.rawSeriesData = [{
                data: 10
            }, {
                data: 20
            }];
            actual = seriesDataModel._createBaseGroups();

            expect(actual.length).toBe(2);
            expect(actual[0][0].value).toBe(10);
            expect(actual[1][0].value).toBe(20);
        });

        it('bubble차트의 경우 SeriesItemForCoordinateType으로 seriesItem을 생성합니다.', function() {
            var actual;

            seriesDataModel.rawSeriesData = [{
                data: [{
                    x: 10,
                    y: 20,
                    r: 30,
                    label: 'Label'
                }]
            }];
            seriesDataModel.chartType = 'bubble';

            actual = seriesDataModel._createBaseGroups();
            expect(actual[0][0].x).toBe(10);
            expect(actual[0][0].y).toBe(20);
            expect(actual[0][0].r).toBe(30);
            expect(actual[0][0].label).toBe('Label');

        });
    });

    describe('_createSeriesGroupsFromRawData()', function() {
        it('seriesGroup을 요소로 갖는 groups를 생성합니다.', function() {
            var actual;

            seriesDataModel.rawSeriesData = [{
                data: [10, 20, 30],
                stack: 'st1'
            }, {
                data: [40, 50, 60],
                stack: 'st2'
            }];
            actual = seriesDataModel._createSeriesGroupsFromRawData();

            expect(actual.length).toBe(2);
            expect(actual[0].getSeriesItemCount()).toBe(3);
            expect(actual[0] instanceof SeriesGroup).toBe(true);
        });

        it('isPivot이 true이면 회전된 결과로 groups를 생성합니다.', function() {
            var actual;

            seriesDataModel.rawSeriesData = [{
                data: [10, 20, 30],
                stack: 'st1'
            }, {
                data: [40, 50, 60],
                stack: 'st2'
            }];
            actual = seriesDataModel._createSeriesGroupsFromRawData(true);

            expect(actual.length).toBe(3);
            expect(actual[0].getSeriesItemCount()).toBe(2);
            expect(actual[0] instanceof SeriesGroup);
        });
    });

    describe('_createValues()', function() {
        it('groups에 포함된 seriesItem들의 value들을 1차원 배열로 추출하여 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.groups = [
                new SeriesGroup([
                    new SeriesItem(10),
                    new SeriesItem(20)
                ]),
                new SeriesGroup([
                    new SeriesItem(30),
                    new SeriesItem(40)
                ])
            ];

            actual = seriesDataModel._createValues('value');
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });

        it('coordinate type의 차트의 경우 x 정보를 반환할 수 있습니다.', function() {
            var actual, expected;

            seriesDataModel.groups = [
                new SeriesGroup([
                    new SeriesItemForCoordinateType({
                        x: 10
                    }),
                    new SeriesItemForCoordinateType({
                        x: 20
                    })
                ])
            ];

            actual = seriesDataModel._createValues('x');
            expected = [10, 20];

            expect(actual).toEqual(expected);
        });

        it('coordinate type의 차트의 경우 y 정보를 반환할 수 있습니다.', function() {
            var actual, expected;

            seriesDataModel.groups = [
                new SeriesGroup([
                    new SeriesItemForCoordinateType({
                        y: 10
                    }),
                    new SeriesItemForCoordinateType({
                        y: 20
                    })
                ])
            ];

            actual = seriesDataModel._createValues('y');
            expected = [10, 20];

            expect(actual).toEqual(expected);
        });

        it('coordinate type의 차트의 경우 r(radius) 정보를 반환할 수 있습니다.', function() {
            var actual, expected;

            seriesDataModel.groups = [
                new SeriesGroup([
                    new SeriesItemForCoordinateType({
                        r: 10
                    }),
                    new SeriesItemForCoordinateType({
                        r: 20
                    })
                ])
            ];

            actual = seriesDataModel._createValues('r');
            expected = [10, 20];

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatiosWhenNormalStacked()', function() {
        it('normal stacked 옵션인 경우에는 limit.min, limit.max의 간격을 구하여 seriesGroup.addRatios에 전달합니다.', function() {
            var seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatios']);

            seriesDataModel.groups = [seriesGroup];
            seriesDataModel._addRatiosWhenNormalStacked({min: 0, max: 80});

            expect(seriesGroup.addRatios).toHaveBeenCalledWith(80);
        });
    });

    describe('_calculateBaseRatio()', function() {
        it('groupseriesGroup에서 values 추출한 후 values에 음수와 양수 모두 포함되어있으면 0.5를 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.valuesMap = {
                value: [-20, 40]
            };

            actual = seriesDataModel._calculateBaseRatio();
            expected = 0.5;

            expect(actual).toEqual(expected);
        });

        it('groupseriesGroup에서 values 추출한 후 values에 음수와 양수 중 하나만 존재하면 1을 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.valuesMap = {
                value: [20, 40]
            };

            actual = seriesDataModel._calculateBaseRatio();
            expected = 1;

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatiosWhenPercentStacked()', function() {
        it('percent stacked 옵션인 경우에는 baseRatio구해 seriesGroup.addRatiosWhenPercentStacked에 전달합니다.', function() {
            var seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatiosWhenPercentStacked']);

            seriesDataModel.groups = [seriesGroup];
            seriesDataModel.valuesMap = {
                value: [20, 40]
            };

            seriesDataModel._addRatiosWhenPercentStacked('bar');

            expect(seriesGroup.addRatiosWhenPercentStacked).toHaveBeenCalledWith(1);
        });
    });

    describe('_addRatiosWhenDivergingStacked()', function() {
        it('divergion stacked 옵션인 경우에는 plusSum, minuSum을 구해 seriesGroup.addRatiosWhenDivergingStacked에 전달합니다.', function() {
            var seriesGroup = jasmine.createSpyObj('seriesGroup', ['pluck', 'addRatiosWhenDivergingStacked']);

            seriesGroup.pluck.and.returnValue([10, -20, 30, 40]);
            seriesDataModel.groups = [seriesGroup];

            seriesDataModel._addRatiosWhenDivergingStacked('bar');

            expect(seriesGroup.addRatiosWhenDivergingStacked).toHaveBeenCalledWith(80, 20);
        });
    });

    describe('_makeSubtractionValue()', function() {
        it('라인타입 차트가 아니면서 limit의 값이 모두 음수인 경우에는 limit.max를 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.chartType = 'bar';
            actual = seriesDataModel._makeSubtractionValue({
                min: -90,
                max: -20
            });
            expected = -20;

            expect(actual).toEqual(expected);
        });

        it('라인타입 차트인 경우에는 limit.min을 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.chartType = 'line';
            actual = seriesDataModel._makeSubtractionValue({
                min: -90,
                max: -20
            });
            expected = -90;

            expect(actual).toEqual(expected);
        });

        it('라인차트가 아니면서 모두 양수인 경우에도 limit.min을 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.chartType = 'bar';
            actual = seriesDataModel._makeSubtractionValue({
                min: 20,
                max: 90
            });
            expected = 20;

            expect(actual).toEqual(expected);
        });

        it('그 외의 경우에는 0을 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.chartType = 'bar';
            actual = seriesDataModel._makeSubtractionValue({
                min: -90,
                max: 90
            });
            expected = 0;

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatios()', function() {
        it('옵션이 없는 차트의 경우에는 limit.min, limit.max의 간격과 substractionValue를 구해 seriesGroup.addRatios에 전달합니다.', function() {
            var seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatios']);

            seriesDataModel.groups = [seriesGroup];
            seriesDataModel._addRatios({min: 0, max: 80});

            expect(seriesGroup.addRatios).toHaveBeenCalledWith(80, 0);
        });
    });

    describe('addDataRatios()', function() {
        it('옵션이 없는 경우에는 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatios');
            seriesDataModel.addDataRatios({min: 0, max: 160}, null, 'column');

            expect(seriesDataModel._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 normal stacked인 경우에는 _addRatiosWhenNormalStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatiosWhenNormalStacked');
            seriesDataModel.chartType = 'bar';
            seriesDataModel.addDataRatios({min: 0, max: 160}, 'normal');

            expect(seriesDataModel._addRatiosWhenNormalStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 normal stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatios');
            seriesDataModel.chartType = 'line';
            seriesDataModel.addDataRatios({min: 0, max: 160}, 'normal');

            expect(seriesDataModel._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 diverging percent stacked인 경우에는 _addRatiosWhenDivergingStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatiosWhenDivergingStacked');
            seriesDataModel.divergingOption = true;
            seriesDataModel.chartType = 'bar';
            seriesDataModel.addDataRatios({min: 0, max: 160}, 'percent');

            expect(seriesDataModel._addRatiosWhenDivergingStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 percent stacked인 경우에는 _addRatiosWhenPercentStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatiosWhenPercentStacked');
            seriesDataModel.chartType = 'bar';
            seriesDataModel.addDataRatios({min: 0, max: 160}, 'percent');

            expect(seriesDataModel._addRatiosWhenPercentStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 percent stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(seriesDataModel, '_addRatios');
            seriesDataModel.chartType = 'line';
            seriesDataModel.addDataRatios({min: 0, max: 160}, 'percent');

            expect(seriesDataModel._addRatios).toHaveBeenCalled();
        });
    });

    describe('addDataRatiosOfPieChart()', function() {
        it('파이 차트의 경우에는 seriesGroup values의 합을 구해 seriesGroup.addRatios에 전달합니다.', function() {
            var seriesGroup = jasmine.createSpyObj('seriesGroup', ['pluck', 'addRatios']);

            seriesDataModel.groups = [seriesGroup];
            seriesGroup.pluck.and.returnValue([10, 20, 30, 40]);
            seriesDataModel.addDataRatiosOfPieChart();

            expect(seriesGroup.addRatios).toHaveBeenCalledWith(100);
        });
    });

    describe('addDataRatiosForCoordinateType()', function() {
        it('limitMap.x로 xDistance와 xSubValue를 계산하여 각각의 seriesItem의 addRatio를 호출하여 x ratio를 등록합니다.', function() {
            var limitMap = {
                x: {
                    min: 0,
                    max: 20
                }
            };
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesDataModel.groups = [new SeriesGroup([seriesItem])];
            spyOn(seriesDataModel, 'getValues').and.returnValue([]);
            seriesDataModel.addDataRatiosForCoordinateType(limitMap);

            expect(seriesItem.addRatio).toHaveBeenCalledWith('x', 20, 0);
        });

        it('limitMap.y로 yDistance와 ySubValue를 계산하여 각각의 seriesItem의 addRatio를 호출하여 y ratio를 등록합니다.', function() {
            var limitMap = {
                y: {
                    min: 10,
                    max: 50
                }
            };
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesDataModel.groups = [new SeriesGroup([seriesItem])];
            spyOn(seriesDataModel, 'getValues').and.returnValue([]);
            seriesDataModel.addDataRatiosForCoordinateType(limitMap);

            expect(seriesItem.addRatio).toHaveBeenCalledWith('y', 40, 10);
        });

        it('maxRadious를 구하여 각각의 seriesItem의 addRatio를 호출하여 r ratio를 등록합니다.', function() {
            var limitMap = {};
            var hasRadius = true;
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesDataModel.groups = [new SeriesGroup([seriesItem])];
            spyOn(seriesDataModel, 'getValues').and.returnValue([5, 10]);
            seriesDataModel.addDataRatiosForCoordinateType(limitMap, hasRadius);

            expect(seriesItem.addRatio).toHaveBeenCalledWith('r', 10, 0);
        });
    });

    describe('each()', function() {
        it('groups에 포함된 seriesGroup 수 만큼 iteratee를 실행합니다.', function() {
            var spy = jasmine.createSpyObj('spy', ['iteratee']);

            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: 10
                }, {
                    value: 20
                }]),
                new SeriesGroup([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            seriesDataModel.each(spy.iteratee);

            expect(spy.iteratee).toHaveBeenCalledTimes(2);
        });
    });

    describe('map()', function() {
        it('groups에 포함된 seriesGroup 수 만큼 iteratee를 실행하고 실행 결과를 배열로 반환합니다.', function() {
            var actual, expected;

            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: 10
                }, {
                    value: 20
                }]),
                new SeriesGroup([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            actual = seriesDataModel.map(function(seriesGroup) {
                return seriesGroup.getSeriesItemCount();
            });
            expected = [2, 2];

            expect(actual).toEqual(expected);
        });
    });
});
