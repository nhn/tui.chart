/**
 * @fileoverview Test for SeriesDataModelForBullet.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('../../../src/js/models/data/seriesDataModelForBullet');
var SeriesGroup = require('../../../src/js/models/data/seriesGroup');
var SeriesItem = require('../../../src/js/models/data/seriesItem');

describe('Test for SeriesDataModelForBullet', function() {
    /* eslint-disable object-property-newline */
    var seriesDataModel;

    beforeEach(function() {
        seriesDataModel = new SeriesDataModel({});
        seriesDataModel.rawSeriesData = [
            {data: 11, ranges: [[-29, -10], [-10, 11], [11, 30]], markers: [10, 9]},
            {data: 20, ranges: [[-29, -10], [-10, 11], [11, 30]], markers: [10, 9, 8, 7]}
        ];
    });

    describe('_createSeriesGroupsFromRawData()', function() {
        it('should create series group from base groups', function() {
            var actual = seriesDataModel._createSeriesGroupsFromRawData();

            expect(actual.length).toBe(2);
            expect(actual[0] instanceof SeriesGroup).toBe(true);
            expect(actual[0].items.length).toBe(6);
        });

        it('should create series item from raw data', function() {
            var actual = seriesDataModel._createSeriesGroupsFromRawData()[0].items;

            expect(actual.length).toBe(6);
            expect(actual[0].value).toBe(-29);
            expect(actual[1].value).toBe(11);
            expect(actual[2].value).toBe(30);
            expect(actual[3].value).toBe(11);
            expect(actual[4].value).toBe(10);
            expect(actual[5].value).toBe(9);
        });
    });

    describe('_createBaseGroups()', function() {
        it('should create base group from raw data', function() {
            var actual = seriesDataModel._createBaseGroups()[0];

            expect(actual.length).toBe(6);
            expect(actual[0].value).toBe(-29);
            expect(actual[1].value).toBe(11);
            expect(actual[2].value).toBe(30);
            expect(actual[3].value).toBe(11);
            expect(actual[4].value).toBe(10);
            expect(actual[5].value).toBe(9);
        });
    });

    describe('_createValues()', function() {
        it('should create base group from seriesGroup', function() {
            var rawSeriesData = [
                {data: 11, ranges: [[-29, -10], [-10, 11], [11, 30]], markers: [10, 9]}
            ];
            var actual;

            seriesDataModel.rawSeriesData = rawSeriesData;
            seriesDataModel.groups = [
                new SeriesGroup([
                    new SeriesItem({datum: 11}),
                    new SeriesItem({datum: [-29, -10]}),
                    new SeriesItem({datum: [-10, 11]}),
                    new SeriesItem({datum: [11, 30]}),
                    new SeriesItem({datum: 10}),
                    new SeriesItem({datum: 9})
                ])
            ];

            actual = seriesDataModel._createValues();
            expect(actual).toEqual([11, -29, -10, 11, -10, 30, 11, 10, 9]);
        });
    });
});
