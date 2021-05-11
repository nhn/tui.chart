import { areaChart, heatmapChart } from '/dist/index.js';
import Vue from 'vue/dist/vue.js';
import '@toast-ui/chart/toastui-chart.min.css';

Vue.component('area-chart', areaChart);
Vue.component('heatmap-chart', heatmapChart);

const areaProps = {
  data: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    series: [
      {
        name: 'Seoul',
        data: [20, 40, 25, 50, 15, 45, 33, 34, 20, 30, 22, 13],
      },
      {
        name: 'Sydney',
        data: [5, 30, 21, 18, 59, 50, 28, 33, 7, 20, 10, 30],
      },
      {
        name: 'Moscow',
        data: [30, 5, 18, 21, 33, 41, 29, 15, 30, 10, 33, 5],
      },
    ],
  },
  options: {
    chart: {
      height: 500,
      width: 1000,
      title: 'Average Temperature',
    },
    xAxis: {
      pointOnColumn: false,
      title: { text: 'Month' },
    },
    yAxis: { title: 'Temperature (Celsius)' },
    series: {
      spline: true,
      showDot: true,
      selectable: true,
    },
  },
};

const heatmapProps = {
  options: {
    chart: {
      height: 500,
      width: 800,
      title: '24-hr Average Temperature',
    },
    xAxis: {
      title: 'Month',
    },
    yAxis: {
      title: 'City',
    },
    tooltip: {
      formatter: (value) => `${value}°C`,
    },
    legend: {
      align: 'bottom',
    },
  },
  data: {
    categories: {
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: ['Seoul', 'Seattle', 'Sydney', 'Moscow', 'Jungfrau'],
    },
    series: [
      [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6],
      [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7],
      [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2],
      [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5],
      [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9],
    ],
  },
};

// eslint-disable-next-line no-unused-vars
const vue = new Vue({
  el: '#chart',
  data() {
    return {
      heatmapProps,
      areaProps,
    };
  },
  methods: {
    hoverSeries(ev) {
      console.log(ev, 'hover!');
    },
    selectSeries(ev) {
      console.log(ev, 'select!');
    },
    showSeriesDataLabel() {
      this.$refs.chartRef.invoke('showSeriesDataLabel');
    },
    hideSeriesDataLabel() {
      this.$refs.chartRef.invoke('hideSeriesDataLabel');
    },
  },
});
