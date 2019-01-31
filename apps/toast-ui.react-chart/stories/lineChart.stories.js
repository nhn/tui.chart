import React from 'react';
import {storiesOf} from '@storybook/react';

import Chart from '../src/index';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';

const stories = storiesOf('TOAST UI Chart lineChart', module);

stories.add('TEST', () => <Chart />);
