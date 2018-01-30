/**
 * @fileoverview Test for MapChartMapModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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
        it('create coordinate from coordinateStr', function() {
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
        it('should create coordinate from coordinateStr, prevCoordinate', function() {
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
        it('should create x coordinate from coordinateStr', function() {
            var coordinateStr = '1.11',
                actual = mapModel._makeXCoordinate(coordinateStr),
                expected = {
                    x: 1.11
                };
            expect(actual).toEqual(expected);
        });

        it('should discard coordinateStr value after ",", when coordinateStr length is larger than 1', function() {
            var coordinateStr = '1.11,2.22',
                actual = mapModel._makeXCoordinate(coordinateStr),
                expected = {
                    x: 1.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeXCoordinateFroRelativeCoordinate', function() {
        it('create x cooridnate from coordinateStr', function() {
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

        it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', function() {
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
        it('create y coordinate from coordinateStr', function() {
            var coordinateStr = '1.11',
                actual = mapModel._makeYCoordinate(coordinateStr),
                expected = {
                    y: 1.11
                };
            expect(actual).toEqual(expected);
        });

        it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', function() {
            var coordinateStr = '1.11,0',
                actual = mapModel._makeYCoordinate(coordinateStr),
                expected = {
                    y: 1.11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYCoordinateFromRelativeCoordinate', function() {
        it('should create y coordinate from coordinateStr', function() {
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

        it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', function() {
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
        it('should split path infomation by command(M, m, L, l, H, h, V, v)', function() {
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

        it('should ignore z command', function() {
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

        it('should ingnore z command', function() {
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
        it('create coordinates by path information', function() {
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
        it('should calculate bounds from coordinates', function() {
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
        it('should calculate label position by bounds and position ratio', function() {
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

        it('should set label position according to ratio', function() {
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

        it('should set default value({left: 0.5, top: 0.5}), when no ratio value', function() {
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
        var rawMapData;

        beforeEach(function() {
            rawMapData = [
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
            ];
        });

        it('should create mapData from rawMapData', function() {
            var actual, expected;

            dataProcessor.getValueMapDatum.and.returnValue({});

            actual = mapModel._createMapData(rawMapData);
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

        it('should replace name, labelCoordinate data, when valueMap[code] exists', function() {
            var actual, expected;

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

            actual = mapModel._createMapData(rawMapData);
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

        it('should have ratio property, when ratio is zero', function() {
            var actual;

            dataProcessor.getValueMapDatum.and.callFake(function(code) {
                if (code === 'CD1') {
                    return {
                        name: 'New Map name1',
                        ratio: 0
                    };
                }

                return {
                    name: 'New Map name2'
                };
            });

            actual = mapModel._createMapData(rawMapData);
            expect('ratio' in actual[0]).toBe(true);
            expect('ratio' in actual[1]).toBe(false);
        });
    });

    describe('getLabelData()', function() {
        it('should filter valueMap data by code', function() {
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

        it('should double labelPosition, when zoomMagn set to 2', function() {
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
        it('should create map dimension from dimension and position of map data', function() {
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
