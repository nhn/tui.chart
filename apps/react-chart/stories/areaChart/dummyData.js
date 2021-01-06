export const basicChartDummy = {
  data: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'June',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    series: [
      {
        name: 'Seoul',
        data: [20, 40, 25, 50, 15, 45, 33, 34, 20, 30, 22, 13]
      },
      {
        name: 'Sydney',
        data: [5, 30, 21, 18, 59, 50, 28, 33, 7, 20, 10, 30]
      },
      {
        name: 'Moskva',
        data: [30, 5, 18, 21, 33, 41, 29, 15, 30, 10, 33, 5]
      }
    ]
  },
  options: {
    chart: {
      width: 1160,
      height: 540,
      title: '24-hr Average Temperature'
    },
    series: {
      zoomable: true,
      showDot: false,
      areaOpacity: 1
    },
    yAxis: {
      title: 'Temperature (Celsius)',
      pointOnColumn: true
    },
    xAxis: {
      title: 'Month'
    },
    tooltip: {
      suffix: '°C'
    }
  }
};
