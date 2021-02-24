export function createResponsiveChart(ChartConstructor, data, options) {
  const el = document.createElement('div');

  setTimeout(() => {
    el.style.width = '90vw';
    el.style.height = '90vh';

    const chart = new ChartConstructor({
      el,
      data,
      options,
    });

    return chart;
  });

  return el;
}
