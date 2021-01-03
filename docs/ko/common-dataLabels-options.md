# 데이터 라벨

데이터 라벨은 차트에서 시리즈에 대한 값을 표시할 수 있는 기능이다. `series.dataLabels` 옵션을 사용하여 값을 표시할 수 있으며, `theme.series.dataLabels` 옵션을 정의하여 데이터 라벨을 스타일링 할 수 있다. 데이터 라벨을 지원하는 차트 타입은 `Area`, `Line`, `Bar`, `Column`, `Bullet`, `Treemap`, `Heatmap`, `Pie`, `NestedPie`, `LineArea`, `LineScatter`, `ColumnLine` 이다.

이 가이드에서는 각 차트 타입별로 데이터 라벨을 적용하고 스타일링 하는 방법을 알아본다.

데이터 라벨 스타일은 기본적으로 말풍선 디자인을 적용할 수 있으며, `Area`, `Line`, `Bar`, `Column`, `Bullet` 차트는 말풍선에 화살표를 표시할 수 있으며, `Treemap`, `Heatmap`, `Pie`, `NestedPie` 차트는 말풍선에 화살표를 사용할 수 없다.

## Area

### 옵션

Area 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 시리즈 별 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103474766-5fceb380-4dea-11eb-8c56-13bac3d68d8f.png)

### theme

