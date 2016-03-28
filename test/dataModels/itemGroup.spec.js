/**
 * @fileoverview Test ItemGroup.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ItemGroup = require('../../src/js/dataModels/itemGroup'),
    Items = require('../../src/js/dataModels/items'),
    chartConst = require('../../src/js/const');

describe('test ItemGroup', function() {
    var itemGroup;

    beforeEach(function() {
        itemGroup = new ItemGroup();
    });

    describe('_createBaseGroups()', function() {
        it('rawData.series를 이용하여 Item을 2차원 배열로 들고있는 baseGroups를 생성합니다.', function() {
            var rawSeriesData = [{
                    data: [10, 20, 30],
                    stack: 'st1'
                }, {
                    data: [40, 50, 60],
                    stack: 'st2'
                }],
                actual = itemGroup._createBaseGroups(rawSeriesData);

            expect(actual.length).toBe(2);
            expect(actual[0].length).toBe(3);
            expect(actual[0][0].value).toBe(10);
            expect(actual[0][0].stack).toBe('st1');
            expect(actual[1][2].value).toBe(60);
            expect(actual[1][2].stack).toBe('st2');
        });

        it('data가 숫자인 파이차트형의 경우의 baseGroups를 생성합니다.', function() {
            var rawSeriesData = [{
                    data: 10
                }, {
                    data: 20
                }],
                actual = itemGroup._createBaseGroups(rawSeriesData);

            expect(actual.length).toBe(2);
            expect(actual[0][0].value).toBe(10);
            expect(actual[1][0].value).toBe(20);
        });
    });

    describe('createArrayTypeGroupsFromRawData()', function() {
        it('Items를 요소로 갖는 배열 타입의 groups를 생성합니다.', function() {
            var rawSeriesData = [{
                    data: [10, 20, 30],
                    stack: 'st1'
                }, {
                    data: [40, 50, 60],
                    stack: 'st2'
                }],
                chartType = 'line',
                actual = itemGroup.createArrayTypeGroupsFromRawData(rawSeriesData, chartType);

            expect(actual.length).toBe(2);
            expect(actual[0].getItemCount()).toBe(3);
            expect(actual[0] instanceof Items).toBe(true);
        });

        it('isPivot이 true이변 회전된 결과로 groups를 생성합니다.', function() {
            var rawSeriesData = [{
                    data: [10, 20, 30],
                    stack: 'st1'
                }, {
                    data: [40, 50, 60],
                    stack: 'st2'
                }],
                chartType = 'bar',
                isPivot = true,
                actual = itemGroup.createArrayTypeGroupsFromRawData(rawSeriesData, chartType, isPivot);

            expect(actual.length).toBe(3);
            expect(actual[0].getItemCount()).toBe(2);
            expect(actual[0] instanceof Items);
        });
    });

    describe('_createGroupsFromRawData()', function() {
        it('rawSeriesData가 배열이면 createArrayTypeGroupsFromRawData()의 결과를 반환합니다.', function() {
            var rawSeriesData = [{
                    data: [10, 20, 30],
                    stack: 'st1'
                }, {
                    data: [40, 50, 60],
                    stack: 'st2'
                }],
                actual, expected;

            itemGroup.rawSeriesData = rawSeriesData;
            actual = itemGroup._createGroupsFromRawData();
            expected = itemGroup.createArrayTypeGroupsFromRawData(rawSeriesData, chartConst.DUMMY_KEY);

            expect(actual).toEqual(expected);
        });

        it('rawSeriesData가 객체면 createArrayTypeGroupsFromRawData()의 결과를 각 key에 담아 반환합니다.', function() {
            var rawSeriesData = {
                    column: [{
                        data: [10, 20, 30]
                    }],
                    line: [{
                        data: [40, 50, 60]
                    }]
                },
                actual;

            itemGroup.rawSeriesData = rawSeriesData;
            actual = itemGroup._createGroupsFromRawData();

            expect(actual.column.length).toBe(1);
            expect(actual.column[0].getItemCount()).toBe(3);
            expect(actual.column[0] instanceof Items);
            expect(actual.line.length).toBe(1);
            expect(actual.line[0].getItemCount()).toBe(3);
            expect(actual.line[0] instanceof Items);
        });
    });

    describe('isValidAllGroup()', function() {
        it('모든 그룹이 유효한 items를 갖고 있으면 true를 반환합니다.', function() {
            var actual, expected;

            itemGroup.groups = {
                column: [
                    new Items([{
                        value: 10
                    }, {
                        value: 20
                    }])
                ],
                line: [
                    new Items([{
                        value: 30
                    }, {
                        value: 40
                    }])
                ]
            };

            actual = itemGroup.isValidAllGroup();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('하나의 그룹이라도 유효한 items를 갖고 있지 않으면 false를 반환합니다.', function() {
            var actual, expected;

            itemGroup.groups = {
                column: [
                    new Items([{
                        value: 10
                    }, {
                        value: 20
                    }])
                ],
                line: []
            };

            actual = itemGroup.isValidAllGroup();
            expected = false;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeValues()', function() {
        it('groups에 포함된 item들의 value들을 1차원 배열로 추출하여 반환합니다.', function() {
            var actual, expected;

            itemGroup.groups = [
                new Items([{
                    value: 10
                }, {
                    value: 20
                }]),
                new Items([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            actual = itemGroup._makeValues('bar');
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeWholeGroups()', function() {
        it('객체로 구성된(colum, line) groups의 item들을 같은 item index끼리 모아 items를 새로 구성하여 반환합니다.', function() {
            var actual;

            itemGroup.groups = {
                column: [
                    new Items([{
                        value: 10
                    }, {
                        value: 20
                    }])
                ],
                line: [
                    new Items([{
                        value: 30
                    }, {
                        value: 40
                    }])
                ]
            };

            actual = itemGroup._makeWholeGroups();

            expect(actual.length).toBe(1);
            expect(actual[0].items).toEqual([
                {
                    value: 10
                }, {
                    value: 20
                }, {
                    value: 30
                }, {
                    value: 40
                }
            ]);
        });
    });

    describe('_makeWholeItems()', function() {
        it('groups에 포함된 모든 item들을 모아 하나의 items로 생성하여 반환합니다.', function() {
            var actual;

            itemGroup.groups = [
                new Items([{
                    value: 10
                }, {
                    value: 20
                }]),
                new Items([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            actual = itemGroup._makeWholeItems();

            expect(actual instanceof Items).toBe(true);
            expect(actual.items).toEqual([
                {
                    value: 10
                }, {
                    value: 20
                }, {
                    value: 30
                }, {
                    value: 40
                }
            ]);
        });
    });

    describe('_addRatiosWhenNormalStacked()', function() {
        it('normal stacked 옵션인 경우에는 limit.min, limit.max의 간격을 구하여 items.addRatios에 전달합니다.', function() {
            var items = jasmine.createSpyObj('items', ['addRatios']);

            itemGroup.groups = [items];
            itemGroup._addRatiosWhenNormalStacked('bar', {min: 0, max: 80});

            expect(items.addRatios).toHaveBeenCalledWith(80);
        });
    });

    describe('_calculateBaseRatio()', function() {
        it('groupItems에서 values 추출한 후 values에 음수와 양수 모두 포함되어있으면 0.5를 반환합니다.', function() {
            var actual, expected;

            itemGroup.values = {
                bar: [-20, 40]
            };

            actual = itemGroup._calculateBaseRatio('bar');
            expected = 0.5;

            expect(actual).toEqual(expected);
        });

        it('groupItems에서 values 추출한 후 values에 음수와 양수 중 하나만 존재하면 1을 반환합니다.', function() {
            var actual, expected;

            itemGroup.values = {
                bar: [20, 40]
            };

            actual = itemGroup._calculateBaseRatio('bar');
            expected = 1;

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatiosWhenPercentStacked()', function() {
        it('percent stacked 옵션인 경우에는 baseRatio구해 items.addRatiosWhenPercentStacked에 전달합니다.', function() {
            var items = jasmine.createSpyObj('items', ['addRatiosWhenPercentStacked']);

            itemGroup.groups = [items];
            itemGroup.values = {
                bar: [20, 40]
            };

            itemGroup._addRatiosWhenPercentStacked('bar');

            expect(items.addRatiosWhenPercentStacked).toHaveBeenCalledWith(1);
        });
    });

    describe('_addRatiosWhenDivergingStacked()', function() {
        it('divergion stacked 옵션인 경우에는 plusSum, minuSum을 구해 items.addRatiosWhenDivergingStacked에 전달합니다.', function() {
            var items = jasmine.createSpyObj('items', ['pluck', 'addRatiosWhenDivergingStacked']);

            items.pluck.and.returnValue([10, -20, 30, 40]);
            itemGroup.groups = [items];

            itemGroup._addRatiosWhenDivergingStacked('bar');

            expect(items.addRatiosWhenDivergingStacked).toHaveBeenCalledWith(80, 20);
        });
    });

    describe('_makeSubtractionValue()', function() {
        it('라인타입 차트가 아니면서 limit의 값이 모두 음수인 경우에는 limit.max를 반환합니다.', function() {
            var actual = itemGroup._makeSubtractionValue('bar', {
                    min: -90,
                    max: -20
                }),
                expected = -20;

            expect(actual).toEqual(expected);
        });

        it('라인타입 차트인 경우에는 limit.min을 반환합니다.', function() {
            var actual = itemGroup._makeSubtractionValue('line', {
                    min: -90,
                    max: -20
                }),
                expected = -90;

            expect(actual).toEqual(expected);
        });

        it('라인차트가 아니면서 모두 양수인 경우에도 limit.min을 반환합니다.', function() {
            var actual = itemGroup._makeSubtractionValue('bar', {
                    min: 20,
                    max: 90
                }),
                expected = 20;

            expect(actual).toEqual(expected);
        });

        it('그 외의 경우에는 0을 반환합니다.', function() {
            var actual = itemGroup._makeSubtractionValue('bar', {
                    min: -90,
                    max: 90
                }),
                expected = 0;

            expect(actual).toEqual(expected);
        });
    });

    describe('_addRatios()', function() {
        it('옵션이 없는 차트의 경우에는 limit.min, limit.max의 간격과 substractionValue를 구해 items.addRatios에 전달합니다.', function() {
            var items = jasmine.createSpyObj('items', ['addRatios']);

            itemGroup.groups = [items];
            itemGroup._addRatios('bar', {min: 0, max: 80});

            expect(items.addRatios).toHaveBeenCalledWith(80, 0);
        });
    });

    describe('addDataRatios()', function() {
        it('옵션이 없는 경우에는 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatios');

            itemGroup.addDataRatios({min: 0, max: 160}, null, 'column');

            expect(itemGroup._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 normal stacked인 경우에는 _addRatiosWhenNormalStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatiosWhenNormalStacked');

            itemGroup.addDataRatios({min: 0, max: 160}, 'normal', 'bar');

            expect(itemGroup._addRatiosWhenNormalStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 normal stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatios');

            itemGroup.addDataRatios({min: 0, max: 160}, 'normal', 'line');

            expect(itemGroup._addRatios).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 diverging percent stacked인 경우에는 _addRatiosWhenDivergingStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatiosWhenDivergingStacked');

            itemGroup.divergingOption = true;
            itemGroup.addDataRatios({min: 0, max: 160}, 'percent', 'bar');

            expect(itemGroup._addRatiosWhenDivergingStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효한 차트의 옵션이 percent stacked인 경우에는 _addRatiosWhenPercentStacked()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatiosWhenPercentStacked');

            itemGroup.addDataRatios({min: 0, max: 160}, 'percent', 'bar');

            expect(itemGroup._addRatiosWhenPercentStacked).toHaveBeenCalled();
        });

        it('stacked option이 유효하지 않는 라인 차트에는 percent stacked 옵션이 있다 하더라도 _addRatios()를 호출하여 ratio를 추가합니다.', function() {
            spyOn(itemGroup, '_addRatios');

            itemGroup.addDataRatios({min: 0, max: 160}, 'percent', 'line');

            expect(itemGroup._addRatios).toHaveBeenCalled();
        });
    });

    describe('addDataRatiosOfPieChart()', function() {
        it('파이 차트의 경우에는 items values의 합을 구해 items.addRatios에 전달합니다.', function() {
            var items = jasmine.createSpyObj('items', ['pluck', 'addRatios']);

            itemGroup.groups = [items];
            items.pluck.and.returnValue([10, 20, 30, 40]);
            itemGroup.addDataRatiosOfPieChart();

            expect(items.addRatios).toHaveBeenCalledWith(100);
        });
    });

    describe('each()', function() {
        it('groups에 포함된 items 수 만큼 iteratee를 실행합니다.', function() {
            var spy = jasmine.createSpyObj('spy', ['iteratee']);

            itemGroup.groups = [
                new Items([{
                    value: 10
                }, {
                    value: 20
                }]),
                new Items([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            itemGroup.each(spy.iteratee);

            expect(spy.iteratee).toHaveBeenCalledTimes(2);
        });
    });

    describe('map()', function() {
        it('groups에 포함된 items 수 만큼 iteratee를 실행하고 실행 결과를 배열로 반환합니다.', function() {
            var actual, expected;

            itemGroup.groups = [
                new Items([{
                    value: 10
                }, {
                    value: 20
                }]),
                new Items([{
                    value: 30
                }, {
                    value: 40
                }])
            ];

            actual = itemGroup.map(function(items) {
                return items.getItemCount();
            });
            expected = [2, 2];

            expect(actual).toEqual(expected);
        });
    });
});
