import { Story } from './types/story';
import MapChart from '@src/index';
import '@src/css/chart.css';

export default {
  title: 'map chart/world',
  argTypes: {
    align: {
      control: {
        type: 'radio',
        options: ['bottom', 'top', 'left', 'right'],
      },
    },
  },
};

function createContainer() {
  const el = document.createElement('div');
  el.style.width = '500px';
  el.style.height = '500px';

  return el;
}

function createMapChart({ align, data }) {
  const el = createContainer();
  const chart = new MapChart({
    el,
    options: { chart: { width: 800, height: 800, type: 'world' }, legend: { align } },
    data,
  });

  return { el, chart };
}

const Template: Story = (args) => {
  const el = createContainer();
  const { el: mapChartEl } = createMapChart({ ...args });
  el.appendChild(mapChartEl);

  return el;
};

const data = [
  {
    code: 'US',
    data: 450,
  },
  {
    code: 'RU',
    data: 100,
  },
  {
    code: 'CN',
    data: 300,
  },
  {
    code: 'IN',
    data: 400,
  },
];

export const Basic = Template.bind({});
Basic.args = {
  align: 'bottom',
  data,
};
