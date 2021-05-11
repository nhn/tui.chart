import { Story } from './types/story';
import { color } from '@src/index';

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
  el.style.width = '100px';
  el.style.height = '100px';
  el.style.border = '1px solid #ccc';

  return el;
}

function button({ text }: Args) {
  const buttonEl = document.createElement('button');
  buttonEl.innerText = text;
  buttonEl.style.color = color;

  return buttonEl;
}

const Template: Story<Args> = (args: Args) => {
  const el = createContainer();
  const buttonEl = button(args);
  el.appendChild(buttonEl);

  return el;
};

export const Button = Template.bind({});
Button.args = {
  text: 'hello',
};
