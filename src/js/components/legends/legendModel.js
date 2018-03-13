/**
 * @fileoverview LegendModel is a model for legend area(checkbox, icon, label text)
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var concat = Array.prototype.concat;
var forEachArray = snippet.forEachArray;

var LegendModel = snippet.defineClass(/** @lends LegendModel.prototype */ {
    /**
     * LegendModel is legend model.
     * @constructs LegendModel
     * @private
     * @param {object} params parameters
     *      @param {number} params.labels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * legend labels
         * @type {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}}
         */
        this.labels = params.labels;

        /**
         * label infos
         * @type {Array.<{chartType: string, label: string, index: number}>}
         */
        this.legendData = params.legendData;

        /**
         * chart types
         * @type {?Array.<string>}
         */
        this.seriesTypes = params.seriesTypes || [];

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Legend data
         * @type {?Array}
         */
        this.data = null;

        /**
         * Selected legend index.
         * @type {?number}
         */
        this.selectedIndex = null;

        /**
         * sending data to series
         * @type {object}
         */
        this.checkedIndexesMap = {};

        /**
         * checked indexes
         * @type {Array}
         */
        this.checkedWholeIndexes = [];

        this._setData();
        this._initCheckedIndexes();
    },

    /**
     * Initialize checked data.
     * @private
     */
    _initCheckedIndexes: function() {
        var self = this;
        var checkedIndexes = [];
        forEachArray(this.legendData, function(legendDatum, index) {
            if (legendDatum.visible) {
                checkedIndexes.push(index);
            }
            self.checkedWholeIndexes[index] = legendDatum.visible;
        });

        this.updateCheckedLegendsWith(checkedIndexes);
    },

    /**
     * Set theme to legend data.
     * @param {Array.<object>} legendData - legend data
     * @param {{
     *     colors: Array.<string>,
     *     borderColor: ?string
     *     }} colorTheme - legend theme
     * @param {Array.<boolean>} [checkedIndexes] - checked indexes
     * @private
     */
    _setThemeToLegendData: function(legendData, colorTheme, checkedIndexes) {
        var seriesIndex = 0;

        forEachArray(legendData, function(datum, index) {
            var itemTheme = {
                color: colorTheme.colors[index]
            };

            if (colorTheme.borderColor) {
                itemTheme.borderColor = colorTheme.borderColor;
            }

            datum.theme = itemTheme;
            datum.index = index;

            if (!checkedIndexes || !snippet.isUndefined(checkedIndexes[index])) {
                datum.seriesIndex = seriesIndex;
                seriesIndex += 1;
            } else {
                datum.seriesIndex = -1;
            }
        });
    },

    /**
     * Set legend data.
     * @private
     */
    _setData: function() {
        var self = this;
        var theme = this.theme;
        var chartType = this.chartType;
        var seriesTypes = this.seriesTypes;
        var legendData = this.legendData;
        var checkedIndexesMap = this.checkedIndexesMap;
        var data, startIndex;

        if (!seriesTypes || seriesTypes.length < 2) {
            this._setThemeToLegendData(legendData, theme[chartType], checkedIndexesMap[chartType]);
            data = legendData;
        } else {
            startIndex = 0;
            data = concat.apply([], snippet.map(seriesTypes, function(seriesType) {
                var labelLen = self.labels[seriesType].length;
                var endIndex = startIndex + labelLen;
                var slicedLegendData, checkedIndexes;

                slicedLegendData = legendData.slice(startIndex, endIndex);
                checkedIndexes = checkedIndexesMap[seriesType];
                startIndex = endIndex;
                self._setThemeToLegendData(slicedLegendData, theme[seriesType], checkedIndexes);

                return slicedLegendData;
            }));
        }

        this.data = data;
    },

    /**
     * Get legend data.
     * @returns {Array.<{chartType: string, label: string, theme: object}>} legend data
     */
    getData: function() {
        return this.data;
    },

    /**
     * Get legend datum by index.
     * @param {number} index legend index
     * @returns {{chartType: string, label: string, theme: object}} legend datum
     */
    getDatum: function(index) {
        return this.data[index];
    },

    /**
     * Get legend datum by label
     * @param {string} label - legend label
     * @returns {{chartType: string, label: string, theme: object}} legend datum
     */
    getDatumByLabel: function(label) {
        var foundDatum = null;
        forEachArray(this.data, function(datum) {
            if (datum.label === label) {
                foundDatum = datum;
            }

            return !foundDatum;
        });

        return foundDatum;
    },

    /**
     * Get selected datum.
     * @returns {{chartType: string, label: string, theme: Object}} legend datum
     */
    getSelectedDatum: function() {
        return this.getDatum(this.selectedIndex);
    },

    /**
     * Update selected index.
     * @param {?number} value value
     */
    updateSelectedIndex: function(value) {
        this.selectedIndex = value;
    },

    /**
     * Toggle selected index.
     * @param {number} index legend index
     */
    toggleSelectedIndex: function(index) {
        var selectedIndex;

        if (this.selectedIndex === index) {
            selectedIndex = null;
        } else {
            selectedIndex = index;
        }

        this.updateSelectedIndex(selectedIndex);
    },

    /**
     * Get selected index.
     * @returns {number} selected index
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },

    /**
     * Whether unselected index or not.
     * @param {number} index legend index
     * @returns {boolean} true if selected
     */
    isUnselectedIndex: function(index) {
        return !snippet.isNull(this.selectedIndex) && (this.selectedIndex !== index);
    },

    /**
     * Whether checked selected index or not.
     * @returns {boolean} true if checked
     */
    isCheckedSelectedIndex: function() {
        return this.isCheckedIndex(this.selectedIndex);
    },

    /**
     * Toggle checked index.
     * @param {number} index legend index
     */
    toggleCheckedIndex: function(index) {
        this.checkedWholeIndexes[index] = !this.checkedWholeIndexes[index];
    },

    /**
     * Update checked index.
     * @param {number} index legend index
     * @private
     */
    _updateCheckedIndex: function(index) {
        this.checkedWholeIndexes[index] = true;
    },

    /**
     * Whether checked index.
     * @param {number} index legend index
     * @returns {boolean} true if checked
     */
    isCheckedIndex: function(index) {
        return !!this.checkedWholeIndexes[index];
    },

    /**
     * Add sending datum.
     * @param {number} index legend index
     */
    _addSendingDatum: function(index) {
        var legendDatum = this.getDatum(index);
        if (!this.checkedIndexesMap[legendDatum.chartType]) {
            this.checkedIndexesMap[legendDatum.chartType] = [];
        }
        this.checkedIndexesMap[legendDatum.chartType][legendDatum.index] = true;
    },

    /**
     * Check selected index;
     */
    checkSelectedIndex: function() {
        this._updateCheckedIndex(this.selectedIndex);
        this._addSendingDatum(this.selectedIndex);
        this._setData();
    },

    /**
     * Get checked indexes.
     * @returns {object} object data that whether series has checked or not
     */
    getCheckedIndexes: function() {
        return this.checkedIndexesMap;
    },

    /**
     * Reset checked data.
     * @private
     */
    _resetCheckedData: function() {
        this.checkedWholeIndexes = [];
        this.checkedIndexesMap = {};
    },

    /**
     * Update checked legend's indexes
     * @param {Array.<number>} indexes indexes
     */
    updateCheckedLegendsWith: function(indexes) {
        var self = this;

        this._resetCheckedData();
        forEachArray(indexes, function(index) {
            self._updateCheckedIndex(index);
            self._addSendingDatum(index);
        });
        this._setData();
    }
});

module.exports = LegendModel;
