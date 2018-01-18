/**
 * @fileoverview MapChartMapModel is map model of map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var arrayUtil = require('../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var MapChartMapModel = snippet.defineClass(/** @lends MapChartMapModel.prototype */ {
    /**
     * MapChartMapModel is map model of map chart.
     * @constructs MapChartMapModel
     * @param {MapChartDataProcessor} dataProcessor Map chart data processor
     * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
     */
    init: function(dataProcessor, rawMapData) {
        /**
         * Command function map.
         * @type {{
         *      M: MapChartMapModel._makeCoordinate, m: MapChartMapModel._makeCoordinateFromRelativeCoordinate,
         *      L: MapChartMapModel._makeCoordinate, l: MapChartMapModel._makeCoordinateFromRelativeCoordinate,
         *      H: MapChartMapModel._makeXCoordinate, h: MapChartMapModel._makeXCoordinateFroRelativeCoordinate,
         *      V: MapChartMapModel._makeYCoordinate, v: MapChartMapModel._makeYCoordinateFromRelativeCoordinate
         * }}
         */
        this.commandFuncMap = {
            M: snippet.bind(this._makeCoordinate, this),
            m: snippet.bind(this._makeCoordinateFromRelativeCoordinate, this),
            L: snippet.bind(this._makeCoordinate, this),
            l: snippet.bind(this._makeCoordinateFromRelativeCoordinate, this),
            H: snippet.bind(this._makeXCoordinate, this),
            h: snippet.bind(this._makeXCoordinateFroRelativeCoordinate, this),
            V: snippet.bind(this._makeYCoordinate, this),
            v: snippet.bind(this._makeYCoordinateFromRelativeCoordinate, this)
        };

        /**
         * Ignore command map.
         * @type {{Z: boolean, z: boolean}}
         */
        this.ignoreCommandMap = {
            Z: true,
            z: true
        };

        /**
         * Map dimension
         * @type {{width: number, height: number}}
         */
        this.mapDimension = null;

        /**
         * Map chart data processor.
         * @type {MapChartDataProcessor}
         */
        this.dataProcessor = dataProcessor;

        /**
         * Raw map data.
         * @type {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y: number}}>}
         */
        this.rawMapData = rawMapData;

        /**
         * Map data.
         * @type {null|Array.<object>}
         */
        this.mapData = null;
    },

    /**
     * Split coordinate string.
     * @param {string} coordinateStr coordinate string
     * @returns {{x: number, y: number}} coordinate map
     * @private
     */
    _splitCoordinate: function(coordinateStr) {
        var coordinates = coordinateStr.split(','),
            result = {
                x: parseFloat(coordinates[0])
            };

        if (coordinates[1]) {
            result.y = parseFloat(coordinates[1]);
        }

        return result;
    },

    /**
     * Make coordinate
     * @param {string} coordinateStr coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinate: function(coordinateStr) {
        return this._splitCoordinate(coordinateStr);
    },

    /**
     * Make coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinateFromRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x + prevCoordinate.x,
            y: coordinate.y + prevCoordinate.y
        };
    },

    /**
     * Make x coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{x: number}} x coordinate
     * @private
     */
    _makeXCoordinate: function(coordinateStr) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x
        };
    },

    /**
     * Make x coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{x: number}} x coordinate
     * @private
     */
    _makeXCoordinateFroRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            x: coordinate.x + prevCoordinate.x
        };
    },

    /**
     * Make y coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{y: number}} y coordinate
     * @private
     */
    _makeYCoordinate: function(coordinateStr) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            y: coordinate.x
        };
    },

    /**
     * Make y coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{y: number}} y coordinate
     * @private
     */
    _makeYCoordinateFromRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinate = this._splitCoordinate(coordinateStr);

        return {
            y: coordinate.x + prevCoordinate.y
        };
    },

    /**
     * Split path.
     * @param {string} path path
     * @returns {Array.<{type: string, coordinate: string}>} splitted path data
     * @private
     */
    _splitPath: function(path) {
        var i = 0,
            len = path.length,
            pathData = [],
            coordinate = '',
            chr, commandType;

        for (; i < len; i += 1) {
            chr = path.charAt(i);
            if (this.commandFuncMap[chr]) {
                if (commandType && coordinate) {
                    pathData.push({
                        type: commandType,
                        coordinate: coordinate
                    });
                }
                commandType = chr;
                coordinate = '';
            } else if (!this.ignoreCommandMap[chr]) {
                coordinate += chr;
            }
        }

        if (commandType && coordinate) {
            pathData.push({
                type: commandType,
                coordinate: coordinate
            });
        }

        return pathData;
    },

    /**
     * Make coordinates from path.
     * @param {string} path path
     * @returns {Array.<{x: number, y: number}>} coordinates
     * @private
     */
    _makeCoordinatesFromPath: function(path) {
        var self = this,
            pathData = this._splitPath(path),
            prevCoordinate = {
                x: 0,
                y: 0
            };

        return snippet.map(pathData, function(datum) {
            var commandFunc = self.commandFuncMap[datum.type],
                coordinate = commandFunc(datum.coordinate, prevCoordinate);

            snippet.extend(prevCoordinate, coordinate);

            return coordinate;
        });
    },

    /**
     * Find bound from coordinates.
     * @param {Array.<{left: number, top: number}>} coordinates coordinates
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound
     * @private
     */
    _findBoundFromCoordinates: function(coordinates) {
        var xs = snippet.filter(snippet.pluck(coordinates, 'x'), function(x) {
                return !snippet.isUndefined(x);
            }),
            ys = snippet.filter(snippet.pluck(coordinates, 'y'), function(y) {
                return !snippet.isUndefined(y);
            }),
            maxLeft = arrayUtil.max(xs),
            minLeft = arrayUtil.min(xs),
            maxTop = arrayUtil.max(ys),
            minTop = arrayUtil.min(ys);

        return {
            dimension: {
                width: maxLeft - minLeft,
                height: maxTop - minTop
            },
            position: {
                left: minLeft,
                top: minTop
            }
        };
    },

    /**
     * Make label position.
     * @param {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound bound
     * @param {?{left: number, top: number}} positionRatio position ratio
     * @returns {{left: number, top: number}} label position
     * @private
     */
    _makeLabelPosition: function(bound, positionRatio) {
        positionRatio = positionRatio || chartConst.MAP_CHART_LABEL_DEFAULT_POSITION_RATIO;

        return {
            left: bound.position.left + (bound.dimension.width * positionRatio.x),
            top: bound.position.top + (bound.dimension.height * positionRatio.y)
        };
    },

    /**
     * Create map data.
     * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
     * @returns {Array.<object>}
     * @private
     */
    _createMapData: function(rawMapData) {
        var self = this;

        return snippet.map(rawMapData, function(datum) {
            var coordinate = self._makeCoordinatesFromPath(datum.path),
                bound = self._findBoundFromCoordinates(coordinate),
                userData = self.dataProcessor.getValueMapDatum(datum.code),
                name, labelCoordinate, label, ratio, resultData;

            if (userData) {
                label = userData.label;
                ratio = userData.ratio;
                name = userData.name || datum.name;
                labelCoordinate = userData.labelCoordinate || datum.labelCoordinate;
            }

            resultData = {
                code: datum.code,
                name: name,
                path: datum.path,
                bound: bound,
                labelPosition: self._makeLabelPosition(bound, labelCoordinate)
            };

            if (label) {
                resultData.label = label;
            }

            if (ratio >= 0) {
                resultData.ratio = ratio;
            }

            return resultData;
        });
    },

    /**
     * Get map data.
     * @returns {Array.<object>}
     */
    getMapData: function() {
        if (!this.mapData) {
            this.mapData = this._createMapData(this.rawMapData);
        }

        return this.mapData;
    },

    /**
     * Get map datum.
     * @param {number} index - index
     * @returns {object}
     */
    getDatum: function(index) {
        return this.getMapData()[index];
    },

    /**
     * Get label data.
     * @param {number} ratio ratio
     * @returns {Array.<{name: string, bound: {dimension: {width: number, height: number},
     *          position: {top: number, left: number}}, labelPosition: {width: number, height: number}}>} map data
     */
    getLabelData: function(ratio) {
        var self = this;
        var mapData = this.getMapData();
        var labelData = snippet.filter(mapData, function(datum) {
            return self.dataProcessor.getValueMapDatum(datum.code);
        });

        return snippet.map(labelData, function(datum) {
            return {
                name: datum.name,
                labelPosition: {
                    left: datum.labelPosition.left * ratio,
                    top: datum.labelPosition.top * ratio
                }
            };
        });
    },

    /**
     * Make map dimension
     * @returns {{width: number, height: number}} map dimension
     * @private
     */
    _makeMapDimension: function() {
        var mapData = this.getMapData();
        var lefts = snippet.map(mapData, function(datum) {
            return datum.bound.position.left;
        });
        var rights = snippet.map(mapData, function(datum) {
            return datum.bound.position.left + datum.bound.dimension.width;
        });
        var tops = snippet.map(mapData, function(datum) {
            return datum.bound.position.top;
        });
        var bottoms = snippet.map(mapData, function(datum) {
            return datum.bound.position.top + datum.bound.dimension.height;
        });

        return {
            width: arrayUtil.max(rights) - arrayUtil.min(lefts),
            height: arrayUtil.max(bottoms) - arrayUtil.min(tops)
        };
    },

    /**
     * Get map dimension.
     * @returns {{width: number, height: number}} map dimension
     */
    getMapDimension: function() {
        if (!this.mapDimension) {
            this.mapDimension = this._makeMapDimension();
        }

        return this.mapDimension;
    }
});

module.exports = MapChartMapModel;
