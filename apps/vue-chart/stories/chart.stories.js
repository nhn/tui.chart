import {
  areaChart,
  lineChart,
  barChart,
  boxPlotChart,
  bubbleChart,
  bulletChart,
  columnChart,
  columnLineChart,
  heatmapChart,
  lineAreaChart,
  lineScatterChart,
  nestedPieChart,
  pieChart,
  radarChart,
  scatterChart,
  treemapChart,
  radialBarChart,
  gaugeChart,
} from '../src/index';
import '@toast-ui/chart/dist/toastui-chart.min.css';
import {
  temperatureData,
  avgTemperatureData,
  budgetData,
  budgetDataForBoxPlot,
  lifeExpectancyPerGDPData,
  budgetDataForBullet,
  temperatureAverageData,
  temperatureAverageDataForHeatmap,
  energyUsageData,
  efficiencyAndExpensesData,
  browserUsageData2,
  browserUsageData,
  genderHeightWeightData,
  usedDiskSpaceData,
  olympicMedalData,
  gaugeData,
} from './data';

export default {
  title: 'Chart',
};

export const area = () => {
  const options = {
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
  };

  return {
    components: {
      'area-chart': areaChart,
    },
    template: '<area-chart :data="chartProps.data" :options="chartProps.options" ></area-chart>',
    created() {
      this.chartProps = { data: avgTemperatureData, options };
    },
  };
};

export const bar = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return {
    components: {
      'bar-chart': barChart,
    },
    template: '<bar-chart :data="chartProps.data" :options="chartProps.options" ></bar-chart>',
    created() {
      this.chartProps = { data: budgetData, options };
    },
  };
};

export const boxPlot = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return {
    components: {
      'box-plot-chart': boxPlotChart,
    },
    template:
      '<box-plot-chart :data="chartProps.data" :options="chartProps.options" ></box-plot-chart>',
    created() {
      this.chartProps = { data: budgetDataForBoxPlot, options };
    },
  };
};

export const bubble = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Life Expectancy per GDP',
    },
    yAxis: {
      title: 'Life Expectancy (years)',
    },
    xAxis: {
      title: 'GDP',
    },
  };

  return {
    components: {
      'bubble-chart': bubbleChart,
    },
    template:
      '<bubble-chart :data="chartProps.data" :options="chartProps.options" ></bubble-chart>',
    created() {
      this.chartProps = { data: lifeExpectancyPerGDPData, options };
    },
  };
};

export const bullet = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return {
    components: {
      'bullet-chart': bulletChart,
    },
    template:
      '<bullet-chart :data="chartProps.data" :options="chartProps.options" ></bullet-chart>',
    created() {
      this.chartProps = { data: budgetDataForBullet, options };
    },
  };
};

export const column = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return {
    components: {
      'column-chart': columnChart,
    },
    template:
      '<column-chart :data="chartProps.data" :options="chartProps.options" ></column-chart>',
    created() {
      this.chartProps = { data: budgetData, options };
    },
  };
};

export const columnLine = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: '24-hr Average Temperature',
    },
    yAxis: { title: 'Temperature (Celsius)' },
    xAxis: { title: 'Month' },
  };

  return {
    components: {
      'column-line-chart': columnLineChart,
    },
    template:
      '<column-line-chart :data="chartProps.data" :options="chartProps.options" ></column-line-chart>',
    created() {
      this.chartProps = { data: temperatureAverageData, options };
    },
  };
};

export const heatmap = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
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
  };

  return {
    components: {
      'heatmap-chart': heatmapChart,
    },
    template:
      '<heatmap-chart :data="chartProps.data" :options="chartProps.options" ></heatmap-chart>',
    created() {
      this.chartProps = { data: temperatureAverageDataForHeatmap, options };
    },
  };
};

export const line = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
    },
    xAxis: {
      pointOnColumn: true,
    },
    series: {
      spline: true,
      showDot: true,
      selectable: true,
    },
  };

  return {
    components: {
      'line-chart': lineChart,
    },
    template: '<line-chart :data="chartProps.data" :options="chartProps.options" ></line-chart>',
    created() {
      this.chartProps = { data: temperatureData, options };
    },
  };
};

