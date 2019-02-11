export const donutChartDummy = {
  data: {
    categories: ['Browser'],
    series: [
      {
        name: 'Chrome',
        data: 46.02
      },
      {
        name: 'IE',
        data: 20.47
      },
      {
        name: 'Firefox',
        data: 17.71
      },
      {
        name: 'Safari',
        data: 5.45
      },
      {
        name: 'Opera',
        data: 3.1
      },
      {
        name: 'Etc',
        data: 7.25
      }
    ]
  },
  options: {
    chart: {
      width: 700,
      height: 700,
      title: 'Usage share of web browsers',
      format: function(value, chartType, areaType, valuetype, legendName) {
        if (areaType === 'makingSeriesLabel') {
          // formatting at series area
          value = value + '%';
        }

        return value;
      }
    },
    series: {
      radiusRange: ['40%', '100%'],
      showLabel: true
    },
    tooltip: {
      suffix: '%'
    },
    legend: {
      align: 'bottom'
    }
  }
};
