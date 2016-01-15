/**
 * @fileoverview test barTypeMixer.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var barTypeMixer = require('../../src/js/charts/barTypeMixer.js');

describe('ComboChart', function() {
    describe('_pickStacks', function() {
        it('rawSeriesData에서 stack을 추출합니다.', function() {
            var rawSeriesData = [
                    {
                        data: [],
                        stack: 'stack1'
                    },
                    {
                        data: [],
                        stack: 'stack2'
                    }
                ],
                actual = barTypeMixer._pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('stack 값이 없는 경우에는 결과에서 배제되어야 합니다.(undefined가 추출되면 안됨)', function() {
            var rawSeriesData = [
                    {
                        data: []
                    },
                    {
                        data: [],
                        stack: 'stack1'
                    }
                ],
                actual = barTypeMixer._pickStacks(rawSeriesData),
                expected = ['stack1'];
            expect(actual).toEqual(expected);
        });

        it('중복되지 않은 상태의 추출된 순서대로 반환합니다.', function() {
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
                        stack: 'stack2'
                    }
                ],
                actual = barTypeMixer._pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('3개 이상인 경우 2개 까지만 반환합니다.', function() {
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
                ],
                actual = barTypeMixer._pickStacks(rawSeriesData),
                expected = ['stack1', 'stack2'];
            expect(actual).toEqual(expected);
        });

        it('모든 값에 stack 값이 없는 경우에는 빈 배열이 반환되어야 합니다.', function() {
            var rawSeriesData = [
                    {
                        data: []
                    },
                    {
                        data: []
                    }
                ],
                actual = barTypeMixer._pickStacks(rawSeriesData),
                expected = [];
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
                ],
                actual = barTypeMixer._makeNormalDivergingRawSeriesData(rawSeriesData),
                expected = [
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
                ],
                actual = barTypeMixer._makeNormalDivergingRawSeriesData(rawSeriesData),
                expected = [
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
                ],
                actual = barTypeMixer._makeNormalDivergingRawSeriesData(rawSeriesData),
                expected = [
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

    describe('_makeStackedDivergingRawSeriesData()', function() {
        it('stacks중 0번 stack값을 갖고있는 요소의 data들의 양수는 음수로 음수는 0으로 변경합니다.', function() {
            var rawSeriesData = [
                    {
                        data: [1, -2, 3],
                        stack: 'stack1'
                    }
                ],
                actual = barTypeMixer._makeStackedDivergingRawSeriesData(rawSeriesData),
                expected = [
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
                ],
                actual = barTypeMixer._makeStackedDivergingRawSeriesData(rawSeriesData),
                expected = [
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
                ],
                actual = barTypeMixer._makeStackedDivergingRawSeriesData(rawSeriesData),
                expected = [
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
        it('stacked옵션이 없을 경우에는 _makeNormalDivergingRawSeriesData()의 실행 결과를 반환합니다.', function() {
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
                ],
                actual = barTypeMixer._makeRawSeriesDataForDiverging(rawSeriesData),
                expected = barTypeMixer._makeNormalDivergingRawSeriesData(rawSeriesData);

            expect(actual).toEqual(expected);
        });

        it('유효한 stacked옵션이 있을 경우에는 _makeStackedDivergingRawSeriesData()의 실행 결과를 반환합니다.', function() {
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
                ],
                actual = barTypeMixer._makeRawSeriesDataForDiverging(rawSeriesData, 'normal'),
                expected = barTypeMixer._makeStackedDivergingRawSeriesData(rawSeriesData);

            expect(actual).toEqual(expected);
        });

        it('유효하지 않은 stacked옵션이 있을 경우에는 _makeNormalDivergingRawSeriesData()의 실행 결과를 반환합니다.', function() {
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
                ],
                actual = barTypeMixer._makeRawSeriesDataForDiverging(rawSeriesData, true),
                expected = barTypeMixer._makeNormalDivergingRawSeriesData(rawSeriesData);

            expect(actual).toEqual(expected);
        });
    });
});
