## Column & Line Combo chart
* This section describes how to create column & line combo chart with options.
* You can refer to the [Getting started](getting-started.md) for base installation of Toast UI Chart.

***

### Data type

The data type of the column & line combo chart is one level deeper than the depth of [basic data type](chart-types-bar,column.md#basic-data-type).
Features of this data type, you will need to enter the data for each chart type.


```javascript
var rawData = {
    categories: ['cate1', 'cate2', 'cate3'],
    series: {
        column: [
            {
                name: 'Legend1',
                data: [20, 30, 50]
            },
            {
                name: 'Legend2',
                data: [40, 40, 60]
            },
            {
                name: 'Legend3',
                data: [60, 50, 10]
            },
            {
                name: 'Legend4',
                data: [80, 10, 70]
            }
        ],
        line: [
            {
                name: 'Legend2_1',
                data: [1, 2, 3]
            }
        ]
    }
};
```

***

### Creating a basic chart

##### Example

```javascript
var rawData = {
    //...
    series: {
        column: [
            {
                name: 'Seoul',
                data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9]
            },
            //...
        ],
        line: [
            {
                name: 'Average',
                data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3]
            }
        ]
    }
};
//...
tui.chart.comboChart(container, rawData);
```
![Combo Chart](https://user-images.githubusercontent.com/35218826/36882465-6ed86e80-1e17-11e8-936e-709e677a6345.png)

* _[Sample](https://nhn.github.io/tui.chart/latest/tutorial-example08-01-combo-chart-column-and-line.html)_

***

### How to use two yAxis

Using two `yAxis` options, you can place Y axes the left and right.

##### Example

```javascript
//...
var options = {
      //...
    yAxis: [{
        title: 'Temperature',
        chartType: 'column'
    }, {
        title: 'Average',
        chartType: 'line'
    }]
};
//...
tui.chart.comboChart(container, rawData, options);
```
![Combo Chart](https://user-images.githubusercontent.com/35218826/36882588-1757ab34-1e18-11e8-8562-3eb535e23956.png)

* _[Sample](https://nhn.github.io/tui.chart/latest/tutorial-example08-01-combo-chart-column-and-line.html)_

***