export const lineArea = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Energy Usage',
    },
    xAxis: {
      title: 'Month',
      date: { format: 'yy/MM' },
    },
    yAxis: {
      title: 'Energy (kWh)',
    },
    tooltip: {
      formatter: (value) => `${value}kWh`,
    },
  };

  return {
    components: {
      'line-area-chart': lineAreaChart,
    },
    template:
      '<line-area-chart :data="chartProps.data" :options="chartProps.options" ></line-area-chart>',
    created() {
      this.chartProps = { data: energyUsageData, options };
    },
  };
};

export const lineScatter = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      chart: { title: 'Efficiency vs Expenses' },
    },
  };

  return {
    components: {
      'line-scatter-chart': lineScatterChart,
    },
    template:
      '<line-scatter-chart :data="chartProps.data" :options="chartProps.options" ></line-scatter-chart>',
    created() {
      this.chartProps = { data: efficiencyAndExpensesData, options };
    },
  };
};

export const nestedPie = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      chart: { title: 'Usage share of web browsers' },
    },
    series: {
      browsers: {
        radiusRange: {
          inner: '20%',
          outer: '50%',
        },
      },
      versions: {
        radiusRange: {
          inner: '55%',
          outer: '85%',
        },
      },
    },
  };

  return {
    components: {
      'nested-pie-chart': nestedPieChart,
    },
    template:
      '<nested-pie-chart :data="chartProps.data" :options="chartProps.options" ></nested-pie-chart>',
    created() {
      this.chartProps = { data: browserUsageData2, options };
    },
  };
};

export const pie = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      chart: { title: 'Usage share of web browsers' },
    },
    series: {
      dataLabels: {
        visible: true,
      },
    },
  };

  return {
    components: {
      'pie-chart': pieChart,
    },
    template: '<pie-chart :data="chartProps.data" :options="chartProps.options" ></pie-chart>',
    created() {
      this.chartProps = { data: browserUsageData, options };
    },
  };
};

export const radar = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      chart: { title: 'Annual Incomes' },
    },
  };

  return {
    components: {
      'radar-chart': radarChart,
    },
    template: '<radar-chart :data="chartProps.data" :options="chartProps.options" ></radar-chart>',
    created() {
      this.chartProps = { data: budgetData, options };
    },
  };
};

export const scatter = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      title: 'Height vs Weight',
    },
    xAxis: { title: 'Height (cm)' },
    yAxis: { title: 'Weight (kg)' },
  };

  return {
    components: {
      'scatter-chart': scatterChart,
    },
    template:
      '<scatter-chart :data="chartProps.data" :options="chartProps.options" ></scatter-chart>',
    created() {
      this.chartProps = { data: genderHeightWeightData, options };
    },
  };
};

export const treemap = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      title: 'Used disk space',
    },
    tooltip: { formatter: (value) => `${value}GB` },
  };

  return {
    components: {
      'treemap-chart': treemapChart,
    },
    template:
      '<treemap-chart :data="chartProps.data" :options="chartProps.options" ></treemap-chart>',
    created() {
      this.chartProps = { data: usedDiskSpaceData, options };
    },
  };
};

export const radialBar = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      title: 'Used disk space',
    },
  };

  return {
    components: {
      'radialBar-chart': radialBarChart,
    },
    template:
      '<radialBar-chart :data="chartProps.data" :options="chartProps.options" ></radialBar-chart>',
    created() {
      this.chartProps = { data: olympicMedalData, options };
    },
  };
};

export const gauge = () => {
  const options = {
    chart: {
      height: 500,
      width: 550,
    },
    circularAxis: {
      scale: {
        min: 0,
        max: 100,
      },
      title: { text: 'km/h' },
    },
    plot: {
      bands: [
        { range: [0, 20], color: '#55bf3b' },
        { range: [20, 50], color: '#dddf0d' },
        { range: [50, 110], color: '#df5353' },
      ],
    },
  };

  return {
    components: {
      'gauge-chart': gaugeChart,
    },
    template: '<gauge-chart :data="chartProps.data" :options="chartProps.options" ></gauge-chart>',
    created() {
      this.chartProps = { data: gaugeData, options };
    },
  };
};
