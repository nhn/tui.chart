/**
 * @fileoverview Raphael pie chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael,
    ANGLE_180 = 180,
    ANGLE_90 = 90,
    RAD = Math.PI / ANGLE_180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelPieCharts is graph renderer.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = ne.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var dimension = data.dimension;

        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        if (!paper.customAttributes.sector) {
            paper.customAttributes.sector = ne.util.bind(this._makeSectorPath, this);
        }

        this.circleBound = data.circleBound;
        this._renderPie(paper, data, inCallback, outCallback);

        return paper;
    },

    /**
     * To make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r round
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var x1 = cx + r * Math.cos(-(startAngle - ANGLE_90) * RAD), // 원 호의 시작 x 좌표
            y1 = cy - r * Math.sin(-(startAngle - ANGLE_90) * RAD), // 원 호의 시작 y 좌표
            x2 = cx + r * Math.cos(-(endAngle - ANGLE_90) * RAD),// 원 호의 종료 x 좌표
            y2 = cy - r * Math.sin(-(endAngle - ANGLE_90) * RAD), // 원 호의 종료 y 좌표
            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x2, y2,
                "A", r, r, 0, largeArcFlag, 0, x1, y1,
                "Z"
            ];
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
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderPie: function(paper, data, inCallback, outCallback) {
        var circleBound = data.circleBound,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            angle = 0,
            sectors = [];

        ne.util.forEachArray(data.sectorsInfo, function(sectorInfo, index) {
            var percentValue = sectorInfo.percentValue,
                color = colors[index],
                sector = this._renderSector({
                    paper: paper,
                    circleBound: circleBound,
                    angles: sectorInfo.angles.start,
                    attrs: {
                        fill: "90-" + color + "-" + color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });

            this._bindHoverEvent({
                target: sector,
                position: sectorInfo.popupPosition,
                id: '0-' + index,
                inCallback: inCallback,
                outCallback: outCallback
            });

            sectors.push({
                sector: sector,
                angles: sectorInfo.angles.end,
                percentValue: percentValue
            });
        }, this);

        this.sectors = sectors;
    },

    /**
     * Bind hover event.
     * @param {object} params parameters
     *      @param {object} params.target raphael item
     *      @param {{left: number, top: number}} params.position position
     *      @param {string} params.id id
     *      @param {function} params.inCallback in callback
     *      @param {function} params.outCallback out callback
     * @private
     */
    _bindHoverEvent: function(params) {
        params.target.mouseover(function () {
            params.inCallback(params.position, params.id);
        }).mouseout(function () {
            params.outCallback(params.id);
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var sector = this.sectors[data.index].sector,
            cx = this.circleBound.cx,
            cy = this.circleBound.cy;
        sector.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        sector.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * Animate.
     */
    animate: function(callback) {
        var delayTime = 0,
            circleBound = this.circleBound;
        ne.util.forEachArray(this.sectors, function(item) {
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
    }
});

module.exports = RaphaelPieChart;
