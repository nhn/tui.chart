/**
 * @fileoverview Test for AreaTypeDataModel.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeDataModel = require('../../src/js/customEvents/areaTypeDataModel');

describe('AreaTypeDataModel', function() {
    var dataModel;

    beforeEach(function() {
        dataModel = new AreaTypeDataModel({
            data: {
                groupPositions: []
            },
            chartType: 'line'
        });
    });

    describe('_makeData()', function() {
        it('seriesInfo.data.groupPositions의 bound정보와 chartType, index 정보들을 조합한 2차원 배열 data를 반환합니다.', function() {
            var actual = dataModel._makeData([[
                    {
                        left: 10,
                        top: 10
                    }
                ]], 'line');

            expect(actual[0][0].chartType).toBe('line');
            expect(actual[0][0].indexes.groupIndex).toBe(0);
            expect(actual[0][0].indexes.index).toBe(0);
            expect(actual[0][0].bound).toEqual({
                left: 10,
                top: 10
            });
        });
    });

    describe('findData()', function() {
        it('groupIndex에 해당하는 data 그룹 중 layerY에 제일 가까운 data를 찾습니다.', function() {
            var actual, expected;
            dataModel.data = [[
                {
                    bound: {
                        top: 10
                    }
                },

                {
                    bound: {
                        top: 20
                    }
                }
            ]];
            actual = dataModel.findData(0, 16);
            expected = dataModel.data[0][1];
            expect(actual).toBe(expected);
        });
    });
});
