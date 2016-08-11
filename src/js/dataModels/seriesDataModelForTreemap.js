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

var aps = Array.prototype.slice;

var SeriesDataModelForTreemap = tui.util.defineClass(SeriesDataModel, {
    /**
     * SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
     * @constructs SeriesDataModelForTreemap
     */
    init: function() {
        SeriesDataModel.apply(this, arguments);

        /**
         * cached found seriesItems map
         * @type {object.<string, Array.<SeriesItem>>}
         */
        this.foundSeriesItemsMap = {};

        /**
         * cached seriesItem map
         * @type {object<string, SeriesItem>}
         */
        this.seriesItemMap = {};
    },

    /**
     * Flatten hierarchical data.
     * @param {Array.<object>} rawSeriesData - raw series data
     * @param {string | number} parent - parent id
     * @param {?Array.<number>} ancestorIndexes - ancestor indexes
     * @returns {Array.<object>}
     * @private
     */
    _flattenHierarchicalData: function(rawSeriesData, parent, ancestorIndexes) {
        var self = this;
        var flatData = [];
        var idPrefix;

        if (parent) {
            idPrefix = parent + '_';
        } else {
            idPrefix = chartConst.TREEMAP_ID_PREFIX;
            parent = chartConst.TREEMAP_ROOT_ID;
        }

        ancestorIndexes = ancestorIndexes || [];

        tui.util.forEachArray(rawSeriesData, function(datum, index) {
            var id = idPrefix + index;
            var children = datum.children;
            var indexes = ancestorIndexes.concat(index);

            datum.indexes = indexes;

            flatData.push(datum);

            if (!datum.id) {
                datum.id = id;
            }

            if (!datum.parent) {
                datum.parent = parent;
            }

            if (children) {
                flatData = flatData.concat(self._flattenHierarchicalData(children, id, indexes));
                delete datum.children;
            }
        });

        return flatData;
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
            var descendants, children;

            datum.depth = depth;
            datum.group = tui.util.isUndefined(group) ? index : group;

            descendants = self._setTreeProperties(rejected, childDepth, datum.id, datum.group);
            children = tui.util.filter(descendants, function(descendant) {
                return descendant.depth === childDepth;
            });

            if (children.length) {
                datum.value = tui.util.sum(tui.util.pluck(children, 'value'));
                datum.hasChild = true;
            } else {
                datum.hasChild = false;
            }

            filtered = filtered.concat(descendants);
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
        var chartType = this.chartType;
        var rawSeriesData = this.rawSeriesData;
        var seriesItemMap = this.seriesItemMap;
        var formatFunctions = this.formatFunctions;

        rawSeriesData = this._flattenHierarchicalData(rawSeriesData);
        rawSeriesData = this._setTreeProperties(rawSeriesData, 1, chartConst.TREEMAP_ROOT_ID);

        return [tui.util.map(rawSeriesData, function(rawDatum) {
            var seriesItem = new SeriesItem(rawDatum, formatFunctions, chartType);

            seriesItemMap[seriesItem.id] = seriesItem;

            return seriesItem;
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
        if (!this.foundSeriesItemsMap[key]) {
            this.foundSeriesItemsMap[key] = this.getFirstSeriesGroup(true).filter(condition);
        }

        return this.foundSeriesItemsMap[key];
    },

    /**
     * Make cache key for caching found SeriesItems.
     * @param {string} prefix - prefix
     * @returns {string}
     * @private
     */
    _makeCacheKey: function(prefix) {
        var key = prefix;

        if (arguments.length > 1) {
            key += aps.call(arguments, 1).join('_');
        }

        return key;
    },

    /**
     * Whether valid group or not.
     * If comparingGroup is undefined or group and comparingGroup are equal, this group is valid.
     * @param {number} group - group
     * @param {number} [comparingGroup] - comparing group
     * @returns {boolean}
     * @private
     */
    _isValidGroup: function(group, comparingGroup) {
        return !tui.util.isExisty(comparingGroup) || (group === comparingGroup);
    },

    /**
     * Find SeriesItems by depth.
     * @param {number} depth - tree depth
     * @param {number} [group] - tree group
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByDepth: function(depth, group) {
        var self = this;
        var key = this._makeCacheKey(chartConst.TREEMAP_DEPTH_KEY_PREFIX, depth, group);

        return this._findSeriesItems(key, function(seriesItem) {
            return (seriesItem.depth === depth) && self._isValidGroup(seriesItem.group, group);
        });
    },

    /**
     * Find SeriesItems by parent id.
     * @param {string | number} parent - parent id
     * @returns {Array.<SeriesItem>}
     */
    findSeriesItemsByParent: function(parent) {
        var key = this._makeCacheKey(chartConst.TREEMAP_PARENT_KEY_PREFIX, parent);

        return this._findSeriesItems(key, function(seriesItem) {
            return seriesItem.parent === parent;
        });
    },

    /**
     * Find leaf SeriesItems.
     * @param {number} [group] - tree group
     * @returns {Array.<SeriesItem>}
     */
    findLeafSeriesItems: function(group) {
        var self = this;
        var key = this._makeCacheKey(chartConst.TREEMAP_LEAF_KEY_PREFIX, group);

        return this._findSeriesItems(key, function(seriesItem) {
            return !seriesItem.hasChild && self._isValidGroup(seriesItem.group, group);
        });
    },

    /**
     * Find parent by depth.
     * @param {string} id - id
     * @param {number} depth - depth
     * @returns {SeriesItem|null}
     */
    findParentByDepth: function(id, depth) {
        var seriesItem = this.seriesItemMap[id] || null;

        if (seriesItem && seriesItem.depth !== depth) {
            seriesItem = this.findParentByDepth(seriesItem.parent, depth);
        }

        return seriesItem;
    },

    /**
     * Initialize foundSeriesItemsMap.
     */
    initSeriesItemsMap: function() {
        this.foundSeriesItemsMap = null;
    }
});

module.exports = SeriesDataModelForTreemap;
