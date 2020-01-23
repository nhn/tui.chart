/**
 * @fileoverview Test for BoundsBaseCoordinateModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import BoundsBaseCoordinateModel from '../../../src/js/components/mouseEventDetectors/boundsBaseCoordinateModel';

describe('Test for BoundsBaseCoordinateModel', () => {
  let coordinateModel;

  beforeEach(() => {
    coordinateModel = new BoundsBaseCoordinateModel([
      {
        data: {
          groupBounds: []
        },
        chartType: 'column'
      }
    ]);
  });

  describe('_makeRectTypePositionData()', () => {
    it('should create rect type coordinate data', () => {
      const actual = coordinateModel._makeRectTypePositionData(
        [
          [
            {
              end: {
                left: 10,
                top: 10,
                width: 20,
                height: 50
              }
            }
          ]
        ],
        'column'
      );

      expect(actual[0][0].sendData.chartType).toBe('column');
      expect(actual[0][0].sendData.indexes.groupIndex).toBe(0);
      expect(actual[0][0].sendData.indexes.index).toBe(0);
      expect(actual[0][0].sendData.bound).toEqual({
        left: 10,
        top: 10,
        width: 20,
        height: 50
      });
      expect(actual[0][0].bound).toEqual({
        left: 10,
        top: 10,
        right: 30,
        bottom: 60
      });
    });
  });

  describe('_makeDotTypePositionData()', () => {
    it('should create dot type coordinate data', () => {
      const actual = coordinateModel._makeDotTypePositionData(
        [
          [
            {
              left: 10,
              top: 10
            }
          ]
        ],
        'line'
      );

      expect(actual[0][0].sendData.chartType).toBe('line');
      expect(actual[0][0].sendData.indexes.groupIndex).toBe(0);
      expect(actual[0][0].sendData.indexes.index).toBe(0);
      expect(actual[0][0].sendData.bound).toEqual({
        left: 10,
        top: 10
      });
      expect(actual[0][0].bound).toEqual({
        left: 6,
        top: 6,
        right: 14,
        bottom: 14
      });
    });
  });

  describe('_joinData()', () => {
    it('join last depth array', () => {
      const actual = coordinateModel._joinData([
        [
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 1
              }
            },
            {
              sendData: {
                indexes: {
                  index: 1
                },
                value: 2
              }
            }
          ],
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 3
              }
            },
            {
              sendData: {
                indexes: {
                  index: 1
                },
                value: 4
              }
            }
          ]
        ],
        [
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 5
              }
            }
          ],
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 6
              }
            }
          ]
        ]
      ]);
      const expected = [
        [
          {
            sendData: {
              indexes: {
                index: 0
              },
              value: 1
            }
          },
          {
            sendData: {
              indexes: {
                index: 1
              },
              value: 2
            }
          },
          {
            sendData: {
              indexes: {
                index: 0,
                legendIndex: 2
              },
              value: 5
            }
          }
        ],
        [
          {
            sendData: {
              indexes: {
                index: 0
              },
              value: 3
            }
          },
          {
            sendData: {
              indexes: {
                index: 1
              },
              value: 4
            }
          },
          {
            sendData: {
              indexes: {
                index: 0,
                legendIndex: 2
              },
              value: 6
            }
          }
        ]
      ];

      expect(actual).toEqual(expected);
    });
    it('should not set "datum.sendData.indexes.legendIndex" without datum', () => {
      const actual = coordinateModel._joinData([
        [
          [
            null,
            {
              sendData: {
                indexes: {
                  index: 1
                },
                value: 2
              }
            }
          ],
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 3
              }
            },
            {
              sendData: {
                indexes: {
                  index: 1
                },
                value: 4
              }
            }
          ]
        ],
        [
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 5
              }
            }
          ],
          [
            {
              sendData: {
                indexes: {
                  index: 0
                },
                value: 6
              }
            }
          ]
        ]
      ]);
      const expected = [
        [
          null,
          {
            sendData: {
              indexes: {
                index: 1
              },
              value: 2
            }
          },
          {
            sendData: {
              indexes: {
                index: 0,
                legendIndex: 2
              },
              value: 5
            }
          }
        ],
        [
          {
            sendData: {
              indexes: {
                index: 0
              },
              value: 3
            }
          },
          {
            sendData: {
              indexes: {
                index: 1
              },
              value: 4
            }
          },
          {
            sendData: {
              indexes: {
                index: 0,
                legendIndex: 2
              },
              value: 6
            }
          }
        ]
      ];

      expect(actual).toEqual(expected);
      expect(actual[0][0]).toEqual(null);
    });
  });

  describe('_makeData()', () => {
    it('make data for detecting mouse event', () => {
      const actual = coordinateModel._makeData([
        {
          chartType: 'column',
          data: {
            groupBounds: [
              [
                {
                  end: {
                    left: 10,
                    top: 10,
                    width: 20,
                    height: 50
                  }
                }
              ]
            ]
          }
        },
        {
          chartType: 'line',
          data: {
            groupPositions: [
              [
                {
                  left: 10,
                  top: 10
                }
              ]
            ]
          }
        }
      ]);

      expect(actual[0][0].sendData.chartType).toBe('column');
      expect(actual[0][0].sendData.indexes.groupIndex).toBe(0);
      expect(actual[0][0].sendData.indexes.index).toBe(0);
      expect(actual[0][0].sendData.bound).toEqual({
        left: 10,
        top: 10,
        width: 20,
        height: 50
      });
      expect(actual[0][0].bound).toEqual({
        left: 10,
        top: 10,
        right: 30,
        bottom: 60
      });

      expect(actual[0][1].sendData.chartType).toBe('line');
      expect(actual[0][1].sendData.indexes.groupIndex).toBe(0);
      expect(actual[0][1].sendData.indexes.index).toBe(0);
      expect(actual[0][1].sendData.bound).toEqual({
        left: 10,
        top: 10
      });
      expect(actual[0][1].bound).toEqual({
        left: 6,
        top: 6,
        right: 14,
        bottom: 14
      });
    });
  });

  describe('_findCandidates()', () => {
    it('should filter candidates from data by layerX, laeryY', () => {
      const data = [
          {
            bound: {
              left: 10,
              top: 25,
              right: 20,
              bottom: 35
            },
            sendData: {
              bound: {
                top: 30
              }
            }
          },
          {
            bound: {
              left: 10,
              top: 20,
              right: 20,
              bottom: 30
            },
            sendData: {
              bound: {
                top: 25
              }
            }
          }
        ],
        layerX = 20,
        layerY = 22,
        actual = coordinateModel._findCandidates(data, layerX, layerY),
        expected = [
          {
            bound: {
              left: 10,
              top: 20,
              right: 20,
              bottom: 30
            },
            sendData: {
              bound: {
                top: 25
              }
            }
          }
        ];

      expect(actual).toEqual(expected);
    });

    it('top and bottom are the same, there should be an empty event space.', () => {
      const data = [
        {
          bound: {
            left: 10,
            top: 25,
            right: 20,
            bottom: 25
          }
        }
      ];
      const layerX = 15;
      const layerY = 23;
      const actual = coordinateModel._findCandidates(data, layerX, layerY).length;

      expect(actual).toBe(1);
    });

    it('left and right are the same, there should be an empty event space.', () => {
      const data = [
        {
          bound: {
            left: 10,
            top: 20,
            right: 10,
            bottom: 30
          }
        }
      ];
      const layerX = 8;
      const layerY = 25;
      const actual = coordinateModel._findCandidates(data, layerX, layerY).length;

      expect(actual).toBe(1);
    });
  });

  describe('findData()', () => {
    it('should find closest data from candinates', () => {
      coordinateModel.data = [
        [
          {
            bound: {
              left: 10,
              top: 25,
              right: 20,
              bottom: 35
            },
            sendData: {
              bound: {
                top: 30
              }
            }
          },
          {
            bound: {
              left: 10,
              top: 20,
              right: 20,
              bottom: 30
            },
            sendData: {
              bound: {
                top: 25
              }
            }
          }
        ]
      ];
      const actual = coordinateModel.findData(0, 20, 28);
      const expected = coordinateModel.data[0][0].sendData;
      expect(actual).toBe(expected);
    });
  });
});