화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
type AreaDataLabelTheme = {
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
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |

```js
const options = {
  series: {
    dataLabels: { visible: true, offsetY: -10 }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 10,
        fontWeight: 300,
        useSeriesColor: true,
        textBubble: {
          visible: true,
          arrow: {
            visible: true,
            width: 5,
            height: 5,
            direction: 'bottom'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103474846-221e5a80-4deb-11eb-9b0c-c2a7c2e1ea63.png)

## Line

Line 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103474889-82150100-4deb-11eb-957e-a88c0fb3bd6b.png)

### theme

화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
type LineDataLabelTheme = {
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
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |

```js
const options = {
  series: {
    dataLabels: { visible: true, offsetY: -10 }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 10,
        fontWeight: 300,
        useSeriesColor: true,
        textBubble: {
          visible: true,
          paddingY: 3,
          paddingX: 6,
          arrow: {
            visible: true,
            width: 5,
            height: 5,
            direction: 'bottom'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103474891-83dec480-4deb-11eb-9924-291a8a0af77e.png)

## Bar

### 옵션
Bar 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      anchor: 'start' | 'center' | 'end' | 'auto';
      stackTotal?: {
        visible?: boolean;
        formatter?: (value: SeriesDataType) => string;
      };
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
| `stackTotal` | object | 스택 바 차트에서 합계 값에 대한 라벨 설정 |
| `stackTotal.visible` | boolean | 합계 라벨 표시 여부. 스택 차트일 경우 기본값은 `true`가 됨 |
| `stackTotal.formatter` | function | 합계 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476227-35cfbe00-4df7-11eb-8be9-3a66c5b2c6f8.png)

```js
// 스택 바 차트
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478803-830a5a80-4e0c-11eb-9897-915d2aff02d1.png)

### theme

Bar 차트의 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 스택 바 차트일 경우 표시되는 합계 라벨에 대한 스타일링도 할 수 있다. 화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
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

type BarDataLabelTheme = CommonDataLabelBubbleTheme & {
  stackTotal?: CommonDataLabelBubbleTheme;
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |

```js
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        stackTotal: {
          fontFamily: 'monaco',
          fontWeight: 14,
          color: '#ffffff',
          textBubble: {
            visible: true,
            paddingY: 6,
            borderWidth: 3,
            borderColor: '#00bcd4',
            borderRadius: 7,
            backgroundColor: '#041367',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476460-4b45e780-4df9-11eb-930b-12deb0e31834.png)

## Column
### 옵션
Column 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      anchor: 'start' | 'center' | 'end' | 'auto';
      stackTotal?: {
        visible?: boolean;
        formatter?: (value: SeriesDataType) => string;
      };
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
| `anchor` | 'start' \| 'center' \| 'end' \| 'auto' | 데이터 라벨 위치 설정 (기본값: `'auto'`)  |
| `stackTotal` | object | 스택 컬럼 차트에서 합계 값에 대한 라벨 설정 |
| `stackTotal.visible` | boolean | 합계 라벨 표시 여부. 스택 차트일 경우 기본값은 `true`가 됨 |
| `stackTotal.formatter` | function | 합계 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476415-b3e09480-4df8-11eb-9fa1-56125f3fd0a7.png)

```js
// 스택 컬럼 차트
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478831-ba790700-4e0c-11eb-82bb-14d593d60543.png)

### theme

Column 차트의 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 스택 컬럼 차트일 경우 표시되는 합계 라벨에 대한 스타일링도 할 수 있다. 화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
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

type ColumnDataLabelTheme = CommonDataLabelBubbleTheme & {
  stackTotal?: CommonDataLabelBubbleTheme;
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |

```js
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        stackTotal: {
          fontFamily: 'monaco',
          fontWeight: 14,
          color: '#ffffff',
          textBubble: {
            visible: true,
            paddingY: 6,
            borderWidth: 3,
            borderColor: '#00bcd4',
            borderRadius: 7,
            backgroundColor: '#041367',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476423-bf33c000-4df8-11eb-8e9c-2d5b718c3f3e.png)


## Bullet

### 옵션
Bullet 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
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


### theme

Bullet 차트의 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 마커 데이터 값을 나타내는 라벨도 스타일링 할 수 있다. 화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
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

type BulletDataLabelTheme = CommonDataLabelBubbleTheme & {
  marker?: CommonDataLabelBubbleTheme;
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |

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

## Treemap

### 옵션

Treemap 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      useTreemapLeaf?: boolean;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |
| `useTreemapLeaf` | boolean | 자식 데이터 라벨 표시 여부 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475194-7b3bbd80-4dee-11eb-8489-12695595bf6e.png)

```js
// 자식 데이터 라벨 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      useTreemapLeaf: true
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475197-7d058100-4dee-11eb-9d44-3e4fa321b2b2.png)

### theme

화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
type TreemapDataLabelTheme = {
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
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |

```js
const options = {
  series: {
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 16,
        fontWeight: '800',
        useSeriesColor: true,
        lineWidth: 3,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 10
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475200-7ecf4480-4dee-11eb-969f-f809d0ba59be.png)

## Heatmap

### 옵션

Heatmap 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475076-7e827980-4ded-11eb-975e-39c2566bf42e.png)

### theme

화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
type HeatmapDataLabelTheme = {
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
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |

```js
const options = {
  series: {
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 9,
        fontWeight: '600',
        useSeriesColor: true,
        textBubble: {
          visible: true,
          backgroundColor: '#333333',
          paddingX: 1,
          paddingY: 1,
          borderRadius: 5
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475079-83472d80-4ded-11eb-82f4-f363cbcb3416.png)

## Pie

### 옵션

Pie 차트의 데이터 라벨 옵션은 다음과 같다.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      anchor?: 'center' | 'outer';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
      };
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
| `anchor` | 'center' \| 'outer' | 데이터 라벨 표시 위치 설정. `'center'`는 원 안에, `'outer'`는 원 바깥에 라벨이 위치.<br>(기본값 : `'center'`) |
| `pieSeriesName` | object | 시리즈 이름 라벨 표시 설정 |
| `pieSeriesName.visible` | boolean | 시리즈 이름 라벨 표시 여부 |
| `pieSeriesName.anchor` | 'center' \| 'outer' | 시리즈 이름 라벨 표시 위치 설정. `'center'`는 원 안에, `'outer'`는 원 바깥에 라벨이 위치.<br>(기본값 : `'center'`) |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

```js
// 원 바깥에 라벨 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      anchor: 'outer'
    }
  }
};
```

| 기본 | 원 바깥에 라벨 표시 |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474427-13ce3f80-4de7-11eb-97f6-58ab2cd29001.png) | ![image](https://user-images.githubusercontent.com/43128697/103474431-15980300-4de7-11eb-9664-e96e7e763422.png) |

```js
// 기본 - 시리즈 이름 라벨 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true }
    }
  }
};
```

```js
// 시리즈 이름 라벨을 원 바깥에 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: {
        visible: true,
        anchor: 'outer'
      }
    }
  }
};
```

| 기본 - 시리즈 이름 라벨 표시 | 시리즈 이름 라벨을 원 바깥에 표시 |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474482-b38bcd80-4de7-11eb-99ac-54842fe29b0d.png) | ![image](https://user-images.githubusercontent.com/43128697/103474483-b5ee2780-4de7-11eb-812a-045f78f71e8f.png) |

### theme

Pie 차트의 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 시리즈 이름을 나타내는 라벨, callout 라인 스타일을 설정할 수 있다. 화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
type CommonDataLabelBoxTheme = {
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
  };
};

type PieDataLabelTheme = CommonDataLabelBoxTheme & {
  pieSeriesName?: CommonDataLabelBoxTheme;
  callout?: {
    useSeriesColor?: boolean;
    lineWidth?: number;
    lineColor?: string;
  };
};
```

