/**
 * @fileoverview Raphael pie chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael,
    RAD = Math.PI / 180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelPieCharts is graph renderer.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = ne.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function or line chart.
     * @param {object} paper raphael paper
     * @param {HTMLElement} container container
     * @param {{percentValues: array.<number>, circleBounds: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @return {object} paper raphael paper
     */
    render: function(paper, container, data, inCallback, outCallback) {
        var dimension = data.dimension,
            that = this;
        if (!paper) {
            paper = Raphael(container, dimension.width, dimension.height);
        }

        if (!paper.customAttributes.sector) {
            // 객체를 인자로 받게되면 오동작 함
            paper.customAttributes.sector = function(cx, cy, r, startAngle, endAngle) {
                var path = that._makeSectorPath(cx, cy, r, startAngle, endAngle);
                return {path: path};
            };
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
     * @returns {string[]} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var x1 = cx + r * Math.cos(-startAngle * RAD),
            x2 = cx + r * Math.cos(-endAngle * RAD),
            y1 = cy + r * Math.sin(-startAngle * RAD),
            y2 = cy + r * Math.sin(-endAngle * RAD),
            path = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"];
        return path;
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
            sectors = paper.set(),
            angles = [];

        ne.util.forEachArray(percentValues, function(percentValue, index) {
            var anglePlus = 360 * percentValue,
                popAngle = angle + (anglePlus / 2),
                color = colors[index],
                p = this._renderSector({
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

            sectors.push(p);
            angles.push({
                startAngle: angle,
                endAngle: angle + anglePlus,
                percentValue: percentValue
            });
            angle += anglePlus;

            this._bindHoverEvent({
                target: p,
                position: {
                    left: cx + (r + delta) * Math.cos(-popAngle * RAD),
                    top: cy + (r + delta) * Math.sin(-popAngle * RAD)
                },
                id: '0-' + index,
                inCallback: inCallback,
                outCallback: outCallback
            });
        }, this);

        this.sectors = sectors;
        this.angles = angles;
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
        var that = this;
        params.target.mouseover(function () {
            that.showedId = params.id;
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
        var target = this.sectors[data.index],
            cx = this.circleBounds.cx,
            cy = this.circleBounds.cy;
        target.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var target = this.sectors[data.index];
        target.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * First animation.
     */
    firstAnimation: function() {
        var circleBounds = this.circleBounds,
            angles = this.angles,
            time = 0;
        ne.util.forEachArray(this.sectors, function(sector, index) {
            var angle = angles[index],
                animationTime = LOADING_ANIMATION_TIME * angle.percentValue,
                anim = Raphael.animation({
                    sector: [circleBounds.cx, circleBounds.cy, circleBounds.r, angle.startAngle, angle.endAngle]
                }, animationTime);
            sector.animate(anim.delay(time));
            time += animationTime;
        }, this);
    }
});

module.exports = RaphaelPieChart;
