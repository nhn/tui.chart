<template>
  <div>
    <h1>🍞📊 TOAST UI Chart + Vue</h1>
    <toastui-line-chart
      ref="toastui-line-chart"
      :data="chartProps.data"
      :options="chartProps.options"
    ></toastui-line-chart>
    <!--    <tui-bar-chart-->
    <!--      ref="tuiBarChart"-->
    <!--      :data="barChartData"-->
    <!--      :options="barChartOptions"-->
    <!--    ></tui-bar-chart>-->
  </div>
</template>
<script>
import { lineChart } from '../src/index';

// const chartWidth = 800;
// function remakeDataForBarChart(chartData, checkedInfo) {
//   const barChartSeriesData = chartData.series;
//   const newBarChartSeriesData = barChartSeriesData.map((seriesItem) => ({
//     name: seriesItem.name,
//     data: Array.from(seriesItem.data).filter((value, valueIdx) => checkedInfo[valueIdx]),
//   }));
//
//   return {
//     categories: Array.from(chartData.categories).filter((value, valueIdx) => checkedInfo[valueIdx]),
//     series: newBarChartSeriesData,
//   };
// }
//
// function remakeDataForLineColumnChart(chartData, checkedInfo) {
//   const comboChartSeriesData = chartData.series;
//   const columnChartSeriesData = comboChartSeriesData.column;
//   const lineChartSeriesData = comboChartSeriesData.line;
//
//   return {
//     categories: chartData.categories,
//     series: {
//       column: remakeDataForColumnChart(columnChartSeriesData, checkedInfo),
//       line: remakeDataForLineChart(lineChartSeriesData, columnChartSeriesData, checkedInfo),
//     },
//   };
// }
//
// function remakeDataForColumnChart(chartData, checkedInfo) {
//   return chartData.map((seriesItem, idx) =>
//     Object.assign({}, seriesItem, {
//       visible: checkedInfo[idx],
//     })
//   );
// }
//
// function remakeDataForLineChart(lineChartData, columnChartData, checkedInfo) {
//   const makeTotalAverage = (chartData, checked) => {
//     const totalValueData = chartData.reduce(
//       (accumulator, seriesItem, idx) => {
//         if (checked[idx]) {
//           accumulator.forEach((accValue, accIdx) => {
//             accumulator[accIdx] += seriesItem.data[accIdx];
//           });
//         }
//
//         return accumulator;
//       },
//       [0, 0, 0]
//     );
//
//     return totalValueData.map(
//       (totalValue) => totalValue / checked.filter((checkInfo) => checkInfo).length
//     );
//   };
//
//   return lineChartData.map((seriesItem) => ({
//     name: seriesItem.name,
//     data: makeTotalAverage(columnChartData, checkedInfo),
//   }));
// }
//

export default {
  components: {
    'toastui-line-chart': lineChart,
    //     'tui-bar-chart': barChart,
    //     // 'tui-combo-chart': comboChart,
    //     // 'tui-map-chart': mapChart,
  },
  created() {
    this.chartProps = {
      data: {
        categories: [
          '01/01/2020',
          '02/01/2020',
          '03/01/2020',
          '04/01/2020',
          '05/01/2020',
          '06/01/2020',
          '07/01/2020',
          '08/01/2020',
          '09/01/2020',
          '10/01/2020',
          '11/01/2020',
          '12/01/2020',
        ],
        series: [
          {
            name: 'Seoul',
            data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 25.9, 27.2, 24.4, 13.9, 6.6, -0.6],
          },
          {
            name: 'Seattle',
            data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.6, 3.7],
          },
          {
            name: 'Sydney',
            data: [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2],
          },
          {
            name: 'Moscow',
            data: [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5],
          },
          {
            name: 'Jungfrau',
            data: [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9],
          },
        ],
      },
      options: {},
    };
  },
  methods: {
    //     onChangeCheckedLegends(info) {
    //       console.group('changeCheckedLegends');
    //       console.log('Info : ', info);
    //       console.groupEnd();
    //
    //       const { chartType } = this.$refs.tuiDonutChart.chartInstance;
    //       const checkedInfo = info[chartType];
    //
    //       this.$refs.tuiBarChart.invoke(
    //         'setData',
    //         remakeDataForBarChart(this.barChartData, checkedInfo)
    //       );
    //
    //       this.$refs.tuiLineColumnChart.invoke(
    //         'setData',
    //         remakeDataForLineColumnChart(this.lineColumnData, checkedInfo)
    //       );
    //     },
  },
};
</script>
