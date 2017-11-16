/**
 * @fileoverview util for console
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = {
    /**
     * check if window.console exists
     * @param {string} message - message
     * @param {string} status - print function of window.console
     */
    print: function(message, status) {
        status = status || 'log';

        if (window.console) {
            window.console[status](message);
        }
    }
};
