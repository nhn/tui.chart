import { Story } from './types/story';
import MapChart from '@src/index';

export default {
  title: 'map chart/world',
};

function createContainer() {
  const el = document.createElement('div');
  el.style.width = '500px';
  el.style.height = '500px';
  el.style.border = '1px solid #ccc';

  return el;
}

function createMapChart() {
  const el = createContainer();
  const chart = new MapChart({
    el,
    options: { chart: { width: 500, height: 500, type: 'world' } },
  });

  return { el, chart };
}

const Template: Story = () => {
  const el = createContainer();
  const { el: mapChartEl } = createMapChart();
  el.appendChild(mapChartEl);

  return el;
};

export const Basic = Template.bind({});
