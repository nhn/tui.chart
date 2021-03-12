# Bullet 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Bullet 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { BulletChart } from '@toast-ui/chart';

const chart = new BulletChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.bulletChart({el, data, options});
```

## 기본 차트

### 데이터 타입

`series` 값에는 `name`, `data`, `markers`, `ranges` 데이터를 배열로 입력한다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 유일한 id로 작성한다.

```js
const data = {
  series: [
    {
      name: 'Budget',
      data: 25,
      markers: [28, 2, 15],
      ranges: [
        [-1, 10],
        [10, 20],
        [20, 30]
      ]
    },
    {
      name: 'Income',
      data: 11,
      markers: [20],
      ranges: [
        [0, 8],
        [8, 15]
      ]
    },
    {
      name: 'Expenses',
      data: 30,
      markers: [25],
      ranges: [
        [0, 10],
        [10, 19],
        [19, 28]
      ]
    },
    {
      name: 'Dept',
      data: 23,
      markers: [],
      ranges: [
        [19, 25],
        [13, 19],
        [0, 13]
      ]
    }
  ],
};
```

![image](https://user-images.githubusercontent.com/43128697/102740630-af958f80-4393-11eb-8685-ddd23d222fab.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  series: [
    {
      name: 'Budget',
      data: 25,
      markers: [28, 2, 15],
      ranges: [
        [-1, 10],
        [10, 20],
        [20, 30]
      ],
      visible: false,
    },
    {
      name: 'Income',
      data: 11,
      markers: [20],
      ranges: [
        [0, 8],
        [8, 15]
      ]
    },
    {
      name: 'Expenses',
      data: 30,
      markers: [25],
      ranges: [
        [0, 10],
        [10, 19],
        [19, 28]
      ]
    },
    {
      name: 'Dept',
      data: 23,
      markers: [],
      ranges: [
        [19, 25],
        [13, 19],
        [0, 13]
      ]
    }
  ],
};
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108008732-633d9780-7044-11eb-954f-2b1a28b5a978.png)


## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
    // ...
  },
  xAxis?: {
    // ...
  },
  yAxis?: {
    // ...
  },
  legend?: {
    // ...
  },
  exportMenu?: {
    // ...
  },
  tooltip?: {
    // ...
  },
  plot?: {
    // ...
  },
  responsive?: {
    // ...
  },
  theme?: {
    // 아래 테마 챕터에서 설명
  },
  series?: {
    vertical?: boolean;
    selectable?: boolean;
    eventDetectType?: 'point' | 'grouped';
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  }
};
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [플롯](./common-plot.md),
> [`responsive` 옵션](./common-responsive-options.md)
> )

### vertical

Bullet 차트는 기본적으로 가로형 차트이다. `vertical` 옵션을 `true`로 설정하면 세로형 차트를 그릴 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    vertical: true
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102740899-3480a900-4394-11eb-8156-2ad11a018843.png)

### selectable

해당 시리즈를 선택할 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102741068-b7a1ff00-4394-11eb-9824-f2f404076e1a.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### eventDetectType

마우스를 통해 시리즈 데이터를 선택하거나 탐지하는 방법을 정의할 수 있다.

| 타입 | 설명 |
| --- | --- |
| `point` | 개별 시리즈 영역에 마우스가 다가가야 탐지. 현재 마우스가 가리키고 있는 포인트를 기준으로 단 한 개만 탐지됨 |
| `grouped` | Y축(`vertical: true`옵션과 함께 사용할 경우 X축)을 기준으로 값이 같은 모든 데이터가 탐지됨 |

* 기본값: `point`

![eventDetectType.point](https://user-images.githubusercontent.com/43128697/103997120-085f8780-51de-11eb-9bfe-78af1e667a34.png)

`eventDetectType`을 `'grouped'`로 설정할 경우 Y축(`vertical: true`옵션과 함께 사용할 경우 X축)을 기준으로 값이 같은 데이터가 모두 탐지된다.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/103996962-dcdc9d00-51dd-11eb-8ee7-c3076cd6ec42.png)

### dataLabels
데이터 라벨은 차트에서 시리즈에 대한 값을 표시한다.
`dataLabels` 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      anchor: 'start' | 'center' | 'end' | 'auto';
    };
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |
| `anchor` | 'start' \| 'center' \| 'end' \| 'auto' | 데이터 라벨 위치 설정 (기본값: `'auto'`) |

```js
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476560-61a07300-4dfa-11eb-934c-35b65bf0a761.png)

## 시리즈 theme

Bullet 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 마커 데이터 값을 나타내는 라벨도 스타일링 할 수 있다. 화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
interface BulletChartSeriesTheme {
  areaOpacity?: number;
  colors?: string[];
  barWidth?: number | string;
  barWidthRatios?: {
    rangeRatio?: number;
    bulletRatio?: number;
    markerRatio?: number;
  };
  markerLineWidth?: number;
  rangeColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
  };
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  };
  dataLabels?: CommonDataLabelBubbleTheme & {
    marker?: CommonDataLabelBubbleTheme;
  };
}

