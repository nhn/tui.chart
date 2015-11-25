/**
 * @fileoverview UserEventListener is listener of user event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var UserEventListener = tui.util.defineClass(/** @lends UserEventListener.prototype */ {
    /**
     * Register user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    register: function(eventName, func) {
        this.on(eventName, func);
    }
});

tui.util.CustomEvents.mixin(UserEventListener);

module.exports = UserEventListener;
