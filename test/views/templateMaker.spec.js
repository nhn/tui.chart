/**
 * @fileoverview template maker
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var templateMaker = require('../../src/js/views/templateMaker.js');

describe('test templateMaker', function() {
    it('test template', function() {
        var tag = '<a>{{ key1 }}<span>{{ key2 }}</span></a>{{ key1 }}',
            template = templateMaker.template(tag),
            result = template({key1: '가나다', key2: '라마바'});
        expect(result).toEqual('<a>가나다<span>라마바</span></a>가나다');
    });
});