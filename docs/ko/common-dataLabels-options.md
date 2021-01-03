# 데이터 라벨

데이터 라벨은 차트에서 시리즈에 대한 값을 표시할 수 있는 기능이다. `series.dataLabels` 옵션을 사용하여 값을 표시할 수 있으며, `theme.series.dataLabels` 옵션을 정의하여 데이터 라벨을 스타일링 할 수 있다. 데이터 라벨을 지원하는 차트 타입은 `Area`, `Line`, `Bar`, `Column`, `Bullet`, `Treemap`, `Heatmap`, `Pie`, `NestedPie`, `LineArea`, `LineScatter`, `ColumnLine` 이다.

이 가이드에서는 각 차트 타입별로 데이터 라벨을 적용하고 스타일링 하는 방법을 알아본다.

---

각 차트별 적용 방법에 관해 설명하기 앞서, 데이터 라벨 옵션을 적용하기 위한 공통 속성과 스타일링에 필요한 테마 공통 속성에 대해 설명한다.

`series.dataLabels` 옵션에서 차트마다 공통으로 지원하는 속성은 다음과 같다.

```ts
type DataLabelOptions = {
  visible?: boolean;
  offsetX?: number;
  offsetY?: number;
  formatter?: (value: SeriesDataType) => string;
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 시리즈 별 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

데이터 라벨을 스타일링할 수 있는 공통 속성에 대해 설명한다. 데이터 라벨 스타일은 기본적으로 말풍선 디자인을 적용할 수 있으며, `Area`, `Line`, `Bar`, `Column`, `Bullet`는 말풍선에 화살표를 표시할 수 있으며, `Treemap`, `Heatmap`, `Pie`, `NestedPie`는 말풍선에 화살표를 사용할 수 없다.

다음은 테마에 사용할 수 있는 옵션이다.

```ts
type TextBubble = {
  visible?: boolean;
  arrow?: {
    visible?: boolean;
    width?: number;
    height?: number;
    direction?: 'top' | 'right' | 'bottom' | 'left';
  };
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

/* 사용 차트 타입 : Area, Line, Bar, Column, Bullet */
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
  textBubble?: TextBubble;
};

/* 사용 차트 타입 : Treemap, Heatmap, Pie, NestedPie */
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
  textBubble?: Omit<TextBubble, 'arrow'>
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `useSeriesColor` | boolean | 시리즈 색상을 폰트 색상으로 사용할지 여부 |
| `lineWidth` | number | 텍스트 선 두께 |
| `textStrokeColor` | string | 텍스트 선 색상 |
| `shadowColor` | string | 텍스트 그림자 색상 |
| `shadowBlur` | number | 텍스트 그림자 Blur |
| `fontSize` | number | 폰트 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | string | 폰트 굵기 |
| `color` | string | 폰트 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `textBubble` | object | 말풍선 디자인 설정 |
| `textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `textBubble.arrow` | object | 말풍선 화살표 설정 <br>사용 차트 타입 : `Area`, `Line`, `Bar`, `Column`, `Bullet` |
| `textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |
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
| `formatter` | function | 시리즈 별 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

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

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      anchor: 'start' | 'center' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      stackTotal?: {
        visible?: boolean;
        formatter?: (value: SeriesDataType) => string;
      };
    };
  };
};
```


### theme

```ts
type options = {
  ...
  theme?: {
    series?: {
      dataLabels?: CommonDataLabelBubbleTheme & {
        stackTotal?: CommonDataLabelBubbleTheme;
      };
    };
  };
};
```

## Column

### 옵션

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      anchor: 'start' | 'center' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
      stackTotal?: {
        visible?: boolean;
        formatter?: (value: SeriesDataType) => string;
      };
    };
  };
};
```


### theme

```ts
type options = {
  ...
  theme?: {
    series?: {
      dataLabels?: CommonDataLabelBubbleTheme & {
        stackTotal?: CommonDataLabelBubbleTheme;
      };
    };
  };
};
```

## Bullet

### 옵션

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      anchor: 'start' | 'center' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
    };
  };
};
```


### theme

```ts
type options = {
  ...
  theme?: {
    series?: {
      dataLabels?: CommonDataLabelBubbleTheme & {
        marker?: CommonDataLabelBubbleTheme;
      };
    };
  };
};
```

## Treemap

### 옵션

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
    };
  };
};
```


### theme

```ts
type options = {
  ...
  theme?: {
    series?: {
    dataLabels?: CommonDataLabelBoxTheme;
  };
};
```
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
| `formatter` | function | 시리즈 별 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

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
| `formatter` | function | 시리즈 별 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |
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

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
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


### theme

```ts
type options = {
  ...
  theme?: {
    series?: {
      dataLabels?: {

      };
    };
  };
};
```

## LineArea

### 옵션

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
    }
  }
};

// 혹은

type options = {
  ...
  series: {
    line: {
      ...
      dataLabels: {
        visible?: boolean;
        offsetX?: number;
        offsetY?: number;
        formatter?: (value: SeriesDataType) => string;
      }
    },
    area: {
      ...
      dataLabels: {
        visible?: boolean;
        offsetX?: number;
        offsetY?: number;
        formatter?: (value: SeriesDataType) => string;
      }
    }
  }
};
```


### theme

```ts
type options = {
  ...
  theme: {
    series: {
      dataLabels: {

      }
    }
  }
};
```
## LineScatter

### 옵션

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value: SeriesDataType) => string;
    }
  }
};

// 혹은

type options = {
  ...
  series: {
    line: {
      dataLabels: {
        visible?: boolean;
        offsetX?: number;
        offsetY?: number;
        formatter?: (value: SeriesDataType) => string;
      }
    }
  }
};
```

### theme

```js
const options = {
  theme: {
    series: {
      dataLabels: {

      }
    }
  }
};
```

## ColumnLine

### 옵션

```js
const options = {
  series: {
    dataLabels: {
      visible?: boolean;
      ...
    }
  }
};

// 혹은

const options = {
  series: {
    column: {
      dataLabels: {
        visible?: boolean;
        anchor: 'start' | 'center' | 'end' | 'auto';
        offsetX?: number;
        offsetY?: number;
        formatter?: Formatter;
        stackTotal?: {
          visible?: boolean;
          formatter?: Formatter;
        };
      }
    },
    line: {
      dataLabels: {
        visible?: boolean;
        offsetX?: number;
        offsetY?: number;
        formatter?: Formatter;
      }
    }
  }
};
```

### theme

```js
const options = {
  theme: {
    series: {
      dataLabels: {

      }
    }
  }
};
```

