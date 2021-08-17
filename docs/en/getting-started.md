# 🚀 Getting started

## Download

The TOAST UI products can be installed by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

The TOAST UI products are registered in [npm](https://www.npmjs.com/) package manager.
Install by using the commands provided by a package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.

#### npm

```sh
$ npm install --save @toast-ui/chart # Latest version
$ npm install --save @toast-ui/chart@<version> # Specific version
```

### Via Contents Delivery Network (CDN)

The TOAST UI Chart is available over a CDN.

- You can use cdn as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/chart/latest/toastui-chart.min.css" />
<script src="https://uicdn.toast.com/chart/latest/toastui-chart.min.js"></script>
```

- Within the download you'll find the following directories

```
- uicdn.toast.com/
  ├─ chart/
  │  ├─ latest
  │  │  ├─ toastui-chart.js
  │  │  ├─ toastui-chart.min.js
  │  │  ├─ toastui-chart.css
  │  │  ├─ toastui-chart.min.css
  │  ├─ v4.0.0/
```

### Download Source Files

- [Download all sources for each version](https://github.com/nhn/tui.chart/releases)

## Usage

### HTML

Add the container element where TOAST UI Chart will be created.

```html
<div id="chart"></div>
```

### JavaScript

#### Load

The TOAST UI Chart can be used by creating an instance with the constructor function. To access the constructor function, import the module using one of the three following methods depending on your environment.

```js
/* namespace */
const Chart = toastui.Chart;
```
```js
/* CommonJS in Node.js */
const Chart = require('@toast-ui/chart');
```
```js
/* ES6 in Node.js */
import Chart from '@toast-ui/chart';
import { BarChart } from '@toast-ui/chart';
```

[In Webpack 4, when importing package modules, the parts that are defined in the module field have higher priority than the parts defined in the main field](https://webpack.js.org/configuration/resolve/#resolvemainfields). To use the Webpack 4 with the `require` syntax to import `@toast-ui/chart`, the ESM file defined in the `module` field will be loaded, and the file will be transpiled to be compatible with the `require` syntax. In order to use the **bundle file for UMD**, the user must personally load and use the `@toast-ui/chart/dist/toastui-chart.js` or `@toast-ui/chart/dist/toastui-chart.min.js`.

```js
const Chart = require('@toast-ui/chart/dist/toastui-chart.min.js'); // loading the bundle file for UMD
```

Webpack 5 supports the `exports` field. The entry point can be determined by the `exports` field defined in the package. Furthermore, the necessary chart can be loaded through a sub-path, as presented below.

```js
const Chart = require('@toast-ui/chart'); // ./dist/toastui-chart.js

import { BarChart } from '@toast-ui/chart'; // ./dist/esm/index.js

import BarChart from '@toast-ui/chart/bar';
import ColumnChart from '@toast-ui/chart/column';
import LineChart from '@toast-ui/chart/line';
import AreaChart from '@toast-ui/chart/area';
import LineAreaChart from '@toast-ui/chart/lineArea';
import ColumnLineChart from '@toast-ui/chart/columnLine';
import BulletChart from '@toast-ui/chart/bullet';
import BoxPlotChart from '@toast-ui/chart/boxPlot';
import TreemapChart from '@toast-ui/chart/treemap';
import HeatmapChart from '@toast-ui/chart/heatmap';
import ScatterChart from '@toast-ui/chart/scatter';
import LineScatterChart from '@toast-ui/chart/lineScatter';
import BubbleChart from '@toast-ui/chart/bubble';
import PieChart from '@toast-ui/chart/pie';
import NestedPieChart from '@toast-ui/chart/nestedPie';
import RadarChart from '@toast-ui/chart/radar';
```

### CSS

You need to add the CSS files needed for the Chart. Import CSS files in node environment, and add it to html file when using CDN.

* ES6 Modules

```js
import '@toast-ui/chart/dist/toastui-chart.min.css';
```

* Common JS

```js
require('@toast-ui/chart/dist/toastui-chart.min.css');
```

* CDN

```html
<link rel="stylesheet" href="https://uicdn.toast.com/chart/latest/toastui-chart.min.css" />
```


### Creating Instance

Constructor function needs three parameters: `el`, `data`, `options`

- el: Wrapper HTML element that will contain the chart as a child.
- data: Numerical data the chart will be based on.
- options: Functional options including legend, alignment, and tooltip formatter.

```js
const el = document.getElementById('chart');
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000],
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000],
    },
  ],
};
const options = {
  chart: { width: 700, height: 400 },
};

const chart = Chart.barChart({ el, data, options });
// const chart = new BarChart({ el, data, options }); // Second way
```
![image](https://user-images.githubusercontent.com/35371660/105698632-79769d00-5f49-11eb-8ae5-0d0f648f9ac6.png)
