import { Story } from './types/story';
import MapChart from '@src/index';

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

function createMapChart({ align }) {
  const el = createContainer();
  const chart = new MapChart({
    el,
    options: { chart: { width: 500, height: 500, type: 'world' }, legend: { align } },
  });

  return { el, chart };
}

const Template: Story = (args) => {
  const el = createContainer();
  const { el: mapChartEl } = createMapChart({ ...args });
  el.appendChild(mapChartEl);

  return el;
};

export const Basic = Template.bind({});
Basic.args = {
  align: 'bottom',
};
