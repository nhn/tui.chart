'use strict';
var dom = require('../helpers/domHandler');

/**
 * Get raphael paper
 * @param {HTMLElement} container container element
 * @param {{width:number, height:number}} dimension dimension
 * @returns {object}
 * @private
 */

/**
 * Renderers
 * @type {object}
 */
var renderers = {
    DOM: function(container) {
        var paper = dom.create('DIV');
        dom.append(container, paper);

        return paper;
    }
};

var DrawingToolPicker = {
    /**
     * DrawingToolPicker initializer
     * @param {{width:number, height:number}} dimension dimension
     */
    initDimension: function(dimension) {
        this.dimension = dimension;
    },

    /**
     * Get drawing tool paper
     * @param {HTMLElement} container container element
     * @param {string} rendererType component renderer type
     * @returns {HTMLElement|object}
     */
    getPaper: function(container, rendererType) {
        var paper = this[rendererType + 'Paper'];
        if (!paper || dom.findParentByClass(paper.canvas, 'tui-chart') !== container) {
            paper = renderers[rendererType].call(this, container, this.dimension);

            if (rendererType !== 'DOM') {
                this[rendererType + 'Paper'] = paper;
            }
        }

        return paper;
    },

    /**
     * Add renderer type
     * @param {string} componentType component renderer type
     * @param {function} callback callback function for get renderer's paper
     */
    addRendererType: function(componentType, callback) {
        renderers[componentType] = callback;
    }
};

module.exports = DrawingToolPicker;
