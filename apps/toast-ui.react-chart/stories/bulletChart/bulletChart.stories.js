import React from 'react';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';

import {storiesOf} from '@storybook/react';
import {withKnobs, radios} from '@storybook/addon-knobs';
import {bulletChartTheme} from '../theme';
import {basicChartDummy} from '../bulletChart/dummyData';
import {BulletChart} from '../../src/index';

const stories = storiesOf('BulletChart', module).addDecorator(withKnobs);

stories.add('basic with theme', () => {
  const {data, options} = basicChartDummy;
  const themeOptions = {
    normal: 'normal',
    myTheme: 'myTheme'
  };
  const theme = radios('Theme', themeOptions, 'normal');

  const Story = () => {
    if (theme === themeOptions.myTheme) {
      TuiChart.registerTheme('myTheme', bulletChartTheme);
      options.theme = 'myTheme';
    }

    return <BulletChart data={data} options={options} />;
  };

  return <Story />;
});
