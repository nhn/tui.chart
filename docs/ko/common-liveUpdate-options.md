# Live Update

![no shift](https://user-images.githubusercontent.com/35371660/102158081-fb43c700-3ec3-11eb-96a7-bbc840b52eb4.gif)

`series.shift`옵션을 true로 적용하지 않은 경우 `addData()`시 위 이미지처럼 데이터가 쌓이는 형태를 갖게 된다. 하지만, 데이터가 많아질 경우 각각을 구분해서 알아보기 힘들 수 있는데, Live Update 기능을 이용해 이 문제를 해결할 수 있다.

![live update line](https://user-images.githubusercontent.com/35371660/102157257-815f0e00-3ec2-11eb-8b87-a177664a43b2.gif)

Live Update 기능은 위 그림과 같이 `addData()` API로 데이터를 추가할 때 정해진 사이즈에 맞춰 데이터가 추가되는 것처럼 보여지는 되는 기능이다.

## 적용 방법

1. `series.shift` 옵션을 `true`로 지정한다.

```js
const options = {
  series: {
    shift: true
  }
}
```

2. `addData` API를 사용해 데이터를 추가하면 된다.

```js
const chart = new LineChart({ el, data, options });

chart.addData(newData, newCategory);
```

## 사용 가능 차트

적용 가능한 차트는 다음과 같다.

- [Line Chart](./chart-line.md)

![live update line](https://user-images.githubusercontent.com/35371660/102157257-815f0e00-3ec2-11eb-8b87-a177664a43b2.gif)

- [Area Chart](./chart-area.md)

![area](https://user-images.githubusercontent.com/35371660/102159207-6ee6d380-3ec6-11eb-8ca8-07c82095556f.gif)

- [LineArea Chart](./chart-lineArea.md)

![lineArea](https://user-images.githubusercontent.com/35371660/102160638-2aa90280-3ec9-11eb-98ae-5113cd3f75eb.gif)

- [Column Chart](./chart-column.md)

![column](https://user-images.githubusercontent.com/35371660/102159210-70b09700-3ec6-11eb-9f78-9d9790cd0357.gif)

- [ColumnLine Chart](./chart-columnLine.md)

![columnline](https://user-images.githubusercontent.com/35371660/102159292-976ecd80-3ec6-11eb-84b9-4e487e411245.gif)

- [Heatmap Chart](./chart-heatmap.md)

![heatmap](https://user-images.githubusercontent.com/35371660/102159193-68f0f280-3ec6-11eb-9b1f-4fa14c97c879.gif)




