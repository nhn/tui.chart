/**
 * @fileoverview Test for rawDataHandler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var rawDataHandler = require('../../../src/js/models/data/rawDataHandler.js');
var chartConst = require('../../../src/js/const');

describe('Test for rawDataHandler', function() {
    describe('_pickStacks', function() {
        it('rawSeriesData에서 stack을 추출합니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('stack 값이 없는 경우에는 chartConst.DEFAULT_STACK을 추가합니다.', function() {
            var rawSeriesData = [{
                    data: []
                },
                {
                    data: [],
                    stack: 'stack1'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', chartConst.DEFAULT_STACK];
            expect(actual).toEqual(expected);
        });

        it('중복되지 않은 상태의 추출된 순서대로 반환합니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                },
                {
                    data: [],
                    stack: 'stack2'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('divergingOption이 없는 경우 stack 개수에 제한은 없습니다.', function() {
            var rawSeriesData = [{
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                },
                {
                    data: [],
                    stack: 'stack3'
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2', 'stack3'];
            expect(actual).toEqual(expected);
        });

        it('divergingOption이 ture이면서 3개 이상인 경우 2개 까지만 반환합니다.', function() {
            var rawSeriesData = [
                {
                    data: [],
                    stack: 'stack1'
                },
                {
                    data: [],
                    stack: 'stack2'
                },
                {
                    data: [],
                    stack: 'stack3'
                }
            ];
            var divergingOption = true;
            var actual = rawDataHandler.pickStacks(rawSeriesData, divergingOption);
            var expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('모든 값에 stack 값이 없는 경우에는 defalut stack만을 담은 배열이 반환되어야 합니다.', function() {
            var rawSeriesData = [{
                    data: []
                },
                {
                    data: []
                }],
                actual = rawDataHandler.pickStacks(rawSeriesData),
                expected = [chartConst.DEFAULT_STACK];
            expect(actual).toEqual(expected);
        });
    });

    describe('_sortSeriesData()', function() {
        it('stacks의 stack 순서대로 seriesData를 정렬합니다.', function() {
            var rawSriesData = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }],
                stacks = ['st1', 'st2'],
                actual = rawDataHandler._sortSeriesData(rawSriesData, stacks),
                expected = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }];

            expect(actual).toEqual(expected);
        });
    });

    describe('removeSeriesStack()', function() {
        it('seriesData에서 stack 정보를 제거합니다.', function() {
            var rawSriesData = [{
                    data: [1, 2, 3],
                    stack: 'st1'
                }, {
                    data: [4, 5, 6],
                    stack: 'st2'
                }, {
                    data: [9, 8, 7],
                    stack: 'st1'
                }],
                actual, expected;

            rawDataHandler.removeSeriesStack(rawSriesData);
            actual = rawSriesData;
            expected = [{
                data: [1, 2, 3]
            }, {
                data: [4, 5, 6]
            }, {
                data: [9, 8, 7]
            }];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalDivergingrawSeriesDataData()', function() {
        it('stack값이 없는 경우 두번째 요소 까지를 유효한 데이터로 취급합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, 2, 3]
                },
                {
                    data: [4, 5, 6]
                },
                {
                    data: [7, 8, 9]
                }
            ];
            var actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
            var expected = [
                {
                    data: [-1, -2, -3]
                },
                {
                    data: [4, 5, 6]
                }
            ];

            expect(actual).toEqual(expected);
        });

        it('0번 요소의 data들의 양수는 모두 음수로 변경하고 음수는 모두 0으로 변경합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3]
                }
            ];
            var actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
            var expected = [
                {
                    data: [-1, 0, -3]
                }
            ];

            expect(actual).toEqual(expected);
        });

        it('1번 요소가 존재할 경우 1번 요소 data들의 음수는 모두 0으로 변경합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3]
                },
                {
                    data: [-4, 5, 6]
                }
            ];
            var actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
            var expected = [
                {
                    data: [-1, 0, -3]
                },
                {
                    data: [0, 5, 6]
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeRawSeriesDataForStackedDiverging()', function() {
        it('stacks중 0번 stack값을 갖고있는 요소의 data들의 양수는 음수로 음수는 0으로 변경합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
            var expected = [
                {
                    data: [-1, 0, -3],
                    stack: 'stack1'
                }
            ];
            expect(actual).toEqual(expected);
        });

        it('stacks중 1번 stack값을 갖고있는 요소의 data들의 음수는 0으로 변경합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                },
                {
                    data: [-4, 5, 6],
                    stack: 'stack2'
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
            var expected = [
                {
                    data: [-1, 0, -3],
                    stack: 'stack1'
                },
                {
                    data: [0, 5, 6],
                    stack: 'stack2'
                }
            ];

            expect(actual).toEqual(expected);
        });

        it('stacks가 하나일 경우에는 stack값이 없는 data들의 음수를 0으로 변경합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                },
                {
                    data: [-4, 5, 6]
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
            var expected = [
                {
                    data: [-1, 0, -3],
                    stack: 'stack1'
                },
                {
                    data: [0, 5, 6]
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeRawSeriesDataForDiverging()', function() {
        it('stackType옵션이 없을 경우에는 _makeNormalDivergingRawSeriesData()의 실행 결과를 반환합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                },
                {
                    data: [-4, 5, 6],
                    stack: 'stack2'
                },
                {
                    data: [7, 8, 9],
                    stack: 'stack1'
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData);
            var expected = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);

            expect(actual).toEqual(expected);
        });

        it('유효한 stackType옵션이 있을 경우에는 _makeRawSeriesDataForStackedDiverging()의 실행 결과를 반환합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                },
                {
                    data: [-4, 5, 6],
                    stack: 'stack2'
                },
                {
                    data: [7, 8, 9],
                    stack: 'stack1'
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData, 'normal');
            var expected = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);

            expect(actual).toEqual(expected);
        });

        it('유효하지 않은 stackType옵션이 있을 경우에는 _makeNormalDivergingRawSeriesData()의 실행 결과를 반환합니다.', function() {
            var rawSeriesData = [
                {
                    data: [1, -2, 3],
                    stack: 'stack1'
                },
                {
                    data: [-4, 5, 6],
                    stack: 'stack2'
                },
                {
                    data: [7, 8, 9],
                    stack: 'stack1'
                }
            ];
            var actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData, true);
            var expected = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);

            expect(actual).toEqual(expected);
        });
    });

    describe('filterCheckedRawData()', function() {
        it('한가지 종류의 series data를 checkedLegends에 값을 갖고 있는 index로 필터링합니다.', function() {
            var actual = rawDataHandler.filterCheckedRawData({
                series: {
                    line: ['a', 'b', 'c', 'd']
                }
            }, {line: [null, true, true]});
            var expected = {
                line: ['b', 'c']
            };

            expect(actual.series).toEqual(expected);
        });

        it('두가지 종류의 series data를 checkedLegends에 값을 갖고 있는 index로 필터링합니다.', function() {
            var actual = rawDataHandler.filterCheckedRawData({
                series: {
                    column: ['a', 'b', 'c', 'd'],
                    line: ['e', 'f', 'g']
                }
            }, {
                column: [null, true, null, true],
                line: [true]
            });
            var expected = {
                column: ['b', 'd'],
                line: ['e']
            };

            expect(actual.series).toEqual(expected);
        });
    });
});
