import React from 'react';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';

import {storiesOf} from '@storybook/react';
import {withKnobs, radios} from '@storybook/addon-knobs';
import {BarChart} from '../../src/index';
import {commonTheme} from '../theme';
import {basicChartDummy, divergingAndCenterYAxisChartDummy, rangeDataChartDummy} from './dummyData';

const stories = storiesOf('BarChart', module).addDecorator(withKnobs);

stories.add('basic with theme', () => {
  const {data, options} = basicChartDummy;
  const themeOptions = {
    normal: 'normal',
    myTheme: 'myTheme'
  };
  const theme = radios('Theme', themeOptions, 'normal');

  const Story = () => {
    if (theme === themeOptions.myTheme) {
      TuiChart.registerTheme('myTheme', commonTheme);
      options.theme = 'myTheme';
    }

    return <BarChart data={data} options={options} />;
  };

  return <Story />;
});

stories.add('basic with theme', () => {
  const {data, options} = basicChartDummy;
  const themeOptions = {
    normal: 'normal',
    myTheme: 'myTheme'
  };
  const theme = radios('Theme', themeOptions, 'normal');

  const Story = () => {
    if (theme === themeOptions.myTheme) {
      TuiChart.registerTheme('myTheme', myTheme);
      options.theme = 'myTheme';
    }

    return <BarChart data={data} options={options} />;
  };

  return <Story />;
});

stories.add('range data', () => {
  const {data, options} = rangeDataChartDummy;

  return <BarChart data={data} options={options} />;
});

stories.add('diverging and center yAxis', () => {
  const {data, options} = divergingAndCenterYAxisChartDummy;

  return <BarChart data={data} options={options} />;
});

stories.add('change data dynamically', () => {
  const {options} = basicChartDummy;

  class Story extends React.Component {
    state = {
      data: {
        categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
        series: [
          {
            name: 'Budget',
            data: [5000, 3000, 5000, 7000, 6000, 4000]
          },
          {
            name: 'Income',
            data: [8000, 1000, 7000, 2000, 5000, 3000]
          }
        ]
      }
    };
    ref = React.createRef();

    handleClick = () => {
      this.setState((prevState) => ({
        data: {
          ...prevState.data,
          series: [
            ...prevState.data.series,
            {
              name: 'test',
              data: [1000, 2000, 3000, 4000, 5000, 6000]
            }
          ]
        }
      }));
    };

    render() {
      return (
        <>
          <BarChart ref={this.ref} data={this.state.data} options={options} />
          <button onClick={this.handleClick}>change state</button>
        </>
      );
    }
  }

  return <Story />;
});
