/**
 * @fileoverview MapChartMapModel is map model of map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var MapChartMapModel = tui.util.defineClass(/** @lends MapChartMapModel.prototype */ {
    /**
     * MapChartMapModel is map model of map chart.
     * @constructs MapChartMapModel
     * @param {MapChartDataProcessor} dataProcessor Map chart data processor
     */
    init: function(dataProcessor) {
        /**
         * Command function map.
         * @type {{M: MapChartMapModel._makeCoordinate, m: MapChartMapModel._makeCoordinateFromRelativeCoordinate, L: MapChartMapModel._makeCoordinate, l: MapChartMapModel._makeCoordinateFromRelativeCoordinate, H: MapChartMapModel._makeXCoordinate, h: MapChartMapModel._makeXCoordinateFroRelativeCoordinate, V: MapChartMapModel._makeYCoordinate, v: MapChartMapModel._makeYCoordinateFromRelativeCoordinate}}
         */
        this.commandFuncMap = {
            M: this._makeCoordinate,
            m: this._makeCoordinateFromRelativeCoordinate,
            L: this._makeCoordinate,
            l: this._makeCoordinateFromRelativeCoordinate,
            H: this._makeXCoordinate,
            h: this._makeXCoordinateFroRelativeCoordinate,
            V: this._makeYCoordinate,
            v: this._makeYCoordinateFromRelativeCoordinate
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
         * Map data.
         * @type {Array}
         */
        this.mapData = [];

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
    },

    /**
     * Make coordinate
     * @param {string} coordinateStr coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinate: function(coordinateStr) {
        var coordinates = coordinateStr.split(',');

        return {
            x: parseFloat(coordinates[0]),
            y: parseFloat(coordinates[1])
        };
    },

    /**
     * Make coordinate from relative coordinate.
     * @param {string} coordinateStr coordinate
     * @param {{x: number, y: number}} prevCoordinate previous coordinate
     * @returns {{x: number, y: number}} coordinate
     * @private
     */
    _makeCoordinateFromRelativeCoordinate: function(coordinateStr, prevCoordinate) {
        var coordinates = coordinateStr.split(',');

        return {
            x: parseFloat(coordinates[0]) + prevCoordinate.x,
            y: parseFloat(coordinates[1]) + prevCoordinate.y
        };
    },

    /**
     * Make x coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{x: number}} x coordinate
     * @private
     */
    _makeXCoordinate: function(coordinateStr) {
        var coordinates = coordinateStr.split(',');

        return {
            x: parseFloat(coordinates[0])
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
        var coordinates = coordinateStr.split(',');

        return {
            x: parseFloat(coordinates[0]) + prevCoordinate.x
        };
    },

    /**
     * Make y coordinate.
     * @param {string} coordinateStr coordinate
     * @returns {{y: number}} y coordinate
     * @private
     */
    _makeYCoordinate: function(coordinateStr) {
        var coordinates = coordinateStr.split(',');

        return {
            y: parseFloat(coordinates[0])
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
        var coordinates = coordinateStr.split(',');

        return {
            y: parseFloat(coordinates[0]) + prevCoordinate.y
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
        var pathData = this._splitPath(path),
            prevCoordinate = {
                x: 0,
                y: 0
            };

        return tui.util.map(pathData, function(datum) {
            var commandFunc = this.commandFuncMap[datum.type],
                coordinate = commandFunc(datum.coordinate, prevCoordinate);

            tui.util.extend(prevCoordinate, coordinate);

            return coordinate;
        }, this);
    },

    /**
     * Find bound from coordinates.
     * @param {Array.<{left: number, top: number}>} coordinates coordinates
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound
     * @private
     */
    _findBoundFromCoordinates: function(coordinates) {
        var xs = tui.util.filter(tui.util.pluck(coordinates, 'x'), function(x) {
                return !tui.util.isUndefined(x);
            }),
            ys = tui.util.filter(tui.util.pluck(coordinates, 'y'), function(y) {
                return !tui.util.isUndefined(y);
            }),
            maxLeft = Math.max.apply(null, xs),
            minLeft = Math.min.apply([], xs),
            maxTop = Math.max.apply([], ys),
            minTop = Math.min.apply([], ys);

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
     */
    createMapData: function(rawMapData) {
        var valueMap = this.dataProcessor.getValueMap();

        this.mapData = tui.util.map(rawMapData, function(datum) {
            var coordinate = this._makeCoordinatesFromPath(datum.path),
                bound = this._findBoundFromCoordinates(coordinate),
                userData = valueMap[datum.code],
                name = (userData && userData.name) || datum.name,
                labelCoordinate = (userData && userData.labelCoordinate) || datum.labelCoordinate;

            return {
                code: datum.code,
                name: name,
                bound: bound,
                labelPosition: this._makeLabelPosition(bound, labelCoordinate)
            };
        }, this);
    },

    /**
     * Get label data.
     * @returns {Array.<{name: string, bound: {dimension: {width: number, height: number}, position: {top: number, left: number}}, labelPosition: {width: number, height: number}}>} map data
     */
    getLabelData: function() {
        var valueMap = this.dataProcessor.getValueMap();

        return tui.util.filter(this.mapData, function(datum) {
            return valueMap[datum.code];
        }, this);
    },

    /**
     * Make map dimension
     * @returns {{width: number, height: number}} map dimension
     * @private
     */
    _makeMapDimension: function() {
        var mapData = this.mapData,
            lefts = tui.util.map(mapData, function(datum) {
                return datum.bound.position.left;
            }),
            rights = tui.util.map(mapData, function(datum) {
                return datum.bound.position.left + datum.bound.dimension.width;
            }),
            tops = tui.util.map(mapData, function(datum) {
                return datum.bound.position.top;
            }),
            bottoms = tui.util.map(mapData, function(datum) {
                return datum.bound.position.top + datum.bound.dimension.height;
            });
        return {
            width: Math.max.apply(null, rights) - Math.min.apply(null, lefts),
            height: Math.max.apply(null, bottoms) - Math.min.apply(null, tops)
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
