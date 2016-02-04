/**
 * @fileoverview test for MapChartMapModel
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartMapModel = require('../../src/js/charts/mapChartMapModel.js');

describe('MapChartMapModel', function() {
    var mapModel, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getValueMapDatum']);
    });

    beforeEach(function() {
        mapModel = new MapChartMapModel(dataProcessor);
    });

    describe('_makeCoordinate', function() {
        it('coordinateStr값으로 부터 coordinate를 생성합니다', function() {
            var coordinateStr = '1.11,2.22',
                actual = mapModel._makeCoordinate(coordinateStr),
                expected = {
                    x: 1.11,
                    y: 2.22
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCoordinateFromRelativeCoordinate', function() {
        it('상대 coordinateStr값과 prevCoordinate 정보를 이용하여 coordinate를 생성합니다', function() {
            var coordinateStr = '1.11,2.22',
                prevCoordinate = {
                    x: 3,
                    y: 1
                },
                actual = mapModel._makeCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate),
                expected = {
                    x: 4.11,
                    y: 3.22
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeXCoordinate', function() {
        it('coordinateStr값으로 부터 x coordinate를 생성합니다', function() {
            var coordinateStr = '1.11',
                actual = mapModel._makeXCoordinate(coordinateStr),
                expected = {
                    x: 1.11
                };
            expect(actual).toEqual(expected);
        });

        it('","가 포함된 두자리의 이상의 coordinateStr값이 있을 경우 두번째 부터는 무시합니다.', function() {
            var coordinateStr = '1.11,2.22',
                actual = mapModel._makeXCoordinate(coordinateStr),
                expected = {
                    x: 1.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeXCoordinateFroRelativeCoordinate', function() {
        it('상대 coordinateStr값으로 부터 x coordinate를 생성합니다', function() {
            var coordinateStr = '1.11',
                prevCoordinate = {
                    x: 3,
                    y: 1
                },
                actual = mapModel._makeXCoordinateFroRelativeCoordinate(coordinateStr, prevCoordinate),
                expected = {
                    x: 4.11
                };
            expect(actual).toEqual(expected);
        });

        it('","가 포함된 두자리의 이상의 상대 coordinateStr값이 있을 경우 두번째 부터는 무시합니다.', function() {
            var coordinateStr = '1.11,0',
                prevCoordinate = {
                    x: 3,
                    y: 1
                },
                actual = mapModel._makeXCoordinateFroRelativeCoordinate(coordinateStr, prevCoordinate),
                expected = {
                    x: 4.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYCoordinate', function() {
        it('coordinateStr값으로 부터 y coordinate를 생성합니다', function() {
            var coordinateStr = '1.11',
                actual = mapModel._makeYCoordinate(coordinateStr),
                expected = {
                    y: 1.11
                };
            expect(actual).toEqual(expected);
        });

        it('","가 포함된 두자리의 이상의 coordinateStr값이 있을 경우 두번째 부터는 무시합니다.', function() {
            var coordinateStr = '1.11,0',
                actual = mapModel._makeYCoordinate(coordinateStr),
                expected = {
                    y: 1.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYCoordinateFromRelativeCoordinate', function() {
        it('상대 coordinateStr값으로 부터 y coordinate를 생성합니다', function() {
            var coordinateStr = '2.11',
                prevCoordinate = {
                    x: 3,
                    y: 1
                },
                actual = mapModel._makeYCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate),
                expected = {
                    y: 3.11
                };
            expect(actual).toEqual(expected);
        });

        it('","가 포함된 두자리의 이상의 상대 coordinateStr값이 있을 경우 두번째 부터는 무시합니다.', function() {
            var coordinateStr = '2.11,0',
                prevCoordinate = {
                    x: 3,
                    y: 1
                },
                actual = mapModel._makeYCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate),
                expected = {
                    y: 3.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_splitPath()', function() {
        it('path 정보를 command(M, m, L, l, H, h, V, v) 기준으로 나눕니다.', function() {
            var path = 'M0,1L2,3l4,5m6,7H8h9V10v11',
                actual = mapModel._splitPath(path),
                expected = [
                    {
                        type: 'M',
                        coordinate: '0,1'
                    },
                    {
                        type: 'L',
                        coordinate: '2,3'
                    },
                    {
                        type: 'l',
                        coordinate: '4,5'
                    },
                    {
                        type: 'm',
                        coordinate: '6,7'
                    },
                    {
                        type: 'H',
                        coordinate: '8'
                    },
                    {
                        type: 'h',
                        coordinate: '9'
                    },
                    {
                        type: 'V',
                        coordinate: '10'
                    },
                    {
                        type: 'v',
                        coordinate: '11'
                    }
                ];

            expect(actual).toEqual(expected);
        });

        it('path에 Z command가 포함되어있을 경우에는 무시합니다.', function() {
            var path = 'M0,1L2,3Z',
                actual = mapModel._splitPath(path),
                expected = [
                    {
                        type: 'M',
                        coordinate: '0,1'
                    },
                    {
                        type: 'L',
                        coordinate: '2,3'
                    }
                ];

            expect(actual).toEqual(expected);
        });

        it('path에 z command가 포함되어있을 경우에는 무시합니다.', function() {
            var path = 'M0,1l2,3z',
                actual = mapModel._splitPath(path),
                expected = [
                    {
                        type: 'M',
                        coordinate: '0,1'
                    },
                    {
                        type: 'l',
                        coordinate: '2,3'
                    }
                ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCoordinatesFromPath()', function() {
        it('path정보를 파싱하여 coordinates를 생성합니다', function() {
            var path = 'M0,1L2,3l4,5m6,7H8h9V10v11',
                actual = mapModel._makeCoordinatesFromPath(path),
                expected = [
                    {
                        x: 0,
                        y: 1
                    },
                    {
                        x: 2,
                        y: 3
                    },
                    {
                        x: 6,
                        y: 8
                    },
                    {
                        x: 12,
                        y: 15
                    },
                    {
                        x: 8
                    },
                    {
                        x: 17
                    },
                    {
                        y: 10
                    },
                    {
                        y: 21
                    }
                ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_findBoundFromCoordinates()', function() {
        it('coordinates 정보로 부터 bounds 정보를 계산합니다.', function() {
            var coordinates = [
                    {
                        x: 0,
                        y: 1
                    },
                    {
                        x: 2,
                        y: 3
                    },
                    {
                        x: 6,
                        y: 8
                    },
                    {
                        x: 12,
                        y: 15
                    },
                    {
                        x: 8
                    },
                    {
                        x: 17
                    },
                    {
                        y: 10
                    },
                    {
                        y: 21
                    }
                ],
                actual = mapModel._findBoundFromCoordinates(coordinates),
                expected = {
                    dimension: {
                        width: 17,
                        height: 20
                    },
                    position: {
                        left: 0,
                        top: 1
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLabelPosition()', function() {
        it('bounds와 position ratio정보를 이용하여 label의 positon 정보를 계산합니다', function() {
            var bound = {
                    dimension: {
                        width: 319,
                        height: 80
                    },
                    position: {
                        left: 9,
                        top: 74
                    }
                },
                positionRatio = {
                    x: 0.5,
                    y: 0.5
                },
                actual = mapModel._makeLabelPosition(bound, positionRatio),
                expected = {
                    left: 168.5,
                    top: 114
                };

            expect(actual).toEqual(expected);
        });

        it('ratio값에 따라 결과값이 달라집니다.', function() {
            var bound = {
                    dimension: {
                        width: 319,
                        height: 80
                    },
                    position: {
                        left: 9,
                        top: 74
                    }
                },
                positionRatio = {
                    x: 0.6,
                    y: 0.6
                },
                actual = mapModel._makeLabelPosition(bound, positionRatio),
                expected = {
                    left: 200.4,
                    top: 122
                };

            expect(actual).toEqual(expected);
        });

        it('ratio값이 없으면 default ratio인 {left: 0.5, top: 0.5}가 반영됩니다.', function() {
            var bound = {
                    dimension: {
                        width: 319,
                        height: 80
                    },
                    position: {
                        left: 9,
                        top: 74
                    }
                },
                actual = mapModel._makeLabelPosition(bound),
                expected = {
                    left: 168.5,
                    top: 114
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_createMapData()', function() {
        it('rawMapData를 전달받아 mapData 생성합니다.', function() {
            var rawMapData = [
                    {
                        code: 'CD1',
                        name: 'Map name1',
                        path: 'M9,90L169,90L328,58L328,154L169,154L9,154',
                        labelCoordinate: {
                            x: 0.6,
                            y: 0.6
                        }
                    },
                    {
                        code: 'CD2',
                        name: 'Map name2',
                        path: 'M9,122L169,106L328,74L328,154L169,154L9,154'
                    }
                ],
                actual, expected;

            dataProcessor.getValueMapDatum.and.returnValue({});
            mapModel._createMapData(rawMapData);

            actual = mapModel.mapData;
            expected = [
                {
                    code: 'CD1',
                    name: 'Map name1',
                    path: 'M9,90L169,90L328,58L328,154L169,154L9,154',
                    bound: {
                        dimension: {
                            width: 319,
                            height: 96
                        },
                        position: {
                            left: 9,
                            top: 58
                        }
                    },
                    labelPosition: {
                        left: 200.4,
                        top: 115.6
                    }
                },
                {
                    code: 'CD2',
                    name: 'Map name2',
                    path: 'M9,122L169,106L328,74L328,154L169,154L9,154',
                    bound: {
                        dimension: {
                            width: 319,
                            height: 80
                        },
                        position: {
                            left: 9,
                            top: 74
                        }
                    },
                    labelPosition: {
                        left: 168.5,
                        top: 114
                    }
                }
            ];

            expect(actual).toEqual(expected);
        });

        it('valueMap에 존재하는 경우 name, labelCoordinate에 한해 기존 data를 대체합니다.', function() {
            var rawMapData = [
                    {
                        code: 'CD1',
                        name: 'Map name1',
                        path: 'M9,90L169,90L328,58L328,154L169,154L9,154',
                        labelCoordinate: {
                            x: 0.6,
                            y: 0.6
                        }
                    },
                    {
                        code: 'CD2',
                        name: 'Map name2',
                        path: 'M9,122L169,106L328,74L328,154L169,154L9,154'
                    }
                ],
                actual, expected;

            dataProcessor.getValueMapDatum.and.callFake(function(code) {
                var result;

                if (code === 'CD1') {
                    result = {
                        name: 'New Map name1'
                    };
                } else {
                    result = {
                        labelCoordinate: {
                            x: 0.6,
                            y: 0.6
                        }
                    };
                }
                return result;
            });

            mapModel._createMapData(rawMapData);

            actual = mapModel.mapData;
            expected = [
                {
                    code: 'CD1',
                    name: 'New Map name1',
                    path: 'M9,90L169,90L328,58L328,154L169,154L9,154',
                    bound: {
                        dimension: {
                            width: 319,
                            height: 96
                        },
                        position: {
                            left: 9,
                            top: 58
                        }
                    },
                    labelPosition: {
                        left: 200.4,
                        top: 115.6
                    }
                },
                {
                    code: 'CD2',
                    name: 'Map name2',
                    path: 'M9,122L169,106L328,74L328,154L169,154L9,154',
                    bound: {
                        dimension: {
                            width: 319,
                            height: 80
                        },
                        position: {
                            left: 9,
                            top: 74
                        }
                    },
                    labelPosition: {
                        left: 200.4,
                        top: 122
                    }
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('getLabelData()', function() {
        it('valueMap에 해당하는 data만 필터링하여 반환합니다', function() {
            var zoomMagn = 1,
                actual, expected;

            mapModel.mapData = [
                {
                    code: 'CD1',
                    name: 'Map name1',
                    labelPosition: {
                        left: 200.4,
                        top: 115.6
                    }
                },
                {
                    code: 'CD2',
                    name: 'Map name2',
                    labelPosition: {
                        left: 200.4,
                        top: 122
                    }
                }
            ];
            dataProcessor.getValueMapDatum.and.callFake(function(code) {
                var result;

                if (code === 'CD1') {
                    result = {};
                }

                return result;
            });
            actual = mapModel.getLabelData(zoomMagn);
            expected = [
                {
                    name: 'Map name1',
                    labelPosition: {
                        left: 200.4,
                        top: 115.6
                    }
                }
            ];

            expect(actual).toEqual(expected);
        });

        it('zoomMagn를 2로 하면 labelPosition을 두배의 수치로 계산하여 반환합니다', function() {
            var zoomMagn = 2,
                actual, expected;

            mapModel.mapData = [
                {
                    code: 'CD1',
                    name: 'Map name1',
                    labelPosition: {
                        left: 200.4,
                        top: 115.6
                    }
                }
            ];
            dataProcessor.getValueMapDatum.and.returnValue({});
            actual = mapModel.getLabelData(zoomMagn);
            expected = [
                {
                    name: 'Map name1',
                    labelPosition: {
                        left: 400.8,
                        top: 231.2
                    }
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeMapDimension()', function() {
        it('mapData의 dimension과 position 정보를 이용하여 map dimension을 생성합니다', function() {
            var actual, expected;

            mapModel.mapData = [
                {
                    bound: {
                        dimension: {
                            width: 319,
                            height: 96
                        },
                        position: {
                            left: 9,
                            top: 58
                        }
                    }
                },
                {
                    bound: {
                        dimension: {
                            width: 319,
                            height: 80
                        },
                        position: {
                            left: 109,
                            top: 208
                        }
                    }
                }
            ];

            actual = mapModel._makeMapDimension();
            expected = {
                width: 419,
                height: 230
            };

            expect(actual).toEqual(expected);
        });
    });
});
