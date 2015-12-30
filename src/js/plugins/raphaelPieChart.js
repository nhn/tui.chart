/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANGLE_180 = 180,
    RAD = Math.PI / ANGLE_180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700,
    EMPHASIS_OPACITY = 1,
    DE_EMPHASIS_OPACITY = 0.3;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {HTMLElement} container container
     * @param {{sectorData: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @return {object} paper raphael paper
     */
    render: function(container, data, callbacks) {
        var dimension = data.dimension,
            paper;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        if (!paper.customAttributes.sector) {
            paper.customAttributes.sector = tui.util.bind(this._makeSectorPath, this);
        }

        this.selectionColor = data.theme.selectionColor;
        this.circleBound = data.circleBound;
        this._renderPie(paper, data, callbacks);

        return paper;
    },

    /**
     * Make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var x1 = cx + r * Math.sin(startAngle * RAD), // 원 호의 시작 x 좌표
            y1 = cy - r * Math.cos(startAngle * RAD), // 원 호의 시작 y 좌표
            x2 = cx + r * Math.sin(endAngle * RAD),// 원 호의 종료 x 좌표
            y2 = cy - r * Math.cos(endAngle * RAD), // 원 호의 종료 y 좌표
            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x1, y1,
                "A", r, r, 0, largeArcFlag, 1, x2, y2,
                "Z"
            ];
        // path에 대한 자세한 설명은 아래 링크를 참고
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
        return {path: path};
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
    _renderSector: function (params) {
        var circleBound = params.circleBound,
            angles = params.angles;

        return params.paper.path().attr({
            sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
        }).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{sectorData: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @private
     */
    _renderPie: function(paper, data, callbacks) {
        var circleBound = data.circleBound,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            sectors = [];

        tui.util.forEachArray(data.sectorData, function(sectorDatum, index) {
            var percentValue = sectorDatum.percentValue,
                color = colors[index],
                sector = this._renderSector({
                    paper: paper,
                    circleBound: circleBound,
                    angles: sectorDatum.angles.start,
                    attrs: {
                        fill: color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });

            this._bindHoverEvent(sector, index, callbacks);

            sectors.push({
                sector: sector,
                color: color,
                angles: sectorDatum.angles.end,
                percentValue: percentValue
            });
        }, this);

        this.sectors = sectors;
    },

    /**
     * Render legend lines.
     * @param {array.<object>} outerPositions outer position
     */
    renderLegendLines: function(outerPositions) {
        var that = this,
            paths;

        if (this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions);
        this.legendLines = tui.util.map(paths, function(path) {
            return raphaelRenderUtil.renderLine(that.paper, path, 'transparent', 1);
        });
    },

    /**
     * Make line paths.
     * @param {array.<object>} outerPositions outer positions
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
        }, this);

        return paths;
    },

    /**
     * Bind hover event.
     * @param {object} target raphael item
     * @param {number} index index
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @private
     */
    _bindHoverEvent: function(target, index, callbacks) {
        var args = [{}, 0, index],
            isOn = false,
            throttled = tui.util.throttle(function() {
                if (!isOn) {
                    return;
                }
                callbacks.funcShowTooltip.apply(null, arguments);
            }, 100);

        target.mouseover(function (e) {
            var _args = args.concat({
                clientX: e.clientX,
                clientY: e.clientY
            });
            isOn = true;
            callbacks.funcShowTooltip.apply(null, _args);
        }).mousemove(function(e) {
            var _args = args.concat({
                clientX: e.clientX,
                clientY: e.clientY - 10
            });
            throttled.apply(null, _args);
        }).mouseout(function () {
            isOn = false;
            callbacks.funcHideTooltip();
        }).click(function() {
            callbacks.funcSelectSeries(index);
        });
    },

    /**
     * Expand selector radius.
     * @param {object} sector pie sector
     */
    _expandSector: function(sector) {
        var cx = this.circleBound.cx,
            cy = this.circleBound.cy;

        sector.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * Restore selector radius.
     * @param {object} sector pie sector
     */
    _restoreSector: function(sector) {
        sector.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * Show animation.
     * @param {{index: number}} data data
     */
    showAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        this._expandSector(sector);
    },

    /**
     * Hide animation.
     * @param {{index: number}} data data
     */
    hideAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
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
                animationTime = LOADING_ANIMATION_TIME * item.percentValue,
                anim = Raphael.animation({
                    sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
                }, animationTime);
            item.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        }, this);

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

        tui.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles;
            item.sector.attr({
                sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
            });
        }, this);
    },

    /**
     * Move legend lines.
     * @param {array.<object>} outerPositions outer positions
     */
    moveLegendLines: function(outerPositions) {
        var paths;

        if (!this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions)
        tui.util.forEachArray(this.legendLines, function(line, index) {
            line.attr({path: paths[index]});
            return line;
        });
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var item = this.sectors[indexes.index],
            objColor = Raphael.color(item.color),
            color = this.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, 0.2);

        item.sector.attr({
            fill: color
        });
    },

    /**
     * Unelect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var sector = this.sectors[indexes.index];

        sector.sector.attr({
            fill: sector.color
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
        }, this);
    }
});

module.exports = RaphaelPieChart;
