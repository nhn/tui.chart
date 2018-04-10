/**
 * @fileoverview util for console
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

const consoleUtil = {
    /**
     * check if window.console exists
     * @param {string} message - message
     * @param {string} status - print function of window.console
     */
    print(message, status) {
        status = status || 'log';

        if (window.console) {
            window.console[status](message);
        }
    }
};

export default consoleUtil;
