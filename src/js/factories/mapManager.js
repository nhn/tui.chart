/**
 * @fileoverview  Map Manager.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var maps = {};

module.exports = {
    /**
     * Get map data.
     * @param {string} mapName map name
     * @returns {Array} map data
     */
    get: function(mapName) {
        var data = maps[mapName];

        if (!data) {
            throw new Error('Not exist ' + mapName + ' map.');
        }

        return data;
    },

    /**
     * Register Map.
     * @param {string} mapName map name
     * @param {Array} data map data
     */
    register: function(mapName, data) {
        maps[mapName] = data;
    }
};
