/**
 * @fileoverview SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('./seriesDataModel');
var SeriesItem = require('./seriesItemForTreemap');
var chartConst = require('../const');

var SeriesDataModelForTreemap = tui.util.defineClass(SeriesDataModel, {
    /**
     * SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
     * @constructs SeriesDataModelForTreemap
     */
    init: function() {
        SeriesDataModel.apply(this, arguments);

        /**
         * seriesItems map
         * @type {object.<string, Array.<SeriesItem>>}
         */
        this.seriesItemsMap = {};
    },

    /**
     * Set parent property to root id, when datum of rawSeriesData has not parent property.
     * @param {Array.<object>} rawSeriesData - raw series data
     * @returns {Array.<object>}
     * @private
     */
    _setParentToRootId: function(rawSeriesData) {
        return tui.util.map(rawSeriesData, function(datum) {
            if (!datum.parent) {
                datum.parent = chartConst.TREEMAP_ROOT_ID;
            }

            return datum;
        });
    },

    /**
     * Partition raw series data by parent id
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {string | number} parent - parent id
     * @returns {Array.<Array>}
     * @private
     */
    _partitionRawSeriesDataByParent: function(rawSeriesData, parent) {
        var filtered = [];
        var rejected = [];

        tui.util.forEachArray(rawSeriesData, function(datum) {
            if (datum.parent === parent) {
                filtered.push(datum);
            } else {
                rejected.push(datum);
            }
        });

        return [filtered, rejected];
    },

    /**
     * Set tree properties like depth, group in raw series data.
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {number} depth - tree depth
     * @param {number} parent - parent id
     * @param {number} group - tree group
     * @returns {Array.<object>}
     * @private
     */
    _setTreeProperties: function(rawSeriesData, depth, parent, group) {
        var self = this;
        var parted = this._partitionRawSeriesDataByParent(rawSeriesData, parent);
        var filtered = parted[0];
        var rejected = parted[1];
        var childDepth = depth + 1;

        tui.util.forEachArray(filtered, function(datum, index) {
            var descendant, children;

            datum.depth = depth;
            datum.group = tui.util.isUndefined(group) ? index : group;

            descendant = self._setTreeProperties(rejected, childDepth, datum.id, datum.group);
            children = tui.util.filter(descendant, function(child) {
                return child.depth === childDepth;
            });

            if (children.length) {
                datum.value = tui.util.sum(tui.util.pluck(children, 'value'));
            }

            filtered = filtered.concat(descendant);
        });

        return filtered;
    },

    /**
     * Create base groups.
     * @returns {Array.<Array.<SeriesItem>>}
     * @private
     * @override
     */
    _createBaseGroups: function() {
        var rawSeriesData = this._setParentToRootId(this.rawSeriesData);

        rawSeriesData = this._setTreeProperties(rawSeriesData, 1, chartConst.TREEMAP_ROOT_ID);

        return [tui.util.map(rawSeriesData, function(rawDatum) {
            return new SeriesItem(rawDatum);
        })];
    },

    /**
     * Find SeriesItems.
     * @param {string} key - key
     * @param {function} condition - condition function
     * @returns {Array.<SeriesItem>}
     * @private
     */
    _findSeriesItems: function(key, condition) {
        if (!this.seriesItemsMap[key]) {
            this.seriesItemsMap[key] = this.getFirstSeriesGroup(true).filter(condition);
        }

        return this.seriesItemsMap[key];
    },

    /**
     * Find SeriesItems by depth.
     * @param {number} depth - tree depth
     * @param {number} [group] - tree group
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByDepth: function(depth, group) {
        var key = chartConst.TREEMAP_DEPTH_KEY_PREFIX + depth;

        return this._findSeriesItems(key, function(seriesItem) {
            return seriesItem.depth === depth && (!tui.util.isExisty(group) || (seriesItem.group === group));
        });
    },
    /**
     * FInd SeriesItems by parent id.
     * @param {string | number} parent - parent id
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByParent: function(parent) {
        var key = chartConst.TREEMAP_PARENT_KEY_PREFIX + parent;

        return this._findSeriesItems(key, function(seriesItem) {
            return seriesItem.parent === parent;
        });
    },

    /**
     * Find SeriesItem by depth, group and detected index.
     * @param {number} depth - tree depth
     * @param {number} group - tree group
     * @param {number} detectedIndex - detected index on custom event area
     * @returns {number}
     */
    findSeriesItem: function(depth, group, detectedIndex) {
        var seriesItems = this.findSeriesItemsByDepth(depth, group);
        var foundSeriesItem = null;

        tui.util.forEachArray(seriesItems, function(seriesItem, index) {
            if (index === detectedIndex) {
                foundSeriesItem = seriesItem;
                return false;
            }

            return true;
        });

        return foundSeriesItem;
    }
});

module.exports = SeriesDataModelForTreemap;
