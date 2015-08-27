/**
 * @fileoverview template maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../src/js/helpers/templateMaker.js');

describe('test templateMaker', function() {
    it('template()', function() {
        var tag = '<a>{{ key1 }}<span>{{ key2 }}</span></a>{{ key1 }}',
            template = templateMaker.template(tag),
            result = template({key1: 'ABC', key2: 'DEF'});
        expect(result).toEqual('<a>ABC<span>DEF</span></a>ABC');
    });
});