값을 나타내는 데이터 라벨과 시리즈 이름을 나타내는 라벨(`pieSeriesName`)의 스타일링은 같으며, 사용할 수 있는 옵션은 다음과 같다.

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 글자 굵기 |
| `color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.paddingX` | number | 수평 여백 |
| `textBubble.paddingY`| number | 수직 여백 |
| `textBubble.backgroundColor` | string | 말풍선 배경색 |
| `textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `textBubble.shadowBlur` | number | 말풍선 그림자 Blur |

추가로, 원과 원 밖에 있는 라벨을 잇는 callout 라인 스타일을 설정할 수 있다.

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `callout` | object | callout 라인 스타일 |
| `callout.useSeriesColor` | boolean | callout 라인 색상을 시리즈 색상을 사용할지 여부 |
| `callout.lineWidth` | number | callout 라인 두께 |
| `callout.lineColor` | string | callout 라인 색상. `callout.useSeriesColor: true`이면 동작하지 않음 |

```js
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true, anchor: 'outer' }
    }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        useSeriesColor: true,
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        callout: {
          lineWidth: 3,
          lineColor: '#f44336',
          useSeriesColor: false
        },
        pieSeriesName: {
          useSeriesColor: false,
          color: '#f44336',
          fontFamily: 'fantasy',
          fontSize: 13,
          textBubble: {
            visible: true,
            paddingX: 1,
            paddingY: 1,
            backgroundColor: 'rgba(158, 158, 158, 0.3)',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102973846-db09ad00-4540-11eb-9f9e-36186740d3b4.png)

## Nested Pie
### 옵션

`series.dataLabels` 옵션을 지정하면 모든 중첩된 Pie 차트에서 데이터 라벨이 표시된다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478578-02972a00-4e0b-11eb-9aa9-b9e66ce48279.png)

`series` 옵션에 각 계층별로 Pie 시리즈 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 좀 더 세밀하게 설정해 줄 수 있다.

```ts
type options = {
  ...
  series?: {
    [name]: {
      ...
      dataLabels: {
        // Pie 시리즈  데이터 라벨 옵션
      };
    },
    ...
  };
};
```

간단한 예시로 안쪽에 있는 Pie 시리즈('browsers')에는 데이터 라벨만 표시해주고, 바깥쪽에 있는 Pie 시리즈('versions')에는 시리즈 이름 라벨까지 표시해주었다.

