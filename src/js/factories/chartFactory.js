/**
 * @fileoverview  Chart Factory is register chart and get it.
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
         * @returns {object} chart instance;
         */
        get: function(chartType, data, options) {
            var Chart = charts[chartType],
                chart;

            if (!Chart) {
                throw new Error('Not exist ' + chartType + ' chart.');
            }

            chart = new Chart(data, options);

            return chart;
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