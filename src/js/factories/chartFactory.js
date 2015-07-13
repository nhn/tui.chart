/**
 * @fileoverview  Chart Factory.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

var charts = {};
module.exports = {
    /**
     * Get chart.
     * @param {string} type chart type
     * @param {object} data chart data
     * @param {object} options chart options
     * @returns {*}
     */
    get: function(type, data, options) {
        var Chart = charts[type];
        if (Chart) {
            var chart = new Chart(data, options);
            return chart;
        } else {
            throw new Error(type + '차트는 존재하지 않습니다.');
        }
    },

    /**
     * Chart register.
     * @param {string} type char type
     * @param {class} ChartClass chart class
     */
    register: function(type, ChartClass) {
        charts[type] = ChartClass;
    }
};