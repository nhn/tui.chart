# Axes

축은 보조 눈금과 값의 개요를 나타내 차트 데이터의 이해를 돕는 구성요소다. 

![image](https://user-images.githubusercontent.com/35371660/102475360-1ddd0800-409d-11eb-96eb-6421f58fb1cb.png)

TOAST UI Chart의 사용 가능한 축의 종류는 X축, Y축, 보조 Y축이며 차트에 따라 사용 가능한 축의 종류가 다르다. 

| 타입 | 차트명 | 
| --- | --- |
| x축, y축, 보조 y 축 사용 가능 | `Area`, `Bar`, `ColumnLine`, `LineArea`, `Line`, `LineScatter` |
| x축, y축 사용 가능 | `BoxPlot`, `Bubble`, `Bullet`, `Column`, `Heatmap`, `Scatter` |
| 축이 없는 차트 | `Radar`, `Treemap`, `Pie`, `NestedPie` |

이 가이드에서는 모든 축을 사용 가능한 차트라는 가정하에 작성되었다.

## options

축의 변경 가능한 옵션은 다음과 같다.

```ts
interface AxisOptions {
  tick?: {
    interval?: number;
  }
  label?: {
    interval?: number;
  }
  scale?: {
    min?: number;
    max?: number;
    stepSize?: 'auto' | number;
  }
  title?: string | {
    text: string;
    offsetX?: number;
    offsetY?: number;
  }
  width?: number;
  height?: number;
}

interface xAxisOptions extends AxisOptions {
  pointOnColumn?: boolean; // Only available on Line, Area Chart
  rotateLabel?: boolean;
  date?: boolean | {
    format: string;
  };
}
```

### tick, label

`tick`과 `label`을 통해 그려지는 눈금과 눈금에 대한 정보를 나타내는 라벨의 간격을 조절할 수 있다. 각각 `interval` 값을 옵션으로 가질 수 있으며 이 숫자값을 기준으로 간격이 조절된다.

```js
const options = {
  xAxis: {
    tick: {
      interval: 3
    },
    label: {
      interval: 6
    }
  }
}
```

다음과 같이 예제를 작성할 경우 다음과 같이 나타나던 축을 다음과 같이 좀 더 단순화 할 수 있다.

![image](https://user-images.githubusercontent.com/35371660/102288746-78cd0d00-3f80-11eb-8479-8b882cb39149.png)


### scale

scale 옵션을 통해 축에 나타나는 값의 최대, 최소 값을 지정할 수 있으며 tick과 label이 그려지는 간격의 크기를 정할 수 있다. 각각 `scale.min`, `scale.max`, `scale.stepSize`로 조절할 수 있으며 사용자가 지정하지 않을 경우 차트 내부에서 자동으로 처리한다.

```js
const options = {
  yAxis: {
    scale: {
      min: 20,
      max: 50,
      stepSize: 10
    }
  }
};
```

![image](https://user-images.githubusercontent.com/35371660/102288615-34da0800-3f80-11eb-89a1-68b2862ffd5d.png)

### title

위 그림에서 파악할 수 있듯이 각 차트는 제목을 갖는다. `title` 옵션은 문자열로 직접 입력받을 수 있으며 `title.text` 옵션과  `title.offsetX`, `title.offsetY` 옵션을 통해 제목을 지정하며 위치를 변경해 줄 수 있다.

```js
const options = {
  xAxis: {
    title: {
      text: 'new title',
      offsetX: 100,
      offsetY: 100
    }
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/102191824-4af2b480-3efd-11eb-87c0-9a5ec4c9296b.png)


### date

x축의 경우 나타나는 category 값이 Date 객체 또는 날짜를 나타내는 문자열이 될 수 있다. 해당 데이터를 내부에서 처리해주기 위해 날짜 데이터를 사용하는 경우 `xAxis.date` 객체를 `true`로 지정하거나 `xAxis.date.format`을 지정해야 한다.

| 타입 | 사용 가능한 포맷 |
| --- | --- |
| year | `YYYY`, `YY`, `yy`, `yyyy` |
| month | `MMMM`, `MMM`, `MM`, `M` |
| date | `D`, `d`, `DD`, `dd` |
| hour | `hh`, `HH`, `h`, `H` |
| minute | `m`, `mm` |
| seconds | `s`, `ss` |
| meridiem | `A`, `a` |

해당 포맷 옵션을 이용하는 간단한 예제를 만들어보자.

```js
const data = {
  categories: [
    '01/01/2020',
    '02/01/2020',
    '03/01/2020',
    '04/01/2020',
    '05/01/2020',
    '06/01/2020',
    '07/01/2020',
    '08/01/2020',
    '09/01/2020',
    '10/01/2020',
    '11/01/2020',
    '12/01/2020',
  ],
  series: [ ... ]
}

const options = {
  xAxis: {
    date: {
      format: 'YY-MM-DD'
    }
  }
}
```

Date 타입의 카테고리가 포맷팅되어 나타나는 것을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35371660/102196061-bab76e00-3f02-11eb-8be2-d480b9810113.png)


### rotateLabel

* ⚠️ 개발 후 가이드 작성 필요 ⚠️ 

### pointOnColumn

x축을 기준으로 시리즈의 시작 부분을 틱과 틱 가운데로 이동시킬 수 있다. 해당 옵션은 [Line 차트](./chart-line.md)와 [Area 차트](./chart-area.md)에서만 사용 가능하다. 


* default: `false`


```js
const options = {
  xAxis: {
    pointOnColumn: true
  }
}
```

**`pointOnColumn: true`가 적용된 Line 차트**
![image](https://user-images.githubusercontent.com/35371660/101850121-76dc0600-3b9c-11eb-867d-3bc47bd476f7.png)

**`pointOnColumn: true`가 적용된 Area 차트**
![image](https://user-images.githubusercontent.com/35371660/101856997-d8ef3800-3ba9-11eb-9caf-8b4bca816836.png)

## theme

Axis를 스타일링 할 수 있는 테마 옵션은 다음과 같다.

```ts
interface AxisTheme {
  width?: number;
  color?: string;
  title?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string
  };
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string
  };
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| width | number | 축 라인 두께 |
| color | string | 축 색상 |
| title | object | 축 제목 테마 옵션 |
| label | object | 축 라벨 테마 옵션 |

테마는 options의 `theme`값으로 추가 해준다. y축의 라벨과 선 두께, 색상을 바꾸는 간단한 예시를 작성해보자.

```js
const options = {
  theme: {
    yAxis: {
      label: {
        color: '#ff2233',
        fontWeight: 600,
        fontFamily: 'monaco',
        fontSize: 14
      },
      width: 3,
      color: '#00ff32',
    }
  }
};
```

적용된 스타일은 다음과 같다. 

![image](https://user-images.githubusercontent.com/35371660/102197823-01a66300-3f05-11eb-9668-6b4a53b83cb6.png)

## Secondary Y Axis

`Area`, `Bar`, `ColumnLine`, `LineArea`, `Line`, `LineScatter` 차트는 보조 축을 사용할 수 있다. 기존에 작성하던 객체 형태의 `yAxis` 옵션을 배열로 입력하면 첫번째 옵션이 주축에 대한 옵션, 두번째 옵션이 부축에 대한 옵션으로 동작한다. 


```js
const options = {
  yAxis: [
    {
      title: 'Temperature (Celsius)',
    },
    {
      title: 'Percent (%)',
      scale: {
        min: 0,
        max: 100,
      },
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/102289947-45d84880-3f83-11eb-94ce-8b8e6bead8e8.png)

테마 또한 동일하게 yAxis의 테마 옵션을 배열로 입력하면 첫번째 테마가 주축, 두 번째 테마가 부축에 적용된다.

```js
const options = {
  theme: {
    yAxis: [
      {
        title: {
          fontFamily: 'Impact',
          fontSize: 17,
          fontWeight: 400,
          color: '#03C03C',
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#6655EE',
        },
        width: 3,
        color: '#88ddEE',
      },
      {
        title: {
          fontFamily: 'Comic Sans MS',
          fontSize: 13,
          fontWeight: 600,
          color: '#00a9ff',
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#FFABAB',
        },
        width: 3,
        color: '#AFFCCA',
      }
    ]
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/102290775-090d5100-3f85-11eb-9181-3ad214d50407.png)
