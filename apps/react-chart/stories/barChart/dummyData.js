export const basicChartDummy = {
  data: {
    categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
    series: [
      {
        name: 'Budget',
        data: [5000, 3000, 5000, 7000, 6000, 4000]
      },
      {
        name: 'Income',
        data: [8000, 1000, 7000, 2000, 5000, 3000]
      }
    ]
  },
  options: {
    chart: {
      width: 1160,
      height: 650,
      title: 'Monthly Revenue',
      format: '1,000'
    },
    yAxis: {
      title: 'Month'
    },
    xAxis: {
      title: 'Amount',
      min: 0,
      max: 9000,
      suffix: '$'
    },
    series: {
      showLabel: true
    }
  }
};

export const rangeDataChartDummy = {
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
        data: [
          [-8.3, 0.3],
          [-5.8, 3.1],
          [-0.6, 9.1],
          [5.8, 16.9],
          [11.5, 22.6],
          [16.6, 26.6],
          [21.2, 28.8],
          [21.8, 30.0],
          [15.8, 25.6],
          [8.3, 19.6],
          [1.4, 11.1],
          [-5.2, 3.2]
        ]
      }
    ]
  },
  options: {
    chart: {
      width: 1160,
      height: 650,
      title: 'Temperature Range'
    },
    yAxis: {
      title: 'Month'
    },
    xAxis: {
      title: 'Temperature (Celsius)'
    },
    series: {
      showLabel: false,
      barWidth: 25
    },
    tooltip: {
      suffix: '°C'
    }
  }
};

export const divergingAndCenterYAxisChartDummy = {
  data: {
    categories: [
      '100 ~',
      '90 ~ 99',
      '80 ~ 89',
      '70 ~ 79',
      '60 ~ 69',
      '50 ~ 59',
      '40 ~ 49',
      '30 ~ 39',
      '20 ~ 29',
      '10 ~ 19',
      '0 ~ 9'
    ],
    series: [
      {
        name: 'Male',
        data: [
          3832,
          38696,
          395906,
          1366738,
          2482657,
          4198869,
          4510524,
          3911135,
          3526321,
          2966126,
          2362433
        ]
      },
      {
        name: 'Female',
        data: [
          12550,
          128464,
          839761,
          1807901,
          2630336,
          4128479,
          4359815,
          3743214,
          3170926,
          2724383,
          2232516
        ]
      }
    ]
  },
  options: {
    chart: {
      width: 1160,
      height: 650,
      title: 'Population Distribution',
      format: '1,000'
    },
    yAxis: {
      title: 'Age Group',
      align: 'center'
    },
    xAxis: {
      labelMargin: 10
    },
    series: {
      diverging: true
    }
  }
};
