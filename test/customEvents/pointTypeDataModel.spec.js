/**
 * @fileoverview Test for PointTypeDataModel.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PointTypeDataModel = require('../../src/js/customEvents/pointTypeDataModel');

describe('PointTypeDataModel', function() {
    var dataModel;

    beforeEach(function() {
        dataModel = new PointTypeDataModel([{
            data: {
                groupBounds: []
            },
            chartType: 'column'
        }]);
    });

    describe('_makeRectTypeCoordinateData()', function() {
        it('rect 형태의 그래프로 된 series들의 좌표 data를 생성합니다.', function() {
            var actual = dataModel._makeRectTypeCoordinateData([[
                {
                    end: {
                        left: 10,
                        top: 10,
                        width: 20,
                        height: 50
                    }
                }
                ]], 'column');

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

    describe('_makeDotTypeCoordinateData()', function() {
        it('dot 형태의 그래프로 된 series들의 좌표 data를 생성합니다.', function() {
            var actual = dataModel._makeDotTypeCoordinateData([[
                {
                    left: 10,
                    top: 10
                }
            ]], 'line');

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

    describe('_joinData()', function() {
        it('3차원 배열에서 마지막 배열끼리 join 시킨다.', function() {
            var actual = dataModel._joinData([
                    [
                        [1, 2, 3, 4, 5],
                        [11, 12, 13, 14, 15]
                    ],
                    [
                        [6, 7, 8],
                        [16, 17, 18]
                    ]
                ]),
                expected = [
                    [1, 2, 3, 4, 5, 6, 7, 8],
                    [11, 12, 13, 14, 15, 16, 17, 18]
                ];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeData()', function() {
        it('seriesInfos에 colum 차트와 line차트 series 정보를 전달하여 생성하면 series의 순서가 뒤집히면서 두개의 타입이 통합되어 하나의 data로 생성된다.', function() {
            var actual = dataModel._makeData([
                {
                    chartType: 'column',
                    data: {
                        groupBounds: [[
                            {
                                end: {
                                    left: 10,
                                    top: 10,
                                    width: 20,
                                    height: 50
                                }
                            }
                        ]]
                    }
                },
                {
                    chartType: 'line',
                    data: {
                        groupPositions: [[
                            {
                                left: 10,
                                top: 10
                            }
                        ]]
                    }
                }
            ]);

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

            expect(actual[0][1].sendData.chartType).toBe('column');
            expect(actual[0][1].sendData.indexes.groupIndex).toBe(0);
            expect(actual[0][1].sendData.indexes.index).toBe(0);
            expect(actual[0][1].sendData.bound).toEqual({
                left: 10,
                top: 10,
                width: 20,
                height: 50
            });
            expect(actual[0][1].bound).toEqual({
                left: 10,
                top: 10,
                right: 30,
                bottom: 60
            });
        });
    });

    describe('findData()', function() {
        it('groupIndex에 해당하는 data 그룹 중 layerX, layerY정보를 포함하는 data 후보군 중에서 layerY에 제일 가까운 data를 찾습니다.', function() {
            var actual, expected;
            dataModel.data = [[
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
            ]];
            actual = dataModel.findData(0, 20, 28);
            expected = dataModel.data[0][0].sendData;
            expect(actual).toBe(expected);
        });
    });
});
