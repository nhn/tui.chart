/**
 * @fileoverview Test for MapChartMapModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import MapChartMapModel from '../../src/js/charts/mapChartMapModel.js';

describe('MapChartMapModel', () => {
  let mapModel, dataProcessor;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', ['getValueMapDatum']);
  });

  beforeEach(() => {
    mapModel = new MapChartMapModel(dataProcessor);
  });

  describe('_makeCoordinate', () => {
    it('create coordinate from coordinateStr', () => {
      const coordinateStr = '1.11,2.22';
      const actual = mapModel._makeCoordinate(coordinateStr);
      const expected = {
        x: 1.11,
        y: 2.22
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeCoordinateFromRelativeCoordinate', () => {
    it('should create coordinate from coordinateStr, prevCoordinate', () => {
      const coordinateStr = '1.11,2.22';
      const prevCoordinate = {
        x: 3,
        y: 1
      };
      const actual = mapModel._makeCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate);
      const expected = {
        x: 4.11,
        y: 3.22
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeXCoordinate', () => {
    it('should create x coordinate from coordinateStr', () => {
      const coordinateStr = '1.11';
      const actual = mapModel._makeXCoordinate(coordinateStr);
      const expected = {
        x: 1.11
      };
      expect(actual).toEqual(expected);
    });

    it('should discard coordinateStr value after ",", when coordinateStr length is larger than 1', () => {
      const coordinateStr = '1.11,2.22';
      const actual = mapModel._makeXCoordinate(coordinateStr);
      const expected = {
        x: 1.11
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeXCoordinateFroRelativeCoordinate', () => {
    it('create x cooridnate from coordinateStr', () => {
      const coordinateStr = '1.11';
      const prevCoordinate = {
        x: 3,
        y: 1
      };
      const actual = mapModel._makeXCoordinateFroRelativeCoordinate(coordinateStr, prevCoordinate);
      const expected = {
        x: 4.11
      };
      expect(actual).toEqual(expected);
    });

    it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', () => {
      const coordinateStr = '1.11,0';
      const prevCoordinate = {
        x: 3,
        y: 1
      };
      const actual = mapModel._makeXCoordinateFroRelativeCoordinate(coordinateStr, prevCoordinate);
      const expected = {
        x: 4.11
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeYCoordinate', () => {
    it('create y coordinate from coordinateStr', () => {
      const coordinateStr = '1.11';
      const actual = mapModel._makeYCoordinate(coordinateStr);
      const expected = {
        y: 1.11
      };
      expect(actual).toEqual(expected);
    });

    it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', () => {
      const coordinateStr = '1.11,0';
      const actual = mapModel._makeYCoordinate(coordinateStr);
      const expected = {
        y: 1.11
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeYCoordinateFromRelativeCoordinate', () => {
    it('should create y coordinate from coordinateStr', () => {
      const coordinateStr = '2.11';
      const prevCoordinate = {
        x: 3,
        y: 1
      };
      const actual = mapModel._makeYCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate);
      const expected = {
        y: 3.11
      };
      expect(actual).toEqual(expected);
    });

    it('should discard coordinateStr after ",", if coordinateStr length is larget than 1', () => {
      const coordinateStr = '2.11,0';
      const prevCoordinate = {
        x: 3,
        y: 1
      };
      const actual = mapModel._makeYCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate);
      const expected = {
        y: 3.11
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_splitPath()', () => {
    it('should split path infomation by command(M, m, L, l, H, h, V, v)', () => {
      const path = 'M0,1L2,3l4,5m6,7H8h9V10v11';
      const actual = mapModel._splitPath(path);
      const expected = [
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

    it('should ignore z command', () => {
      const path = 'M0,1L2,3Z';
      const actual = mapModel._splitPath(path);
      const expected = [
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

    it('should ingnore z command', () => {
      const path = 'M0,1l2,3z';
      const actual = mapModel._splitPath(path);
      const expected = [
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

  describe('_makeCoordinatesFromPath()', () => {
    it('create coordinates by path information', () => {
      const path = 'M0,1L2,3l4,5m6,7H8h9V10v11';
      const actual = mapModel._makeCoordinatesFromPath(path);
      const expected = [
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

  describe('_findBoundFromCoordinates()', () => {
    it('should calculate bounds from coordinates', () => {
      const coordinates = [
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
      const actual = mapModel._findBoundFromCoordinates(coordinates);
      const expected = {
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

  describe('_makeLabelPosition()', () => {
    it('should calculate label position by bounds and position ratio', () => {
      const bound = {
        dimension: {
          width: 319,
          height: 80
        },
        position: {
          left: 9,
          top: 74
        }
      };
      const positionRatio = {
        x: 0.5,
        y: 0.5
      };
      const actual = mapModel._makeLabelPosition(bound, positionRatio);
      const expected = {
        left: 168.5,
        top: 114
      };

      expect(actual).toEqual(expected);
    });

    it('should set label position according to ratio', () => {
      const bound = {
        dimension: {
          width: 319,
          height: 80
        },
        position: {
          left: 9,
          top: 74
        }
      };
      const positionRatio = {
        x: 0.6,
        y: 0.6
      };
      const actual = mapModel._makeLabelPosition(bound, positionRatio);
      const expected = {
        left: 200.4,
        top: 122
      };

      expect(actual).toEqual(expected);
    });

    it('should set default value({left: 0.5, top: 0.5}), when no ratio value', () => {
      const bound = {
        dimension: {
          width: 319,
          height: 80
        },
        position: {
          left: 9,
          top: 74
        }
      };
      const actual = mapModel._makeLabelPosition(bound);
      const expected = {
        left: 168.5,
        top: 114
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_createMapData()', () => {
    let rawMapData;

    beforeEach(() => {
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

    it('should create mapData from rawMapData', () => {
      dataProcessor.getValueMapDatum.and.returnValue({});

      const actual = mapModel._createMapData(rawMapData);
      const expected = [
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

    it('should replace name, labelCoordinate data, when valueMap[code] exists', () => {
      dataProcessor.getValueMapDatum.and.callFake(code => {
        let result;

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

      const actual = mapModel._createMapData(rawMapData);
      const expected = [
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

    it('should have ratio property, when ratio is zero', () => {
      dataProcessor.getValueMapDatum.and.callFake(code => {
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

      const actual = mapModel._createMapData(rawMapData);
      expect('ratio' in actual[0]).toBe(true);
      expect('ratio' in actual[1]).toBe(false);
    });
  });

  describe('getLabelData()', () => {
    it('should filter valueMap data by code', () => {
      const zoomMagn = 1;

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
      dataProcessor.getValueMapDatum.and.callFake(code => {
        let result;

        if (code === 'CD1') {
          result = {};
        }

        return result;
      });
      const actual = mapModel.getLabelData(zoomMagn);
      const expected = [
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

    it('should double labelPosition, when zoomMagn set to 2', () => {
      const zoomMagn = 2;

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
      const actual = mapModel.getLabelData(zoomMagn);
      const expected = [
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

  describe('_makeMapDimension()', () => {
    it('should create map dimension from dimension and position of map data', () => {
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

      const actual = mapModel._makeMapDimension();
      const expected = {
        width: 419,
        height: 230
      };

      expect(actual).toEqual(expected);
    });
  });
});
