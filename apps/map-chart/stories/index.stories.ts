import { Story } from './types/story';

import MapChart from '@src/index';

export default {
  title: 'map chart/test',
  argTypes: {
    text: 'string',
  },
};

interface Args {
  text: string;
}

function createContainer() {
  const el = document.createElement('div');
  el.style.width = '500px';
  el.style.height = '500px';
  el.style.border = '1px solid #ccc';

  return el;
}

function mapChart({ text }: Args) {
  const el = createContainer();
  const chart = new MapChart({ el, options: { type: 'world' } });

  return el;
}

const Template: Story<Args> = (args: Args) => {
  const el = createContainer();
  const buttonEl = mapChart(args);
  el.appendChild(buttonEl);

  return el;
};

export const Button = Template.bind({});
Button.args = {
  text: 'hello',
};
