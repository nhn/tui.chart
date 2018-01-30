/**
 * @fileoverview Test for templateMaker
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../src/js/helpers/templateMaker.js');

describe('Test for templateMaker', function() {
    describe('template()', function() {
        it('should make HTML using template', function() {
            var tag = '<a>{{ key1 }}<span>{{ key2 }}</span></a>{{ key1 }}',
                template = templateMaker.template(tag),
                result = template({key1: 'ABC', key2: 'DEF'});
            expect(result).toBe('<a>ABC<span>DEF</span></a>ABC');
        });
    });
});
