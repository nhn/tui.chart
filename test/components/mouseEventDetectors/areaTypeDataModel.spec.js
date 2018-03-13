/**
 * @fileoverview Test for AreaTypeDataModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeDataModel = require('../../../src/js/components/mouseEventDetectors/areaTypeDataModel');

describe('Test for AreaTypeDataModel', function() {
    var dataModel;

    beforeEach(function() {
        dataModel = new AreaTypeDataModel([{
            chartType: 'line',
            data: {
                groupPositions: []
            }
        }]);
    });

    describe('_makeData()', function() {
        it('make data for detecting mouse event', function() {
            var seriesItemBoundsData = [
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
            ];
            var actual = dataModel._makeData(seriesItemBoundsData);

            expect(actual[0].chartType).toBe('line');
            expect(actual[0].indexes.groupIndex).toBe(0);
            expect(actual[0].indexes.index).toBe(0);
            expect(actual[0].bound).toEqual({
                left: 10,
                top: 10
            });
        });
    });

    describe('findData()', function() {
        it('find data', function() {
            var actual, expected;
            dataModel.data = [
                {
                    bound: {
                        top: 10,
                        left: 10
                    },
                    indexes: {
                        groupIndex: 0,
                        index: 0
                    }
                },
                {
                    bound: {
                        top: 20,
                        left: 20
                    }
                }
            ];
            actual = dataModel.findData({
                x: 17,
                y: 10
            }, null, null);
            expected = dataModel.data[0];
            expect(actual).toBe(expected);
        });
    });
});
