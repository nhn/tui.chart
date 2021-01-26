# Live Update

![no shift](https://user-images.githubusercontent.com/35371660/102158081-fb43c700-3ec3-11eb-96a7-bbc840b52eb4.gif)

If the `series.shift` option is not set to true, when the new data is added through `addData()`, the chart automatically shifts as shown above. However, this could lead to problems when the amount of data increases. This problem can be addressed through the Live Update feature.

![live update line](https://user-images.githubusercontent.com/35371660/102157257-815f0e00-3ec2-11eb-8b87-a177664a43b2.gif)

The Live Update feature allows the chart to show the adding of the new data when `addData()` API is called according to the predetermined size.

## Applying Live Update

1. Set the `series.shift` option to `true`.

```js
const options = {
  series: {
    shift: true
  }
}
```

2. Use the `addData` API to add data.

```js
const chart = new LineChart({ el, data, options });

chart.addData(newData, newCategory);
```

## Compatible Charts

The following is a list of charts compatible with Live Update.

- [Line Chart](./chart-line.md)

![live update line](https://user-images.githubusercontent.com/35371660/102157257-815f0e00-3ec2-11eb-8b87-a177664a43b2.gif)

- [Area Chart](./chart-area.md)

![area](https://user-images.githubusercontent.com/35371660/102159207-6ee6d380-3ec6-11eb-8ca8-07c82095556f.gif)

- [Line Area Chart](./chart-lineArea.md)

![lineArea](https://user-images.githubusercontent.com/35371660/102160638-2aa90280-3ec9-11eb-98ae-5113cd3f75eb.gif)

- [Column Chart](./chart-column.md)

![column](https://user-images.githubusercontent.com/35371660/102159210-70b09700-3ec6-11eb-9f78-9d9790cd0357.gif)

- [ColumnLine Chart](./chart-columnLine.md)

![columnline](https://user-images.githubusercontent.com/35371660/102159292-976ecd80-3ec6-11eb-84b9-4e487e411245.gif)

- [Heatmap Chart](./chart-heatmap.md)

![heatmap](https://user-images.githubusercontent.com/35371660/102159193-68f0f280-3ec6-11eb-9b1f-4fa14c97c879.gif)
