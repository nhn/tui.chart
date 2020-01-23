/**
 * @fileoverview SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import SeriesDataModel from './seriesDataModel';
import SeriesItem from './seriesItemForTreemap';
import chartConst from '../../const';
import calculator from '../../helpers/calculator';
import snippet from 'tui-code-snippet';

class SeriesDataModelForTreeMap extends SeriesDataModel {
  /**
   * SeriesDataModelForTreemap is base model for drawing graph of treemap chart series area.
   * @constructs SeriesDataModelForTreemap
   * @private
   */
  constructor(...args) {
    super(...args);

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
  }

  /**
   * Flatten hierarchical data.
   * @param {Array.<object>} rawSeriesData - raw series data
   * @param {string | number} parent - parent id
   * @param {?Array.<number>} ancestorIndexes - ancestor indexes
   * @returns {Array.<object>}
   * @private
   */
  _flattenHierarchicalData(rawSeriesData, parent, ancestorIndexes) {
    let flatData = [];
    let idPrefix;

    if (parent) {
      idPrefix = `${parent}_`;
    } else {
      idPrefix = chartConst.TREEMAP_ID_PREFIX;
      parent = chartConst.TREEMAP_ROOT_ID;
    }

    ancestorIndexes = ancestorIndexes || [];

    rawSeriesData.forEach((datum, index) => {
      const id = idPrefix + index;
      const { children } = datum;
      const indexes = ancestorIndexes.concat(index);

      datum.indexes = indexes;

      if (!snippet.isNull(datum.value)) {
        flatData.push(datum);
      }

      if (!datum.id) {
        datum.id = id;
      }

      if (!datum.parent) {
        datum.parent = parent;
      }

      if (children) {
        flatData = flatData.concat(this._flattenHierarchicalData(children, id, indexes));
        delete datum.children;
      }
    });

    return flatData;
  }

  /**
   * Partition raw series data by parent id
   * @param {Array.<object>} rawSeriesData - raw series data
   * @param {string | number} parent - parent id
   * @returns {Array.<Array>}
   * @private
   */
  _partitionRawSeriesDataByParent(rawSeriesData, parent) {
    const filtered = [];
    const rejected = [];

    rawSeriesData.forEach(datum => {
      if (datum.parent === parent) {
        filtered.push(datum);
      } else {
        rejected.push(datum);
      }
    });

    return [filtered, rejected];
  }

  /**
   * Set tree properties like depth, group in raw series data.
   * @param {Array.<object>} flatSeriesData - flat series data
   * @param {number} depth - tree depth
   * @param {number} parent - parent id
   * @param {number} group - tree group
   * @returns {Array.<object>}
   * @private
   */
  _setTreeProperties(flatSeriesData, depth, parent, group) {
    const parted = this._partitionRawSeriesDataByParent(flatSeriesData, parent);
    let [filtered] = parted;
    const [, rejected] = parted;
    const childDepth = depth + 1;

    filtered.forEach((datum, index) => {
      datum.depth = depth;
      datum.group = snippet.isUndefined(group) ? index : group;

      const descendants = this._setTreeProperties(
        rejected,
        childDepth,
        datum.id,
        datum.group,
        datum.fillOpacity
      );
      const children = descendants.filter(descendant => descendant.depth === childDepth);

      if (children.length) {
        datum.value = calculator.sum(snippet.pluck(children, 'value'));
        datum.hasChild = true;
      } else {
        datum.hasChild = false;
      }

      if (descendants.length) {
        descendants.sort((a, b) => b.value - a.value);
      }

      filtered = filtered.concat(descendants);
    });

    return filtered;
  }

  /**
   * Set ratio.
   * @param {Array.<object>} flatSeriesData - raw series data
   * @param {string} parent - parent id
   * @private
   */
  _setRatio(flatSeriesData, parent) {
    const parted = this._partitionRawSeriesDataByParent(flatSeriesData, parent);
    const [filtered, rejected] = parted;
    const total = calculator.sum(snippet.pluck(filtered, 'value'));

    filtered.forEach(datum => {
      const value = snippet.isNull(datum.value) ? 0 : datum.value;

      datum.ratio = value / total;

      if (datum.hasChild) {
        this._setRatio(rejected, datum.id);
      }
    });
  }

  /**
   * Create base groups.
   * @returns {Array.<Array.<SeriesItem>>}
   * @private
   * @override
   */
  _createBaseGroups() {
    const { chartType, seriesItemMap, formatFunctions } = this;
    let flatSeriesData = this._flattenHierarchicalData(this.rawSeriesData);

    flatSeriesData = this._setTreeProperties(flatSeriesData, 1, chartConst.TREEMAP_ROOT_ID);
    this._setRatio(flatSeriesData, chartConst.TREEMAP_ROOT_ID);

    return [
      flatSeriesData.map(rawDatum => {
        const seriesItem = new SeriesItem(rawDatum, formatFunctions, chartType);

        seriesItemMap[seriesItem.id] = seriesItem;

        return seriesItem;
      })
    ];
  }

  /**
   * Find SeriesItems.
   * @param {string} key - key
   * @param {function} condition - condition function
   * @returns {Array.<SeriesItem>}
   * @private
   */
  _findSeriesItems(key, condition) {
    if (!this.foundSeriesItemsMap[key]) {
      this.foundSeriesItemsMap[key] = this.getFirstSeriesGroup(true).filter(condition);
    }

    return this.foundSeriesItemsMap[key];
  }

  /**
   * Make cache key for caching found SeriesItems.
   * @param {string} prefix - prefix
   * @returns {string}
   * @private
   */
  _makeCacheKey(...args) {
    let [key] = args;

    if (args.length > 1) {
      key += args.slice(1).join('_');
    }

    return key;
  }

  /**
   * Whether valid group or not.
   * If comparingGroup is undefined or group and comparingGroup are equal, this group is valid.
   * @param {number} group - group
   * @param {number} [comparingGroup] - comparing group
   * @returns {boolean}
   * @private
   */
  _isValidGroup(group, comparingGroup) {
    return !snippet.isExisty(comparingGroup) || group === comparingGroup;
  }

  /**
   * Find SeriesItems by depth.
   * @param {number} depth - tree depth
   * @param {number} [group] - tree group
   * @returns {Array.<SeriesItem>}
   */
  findSeriesItemsByDepth(depth, group) {
    const key = this._makeCacheKey(chartConst.TREEMAP_DEPTH_KEY_PREFIX, depth, group);

    return this._findSeriesItems(
      key,
      seriesItem => seriesItem.depth === depth && this._isValidGroup(seriesItem.group, group)
    );
  }

  /**
   * Find SeriesItems by parent id.
   * @param {string | number} parent - parent id
   * @returns {Array.<SeriesItem>}
   */
  findSeriesItemsByParent(parent) {
    const key = this._makeCacheKey(chartConst.TREEMAP_PARENT_KEY_PREFIX, parent);

    return this._findSeriesItems(key, seriesItem => seriesItem.parent === parent);
  }

  /**
   * Find leaf SeriesItems.
   * @param {number} [group] - tree group
   * @returns {Array.<SeriesItem>}
   */
  findLeafSeriesItems(group) {
    const key = this._makeCacheKey(chartConst.TREEMAP_LEAF_KEY_PREFIX, group);

    return this._findSeriesItems(
      key,
      seriesItem => !seriesItem.hasChild && this._isValidGroup(seriesItem.group, group)
    );
  }

  /**
   * Find parent by depth.
   * @param {string} id - id
   * @param {number} depth - depth
   * @returns {SeriesItem|null}
   */
  findParentByDepth(id, depth) {
    let seriesItem = this.seriesItemMap[id] || null;

    if (seriesItem && seriesItem.depth !== depth) {
      seriesItem = this.findParentByDepth(seriesItem.parent, depth);
    }

    return seriesItem;
  }

  /**
   * Initialize foundSeriesItemsMap.
   */
  initSeriesItemsMap() {
    this.foundSeriesItemsMap = null;
  }
}

export default SeriesDataModelForTreeMap;
