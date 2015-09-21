/**
 * @fileoverview template maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../src/js/helpers/templateMaker.js');

describe('templateMaker', function() {
    describe('template()', function() {
        it('템플릿팅 결과입니다.', function () {
            var tag = '<a>{{ key1 }}<span>{{ key2 }}</span></a>{{ key1 }}',
                template = templateMaker.template(tag),
                result = template({key1: 'ABC', key2: 'DEF'});
            expect(result).toBe('<a>ABC<span>DEF</span></a>ABC');
        });
    });
});
