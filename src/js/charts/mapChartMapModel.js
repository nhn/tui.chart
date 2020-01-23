/**
 * @fileoverview MapChartMapModel is map model of map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import arrayUtil from '../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

class MapChartMapModel {
  /**
   * MapChartMapModel is map model of map chart.
   * @constructs MapChartMapModel
   * @param {MapChartDataProcessor} dataProcessor Map chart data processor
   * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
   * @ignore
   */
  constructor(dataProcessor, rawMapData) {
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
  }

  /**
   * Split coordinate string.
   * @param {string} coordinateStr coordinate string
   * @returns {{x: number, y: number}} coordinate map
   * @private
   */
  _splitCoordinate(coordinateStr) {
    const coordinates = coordinateStr.split(',');
    const result = {
      x: parseFloat(coordinates[0])
    };

    if (coordinates[1]) {
      result.y = parseFloat(coordinates[1]);
    }

    return result;
  }

  /**
   * Make coordinate
   * @param {string} coordinateStr coordinate
   * @returns {{x: number, y: number}} coordinate
   * @private
   */
  _makeCoordinate(coordinateStr) {
    return this._splitCoordinate(coordinateStr);
  }

  /**
   * Make coordinate from relative coordinate.
   * @param {string} coordinateStr coordinate
   * @param {{x: number, y: number}} prevCoordinate previous coordinate
   * @returns {{x: number, y: number}} coordinate
   * @private
   */
  _makeCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate) {
    const coordinate = this._splitCoordinate(coordinateStr);

    return {
      x: coordinate.x + prevCoordinate.x,
      y: coordinate.y + prevCoordinate.y
    };
  }

  /**
   * Make x coordinate.
   * @param {string} coordinateStr coordinate
   * @returns {{x: number}} x coordinate
   * @private
   */
  _makeXCoordinate(coordinateStr) {
    const coordinate = this._splitCoordinate(coordinateStr);

    return {
      x: coordinate.x
    };
  }

  /**
   * Make x coordinate from relative coordinate.
   * @param {string} coordinateStr coordinate
   * @param {{x: number, y: number}} prevCoordinate previous coordinate
   * @returns {{x: number}} x coordinate
   * @private
   */
  _makeXCoordinateFroRelativeCoordinate(coordinateStr, prevCoordinate) {
    const coordinate = this._splitCoordinate(coordinateStr);

    return {
      x: coordinate.x + prevCoordinate.x
    };
  }

  /**
   * Make y coordinate.
   * @param {string} coordinateStr coordinate
   * @returns {{y: number}} y coordinate
   * @private
   */
  _makeYCoordinate(coordinateStr) {
    const coordinate = this._splitCoordinate(coordinateStr);

    return {
      y: coordinate.x
    };
  }

  /**
   * Make y coordinate from relative coordinate.
   * @param {string} coordinateStr coordinate
   * @param {{x: number, y: number}} prevCoordinate previous coordinate
   * @returns {{y: number}} y coordinate
   * @private
   */
  _makeYCoordinateFromRelativeCoordinate(coordinateStr, prevCoordinate) {
    const coordinate = this._splitCoordinate(coordinateStr);

    return {
      y: coordinate.x + prevCoordinate.y
    };
  }

  /**
   * Split path.
   * @param {string} path path
   * @returns {Array.<{type: string, coordinate: string}>} splitted path data
   * @private
   */
  _splitPath(path) {
    const len = path.length;
    const pathData = [];
    let coordinate = '';
    let commandType;

    for (let i = 0; i < len; i += 1) {
      const chr = path.charAt(i);
      if (this.commandFuncMap[chr]) {
        if (commandType && coordinate) {
          pathData.push({
            type: commandType,
            coordinate
          });
        }
        commandType = chr;
        coordinate = '';
      } else if (!this.ignoreCommandMap[chr]) {
        coordinate += chr;
      }
    }

    this._addCommandPath(pathData, {
      commandType,
      coordinate
    });

    return pathData;
  }

  /**
   * Add command path for Split path.
   * @param {Array} pathData svg path array
   * @param {Object} pathInfos svg path infos
   *   @param {string} commandType svg command type
   *   @param {string} coordinate path string
   * @private
   */
  _addCommandPath(pathData, { commandType, coordinate } = {}) {
    if (commandType && coordinate) {
      pathData.push({
        type: commandType,
        coordinate
      });
    }
  }

  /**
   * Make coordinates from path.
   * @param {string} path path
   * @returns {Array.<{x: number, y: number}>} coordinates
   * @private
   */
  _makeCoordinatesFromPath(path) {
    const pathData = this._splitPath(path);
    const prevCoordinate = {
      x: 0,
      y: 0
    };

    return pathData.map(datum => {
      const commandFunc = this.commandFuncMap[datum.type];
      const coordinate = commandFunc(datum.coordinate, prevCoordinate);

      snippet.extend(prevCoordinate, coordinate);

      return coordinate;
    });
  }

  /**
   * Find bound from coordinates.
   * @param {Array.<{left: number, top: number}>} coordinates coordinates
   * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound
   * @private
   */
  _findBoundFromCoordinates(coordinates) {
    const xs = snippet.pluck(coordinates, 'x').filter(x => !snippet.isUndefined(x));
    const ys = snippet.pluck(coordinates, 'y').filter(y => !snippet.isUndefined(y));
    const maxLeft = arrayUtil.max(xs);
    const minLeft = arrayUtil.min(xs);
    const maxTop = arrayUtil.max(ys);
    const minTop = arrayUtil.min(ys);

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
  }

  /**
   * Make label position.
   * @param {{dimension: {width: number, height: number}, position: {top: number, left: number}}} bound bound
   * @param {?{left: number, top: number}} positionRatio position ratio
   * @returns {{left: number, top: number}} label position
   * @private
   */
  _makeLabelPosition(bound, positionRatio) {
    positionRatio = positionRatio || chartConst.MAP_CHART_LABEL_DEFAULT_POSITION_RATIO;

    return {
      left: bound.position.left + bound.dimension.width * positionRatio.x,
      top: bound.position.top + bound.dimension.height * positionRatio.y
    };
  }

  /**
   * Create map data.
   * @param {Array.<{name: string, path: string, labelCoordinate: ?{x: number, y:number}}>} rawMapData raw map data
   * @returns {Array.<object>}
   * @private
   */
  _createMapData(rawMapData) {
    return rawMapData.map(datum => {
      const coordinate = this._makeCoordinatesFromPath(datum.path);
      const bound = this._findBoundFromCoordinates(coordinate);
      const userData = this.dataProcessor.getValueMapDatum(datum.code);
      let name, labelCoordinate, label, ratio;

      if (userData) {
        label = userData.label;
        ratio = userData.ratio;
        name = userData.name || datum.name;
        labelCoordinate = userData.labelCoordinate || datum.labelCoordinate;
      }

      const resultData = {
        code: datum.code,
        name,
        path: datum.path,
        bound,
        labelPosition: this._makeLabelPosition(bound, labelCoordinate)
      };

      if (label) {
        resultData.label = label;
      }

      if (ratio >= 0) {
        resultData.ratio = ratio;
      }

      return resultData;
    });
  }

  /**
   * clear map data.
   */
  clearMapData() {
    this.mapData = null;
  }

  /**
   * Get map data.
   * @returns {Array.<object>}
   */
  getMapData() {
    if (!this.mapData) {
      this.mapData = this._createMapData(this.rawMapData);
    }

    return this.mapData;
  }

  /**
   * Get map datum.
   * @param {number} index - index
   * @returns {object}
   */
  getDatum(index) {
    return this.getMapData()[index];
  }

  /**
   * Get label data.
   * @param {number} ratio ratio
   * @returns {Array.<{name: string, bound: {dimension: {width: number, height: number},
   *          position: {top: number, left: number}}, labelPosition: {width: number, height: number}}>} map data
   */
  getLabelData(ratio) {
    const mapData = this.getMapData();
    const labelData = mapData.filter(datum => this.dataProcessor.getValueMapDatum(datum.code));

    return labelData.map(datum => ({
      name: datum.name,
      labelPosition: {
        left: datum.labelPosition.left * ratio,
        top: datum.labelPosition.top * ratio
      }
    }));
  }

  /**
   * Make map dimension
   * @returns {{width: number, height: number}} map dimension
   * @private
   */
  _makeMapDimension() {
    const mapData = this.getMapData();
    const lefts = mapData.map(datum => datum.bound.position.left);
    const rights = mapData.map(datum => datum.bound.position.left + datum.bound.dimension.width);
    const tops = mapData.map(datum => datum.bound.position.top);
    const bottoms = mapData.map(datum => datum.bound.position.top + datum.bound.dimension.height);

    return {
      width: arrayUtil.max(rights) - arrayUtil.min(lefts),
      height: arrayUtil.max(bottoms) - arrayUtil.min(tops)
    };
  }

  /**
   * Get map dimension.
   * @returns {{width: number, height: number}} map dimension
   */
  getMapDimension() {
    if (!this.mapDimension) {
      this.mapDimension = this._makeMapDimension();
    }

    return this.mapDimension;
  }
}

export default MapChartMapModel;
