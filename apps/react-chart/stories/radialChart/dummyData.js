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
        data: [8000, 8000, 7000, 2000, 5000, 3000]
      },
      {
        name: 'Expenses',
        data: [4000, 4000, 6000, 3000, 4000, 5000]
      },
      {
        name: 'Debt',
        data: [6000, 3000, 3000, 1000, 2000, 4000]
      }
    ]
  },
  options: {
    chart: {
      title: 'Annual Incomes',
      width: 700,
      height: 700
    },
    series: {
      showDot: false,
      showArea: false
    },
    plot: {
      type: 'circle'
    },
    legend: {
      align: 'bottom'
    }
  }
};
