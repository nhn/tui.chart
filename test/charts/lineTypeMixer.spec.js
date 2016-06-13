/**
 * @fileoverview Test for lineTypeMixer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var lineTypeMixer = require('../../src/js/charts/lineTypeMixer.js');

describe('Test for lineTypeMixer', function() {
    describe('_filterRawDataForZoom()', function() {
        it('전달하는 raw data를 전달하는 index 범위(indexRange)로 필터링하여 반환합니다.', function() {
            var rawData = {
                categories: ['cate1', 'cate2', 'cate3', 'cate4', 'cate5'],
                series: [
                    {
                        data: [1, 2, 3, 4, 5]
                    },
                    {
                        data: [11, 12, 13, 14 ,15]
                    }
                ]
            };
            var actual = lineTypeMixer._filterRawDataForZoom(rawData, [1, 3]);
            var expected = {
                categories: ['cate2', 'cate3', 'cate4'],
                series: [
                    {
                        data: [2, 3, 4]
                    },
                    {
                        data: [12, 13, 14]
                    }
                ]
            };

            expect(actual).toEqual(expected);
        });
    });
});
