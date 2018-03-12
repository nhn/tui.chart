## ![Toast UI Chart](https://user-images.githubusercontent.com/35218826/37276594-8203c098-2625-11e8-8e3e-d638cb51617c.png)

> 🍞🍯 Spread your data on TOAST UI Chart. TOAST UI Chart is Statistical Data Visualization library for javascript

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.grid/releases/latest) [![npm](https://img.shields.io/npm/v/tui-chart.svg)](https://www.npmjs.com/package/tui-grid) [![bower](https://img.shields.io/bower/v/tui-chart.svg)](https://github.com/nhnent/tui.chart/releases/latest) [![GitHub license](https://img.shields.io/github/license/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.chart/blob/production/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.chart/pulls) [![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

![chart_animation](https://user-images.githubusercontent.com/35218826/37018282-2a792584-2157-11e8-835f-fac1275d31e0.gif)
![all](https://user-images.githubusercontent.com/35218826/37026890-1e2bcfe0-2173-11e8-9b06-3db329d5f477.png)




## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Features](#-features)
* [Demos & Examples](https://nhnent.github.io/tui.chart/latest/)
* [Install](#-install)
  * [Package Installs](#via-package-manager)
  * [Installing from source](#download-source-files)
* [Load](#load)
    * [namespace](#load)
    * [modules](#load)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#develop)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)

## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | Yes | Yes | Yes | [[8+]] |


## 🎨 Features

TOAST UI Chart is a chart library for JavaScript that can be used in legacy browsers including IE8.
It is intuitive and easy to apply without any other learning.
If you like, you can change the chart in detail using many options and custom themes.

### Flexible
#### - It supports various charts covering various requirements


##### ***Single Charts***

  | [Bar](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html)<br>[Column](https://nhnent.github.io/tui.chart/latest/tutorial-example02-01-column-chart-basic.html) | [Line](https://nhnent.github.io/tui.chart/latest/tutorial-example03-01-line-chart-basic.html)<br>[Area](https://nhnent.github.io/tui.chart/latest/tutorial-example04-01-area-chart-basic.html)<br>[Radial](https://nhnent.github.io/tui.chart/latest/tutorial-example13-01-radial-chart-basic.html) | [Bubble](https://nhnent.github.io/tui.chart/latest/tutorial-example05-01-bubble-chart-basic.html)<br>[Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example06-01-scatter-chart-basic.html) | [Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-01-pie-chart-basic.html)(General)<br>[Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-04-pie-chart-donut.html)(Donut) | [Map](https://nhnent.github.io/tui.chart/latest/tutorial-example09-01-map-chart-world-map.html)<br>[Heatmap](https://nhnent.github.io/tui.chart/latest/tutorial-example10-01-heatmap-chart-basic.html)<br>[Treemap](https://nhnent.github.io/tui.chart/latest/tutorial-example11-01-treemap-chart-basic.html) | [Boxplot](https://nhnent.github.io/tui.chart/latest/tutorial-example14-01-boxplot-chart-basic.html) | [Bullet](https://nhnent.github.io/tui.chart/latest/tutorial-example15-01-bullet-chart-basic.html) |
| --- | --- | --- | --- | --- | --- | --- |
| ![2018-03-12 12 39 24](https://user-images.githubusercontent.com/35218826/37264727-713fb84e-25f2-11e8-8297-dbc5c2b279e0.png) | ![2018-03-12 12 15 03](https://user-images.githubusercontent.com/35218826/37264117-0fc54118-25ef-11e8-93b0-a57b02788f06.png) | ![2018-03-12 12 17 49](https://user-images.githubusercontent.com/35218826/37264209-70c034f0-25ef-11e8-8a72-9264bc5a59e6.png) | ![2018-03-12 12 19 53](https://user-images.githubusercontent.com/35218826/37264250-b243e4c6-25ef-11e8-85fe-7f5a183bf88e.png) | ![2018-03-12 12 44 00](https://user-images.githubusercontent.com/35218826/37264840-13adc058-25f3-11e8-9e9e-e8e797d494c2.png) | ![2018-03-12 12 26 16](https://user-images.githubusercontent.com/35218826/37264425-9d8334a0-25f0-11e8-93e6-60bf196de439.png) | ![2018-03-12 12 28 42](https://user-images.githubusercontent.com/35218826/37264499-f36a243c-25f0-11e8-95b8-f446963592f2.png) |
  

##### ***Combo Charts***

  | [Column-Line](https://nhnent.github.io/tui.chart/latest/tutorial-example08-01-combo-chart-column-and-line.html) | [Pie-Donut](https://nhnent.github.io/tui.chart/latest/tutorial-example08-02-combo-chart-pie-and-donut.html) | [Line-Area](https://nhnent.github.io/tui.chart/latest/tutorial-example08-03-combo-chart-line-and-area.html) | [Line-Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example08-04-combo-chart-line-and-scatter.html) |
| --- | --- | --- | --- |
| ![2018-03-12 12 30 42](https://user-images.githubusercontent.com/35218826/37264567-5ad001b4-25f1-11e8-83d9-f0c5629dc76c.png) | ![2018-03-12 12 32 31](https://user-images.githubusercontent.com/35218826/37264583-7720e9dc-25f1-11e8-9735-a6eb1553707a.png) | ![2018-03-12 12 34 40](https://user-images.githubusercontent.com/35218826/37264621-c9812ea8-25f1-11e8-9fb9-7e72db30ac23.png) | ![2018-03-12 12 36 14](https://user-images.githubusercontent.com/35218826/37264661-050fe914-25f2-11e8-8984-cd19e6b6b583.png) |
  


Find more on [Example](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html) and [wiki](https://github.com/nhnent/tui.chart/tree/production/docs/wiki#tutorial) pages.  

#### - It is flexible chart that can customize detail

| Various expressions | Custom theme | Stack option  | Diverging option | Group tooltip |
| --- | --- | --- | --- | --- |
| ![variousexpression](https://user-images.githubusercontent.com/35218826/37189405-8ae857ea-2397-11e8-8cb6-2d5fc158108e.png) | ![customtheme](https://user-images.githubusercontent.com/35218826/37189470-f64207a2-2397-11e8-98b6-51aaea5a4cb3.png)  | ![stackoption](https://user-images.githubusercontent.com/35218826/37188991-5b5580cc-2395-11e8-83ec-4e0d8c5664e2.png) | ![diverging](https://user-images.githubusercontent.com/35218826/37189084-e6c6012c-2395-11e8-9529-bf80c8a79608.png) | ![grouptooltip](https://user-images.githubusercontent.com/35218826/37189231-93e2973a-2396-11e8-98f3-e28b6a9891fb.png) |


### IE8+
##### - ***Supported from IE8 legacy browser***
Common javascript chart libraries use SVG for graphical representations, and browsers that do not support SVG, such as IE8, require an SVG polyphil.
However, TUI Chart allows you to display beautifully designed charts in the same way as modern browsers, even in legacy browsers IE8 or above, even if you do not use separate polyphils.

![ie8compare](https://user-images.githubusercontent.com/35218826/37028384-7205589e-2177-11e8-8d90-792c3827a0c1.png)
 

##### -  ***Maintained Actively***
We are also using the tui chart for services that support legacy browsers, so we are continually improving our charts.
Compare it with the last commit on another chart that supports legacy browsers.

##### - ***MIT License***
Of course, the free chart library is easy to find.
However, many useful chart libraries have commercial licenses.
That's why we started this project.
Our chart library is free for commercial use, and it is even useful.

 
### Light Weight
Compared to other charts, the capacity is a small chart library.

| sum size | 803kb  |
| --- | --- |
| tui-chart.js | 373kb |
| raphael.js (dependency) | 319kb |
| tui-code-snippet (dependency) | 111kb |

### Other tips

* [Load Data from `<table>`](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/import-chart-data-from-existing-table-element.md)
* [Add data dynamically](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/theme.md)
* [Apply themes](https://nhnent.github.io/tui.chart/latest/tutorial-example12-01-dynamic-chart-append-and-shift-data-dynamically.html)



## Dependencies

* [raphael](https://github.com/nhnent/raphael)
* [tui.code-snippet](https://github.com/nhnent/tui.code-snippet)

## Map Data Attribution
* [https://www.amcharts.com/svg-maps/](https://www.amcharts.com/svg-maps/)

## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org) is installed.

#### npm

```sh
$ npm install --save [[package name]] # Latest version
$ npm install --save [[package name]]@<version> # Specific version
```

#### bower

```sh
$ bower install [[package name]] # Latest version
$ bower install [[package name]]#<tag> # Specific version
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.chart/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.chart/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI Chart will be created.

``` html
<div id="chart"></div>
```

### JavaScript
#### Load
TOAST UI Chart can be used by creating an instance with the constructor function. To get the constructor function, you should import the module using one of the following three ways depending on your environment.

```javascript
var chart = tui.chart; /* namespace */
```
```javascript
var chart = require('tui-chart'); /* CommonJS in Node.js */
```
```javascript
import {chart} from 'tui-chart'; /* ES6 in Node.js */
```

Factory function needs three paramters: container, data, options

* Container: Wrapper HTMLElements that will contain charts as a child
* data: numeric data need to make charts
* options: functional options like legend aligment or tooltip visiblities

``` javascript
var container = document.getElementById('chart-area');
var data = {
    category: [...], series: [...]
};
var options = {
    chart: {width: 700, height: 400}
};

chart.barChart(container, data, options);
```

See [details](https://nhnent.github.io/tui.chart/latest) for additional informations.

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

```sh
$ git clone https://github.com/{username}/tui.chart.git
$ cd tui.chart
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

```sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
```

#### Run karma test

```sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


### Pull requests
Before PR, check build lastly and then check any errors.
If it has no error, commit and then push it!
```sh
$ npm run deploy
$ npm run test
```

## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/README.md)
* [APIs](https://nhnent.github.io/tui.chart/latest/)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.chart/releases).

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Issue guideline](ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🍞 TOAST UI Family
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Grid](https://github.com/nhnent/tui.grid)
* [TOAST UI Components](https://github.com/nhnent)

## 📜 License
This software is licensed under the [MIT](https://github.com/nhnent/tui.chart/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
