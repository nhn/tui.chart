# Layout Configuration

Aside from chart sizes, users can also change the sizes for different components. Users can define x-axis, y-axis, plot area size, and legend width, and it can be useful when using multiple charts and having to fix the width of a chart.

## X Axis
With charts that use the x-axis, the size of the x-axis area can be defined. The `xAxis` can be used with `width` and `height` options. Using the `width` and `height` options, users can define the size of the area where the x-axis is painted.

```ts
type xAxisOption = {
  ...
  width?: number;
  height?: number;
};
```

```js
const options = {
  xAxis: {
    title: 'Amount',
    width: 700,
    height: 100
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103404407-c0fe4900-4b96-11eb-8911-61654ca6312d.png)

## Y Axis
With charts that use the y-axis, the size of the y-axis area can be defined. The `yAxis` can be used with `width` and `height` options. Using the `width` and `height` options, users can define the size of the area where the y-axis is painted.

```ts
type yAxisOption = {
  ...
  width?: number;
  height?: number;
};
```

```js
const options = {
  yAxis: {
    width: 100,
    height: 350,
    title: 'Month'
  }
};
```
![image](https://user-images.githubusercontent.com/43128697/103404404-bf348580-4b96-11eb-98e5-6b44648be3d2.png)

It can be used to change the size of the center y-axis area for Bar charts that use `series.diverging` option.

```js
const options = {
  yAxis: {
    title: 'Age Group',
    align: 'center',
    width: 100,
    height: 300
  },
  xAxis: {
    label: {
      interval: 2
    },
    title: 'People'
  },
  series: {
    diverging: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103404702-f192b280-4b97-11eb-8a11-74945e1e85e1.png)

## Plot
The `plot` is used with all charts and provides `width` and `height` options. Using the `width` and `height` options, users can define the size of the area where the chart is actually painted.

```ts
type PlotOption = {
  width?: number;
  height?: number;
  ...
};
```

```js
const options = {
  plot: {
    width: 800,
    height: 400
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103405040-0de31f00-4b99-11eb-8645-4d58a9563e85.png)

* When both width of the x-axis (`xAxis.width`) and width of the plot (`plot.width`) are provided, the greater of the two is used.
* When both height of the y-axis (`yAxis.height`) and height of the plot (`plot.height`) are provided, the greater of the two is used.

## Legend

The `legend` is used with all charts and provides `width` option. The `width` option can be used to fix the width of the legend.

```ts
type LegendOptions = {
  ...
  maxWidth?: number;
  width?: number;
};
```

```js
const options = {
  legned: {
    width: 200
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103473501-addcba80-4ddc-11eb-9315-a0a2d392dc11.png)
