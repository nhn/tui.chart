/**
 * @fileoverview Raphael pie chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael,
    ANGLE_360 = 360,
    ANGLE_180 = 180,
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
     * @param {{percentValues: array.<number>, circleBounds: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
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

        this.circleBounds = data.circleBounds;
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
        var x1 = cx + r * Math.sin(startAngle * RAD),
            x2 = cx + r * Math.sin(endAngle * RAD),
            y1 = cy - r * Math.cos(startAngle * RAD),
            y2 = cy - r * Math.cos(endAngle * RAD),
            big = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x2, y2,
                "A", r, r, 0, big, 0, x1, y1,
                "Z"];
        return {path: path};
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBounds circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function (params) {
        var circleBounds = params.circleBounds;
        return params.paper.path().attr({
            sector: [circleBounds.cx, circleBounds.cy, circleBounds.r, params.startAngle, params.endAngle]
        }).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{percentValues: array.<number>, circleBounds: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderPie: function(paper, data, inCallback, outCallback) {
        var percentValues = data.percentValues[0],
            circleBounds = data.circleBounds,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            cx = circleBounds.cx,
            cy = circleBounds.cy,
            r = circleBounds.r,
            angle = 0,
            delta = 10,
            sectors = [];

        ne.util.forEachArray(percentValues, function(percentValue, index) {
            var addAngle = ANGLE_360 * percentValue,
                popAngle = angle + (addAngle / 2),
                color = colors[index],
                sector = this._renderSector({
                    paper: paper,
                    circleBounds: circleBounds,
                    startAngle: angle,
                    endAngle: angle,
                    attrs: {
                        fill: "90-" + color + "-" + color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });

            this._bindHoverEvent({
                target: sector,
                position: {
                    left: cx + (r + delta) * Math.sin(popAngle * RAD),
                    top: cy - (r + delta) * Math.cos(popAngle * RAD)
                },
                id: '0-' + index,
                inCallback: inCallback,
                outCallback: outCallback
            });

            sectors.push({
                sector: sector,
                startAngle: angle,
                endAngle: angle + addAngle,
                percentValue: percentValue
            });

            angle += addAngle;
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
            cx = this.circleBounds.cx,
            cy = this.circleBounds.cy;
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
    animate: function() {
        var circleBounds = this.circleBounds,
            delayTime = 0;
        ne.util.forEachArray(this.sectors, function(item) {
            var sector = item.sector,
                animationTime = LOADING_ANIMATION_TIME * item.percentValue,
                anim = Raphael.animation({
                    sector: [circleBounds.cx, circleBounds.cy, circleBounds.r, item.startAngle, item.endAngle]
                }, animationTime);
            sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        }, this);
    }
});

module.exports = RaphaelPieChart;
