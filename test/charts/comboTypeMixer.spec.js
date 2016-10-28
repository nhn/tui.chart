/**
 * @fileoverview Test for ComboChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var comboTypeMixer = require('../../src/js/charts/comboTypeMixer.js');

describe('Test for comboTypeMixer', function() {
    describe('_makeOptionsMap()', function() {
        it('옵션이 있을 경우에는 각 chartType에 맞는 옵션을 추출하여 chartType을 key로 하는 y축 옵션 정보 맵을 생성합니다.', function() {
            var actual;

            comboTypeMixer.options = {
                series: {
                    column: {
                        stackType: 'normal'
                    },
                    line: {
                        showDot: true
                    }
                },
                tooltip: {
                    column: {
                        suffix: '%'
                    },
                    line: {
                        position: 'left top'
                    }
                },
                chartType: 'combo'
            };

            actual = comboTypeMixer._makeOptionsMap(['column', 'line']);

            expect(actual.column).toEqual({
                stackType: 'normal'
            });
            expect(actual.line).toEqual({
                showDot: true
            });
        });
    });
});
