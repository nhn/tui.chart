/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var DEGREE_180 = 180;
var DEGREE_360 = 360;
var MIN_DEGREE = 0.01;
var RAD = Math.PI / DEGREE_180;
var LOADING_ANIMATION_TIME = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {HTMLElement} container container
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
    render: function(container, data, callbacks) {
        var dimension = data.dimension,
            paper;

        //Raphael._oid = 0;
        this.paper = paper = raphael(container, dimension.width, dimension.height);

        this.holeRatio = data.options.holeRatio;
        this._setSectorAttr(data.options.holeRatio);

        this.container = container;
        this.callbacks = callbacks;
        this.selectionColor = data.theme.selectionColor;
        this.circleBound = data.circleBound;

        this._renderPie(paper, data);

        return paper;
    },

    /**
     * Clear paper.
     */
    clear: function() {
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
        var x1 = cx + r * Math.sin(startRadian); // 원 호의 시작 x 좌표
        var y1 = cy - r * Math.cos(startRadian); // 원 호의 시작 y 좌표
        var x2 = cx + r * Math.sin(endRadian); // 원 호의 종료 x 좌표
        var y2 = cy - r * Math.cos(endRadian); // 원 호의 종료 y 좌표
        var largeArcFlag = endAngle - startAngle > DEGREE_180 ? 1 : 0;
        var path = ['M', cx, cy,
            'L', x1, y1,
            'A', r, r, 0, largeArcFlag, 1, x2, y2,
            'Z'
        ];
        // path에 대한 자세한 설명은 아래 링크를 참고
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
        return {path: path};
    },

    /**
     * Make sector path for donut chart.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: Array}} sector path
     * @private
     */
    _makeDonutSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var startRadian = startAngle * RAD;
        var endRadian = endAngle * RAD;
        var r2 = r * this.holeRatio; // 구멍 반지름
        var x1 = cx + r * Math.sin(startRadian);
        var y1 = cy - r * Math.cos(startRadian);
        var x2 = cx + r2 * Math.sin(startRadian);
        var y2 = cy - r2 * Math.cos(startRadian);
        var x3 = cx + r * Math.sin(endRadian);
        var y3 = cy - r * Math.cos(endRadian);
        var x4 = cx + r2 * Math.sin(endRadian);
        var y4 = cy - r2 * Math.cos(endRadian);
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

        if (this.paper.customAttributes.sector) {
            return;
        }

        if (this.holeRatio) {
            makeSectorPath = this._makeDonutSectorPath;
        } else {
            makeSectorPath = this._makeSectorPath;
        }

        this.paper.customAttributes.sector = tui.util.bind(makeSectorPath, this);
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function(params) {
        var circleBound = params.circleBound,
            angles = params.angles;

        return params.paper.path().attr({
            sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
        }).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{
     *      sectorData: Array.<object>,
     *      circleBound: {cx: number, cy: number, r: number},
     *      dimension: object, theme: object, options: object
     * }} data render data
     * @private
     */
    _renderPie: function(paper, data) {
        var self = this,
            circleBound = data.circleBound,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            sectors = [];

        tui.util.forEachArray(data.sectorData, function(sectorDatum, index) {
            var percentValue = sectorDatum.percentValue,
                color = colors[index],
                sector = self._renderSector({
                    paper: paper,
                    circleBound: circleBound,
                    angles: sectorDatum.angles.start,
                    attrs: {
                        fill: color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });
            sector.data('index', index);
            sectors.push({
                sector: sector,
                color: color,
                angles: sectorDatum.angles.end,
                percentValue: percentValue
            });
        });

        this.sectors = sectors;
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
            this.legendLines = tui.util.map(paths, function(path) {
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
        var paths = tui.util.map(outerPositions, function(positions) {
            return [
                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),
                raphaelRenderUtil.makeLinePath(positions.middle, positions.end),
                'Z'
            ].join('');
        });

        return paths;
    },

    /**
     * Expand selector radius.
     * @param {object} sector pie sector
     */
    _expandSector: function(sector) {
        var cx = this.circleBound.cx,
            cy = this.circleBound.cy;

        sector.animate({
            transform: 's1.1 1.1 ' + cx + ' ' + cy
        }, ANIMATION_TIME, 'elastic');
    },

    /**
     * Restore selector radius.
     * @param {object} sector pie sector
     */
    _restoreSector: function(sector) {
        sector.animate({transform: ''}, ANIMATION_TIME, 'elastic');
    },

    /**
     * animate expanding.
     * @param {number} index sector index
     */
    _animateExpanding: function(index) {
        var sector = this.sectors[index].sector;

        if (this.prevMovedSector) {
            this._animateRestoring(this.prevMovedSector.data('index'));
        }

        this._expandSector(sector);
    },

    /**
     * Animate restoring.
     * @param {number} index sector index
     */
    _animateRestoring: function(index) {
        var sector = this.sectors[index].sector;
        this._restoreSector(sector);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0,
            circleBound = this.circleBound;

        tui.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles,
                animationTime, anim;

            if (angles.startAngle === 0 && angles.endAngle === DEGREE_360) {
                angles.endAngle = DEGREE_360 - MIN_DEGREE;
            }

            animationTime = LOADING_ANIMATION_TIME * item.percentValue;
            anim = raphael.animation({
                sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
            }, animationTime);

            item.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        });

        if (callback) {
            setTimeout(callback, delayTime);
        }
    },

    /**
     * Animate legend lines.
     */
    animateLegendLines: function() {
        if (!this.legendLines) {
            return;
        }

        tui.util.forEachArray(this.legendLines, function(line) {
            line.animate({
                'stroke': 'black',
                'stroke-opacity': 1
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
        var dimension = params.dimension,
            circleBound = params.circleBound;

        this.circleBound = circleBound;
        this.paper.setSize(dimension.width, dimension.height);
        delete this.containerBound;

        tui.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles;
            item.sector.attr({
                sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
            });
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
        tui.util.forEachArray(this.legendLines, function(line, index) {
            line.attr({path: paths[index]});
            return line;
        });
    },

    /**
     * Click series.
     * @param {{left: number, top: number}} position mouse position
     */
    clickSeries: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top);

        if (sector && this.prevSelectedSector) {
            this._unselectSeries(this.prevSelectedSector.data('index'));
        }

        if (this.prevSelectedSector === sector) {
            sector = null;
            delete this.prevSelectedSector;
        } else if (sector) {
            this._selectSeries(sector.data('index'));
            this.prevSelectedSector = sector;
        }
    },


    /**
     * Get series container bound.
     * @returns {{left: number, top: number}} container bound
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.container.getBoundingClientRect();
        }
        return this.containerBound;
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
     * Move mouse on series.
     * @param {{left: number, top: number}} position mouse position
     */
    moveMouseOnSeries: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            containerBound, args, changedSector;

        if (sector && this.sectors[sector.data('index')]) {
            containerBound = this._getContainerBound();
            changedSector = this.prevMovedSector !== sector;
            args = [{}, 0, sector.data('index'), {
                left: position.left - containerBound.left,
                top: position.top - containerBound.top
            }];

            if (changedSector) {
                this._animateExpanding(sector.data('index'));
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                this.callbacks.showTooltip.apply(null, args);
                this.prevMovedSector = sector;
            }
        } else if (this.prevMovedSector) {
            this._animateRestoring(this.prevMovedSector.data('index'));
            this.callbacks.hideTooltip();
            this.prevMovedSector = null;
        }
        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {number} index index
     * @private
     */
    _selectSeries: function(index) {
        var item = this.sectors[index];
        var objColor, color;

        if (!item) {
            return;
        }

        objColor = raphael.color(item.color);
        color = this.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);

        item.sector.attr({
            fill: color
        });
    },

    /**
     * Unelect series.
     * @param {number} index index
     * @private
     */
    _unselectSeries: function(index) {
        var item = this.sectors[index];

        if (!item) {
            return;
        }

        item.sector.attr({
            fill: item.color
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var isNull = tui.util.isNull(legendIndex);

        tui.util.forEachArray(this.sectors, function(item, index) {
            var opacity;

            opacity = (isNull || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            item.sector.attr({
                'fill-opacity': opacity
            });
        });
    }
});

module.exports = RaphaelPieChart;
