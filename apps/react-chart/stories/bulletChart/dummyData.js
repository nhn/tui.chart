export const basicChartDummy = {
  data: {
    categories: ['July', 'August'],
    series: [
      {
        name: 'Budget',
        data: 25,
        markers: [28, 2, 15],
        ranges: [[-1, 10], [10, 20], [20, 30]]
      },
      {
        name: 'Hello',
        data: 11,
        markers: [20],
        ranges: [[0, 8], [8, 15]]
      },
      {
        name: 'World',
        data: 30,
        markers: [25],
        ranges: [[0, 10], [10, 19], [19, 28]]
      },
      {
        name: 'Income',
        data: 23,
        markers: [],
        ranges: [[19, 25], [13, 19], [0, 13]]
      }
    ]
  },
  options: {
    chart: {
      width: 1160,
      height: 500,
      title: 'Monthly Revenue',
      format: '1,000'
    },
    legend: {
      visible: true
    },
    xAxis: {
      max: 35
    },
    series: {
      showLabel: true,
      vertical: false
    }
  }
};
