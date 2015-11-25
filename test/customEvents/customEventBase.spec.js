/**
 * @fileoverview Test for CustomEventBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('../../src/js/customEvents/customEventBase');

describe('CustomEventBase', function() {
    var customEventBase;

    beforeEach(function() {
        customEventBase = new CustomEventBase({});
    });

    describe('_isChanged()', function() {
        it('찾아낸 data가 없으면 true를 반환합니다..', function() {
            var actual = customEventBase._isChanged({
                    chartType: 'column'
                }, null),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('이전 data가 없으면 true를 반환합니다..', function() {
            var actual = customEventBase._isChanged(null, {
                    chartType: 'line'
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('찾아낸 data가 이전 data와 chartType이 다르면 true를 반환합니다..', function() {
            var actual = customEventBase._isChanged({
                    chartType: 'column'
                }, {
                    chartType: 'line'
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('찾아낸 data가 이전 data와 groupIndex가 다르면 true를 반환합니다..', function() {
            var actual = customEventBase._isChanged({
                    indexes: {
                        groupIndex: 0
                    }
                }, {
                    indexes: {
                        groupIndex: 1
                    }
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('찾아낸 data가 이전 data와 index 다르면 true를 반환합니다..', function() {
            var actual = customEventBase._isChanged({
                    indexes: {
                        index: 0
                    }
                }, {
                    indexes: {
                        index: 1
                    }
                }),
                expected = true;
            expect(actual).toBe(expected);
        });
    });
});
