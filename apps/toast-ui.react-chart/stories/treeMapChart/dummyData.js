export const basicChartDummy = {
  data: {
    series: [
      {
        label: 'Documents',
        children: [
          {
            label: 'docs',
            children: [
              {
                label: 'pages',
                value: 1.3
              },
              {
                label: 'keynote',
                value: 2.5
              },
              {
                label: 'numbers',
                value: 1.2
              }
            ]
          },
          {
            label: 'photos',
            value: 5.5
          },
          {
            label: 'videos',
            value: 20.7
          }
        ]
      },
      {
        label: 'Downloads',
        children: [
          {
            label: 'recents',
            value: 5.3
          },
          {
            label: '2015',
            value: 10.1
          },
          {
            label: '2014',
            value: 8.2
          }
        ]
      },
      {
        label: 'Application',
        value: 16.4
      },
      {
        label: 'Desktop',
        value: 4.5
      }
    ]
  },
  options: {
    chart: {
      width: 900,
      height: 500,
      title: 'Used disk space'
    },
    series: {
      showLabel: true,
      zoomable: false,
      useLeafLabel: true
    },
    tooltip: {
      suffix: 'GB'
    }
  }
};
