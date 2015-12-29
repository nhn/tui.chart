/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('../../src/js/plugins/raphaelRenderUtil');

describe('RaphaelLineTypeBase', function() {
    describe('makeLinePath()', function() {
        it('from position, to position을 이용하여 line graph를 그리기 위한 line path를 생성합니다.', function() {
            var actual = raphaelRenderUtil.makeLinePath(
                    {
                        left: 10,
                        top: 10
                    }, {
                        left: 100,
                        top: 100
                    }
                ),
                expected = ['M', 10, 10, 'L', 100, 100];
            expect(actual).toEqual(expected);
        });

        it('from position, to position이 같으면 (line두께 % 2 / 2)를 뺀 path를 생성합니다.', function() {
            var actual = raphaelRenderUtil.makeLinePath(
                    {
                        left: 10,
                        top: 10
                    }, {
                        left: 10,
                        top: 10
                    }
                ),
                expected = ['M', 9.5, 9.5, 'L', 9.5, 9.5];
            expect(actual).toEqual(expected);
        });
    });
});
