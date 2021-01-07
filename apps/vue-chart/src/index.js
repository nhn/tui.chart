import { createComponent } from './base';

export const { lineChart } = ['line'].reduce((obj, chartName) => {
  obj[`${chartName}Chart`] = createComponent(chartName);

  return obj;
}, {});
