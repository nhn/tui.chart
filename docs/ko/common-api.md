# API

### on()
* 사용 가능 차트 타입: `All`

```ts
public on(eventName: 'clickLegendLabel'
| 'clickLegendCheckbox'
| 'selectSeries'
| 'unselectSeries'
| 'hoverSeries'
| 'unhoverSeries'
| 'zoom'
| 'resetZoom', handler: (evt: any) => void): void;
```

`on()`는 특정 조건이 발생할 때 사용자 정의 이벤트를 발생시키도록 하는 API다. 인자로 이벤트 명(`eventName`)과 특정 조건이 발생할 수 있는 조건이 충족했을 때 발생하는 사용자 정의 이벤트를 받는다. 현재 제공되고 있는 이벤트 조건은 다음과 같다.

| eventName | 설명 |
| --- | --- |
| `clickLegendLabel` | legend 라벨 영역 클릭 시 이벤트 발생 |
| `clickLegendCheckbox` | legend 체크 박스 영역 클릭 시 이벤트 발생 |
| `selectSeries` | 시리즈 선택 시 발생. `options.series.selectable: true` 조건 필요 |
| `unselectSeries` | 시리즈 선택 해제 시 발생. `options.series.selectable: true` 조건 필요 |
| `hoverSeries` | 시리즈 데이터에 마우스를 올릴 때 이벤트 발생 |
| `unhoverSeries` | `hoverSeries` 이벤트 발생 후 마우스가 떠날 때 이벤트 발생 |
| `zoom` | zoom 발생 시 이벤트 발생. `options.series.zoomable: true` 조건 필요 |
| `resetZoom` | zoom 초기화 시 이벤트 발생. `options.series.zoomable: true` 조건 필요 |

area 차트의 시리즈를 선택했을 때 사용자 정의 이벤트를 추가하고 싶은 경우 다음과 같이 정의할 수 있다. 사용자 정의 함수에서는 각 이벤트에서 제공되는 정보를 인자로 사용할 수 있다.

```js
const chart = new LineChart({ el, data, options });

chart.on('selectSeries', (ev) => {
  console.log(ev);
  /*
  {area: [
    {data: [...], color: '...', name: '...', seriesIndex: '...', index: '...'}
  ]}
   */
});
```

### destroy()
* 사용 가능 차트 타입: `All`

```ts
public destroy(): void;
```

생성된 차트 인스턴스를 제거해준다.

```js
const chart = new LineChart({ el, data, options });

chart.destroy();
```

### resize()
* 사용 가능 차트 타입: `All`

```ts
public resize(size: {
  width?: number;
  height?: number;
}): void;
```

차트가 그려지는 캔버스의 크기를 변경해준다.

```js
const chart = new LineChart({ el, data, options });

chart.resize({width: 400, height: 400});
```

### addSeries()
* 사용 가능 차트 타입: `All`

```ts
public addSeries(data: SeriesDataInput, seriesDataInfo?: {
  category?: string
  chartType?: string;
}): void;
```

series를 추가할 때 사용되는 API다. 첫 번째 인자로는 추가 될 시리즈 데이터 두 번째 인자로는 시리즈에 대한 추가 정보를 받는다. data의 타입은 사용되고 있는 차트의 데이터 타입과 동일하게 추가하면 된다.

간단한 예시로 LineChart에 시리즈를 추가해보자.

```js
const chart = new LineChart({ el, data, options });

chart.addSeries({
  name: 'newSeries',
  data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
});
```

두 번째 인자인 추가 정보는 `category`와 `chartType`을 담아줄 수 있다.

첫 번째로, `category`의 경우 Heatmap 차트에서 사용되며 Y Category에 해당되는 값을 추가한다. Heatmap 차트의 `addSeries()` 예시를 작성해보면 다음과 같다.

```js
chart.addSeries([-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6], {
  category: 'newSeries',
});
```

두 번째로, `chartType`의 경우 `ColumnLine`, `LineArea`, `LineScatter`, `NestedPie`에서 사용되며 각 차트의 타입 또는 `NestedPie`의 경우 시리즈의 `name`을 추가해줘야 해당하는 차트에 적절하게 시리즈가 추가될 수 있다. `LineArea` 차트에 `addSeries()`를 하는 예시를 작성해보면 다음과 같다.

```js
const chart = new LineAreaChart({ el, data, options });

chart.addSeries(
  {
    name: 'new series',
    data: [72, 80, 110, 107, 126, 134, 148],
  },
  { chartType: 'line' }
);
```


### setData()
* 사용 가능 차트 타입: `All`

```ts
public setData(data): void;
```

차트 데이터 전체를 변경하는 API다. 데이터의 타입은 각각의 차트를 그리는데 사용되었던 타입과 동일하다. Line 차트의 `setData` 예시를 살펴보도록 하자.

