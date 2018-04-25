/**
 * @fileoverview This is template maker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

export default {
    /**
     * This is template maker.
     * @param {string} html html
     * @returns {function} template function
     * @eaxmple
     *
     *   var template = templateMaker.template('<span>{{ name }}</span>'),
     *       result = template({name: 'John');
     *   console.log(result); // <span>John</span>
     *
     */
    template(html) {
        return function(data) {
            let result = html;

            Object.entries(data).forEach(([key, value]) => {
                const regExp = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                result = result.replace(regExp, String(value).replace('$', '＄'));
            });

            return result;
        };
    }
};
