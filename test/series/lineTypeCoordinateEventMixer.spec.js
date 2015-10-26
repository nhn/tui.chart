/**
 * @fileoverview Test for LineTypeCoordinateEventMixer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

//var LineTypeCoordinateEventMixer = require('../../src/js/series/lineTypeCoordinateEventMixer');

xdescribe('LineTypeSeriesBase', function() {
    var series;

    beforeEach(function() {
        series = new LineTypeCoordinateEventMixer();
    });

    describe('_makeTickGroups()', function() {
        it('좌표 이벤트 감지를 위해 tick의 x축 count 정보를 근거로 하는 좌표 그룹 정보를 생성합니다.', function() {
            var acutal = series._makeTickGroups(3, 200),
                expected = [
                    {
                        min: 0,
                        max: 50
                    },
                    {
                        min: 50,
                        max: 150
                    },
                    {
                        min: 150,
                        max: 200
                    }
                ];
            expect(acutal).toEqual(expected);
        });
    });

    describe('_makeCoordinateData()', function() {
        it('좌표 이벤트 감지를 위한 기본 data를 구성합니다.', function() {
            var dimension = {
                    width: 200
                },
                seriesData = {
                    groupPositions: [
                        [0.2, 0.4],
                        [0.5, 0.1],
                        [0.6, 0.3]
                    ]
                },
                actual = series._makeCoordinateData(dimension, 3, seriesData),
                expected = {
                    groups: [
                        {
                            min: 0,
                            max: 50
                        },
                        {
                            min: 50,
                            max: 150
                        },
                        {
                            min: 150,
                            max: 200
                        }
                    ],
                    items: [
                        [0.2, 0.5, 0.6],
                        [0.4, 0.1, 0.3]
                    ]
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_findGroupIndex()', function() {
        it('마우스 X좌표값(layerX)으로 groups를 탐색하여 해당하는 group index를 찾아냅니다.', function() {
            var actual, exptected;
            series.coordinateData = {
                groups: [
                    {
                        min: 0,
                        max: 50
                    },
                    {
                        min: 50,
                        max: 150
                    }
                ]
            };
            actual = series._findGroupIndex(70);
            exptected = 1;
            expect(actual).toBe(exptected);
        });

        it('그룹 정보에 해당 좌표값이 없을 경우에는 -1을 반환합니다.', function() {
            var actual, exptected;
            series.coordinateData = {
                groups: [
                    {
                        min: 0,
                        max: 50
                    },
                    {
                        min: 50,
                        max: 150
                    }
                ]
            };
            actual = series._findGroupIndex(170);
            exptected = -1;
            expect(actual).toBe(exptected);
        });
    });

    describe('_findIndex()', function() {
        it('group index와 마우스 Y좌표값(layerX)으로 items를 탐색하여 Y좌표값에 가까운 item의 index를 찾아냅니다.', function() {
            var actual, expected;
            series.coordinateData = {
                items: [
                    [
                        {
                            top: 40
                        },
                        {
                            top: 70
                        }
                    ],
                    [
                        {
                            top: 50
                        },
                        {
                            top: 20
                        }
                    ]
                ]
            };
            actual = series._findIndex(0, 20);
            expected = 0;
            expect(actual).toBe(expected);
        });
    });

    describe('_findIndexes()', function() {
        it('마우스 X, Y좌표값에 해당하는 index정보들을 찾습니다.', function() {
            var actual, expected;
            series.coordinateData = {
                groups: [
                    {
                        min: 0,
                        max: 50
                    },
                    {
                        min: 50,
                        max: 150
                    }
                ],
                items: [
                    [
                        {
                            top: 40
                        },
                        {
                            top: 70
                        }
                    ],
                    [
                        {
                            top: 50
                        },
                        {
                            top: 20
                        }
                    ]
                ]
            };
            actual = series._findIndexes(70, 20);
            expected = {
                groupIndex: 1,
                index: 1
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('_isChanged()', function() {
        it('prevIndexes가 없을 경우에는 true를 반환합니다.', function() {
            var actual = series._isChanged(),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('groupIndex와 index중 하나라도 값이 달라지면 true를 반환합니다.', function() {
            var actual, expected;
            series.prevIndexes = {
                groupIndex: 0,
                index: 0
            };
            actual = series._isChanged({
                groupIndex: 1,
                index: 0
            });
            expected = true;
            expect(actual).toBe(expected);
        });

        it('groupIndex와 index모두 변화가 없으면 false를 반환합니다.', function() {
            var actual, expected;
            series.prevIndexes = {
                groupIndex: 0,
                index: 0
            };
            actual = series._isChanged({
                groupIndex: 0,
                index: 0
            });
            expected = false;
            expect(actual).toBe(expected);
        });
    });
});
