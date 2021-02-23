# TOAST UI Chart for React

> This is a React component wrapping [TOAST UI Chart](https://github.com/nhn/tui.chart).

[![npm version](https://img.shields.io/npm/v/@toast-ui/react-chart.svg)](https://www.npmjs.com/package/@toast-ui/react-chart)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Install](#-install)
  - [Using npm](#using-npm)
- [Usage](#-usage)
  - [Import](#Import)
  - [Components](#components)
  - [Props](#props)
  - [Instance Methods](#Instance-Methods)
  - [Getting the root element](#Getting-the-root-element)
  - [Event](#event)
- [Pull Request Steps](#-pull-request-steps)
- [Contributing](#-contributing)
- [License](#-license)

## Collect statistics on the use of open source

React Wrapper of TOAST UI Chart applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Chart is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected, and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the `usageStatistics` props like the example below.

```js
const options = {
  //...
  usageStatistics: false,
};
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/react-chart
```

## 📊 Usage

### Import

You can use Toast UI Chart for React as a ECMAScript module or a CommonJS module. As this module does not contain CSS files, you should import `toastui-chart.min.css` from `@toastui/chart` manually.

- Using ECMAScript module

```js
import '@toast-ui/chart/dist/toastui-chart.min.css';
import { BarChart, LineChart } from '@toast-ui/react-chart';
```

- Using CommonJS module

```js
require('@toast-ui/chart/dist/toastui-chart.min.css');
const toastui = require('@toast-ui/react-chart');
const BarChart = toastui.BarChart;
const LineChart = toastui.LineChart;
```

### Components

You can use [all kinds of charts in TOAST UI chart](https://github.com/nhn/tui.chart#-features). React Components for each chart types are:

- `AreaChart`
- `LineChart`
- `BarChart`
- `BoxPlotChart`
- `BubbleChart`
- `BulletChart`
- `ColumnChart`
- `ColumnLineChart`
- `HeatmapChart`
- `LineAreaChart`
- `LineScatterChart`
- `NestedPieChart`
- `PieChart`
- `RadarChart`
- `ScatterChart`
- `TreemapChart`

### Props

[All the options of the TOAST UI Chart](https://github.com/nhn/tui.chart/tree/main/docs) are supported in the form of props. Note that data and columns props are required and other props are optional.

```js
const data = {
  categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000],
    },
    {
      name: 'Income',
      data: [8000, 1000, 7000, 2000, 5000, 3000],
    },
  ],
};

const options = {
  chart: {
    width: 1160,
    height: 650,
    title: 'Monthly Revenue',
  },
  yAxis: {
    title: 'Month',
  },
  xAxis: {
    title: 'Amount',
  },
};

const containerStyle = {
  width: '600px',
  height: '600px',
};

const MyComponent = () => <BarChart data={data} options={options} style={containerStyle} />;
```

| Name    | Type   | Required | Description                                                                                                                                                                                                                                                                                                 |
| ------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data    | Object | O        | This prop is for data of the chart. When you change data, chart is rendering for changing data.                                                                                                                                                                                                             |
| options | Object | X        | This prop is for options of TOAST UI chart. You can set the configuration of the chart.                                                                                                                                                                                                                     |
| style   | Object | X        | This prop is for container style of TOAST UI chart. You can set the style of the chart container. To use [responsive layout](https://github.com/nhn/tui.chart/blob/main/docs/en/common-responsive-options.md), the width or height of the container must be specified as a value such as "%" or "vh", "vw". |

### Instance Methods

For using [instance methods of TOAST UI Chart](https://github.com/nhn/tui.chart/blob/main/docs/en/common-api.md), first thing to do is creating Refs of wrapper component using [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs). But the wrapper component does not provide a way to call instance methods of TOAST UI Chart directly. Instead, you can call `getInstance()` method of the wrapper component to get the instance, and call the methods on it.

```js
import { useRef } from 'React';

function MyComponent() {
  const chartRef = useRef(null);

  const handleClickButton = () => {
    console.log('type:', chartRef.current.getInstance().showSeriesDataLabel());
  };

  return (
    <>
      <BarChart ref={chartRef} data={data} options={options} />
      <button onClick={handleClickButton}>showSeriesDataLabel</button>
    </>
  );
}
```

### Getting the root element

An instance of the wrapper component also provides a handy method for getting the root element. If you want to manipulate the root element directly, you can call `getRootElement` to get the element.

```js
import { useRef } from 'React';

function MyComponent() {
  const chartRef = useRef(null);

  const handleClickButton = () => {
    chartRef.current.getRootElement().classList.add('my-chart-root');
  };

  return (
    <>
      <BarChart ref={chartRef} data={data} options={options} />
      <button onClick={handleClickButton}>Click!</button>
    </>
  );
}
```

### Event

[All the events of TOAST UI Chart](https://github.com/nhn/tui.chart/tree/main/docs/en/common-api.md) are supported in the form of `on[EventName]` props. The first letter of each event name should be capitalized. For example, for using `click` event you can use `onClick` prop like the example below.

```js
import { useRef } from 'React';

function MyComponent() {
  const chartRef = useRef(null);

  const handleClick = () => {
    console.log('click!!');
  };

  return <BarChart ref={chartRef} data={data} options={options} onSelectLegend={handleClick} />;
}
```

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to have any errors.

```sh
$ git clone https://github.com/{your-personal-repo}/[[repo name]].git
$ cd [[repo name]]
$ npm install
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 💬 Contributing

- [Code of Conduct](https://github.com/nhn/tui.chart/blob/main/CODE_OF_CONDUCT.md)
- [Contributing guideline](https://github.com/nhn/tui.chart/blob/main/CONTRIBUTING.md)
- [Commit convention](https://github.com/nhn/tui.chart/blob/main/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License

This software is licensed under the [MIT](https://github.com/nhn/tui.chart/blob/main/LICENSE) © [NHN.](https://github.com/nhn)