type CommonDataLabelBubbleTheme = {
  useSeriesColor?: boolean;
  lineWidth?: number;
  textStrokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  textBubble?: {
    visible?: boolean;
    paddingX?: number;
    paddingY?: number;
    backgroundColor?: string;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    arrow?: {
      visible?: boolean;
      width?: number;
      height?: number;
      direction?: 'top' | 'right' | 'bottom' | 'left';
    };
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `colors` | string[] | 시리즈의 색상 |
| `areaOpacity` | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| `barWidth` | number \| string | 시리즈 전체 박스 너비 |
| `barWidthRatios` | object | 범위, Bullet 박스 너비와 마커 길이 비율 설정 |
| `barWidthRatios.rangeRatio` | number | 범위 너비 비율 (기본값: 1) |
| `barWidthRatios.bulletRatio` | number | Bullet 박스 너비 비율 (기본값: 0.5) |
| `barWidthRatios.markerRatio` | number | 마커 선 길이 비율 (기본값: 0.8) |
| `markerLineWidth` | number | 마커 선 두께 |
| `rangeColors` | string[] | 범위 색깔 |
| `borderColor` | string | Bullet 박스 테두리 색깔 |
| `borderWidth` | number | Bullet 박스 테두리 두께 |
| `hover` | object | 데이터에 마우스를 올렸을 때 스타일 |
| `hover.groupRect` | object | 옵션 `series.eventDetectType: 'grouped'`로 설정되어 있을 때, X축(Y축) 기준으로 덮어지는 박스 영역의 스타일 |
| `select` | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| `select.areaOpacity` | number | 선택된 시리즈의 영역 투명도 |
| `select.groupRect` | object | 옵션 `series.eventDetectType: 'grouped'`로 설정되어 있을 때, X축(Y축) 기준으로 선택되는 박스 영역의 스타일 |
| `select.restSeries` | object | 선택되지 않은 시리즈의 스타일 |
| `dataLabels` | object | 데이터 라벨 스타일 |
| `dataLabels.useSeriesColor` | boolean | 글자 색상을 시리즈 색상으로 사용할지 여부 |
| `dataLabels.lineWidth` | number | 텍스트 선 두께 |
| `dataLabels.textStrokeColor` | string | 텍스트 선 색상 |
| `dataLabels.shadowColor` | string | 텍스트 그림자 색상 |
| `dataLabels.shadowBlur` | number | 텍스트 그림자 Blur |
| `dataLabels.fontSize` | number | 글자 크기 |
| `dataLabels.fontFamily` | string | 폰트명 |
| `dataLabels.fontWeight` | string | 글자 굵기 |
| `dataLabels.color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `dataLabels.textBubble` | object | 말풍선 디자인 설정 |
| `dataLabels.textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `dataLabels.textBubble.paddingX` | number | 수평 여백 |
| `dataLabels.textBubble.paddingY`| number | 수직 여백 |
| `dataLabels.textBubble.backgroundColor` | string | 말풍선 배경색 |
| `dataLabels.textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `dataLabels.textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `dataLabels.textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `dataLabels.textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `dataLabels.textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `dataLabels.textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `dataLabels.textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `dataLabels.textBubble.arrow` | object | 말풍선 화살표 설정 |
| `dataLabels.textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `dataLabels.textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `dataLabels.textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `dataLabels.textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |
| `dataLabels.marker` | object | 마커 라벨 스타일. `dataLabels`에 적용할 수 있는 스타일 옵션 모두 사용 가능 |

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 아래 코드는 Bullet 시리즈의 색상과 너비를 바꾸고, 마우스를 올렸을 때 스타일을 변경한 옵션이다.

```js
const options = {
  theme: {
    series: {
      colors: ['#540D6E', '#EE4266', '#FFD23F', '#3BCEAC'],
      barWidth: '50%',
      barWidthRatios: {
        rangeRatio: 1,
        bulletRatio: 0.4,
        markerRatio: 0.4,
      },
      markerLineWidth: 3,
      rangeColors: ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 1)',
      hover: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 6,
      }
    }
  }
};
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102742822-3ef17180-4399-11eb-9f8f-5c43500b8c2f.png)

아래 코드는 데이터 라벨의 테마를 적용하여 말풍선으로 바꾸고 글자 스타일을 변경한 옵션이다.

```js
const options = {
  series: {
    dataLabels: {
      visible: true
    }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'fantasy',
        fontSize: 13,
        fontWeight: 500,
        useSeriesColor: true,
        textBubble: {
          visible: true,
          backgroundColor: '#eeeeee',
          borderWidth: 1,
          borderColor: '#333333',
          borderRadius: 5,
          arrow: { visible: true, width: 4, height: 4 }
        },
        marker: {
          fontFamily: 'fantasy',
          fontSize: 13,
          fontWeight: 600,
          useSeriesColor: false,
          color: '#ffffff',
          textStrokeColor: '#000000',
          shadowColor: '#000000',
          shadowBlur: 6,
          textBubble: { visible: false }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476561-62d1a000-4dfa-11eb-8fce-b7740715961f.png)
