/**
 * @fileoverview This is template maker.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

module.exports = {
    /**
     * This is template maker.
     * @param {string} tag
     * @returns {function}
     * @eaxmple
     *
     *   var template = templateMaker.template('<span>{= name }</span>'),
     *       result = template({name: 'John');
     *   console.log(result); // <span>John</span>
     *
     */
    template: function (tag) {
        return function (data) {
            var result = tag;
            ne.util.forEach(data, function (value, key) {
                var regExp = new RegExp('{=\\s*' + key + '\\s*}', 'g');
                result = result.replace(regExp, value);
            });
            return result;
        }
    }
};