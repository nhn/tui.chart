/**
 * @fileoverview template maker
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

module.exports = {
    /**
     * template maker
     * @param {string} tag
     * @returns {function}
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