import React from 'react';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';

import {storiesOf} from '@storybook/react';
import {withKnobs, radios} from '@storybook/addon-knobs';
import {pieChartTheme} from '../theme';
import {donutChartDummy} from '../pieChart/dummyData';
import {PieChart} from '../../src/index';

const stories = storiesOf('PieChart', module).addDecorator(withKnobs);

stories.add('donut with theme', () => {
  const {data, options} = donutChartDummy;
  const themeOptions = {
    normal: 'normal',
    myTheme: 'myTheme'
  };
  const theme = radios('Theme', themeOptions, 'normal');

  const Story = () => {
    if (theme === themeOptions.myTheme) {
      TuiChart.registerTheme('myTheme', pieChartTheme);
      options.theme = 'myTheme';
    }

    return <PieChart data={data} options={options} />;
  };

  return <Story />;
});
