import React from 'react';
import '@toast-ui/chart/dist/toastui-chart.min.css';
import {
  AreaChart,
  BarChart,
  BoxPlotChart,
  BulletChart,
  BubbleChart,
  ColumnChart,
  ColumnLineChart,
  HeatmapChart,
  LineChart,
  LineAreaChart,
  LineScatterChart,
  NestedPieChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TreemapChart,
} from '../src';
import {
  avgTemperatureData,
  budgetData,
  budgetDataForBoxPlot,
  lifeExpectancyPerGDPData,
  temperatureData,
  budgetDataForBullet,
  temperatureAverageData,
  temperatureAverageDataForHeatmap,
  energyUsageData,
  efficiencyAndExpensesData,
  browserUsageData2,
  browserUsageData,
  genderHeightWeightData,
  usedDiskSpaceData,
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

  return <AreaChart options={options} data={avgTemperatureData} />;
};

export const bar = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return <BarChart options={options} data={budgetData} />;
};

export const boxPlot = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return <BoxPlotChart options={options} data={budgetDataForBoxPlot} />;
};

export const bullet = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return <BulletChart options={options} data={budgetDataForBullet} />;
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

  return <BubbleChart options={options} data={lifeExpectancyPerGDPData} />;
};

export const column = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      title: 'Monthly Revenue',
    },
  };

  return <ColumnChart options={options} data={budgetData} />;
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

  return <ColumnLineChart options={options} data={temperatureAverageData} />;
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

  return <HeatmapChart options={options} data={temperatureAverageDataForHeatmap} />;
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

  return <LineChart options={options} data={temperatureData} />;
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

  return <LineAreaChart options={options} data={energyUsageData} />;
};

export const lineScatter = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
      chart: { title: 'Efficiency vs Expenses' },
    },
  };

  return <LineScatterChart options={options} data={efficiencyAndExpensesData} />;
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

  return <NestedPieChart options={options} data={browserUsageData2} />;
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

  return <PieChart options={options} data={browserUsageData} />;
};

export const radar = () => {
  const options = {
    chart: {
      height: 500,
      width: 700,
      chart: { title: 'Annual Incomes' },
    },
  };

  return <RadarChart options={options} data={budgetData} />;
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

  return <ScatterChart options={options} data={genderHeightWeightData} />;
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

  return <TreemapChart options={options} data={usedDiskSpaceData} />;
};
