import tuiChart from 'tui-chart';

const elTreeMap = document.querySelector('.section[data-section="chart"] .treeMap');

const data = {
  series: [
    {
      label: 'Asia',
      children: [
        {
          label: 'South Korea',
          value: 99909,
          colorValue: 499.81
        },
        {
          label: 'Japan',
          value: 364485,
          colorValue: 335.61
        },
        {
          label: 'Jordan',
          value: 88802,
          colorValue: 86.07
        },
        {
          label: 'Iraq',
          value: 437367,
          colorValue: 81.6
        }
      ]
    },
    {
      label: 'Europe',
      children: [
        {
          label: 'UK',
          value: 241930,
          colorValue: 262.84
        },
        {
          label: 'France',
          value: 640427,
          colorValue: 117.83
        },
        {
          label: 'Hungary',
          value: 89608,
          colorValue: 106.54
        },
        {
          label: 'Portugal',
          value: 91470,
          colorValue: 115.35
        }
      ]
    },
    {
      label: 'America',
      children: [
        {
          label: 'Panama',
          value: 74340,
          colorValue: 52.81
        },
        {
          label: 'Honduras',
          value: 111890,
          colorValue: 75.15
        },
        {
          label: 'Uruguay',
          value: 175015,
          colorValue: 19.6
        },
        {
          label: 'Cuba',
          value: 109820,
          colorValue: 101.47
        }
      ]
    },
    {
      label: 'Africa',
      children: [
        {
          label: 'Malawi',
          value: 94080,
          colorValue: 146.09
        },
        {
          label: 'Ghana',
          value: 227533,
          colorValue: 113.13
        },
        {
          label: 'Togo',
          value: 54385,
          colorValue: 126.28
        },
        {
          label: 'Benin',
          value: 114305,
          colorValue: 96.61
        }
      ]
    }
  ]
};

const treemapOptions = {
  chart: {
    width: 900,
    height: 500,
    title: 'Population density of World',
    format: '1,000'
  },
  series: {
    showLabel: true,
    useColorValue: true,
    zoomable: false,
    useLeafLabel: true
  },
  tooltip: {
    suffix: '㎢'
  },
  legend: {
    align: 'top'
  }
};

const treemapChart = tuiChart.treemapChart(elTreeMap, data, treemapOptions);
treemapChart.chartType;
treemapChart.className;

treemapChart.on('load', () => {
  treemapChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
treemapChart.resetTooltipAlign();
treemapChart.resetTooltipOffset();
treemapChart.resetTooltipPosition();
treemapChart.resize({
  width: 500,
  height: 400
});
treemapChart.setTooltipAlign('right bottom');
treemapChart.setTooltipOffset({
  x: 50,
  y: 50
});
