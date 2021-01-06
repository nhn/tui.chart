import React from 'react';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';

import {storiesOf} from '@storybook/react';
import {withKnobs, radios} from '@storybook/addon-knobs';
import {treeMapChartTheme} from '../theme';
import {basicChartDummy} from '../treeMapChart/dummyData';
import {TreeMapChart} from '../../src/index';

const stories = storiesOf('TreeMapChart', module).addDecorator(withKnobs);

stories.add('basic with theme', () => {
  const {data, options} = basicChartDummy;
  const themeOptions = {
    normal: 'normal',
    myTheme: 'myTheme'
  };
  const theme = radios('Theme', themeOptions, 'normal');

  const Story = () => {
    if (theme === themeOptions.myTheme) {
      TuiChart.registerTheme('myTheme', treeMapChartTheme);
      options.theme = 'myTheme';
    }

    return <TreeMapChart data={data} options={options} />;
  };

  return <Story />;
});
