/**
 * @fileoverview  Chart Factory.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var charts = {},
    factory = {
        /**
         * Get chart.
         * @param {string} chartType chart type
         * @param {object} data chart data
         * @param {object} options chart options
         * @returns {object}
         */
        get: function(chartType, data, options) {
            var Chart = charts[chartType];
            if (Chart) {
                var chart = new Chart(data, options);
                return chart;
            } else {
                throw new Error('Not exist ' + chartType + ' chart.');
            }
        },

        /**
         * Chart register.
         * @param {string} chartType char type
         * @param {class} ChartClass chart class
         */
        register: function(chartType, ChartClass) {
            charts[chartType] = ChartClass;
        }
    };

module.exports = factory;