```js
const lineChart = new LineChart({ el, data, options });

lineChart.setData({
  categories: ['1', '2', '3'],
  series: [
    {
      name: 'new series',
      data: [1, 2, 3],
    },
    {
      name: 'new series2',
      data: [4, 5, 6],
    }
  ]
});
```

### addData()
* 사용 가능 차트 타입: `Line`, `Area`, `Bar`, `BoxPlot`, `Column`, `Heatmap`, `Bubble`, `Scatter`, `Bullet`, `Radar`, `Treemap`, `LineArea`, `LineScatter`, `ColumnLine`

```ts
public addData(data, category?: string): void;
public addData(data, category: string, chartType: 'line' | 'area' | 'column'): void;
```

현재 데이터를 기반으로 데이터를 추가하는 API다. 실시간으로 데이터를 추가할 때 사용할 수 있다. data의 경우 각각의 시리즈 data의  `마지막`에 추가되며 `배열`로 입력된다. 먼저, Line 차트의 `addData` 예시를 살펴보도록 하자.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
    },
  ],
};

const lineChart = new LineChart({ el, data, options });

lineChart.addData([10, 20], '6');
```

위 예제는 다음의 데이터를 갖는 Line 차트로 변경될 것이다.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5', '6'], // '6' 추가
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70, 10], // 10 추가
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70, 20], // 20 추가
    },
  ],
};
```

다음으로 LineArea 차트에서 `addData()`를 사용하는 간단한 예시를 살펴보자.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: {
    line: [
      {
        name: 'A',
        data: [10, 100, 50, 40, 70],
      },
    ],
    area: [
      {
        name: 'B',
        data: [60, 40, 10, 33, 70],
      },
    ],
  },
};

const chart = new LineAreaChart({ el, data, options });

lineAreaChart.addData([10], '6', { chartType: 'line' });
```

LineArea 차트 같이 여러 차트 타입이 함께 그려지는 LineArea, LineColumn 차트의 경우 세 번째 매개변수로 추가될 차트 타입을 `chartType`으로 명시해 줘야 한다. 위 예제는 다음의 데이터를 갖는 LineArea 차트로 변경될 것이다.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5', '6'],
  series: {
    line: [
      {
        name: 'A',
        data: [10, 100, 50, 40, 70, 10],
      },
    ],
    area: [
      {
        name: 'B',
        data: [60, 40, 10, 33, 70],
      },
    ],
  },
};
```


### setOptions()
* 사용 가능 차트 타입: `All`

```ts
public setOptions(options: Options): void;
```

차트 옵션 전체를 변경하는 API다. 옵션 타입은 각각의 차트를 그리는데 사용되었던 타입과 동일하다. Line 차트의 `setOptions()` 예시를 살펴보도록 하자.

```js
const chart = new LineChart({ el, data, options });

chart.setOptions({
  chart: {
    width: 500,
    height: 'auto',
    title: 'Energy Usage',
  },
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  yAxis: {
    title: 'Energy (kWh)',
  },
  series: {
    selectable: true
  },
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
});
```

### updateOptions()
* 사용 가능 차트 타입: `All`

```ts
public updateOptions(options: Options): void;
```

기존 차트의 옵션을 업데이트하는 API다. `setOptions()` API의 경우 처음 차트를 생성할 때 적용되었던 옵션이 모두 사라지지만 `updateOptions()`는 기존 차트를 기준으로 추가되는 옵션만 변경된다. Line 차트의 `updateOptions()` 예시를 살펴보도록 하자.

```ts
const chart = new LineChart({ el, data, options });

chart.updateOptions({
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
})
```

### getOptions()
* 사용 가능 차트 타입: `All`

```ts
public getOptions(): Options;
```

차트에 적용된 차트 옵션이 반환된다. `setOptions()` 혹은 `updateOptions()`로 옵션을 변경했을 경우 변경된 옵션이 반환된다.

### getCheckedLegend()
* 사용 가능 차트 타입: `All`

```ts
public getCheckedLegend(): { chartType: ChartType; label: string; checked: boolean; }[]
```

legend의 체크박스 영역이 활성화되어있는 시리즈의 정보가 반환된다.


### setTooltipOffset()
* 사용 가능 차트 타입: `All`

```ts
public setTooltipOffset({ x?: number; y?: number });
```

현재 툴팁 위치를 기준으로 x, y 위치를 이동시킨다.

```ts
const chart = new LineChart({ el, data, options });

chart.setTooltipOffset({
  x: 30,
  y: -100
});
```