```js
const options = {
  series: {
    browsers: {
      radiusRange: {
        inner: '20%',
        outer: '50%'
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: false
        }
      }
    },
    versions: {
      radiusRange: {
        inner: '55%',
        outer: '85%'
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer'
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478580-0460ed80-4e0b-11eb-97d6-f7998a9029dd.png)

### theme

각 Pie 시리즈의 데이터 라벨 스타일을 지정할 경우 `series[name].dataLabels`를 정의한다.

```ts
type options = {
  ...
  theme?: {
    series?: {
      [name]: {
        dataLabels?: {
          // Pie 시리즈 데이터 라벨 테마
        };
      }
    };
  };
};
```

간단한 예시로 각 Pie 시리즈의 데이터 라벨의 글자 스타일을 변경하고 말풍선으로 변경해 보았다.

```js
const options = {
  series: {
    browsers: {
      dataLabels: {
        visible: true
      }
    },
    versions: {
      dataLabels: {
        visible: true,
        pieSeriesName: { visible: true, anchor: 'outer' }
      }
    }
  },
  theme: {
    series: {
      browsers: {
        dataLabels: {
          fontFamily: 'fantasy',
          fontSize: 13,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            backgroundColor: '#333333',
            borderRadius: 5,
            borderColor: '#ff0000',
            borderWidth: 3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)',
          },
        },
      },
      versions: {
        dataLabels: {
          fontFamily: 'monaco',
          useSeriesColor: true,
          lineWidth: 2,
          textStrokeColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowBlur: 4,
          callout: {
            lineWidth: 3,
            lineColor: '#f44336',
            useSeriesColor: false
          },
          pieSeriesName: {
            useSeriesColor: false,
            color: '#f44336',
            fontFamily: 'fantasy',
            fontSize: 13,
            textBubble: {
              visible: true,
              paddingX: 1,
              paddingY: 1,
              backgroundColor: 'rgba(158, 158, 158, 0.3)',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0,
              shadowColor: 'rgba(0, 0, 0, 0)'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478668-9cf76d80-4e0b-11eb-84fc-fce9f8412d2f.png)

## LineArea

### 옵션

`series.dataLabels` 옵션을 지정하면 Line과 Area 차트에서 모두 데이터 라벨이 표시된다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478314-248fad00-4e09-11eb-8bca-ecd98a4f2776.png)

`series` 옵션에 각 시리즈 별로 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 각 시리즈 별로 좀 더 세밀하게 설정해 줄 수 있다.

```ts
type LineAreaChartSeriesOption = {
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  },
  area: { // Area 시리즈 옵션
    ...
    dataLabels: {
      // Area 시리즈 데이터 라벨 옵션
    }
  }
};
```

간단한 예시로 Area 시리즈의 데이터 라벨은 표시해주지 않고, Line 시리즈의 데이터 라벨만 표시하도록 설정하였다.

```js
const options = {
  series: {
    line: {
      dataLabels: {
        visible: true
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478360-7c2e1880-4e09-11eb-8319-b56af88d7f07.png)

### theme

각 시리즈 별로 데이터 라벨의 스타일을 지정할 경우 `series.line.dataLabels` 또는 `series.area.dataLabels`를 정의한다.

```ts
type LineAreaChartDataLabelTheme = {
  series: {
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    },
    area: {
      dataLabels: {
        // Area 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Area 시리즈와 Line 시리즈의 데이터 라벨 스타일을 글자 색상과 크기, 굵기 등을 조절하고 말풍선 스타일로 변경해보았다.

```js
const options = {
  series: {
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: 15 }
    },
    area: {
      dataLabels: { visible: true, offsetY: -15 }
    },
  },
  theme: {
    series: {
      line: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'top',
            },
          },
        },
      },
      area: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478270-acc18280-4e08-11eb-9558-c85c72e2359d.png)


## LineScatter

### 옵션

`series.dataLabels` 옵션을 지정하면 Line 차트에 데이터 라벨이 표시된다. Scatter 차트는 데이터 라벨 옵션을 지원하지 않는다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477790-5dc61e00-4e05-11eb-94cd-6209948ad291.png)

또한 `series.line.dataLabels` 옵션을 사용하여 데이터 라벨을 표시할 수 있다.

```ts
type LineScatterChartSeriesOption = {
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  }
};
```

### theme

Line 시리즈 데이터 라벨의 스타일을 지정하기 위해서는 `series.line.dataLabels`를 정의한다.

```ts
type LineScatterChartDataLabelTheme = {
  series: {
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Line 시리즈 데이터 라벨 스타일을 말풍선으로 바꾸고 글자 색상과 크기를 변경해보았다.

```js
const options = {
  series: {
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      line: {
        dataLabels: {
          color: '#105018',
          fontSize: 10,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477907-7c78e480-4e06-11eb-9d40-00759bcf65c3.png)

## ColumnLine

### 옵션

`series.dataLabels` 옵션을 지정하면 Column과 Line 차트에서 모두 데이터 라벨이 표시된다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477475-a29c8580-4e02-11eb-9749-a744d5d3fce4.png)

`series` 옵션에 각 시리즈 별로 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 각 시리즈 별로 좀 더 세밀하게 설정해 줄 수 있다.

```ts
type ColumnLineChartSeriesOption = {
  column: { // Column 시리즈 옵션
    ...
    dataLabels: {
      // Column 시리즈 데이터 라벨 옵션
    }
  },
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  }
};
```

간단한 예시로 Line 시리즈의 데이터 라벨은 표시해주지 않고, Column 시리즈의 데이터 라벨만 표시하도록 설정하였다.

```js
const options = {
  series: {
    column: {
      stack: true,
      dataLabels: {
        visible: true,
        stackTotal: {
          visible: false
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477454-6701bb80-4e02-11eb-8256-23421795972e.png)

### theme

각 시리즈 별로 데이터 라벨의 스타일을 지정할 경우 `series.column.dataLabels` 또는 `series.line.dataLabels`를 정의한다.

```ts
type ColumnLineChartDataLabelTheme = {
  series: {
    column: {
      dataLabels: {
        // Column 시리즈 데이터 라벨 테마
      }
    },
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Column 시리즈 데이터 라벨에는 글자 색상과 크기, 굵기 등을 조절하고, Line 시리즈 데이터 라벨에는 말풍선 스타일을 변경해보았다.

```js
const options = {
  series: {
    column: {
      dataLabels: { visible: true, anchor: 'start' }
    },
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      column: {
        dataLabels: {
          color: '#ffffff',
          fontSize: 10,
          fontWeight: 600
        }
      },
      line: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477615-f491db00-4e03-11eb-9207-aa1ee2883aba.png)

