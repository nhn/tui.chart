import React from 'react';
import TuiChart from 'tui-chart';
import 'tui-chart/dist/tui-chart.min.css';
import {storiesOf} from '@storybook/react';
import {withKnobs, radios} from '@storybook/addon-knobs';
import {
  basicChartDummy,
  coordinateDataChartDummy,
  withoutSeriesDataChartDummy,
  splineChartDummy,
  synchronizedTooltipChartDummy
} from './dummyData';
import {commonTheme} from '../theme';
import {LineChart} from '../../src/index';

const stories = storiesOf('LineChart', module).addDecorator(withKnobs);

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

    return <LineChart data={data} options={options} />;
  };

  return <Story />;
});

stories.add('spline', () => {
  const {data, options} = splineChartDummy;

  return <LineChart data={data} options={options} />;
});

stories.add('coordinate data', () => {
  const {data, options} = coordinateDataChartDummy;

  return <LineChart data={data} options={options} />;
});

stories.add('without series data', () => {
  const {data, options} = withoutSeriesDataChartDummy;

  return <LineChart data={data} options={options} />;
});

stories.add('synchronized tooltip chart', () => {
  const {data1, data2, data3, options} = synchronizedTooltipChartDummy;

  class Story extends React.Component {
    ref1 = React.createRef();
    ref2 = React.createRef();
    ref3 = React.createRef();

    handleChart1AfterShowTooltip = (params) => {
      this.ref2.current.getInstance().showTooltip(params);
      this.ref3.current.getInstance().showTooltip(params);
    };

    handleChart2AfterShowTooltip = (params) => {
      this.ref1.current.getInstance().showTooltip(params);
      this.ref3.current.getInstance().showTooltip(params);
    };

    handleChart3AfterShowTooltip = (params) => {
      this.ref1.current.getInstance().showTooltip(params);
      this.ref2.current.getInstance().showTooltip(params);
    };

    handleChart1BeforeHideTooltip = () => {
      this.ref2.current.getInstance().hideTooltip();
      this.ref3.current.getInstance().hideTooltip();
    };

    handleChart2BeforeHideTooltip = () => {
      this.ref1.current.getInstance().hideTooltip();
      this.ref3.current.getInstance().hideTooltip();
    };

    handleChart3BeforeHideTooltip = () => {
      this.ref1.current.getInstance().hideTooltip();
      this.ref2.current.getInstance().hideTooltip();
    };

    render() {
      return (
        <>
          <LineChart
            ref={this.ref1}
            data={data1}
            options={options}
            onAfterShowTooltip={this.handleChart1AfterShowTooltip}
            onBeforeHideTooltip={this.handleChart1BeforeHideTooltip}
          />
          <LineChart
            ref={this.ref2}
            data={data2}
            options={options}
            onAfterShowTooltip={this.handleChart2AfterShowTooltip}
            onBeforeHideTooltip={this.handleChart2BeforeHideTooltip}
          />
          <LineChart
            ref={this.ref3}
            data={data3}
            options={options}
            onAfterShowTooltip={this.handleChart3AfterShowTooltip}
            onBeforeHideTooltip={this.handleChart3BeforeHideTooltip}
          />
        </>
      );
    }
  }

  return <Story />;
});

stories.add('secondary axis', () => {
  const {data, options} = basicChartDummy;
  options.yAxis = [
    {
      title: 'Temperature (Celsius)',
      pointOnColumn: true
    },
    {
      title: 'Percent (%)',
      pointOnColumn: true,
      min: 0,
      max: 100,
      suffix: '%'
    }
  ];

  return <LineChart data={data} options={options} />;
});

stories.add('getRootElement', () => {
  const {data, options} = basicChartDummy;

  class Story extends React.Component {
    ref = React.createRef();

    handleClick = () => {
      alert(this.ref.current.getRootElement());
    };

    render() {
      return (
        <div>
          <LineChart ref={this.ref} data={data} options={options} />
          <button onClick={this.handleClick}>getRootElement</button>
        </div>
      );
    }
  }

  return <Story />;
});