![image](https://user-images.githubusercontent.com/35371660/102179647-dca4f680-3eea-11eb-940d-2fd87dff0434.png)


## showSeriesDataLabel()
* 사용 가능 차트 타입: `Line`, `Area`, `Bar`, `Column`, `Pie`, `Heatmap`, `Bullet`, `Treemap`, `NestedPie`, `LineArea`, `ColumnLine`

```ts
public showSeriesDataLabel();
```

차트의 dataLabel을 보여준다.

### hideSeriesDataLabel()
* 사용 가능 차트 타입: `Line`, `Area`, `Bar`, `Column`, `Pie`, `Heatmap`, `Bullet`, `Treemap`, `NestedPie`, `LineArea`, `ColumnLine`

```ts
public hideSeriesDataLabel();
```

차트의 dataLabel을 숨긴다.

### addPlotLine()
* 사용 가능 차트 타입: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public addPlotLine(data: {value: number | string, color: string, id?: string});
```

`addPlotLine()`을 통해 plot line을 추가할 수 있다. 이후 `removePlotLine()`을 통해 추가한 라인을 제어하고 싶은 경우 `id`를 인자로 넣어주면 된다.

> [plot line](./common-plot.md)에 대해 궁금하다면 해당 가이드를 참고하라

### removePlotLine()
* 사용 가능 차트 타입: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public removePlotLine(id: string);
```

plot line을 제거할 수 있다. 인자로 id를 입력받으며 동일한 id를 가진 plot line을 제거한다.

> [plot line](./common-plot.md)에 대해 궁금하다면 해당 가이드를 참고하라

### addPlotBand()
* 사용 가능 차트 타입: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public addPlotBand(data: {
  range: [number, number] | [string, string],
  color: string,
  id?:string
});
```

plot band 추가할 수 있다. 이후 `removePlotBand()`를 통해 추가한 band를 제어하고 싶은 경우 `id`를 인자로 넣어주면 된다.

> [plot band](./common-plot.md)에 대해 궁금하다면 해당 가이드를 참고하라

### removePlotBand()
* 사용 가능 차트 타입: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public removePlotBand(id: string);
```

plot band를 제거할 수 있다. 인자로 id를 입력받으며 동일한 id를 가진 plot band를 제거한다.

> [plot band](./common-plot.md)에 대해 궁금하다면 해당 가이드를 참고하라


### showTooltip()

해당되는 시리즈의 툴팁을 보여준다.

```ts
public showTooltip(seriesInfo: {
  seriesIndex?: number;
  index?: number;
  alias?: string;
  chartType?: 'line' | 'column' | 'area' | 'scatter';
});
```

인자로 받게 되는 `seriesIndex`는 시리즈의 인덱스, `index`는 시리즈 내에서의 인덱스를 의미한다. 각각 숫자값 인덱스를 넣어줘 tooltip을 보여줄 시리즈의 데이터를 명시한다. `alias`는 NestedPie 차트에서, `chartType`은 ColumnLine, LineArea, LineScatter 차트에서 적용할 차트를 명시해준다.

### hideTooltip()

툴팁을 사라지게 한다.

```ts
public hideTooltip();
```

### selectSeries()

옵션 `options.series.selectable: true`로 설정되어 있을 때 `selectSeries()`를 사용하면 시리즈를 선택할 수 있다.

```ts
public selectSeries(seriesInfo: {
  seriesIndex?: number;
  index?: number;
  alias?: string;
  chartType?: 'line' | 'column' | 'area';
});
```

인자로 받게 되는 `seriesIndex`는 시리즈의 인덱스, `index`는 시리즈 내에서의 인덱스를 의미한다. 각각 숫자값 인덱스를 넣어줘 선택될 시리즈의 데이터를 명시한다. `alias`는 NestedPie 차트에서, `chartType`은 ColumnLine, LineArea, LineScatter 차트에서 적용할 차트를 명시해준다.

선택 시 API의 on 이벤트의 `selectSeries` eventName을 사용할 경우 선택된 시리즈에 대한 제어를 추가로 할 수 있다.

### unselectSeries()

선택을 해제한다.

```ts
public unselectSeries();
```

선택 시 API의 on 이벤트의 `unselectSeries` eventName을 사용할 경우 해제된 시리즈에 대한 제어를 추가로 할 수 있다.

### addOutlier()
* 사용 가능 차트 타입: `BoxPlot`

```ts
public addOutlier(seriesIndex: number, outliers: number[][])
```

`addOutlier`를 사용하면 BoxPlot 차트에 새 outlier 데이터를 추가할 수 있다.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
      outliers: [
        [0, 10],
        [2, 60],
        [3, 80],
      ],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
      outliers: [
        [0, 20]
      ]
    },
  ],
};

const boxPlotChart = new BoxPlotChart({ el, data, options });

boxPlotChart.addOutlier(1, [[1, 50], [3, 30]]);
```

위 예제는 다음의 데이터를 갖는 BoxPlot 차트로 변경될 것이다.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
      outliers: [
        [0, 10],
        [2, 60],
        [3, 80],
      ],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
      outliers: [
        [0, 20]
        [1, 50],
        [3, 30],
      ],
    },
  ],
};
```
