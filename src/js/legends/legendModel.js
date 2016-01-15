/**
 * @fileoverview LegendModel is legend model.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var defaultTheme = require('../themes/defaultTheme');

var concat = Array.prototype.concat;

var LegendModel = tui.util.defineClass(/** @lends LegendModel.prototype */ {
    /**
     * LegendModel is legend model.
     * @constructs LegendModel
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
        this.chartTypes = params.chartTypes;

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

        this._initCheckedIndexes();
        this._setData();
    },

    /**
     * Initialize checked data.
     * @private
     */
    _initCheckedIndexes: function() {
        var checkedWholeIndexes = [];
        tui.util.forEachArray(this.legendData, function(legendDatum, index) {
            checkedWholeIndexes[index] = true;
        }, this);
        this.checkedWholeIndexes = checkedWholeIndexes;
    },

    /**
     * Make label info that applied theme.
     * @param {Array.<object>} labelInfo labels
     * @param {{colors: Array.<number>, singleColor: ?string, bordercolor: ?string}} theme legend theme
     * @param {Array.<boolean>} checkedIndexes checked indexes
     * @returns {Array.<object>} labels
     * @private
     */
    _makeLabelInfoAppliedTheme: function(labelInfo, theme, checkedIndexes) {
        var seriesIndex = 0;

        return tui.util.map(labelInfo, function(item, index) {
            var itemTheme = {
                color: theme.colors[index]
            };

            if (theme.singleColors) {
                itemTheme.singleColor = theme.singleColors[index];
            }

            if (theme.borderColor) {
                itemTheme.borderColor = theme.borderColor;
            }

            item.theme = itemTheme;
            item.index = index;

            if (!checkedIndexes || !tui.util.isUndefined(checkedIndexes[index])) {
                item.seriesIndex = seriesIndex;
                seriesIndex += 1;
            } else {
                item.seriesIndex = -1;
            }

            return item;
        }, this);
    },

    /**
     * Set legend data.
     * @private
     */
    _setData: function() {
        var legendData = this.legendData,
            data, defaultLegendTheme, startIndex, startThemeIndex;

        if (!this.chartTypes) {
            data = this._makeLabelInfoAppliedTheme(legendData, this.theme, this.checkedIndexesMap[this.chartType]);
        } else {
            startIndex = 0;
            startThemeIndex = 0;
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            };
            data = concat.apply([], tui.util.map(this.chartTypes, function(chartType) {
                var chartTheme = this.theme[chartType],
                    labelLen = this.labels[chartType].length,
                    endIndex = startIndex + labelLen,
                    themeEndIndex, datum;

                if (!chartTheme) {
                    themeEndIndex = startThemeIndex + labelLen;
                    chartTheme = JSON.parse(JSON.stringify(defaultLegendTheme));
                    chartTheme.colors = chartTheme.colors.slice(startThemeIndex, themeEndIndex);
                    startThemeIndex = themeEndIndex;
                }

                datum = this._makeLabelInfoAppliedTheme(legendData.slice(startIndex, endIndex), chartTheme, this.checkedIndexesMap[chartType]);
                startIndex = endIndex;
                return datum;
            }, this));
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
        return !tui.util.isNull(this.selectedIndex) && (this.selectedIndex !== index);
    },

    /**
     * Whether checked selected index or not.
     * @returns {boolean} true if checked
     */
    isCheckedSelectedIndex: function() {
        return this.isCheckedIndex(this.selectedIndex);
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
     * @returns {{column: ?Array.<boolean>, line: ?Array.<boolean>} | Array.<boolean>} sending data
     */
    getCheckedIndexes: function() {
        return this.checkedIndexesMap[this.chartType] || this.checkedIndexesMap;
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
     * Update checked data.
     * @param {Array.<number>} indexes indxes
     */
    updateCheckedData: function(indexes) {
        this._resetCheckedData();
        tui.util.forEachArray(indexes, function(index) {
            this._updateCheckedIndex(index);
            this._addSendingDatum(index);
        }, this);
        this._setData();
    }
});

module.exports = LegendModel;
