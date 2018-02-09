/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');
var raphael = require('raphael');

var DEGREE_180 = 180;
var DEGREE_360 = 360;
var MIN_DEGREE = 0.01;
var RAD = Math.PI / DEGREE_180;
var LOADING_ANIMATION_DURATION = 700;
var EMPHASIS_OPACITY = 1;
var OVERLAY_OPACITY = 0.3;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANT_VALUE = 0.2;
var OVERLAY_ID = 'overlay';
var TOOLTIP_OFFSET_VALUE = 20;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 * @private
 */
var RaphaelPieChart = snippet.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {object} paper Raphael paper
     * @param {{
     *      sectorData: Array.<object>,
     *      circleBound: {cx: number, cy: number, r: number},
     *      dimension: object, theme: object, options: object
     * }} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.showTooltip show tooltip function
     *      @param {function} callbacks.hideTooltip hide tooltip function
     * @returns {object} paper raphael paper
     */
    render: function(paper, data, callbacks) {
        var pieSeriesSet = paper.set();

        /**
         * raphael object
         * @type {object}
         */
        this.paper = paper;

        /**
         * ratio for hole
         * @type {number}
         */
        this.holeRatio = data.options.radiusRange[0];

        /**
         * base background
         * @type {string}
         */
        this.chartBackground = data.chartBackground;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = data.chartType;

        /**
         * functions for tooltip control
         * @type {{showTooltip: Function, hideTooltip: Function}}
         */
        this.callbacks = callbacks;

        /**
         * color for selection
         * @type {string}
         */
        this.selectionColor = data.theme.selectionColor;

        /**
         * bound for circle
         * @type {{cx: number, cy: number, r: number}}
         */
        this.circleBound = data.circleBound;

        /**
         * sector attr's name for draw graph
         * @type {string}
         */
        this.sectorName = 'sector_' + this.chartType;

        this._setSectorAttr();

        this.sectorInfos = this._renderPie(data.sectorData, data.theme.colors, data.additionalIndex, pieSeriesSet);
        this.overlay = this._renderOverlay();

        /**
         * previous mouse position
         * @type {{left: number, top: number}}
         */
        this.prevPosition = null;

        /**
         * previous hover sector
         * @type {object}
         */
        this.prevHoverSector = null;

        return pieSeriesSet;
    },

    /**
     * Clear paper.
     */
    clear: function() {
        this.legendLines = null;
        this.paper.clear();
    },

    /**
     * Make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: Array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var startRadian = startAngle * RAD;
        var endRadian = endAngle * RAD;
        var x1 = cx + (r * Math.sin(startRadian)); // x point of start radian
        var y1 = cy - (r * Math.cos(startRadian)); // y posint of start radian
        var x2 = cx + (r * Math.sin(endRadian)); // x point of end radian
        var y2 = cy - (r * Math.cos(endRadian)); // y point of end radian
        var largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
        var path = ['M', cx, cy,
            'L', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x2, y2,
            'Z'];

        // see details about path
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
        return {path: path};
    },

    /**
     * Make sector path for donut chart.
     * @param {number} cx - center x
     * @param {number} cy - center y
     * @param {number} r - radius
     * @param {number} startAngle - start angle
     * @param {number} endAngle - end angel
     * @param {number} [holeRadius] - hole radius
     * @returns {{path: Array}} sector path
     * @private
     */
    _makeDonutSectorPath: function(cx, cy, r, startAngle, endAngle, holeRadius) {
        /* eslint max-params: [2, 6]*/
        var startRadian = startAngle * RAD;
        var endRadian = endAngle * RAD;
        var r2 = holeRadius || (r * this.holeRatio); // radius of donut hole
        var x1 = cx + (r * Math.sin(startRadian));
        var y1 = cy - (r * Math.cos(startRadian));
        var x2 = cx + (r2 * Math.sin(startRadian));
        var y2 = cy - (r2 * Math.cos(startRadian));
        var x3 = cx + (r * Math.sin(endRadian));
        var y3 = cy - (r * Math.cos(endRadian));
        var x4 = cx + (r2 * Math.sin(endRadian));
        var y4 = cy - (r2 * Math.cos(endRadian));
        var largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
        var path = [
            'M', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x3, y3,
            'L', x4, y4,
            'A', r2, r2, 0, largeArcFlag, 0, x2, y2,
            'Z'
        ];

        return {path: path};
    },

    /**
     * Set sector attribute for raphael paper.
     * @private
     */
    _setSectorAttr: function() {
        var makeSectorPath;

        if (this.paper.customAttributes[this.sectorName]) {
            return;
        }

        if (this.holeRatio) {
            makeSectorPath = this._makeDonutSectorPath;
        } else {
            makeSectorPath = this._makeSectorPath;
        }

        this.paper.customAttributes[this.sectorName] = snippet.bind(makeSectorPath, this);
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderOverlay: function() {
        var params = {
            paper: this.paper,
            circleBound: {
                cx: 0,
                cy: 0,
                r: 0
            },
            angles: {
                startAngle: 0,
                endAngle: 0
            },
            attrs: {
                fill: 'none',
                opacity: 0,
                stroke: this.chartBackground.color,
                'stroke-width': 1
            }
        };
        var inner = this._renderSector(params);

        inner.data('id', OVERLAY_ID);
        inner.data('chartType', this.chartType);

        return {
            inner: inner,
            outer: this._renderSector(params)
        };
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{object}} params.attrs attributes
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function(params) {
        var circleBound = params.circleBound;
        var angles = params.angles;
        var attrs = params.attrs;

        attrs[this.sectorName] = [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle];

        return params.paper.path().attr(attrs);
    },

    /**
     * Render pie graph.
     * @param {Array.<object>} sectorData - sectorData
     * @param {Array.<string>} colors - sector colors
     * @param {number} additionalIndex - additional index for accumulate past pie series's data indexes on pieDonutCombo
     * @param {Array.<object>} pieSeriesSet - pie series set
     * @returns {Array.<object>}
     * @private
     */
    _renderPie: function(sectorData, colors, additionalIndex, pieSeriesSet) {
        var self = this;
        var circleBound = this.circleBound;
        var chartBackground = this.chartBackground;
        var sectorInfos = [];

        snippet.forEachArray(sectorData, function(sectorDatum, index) {
            var ratio = sectorDatum.ratio;
            var color = colors[index];
            var sector = self._renderSector({
                paper: self.paper,
                circleBound: circleBound,
                angles: sectorDatum.angles.start,
                attrs: {
                    fill: chartBackground.color,
                    stroke: chartBackground.color,
                    'stroke-width': 1
                }
            });
            sector.data('index', index);
            sector.data('legendIndex', index + additionalIndex);
            sector.data('chartType', self.chartType);

            sectorInfos.push({
                sector: sector,
                color: color,
                angles: sectorDatum.angles.end,
                ratio: ratio
            });

            pieSeriesSet.push(sector);
        });

        return sectorInfos;
    },

    /**
     * Render legend lines.
     * @param {Array.<object>} outerPositions outer position
     */
    renderLegendLines: function(outerPositions) {
        var paper = this.paper,
            paths;

        if (!this.legendLines) {
            paths = this._makeLinePaths(outerPositions);
            this.legendLines = snippet.map(paths, function(path) {
                return raphaelRenderUtil.renderLine(paper, path, 'transparent', 1);
            });
        }
    },

    /**
     * Make line paths.
     * @param {Array.<object>} outerPositions outer positions
     * @returns {Array} line paths.
     * @private
     */
    _makeLinePaths: function(outerPositions) {
        return snippet.map(outerPositions, function(positions) {
            return [
                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),
                raphaelRenderUtil.makeLinePath(positions.middle, positions.end),
                'Z'
            ].join('');
        });
    },

    /**
     * Show overlay.
     * @param {number} index - index
     * @param {number} legendIndex - legend index
     * @private
     */
    _showOverlay: function(index, legendIndex) {
        var overlay = this.overlay;
        var sectorInfo = this.sectorInfos[index];
        var sa = sectorInfo.angles.startAngle;
        var ea = sectorInfo.angles.endAngle;
        var cb = this.circleBound;
        var innerAttrs;

        innerAttrs = {
            fill: '#fff',
            opacity: OVERLAY_OPACITY
        };
        innerAttrs[this.sectorName] = [cb.cx, cb.cy, cb.r, sa, ea, cb.r * this.holeRatio];
        overlay.inner.attr(innerAttrs);
        overlay.inner.data('index', index);
        overlay.inner.data('legendIndex', legendIndex);
        overlay.outer.attr({
            path: this._makeDonutSectorPath(cb.cx, cb.cy, cb.r + 10, sa, ea, cb.r).path,
            fill: sectorInfo.color,
            opacity: OVERLAY_OPACITY
        });
    },

    /**
     * Hide overlay.
     * @private
     */
    _hideOverlay: function() {
        var overlay = this.overlay;
        var attrs = {
            fill: 'none',
            opacity: 0
        };

        overlay.inner.attr(attrs);
        overlay.outer.attr(attrs);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0;
        var sectorName = this.sectorName;
        var circleBound = this.circleBound;
        var sectorArgs = [circleBound.cx, circleBound.cy, circleBound.r];

        snippet.forEachArray(this.sectorInfos, function(sectorInfo) {
            var angles = sectorInfo.angles;
            var attrMap = {
                fill: sectorInfo.color
            };
            var animationTime = LOADING_ANIMATION_DURATION * sectorInfo.ratio;
            var anim;

            if ((angles.startAngle === 0) && (angles.endAngle === DEGREE_360)) {
                angles.endAngle = DEGREE_360 - MIN_DEGREE;
            }

            attrMap[sectorName] = sectorArgs.concat([angles.startAngle, angles.endAngle]);
            anim = raphael.animation(attrMap, animationTime, '>');
            sectorInfo.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        });

        if (callback) {
            setTimeout(callback, delayTime);
        }
    },

    /**
     * Animate legend lines.
     * @param {?number} legendIndex legend index
     */
    animateLegendLines: function(legendIndex) {
        var isNull;

        if (!this.legendLines) {
            return;
        }

        isNull = snippet.isNull(legendIndex);

        snippet.forEachArray(this.legendLines, function(line, index) {
            var opacity = (isNull || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            line.animate({
                'stroke': 'black',
                'stroke-opacity': opacity
            });
        });
    },

    /**
     * Resize graph of pie chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {{cx:number, cy:number, r: number}} params.circleBound circle bound
     */
    resize: function(params) {
        var dimension = params.dimension;
        var circleBound = params.circleBound;
        var sectorName = this.sectorName;
        var labelSet = this.labelSet;

        this.circleBound = circleBound;
        this.paper.setSize(dimension.width, dimension.height);

        snippet.forEachArray(this.sectorInfos, function(sectorInfo, index) {
            var angles = sectorInfo.angles;
            var attrs = {};
            var bBox;

            attrs[sectorName] = [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle];
            sectorInfo.sector.attr(attrs);

            if (labelSet && labelSet.length) {
                bBox = sectorInfo.sector.getBBox();

                labelSet[index].attr({
                    x: bBox.x + (bBox.width / 2),
                    y: bBox.y + (bBox.height / 2)
                });
            }
        });
    },

    /**
     * Move legend lines.
     * @param {Array.<object>} outerPositions outer positions
     */
    moveLegendLines: function(outerPositions) {
        var paths;

        if (!this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions);
        snippet.forEachArray(this.legendLines, function(line, index) {
            line.attr({path: paths[index]});

            return line;
        });
    },

    findSectorInfo: function(position) {
        var sector = this.paper && this.paper.getElementByPoint(position.left, position.top);
        var info = null;

        if (sector) {
            info = {
                legendIndex: snippet.isExisty(sector.data('legendIndex')) ? sector.data('legendIndex') : -1,
                index: snippet.isExisty(sector.data('index')) ? sector.data('index') : -1,
                chartType: sector.data('chartType')
            };
        }

        return info;
    },

    /**
     * Whether changed or not.
     * @param {{left: number, top: number}} prevPosition previous position
     * @param {{left: number, top: number}} position position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Show tooltip.
     * @param {object} sector - raphael object
     * @param {{left: number, top: number}} position - mouse position
     * @private
     */
    _showTooltip: function(sector, position) {
        var args = [{}, 0, sector.data('index'), {
            left: position.left - TOOLTIP_OFFSET_VALUE,
            top: position.top - TOOLTIP_OFFSET_VALUE
        }];

        this.callbacks.showTooltip.apply(null, args);
    },

    /**
     * Whether valid sector or not.
     * @param {object} sector - raphael object
     * @returns {boolean}
     * @private
     */
    _isValidSector: function(sector) {
        return sector && sector.data('chartType') === this.chartType;
    },

    /**
     * Move mouse on series.
     * @param {{left: number, top: number}} position mouse position
     */
    moveMouseOnSeries: function(position) {
        var sector = this.paper && this.paper.getElementByPoint(position.left, position.top);

        if (this._isValidSector(sector)) {
            if (this.prevHoverSector !== sector) {
                this._showOverlay(sector.data('index'), sector.data('legendIndex'));
                this.prevHoverSector = sector;
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                this._showTooltip(sector, position);
            }
        } else if (this.prevHoverSector) {
            this._hideOverlay();
            this.callbacks.hideTooltip();
            this.prevHoverSector = null;
        }

        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {{index: number}} indexes - index map
     */
    selectSeries: function(indexes) {
        var sectorInfo = this.sectorInfos[indexes.index];
        var luminanceColor, objColor, color;

        if (!sectorInfo) {
            return;
        }

        objColor = raphael.color(sectorInfo.color);
        luminanceColor = raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANT_VALUE);

        color = this.selectionColor || luminanceColor;

        sectorInfo.sector.attr({
            fill: color
        });
    },

    /**
     * Unelect series.
     * @param {{index: number}} indexes - index map
     */
    unselectSeries: function(indexes) {
        var sectorInfo = this.sectorInfos[indexes.index];

        if (!sectorInfo) {
            return;
        }

        sectorInfo.sector.attr({
            fill: sectorInfo.color
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var isNull = snippet.isNull(legendIndex);
        var legendLines = this.legendLines;

        snippet.forEachArray(this.sectorInfos, function(sectorInfo, index) {
            var opacity = (isNull || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            sectorInfo.sector.attr({
                'fill-opacity': opacity
            });

            if (legendLines) {
                legendLines[index].attr({
                    'stroke-opacity': opacity
                });
            }
        });
    },
    /**
     * Get rendered label width
     * @param {string} text - text content
     * @param {object} theme - label theme
     * @returns {number}
     */
    getRenderedLabelWidth: function(text, theme) {
        return raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily).width;
    },

    /**
     * Get rendered label height
     * @param {string} text - text content
     * @param {object} theme - label theme
     * @returns {number}
     */
    getRenderedLabelHeight: function(text, theme) {
        return raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily).height;
    },

    /**
     * Render labels and return label set
     * @param {object} paper Raphael paper
     * @param {object} positions position left, top
     * @param {Array.<string>} labels series labels
     * @param {object} theme label theme
     * @returns {Array.<object>}
     */
    renderLabels: function(paper, positions, labels, theme) {
        var labelSet = paper.set();
        var attributes = {
            'font-size': theme.fontSize,
            'font-family': theme.fontFamily,
            'font-weight': theme.fontWeight,
            'text-anchor': 'middle',
            fill: theme.color,
            opacity: 0
        };

        snippet.forEach(positions, function(position, index) {
            var label;

            if (position) {
                label = raphaelRenderUtil.renderText(paper, position, labels[index], attributes);

                label.node.style.userSelect = 'none';
                label.node.style.cursor = 'default';
                label.node.setAttribute('filter', 'url(#glow)');
            }
            labelSet.push(label);
        });

        this.labelSet = labelSet;

        return labelSet;
    }
});

module.exports = RaphaelPieChart;
