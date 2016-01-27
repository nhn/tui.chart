/**
 * @fileoverview  Map factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maps = {};

module.exports = {
    /**
     * Get map data.
     * @param {string} mapName theme name
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
     * @param {string} mapName theme name
     * @param {Array} data map data
     */
    register: function(mapName, dimension, data) {
        maps[mapName] = {
            dimension: dimension,
            data: data
        };
    }
};
