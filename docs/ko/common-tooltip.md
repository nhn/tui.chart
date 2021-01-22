# Tooltip

Tooltip은 현재 마우스를 올려놓은 데이터의 정보를 나타내는 영역이다.

![image](https://user-images.githubusercontent.com/35371660/102475501-482ec580-409d-11eb-839e-c4c4e56ce0b8.png)

해당 영역은 header 영역과 body 영역으로 나누어져 있으며 header 영역에는 category 값이, body 영역에는 데이터 값이 나오게 된다.

## 옵션

tooltip을 제어할 수 있는 옵션은 다음과 같다.

```ts
/* Tooltip 옵션 */
interface TooltipOptions {
  offsetX?: number;
  offsetY?: number;
  formatter?: (value) => string;
  template?: (
    model: TooltipTemplateModel,
    defaultTemplate: { header: string; body: string },
    theme: Required<TooltipTheme>
  ) => string;
  transition: boolean | string;
}

type TooltipTemplateModel = {
  data: {
    label: string;
    color: string;
    value: TooltipDataValue;
    formattedValue?: string;
    category?: string;
    percentValue?: number;
  }[];
  category?: string;
};
```

### offsetX, offsetY

`offsetX`, `offsetY` 옵션 값을 변경해 툴팁의 위치를 변경할 수 있다.

- default
  - offsetX: `0`
  - offsetY: `0`

기존 툴팁의 위치를 (0,0)이라 보고 offsetX를 양수값, offsetY를 음수값을 줘 해당 툴팁의 위치를 조금 더 오른쪽으로, 그리고 위로 이동 시킬 수 있었다.

```js
const options = {
  tooltip: {
    offsetX: 30,
    offsetY: -100,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102179647-dca4f680-3eea-11eb-940d-2fd87dff0434.png)

### Formatter

`tooltip.formatter` 옵션을 통해 값을 포맷팅 한 뒤 출력할 수 있다. formatter 함수는 데이터 값과 데이터에 대한 정보를 차례대로 인자로 가지며 포맷팅 된 문자열을 반환하는 함수다.

간단한 예시로 입력되는 값을 비교해 툴팁에 이모지를 추가하는 예제를 만들어 봤다.

```js
const options = {
  tooltip: {
    formatter: (value, tooltipDataInfo) => {
      const temp = Number(value);
      let icon = '☀️';
      if (temp < 0) {
        icon = '❄️';
      } else if (temp > 25) {
        icon = '🔥';
      }

      console.log(tooltipDataInfo); // { category: '08/01/2020', color: '#785fff', index: 7, seriesIndex: 4, value: -0.1, label: 'Jungfrau'}

      return `${icon} ${value} ℃`;
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102180203-d2cfc300-3eeb-11eb-9197-280cb25654bb.png)

이 경우 `-4.1`이 `value`로 주어지며 출력하고 싶은 형태를 반환해 포매팅해줬다.

### Custom tooltip

`tooltip.template`을 통해 커스텀 툴팁을 생성할 수 있다. 인자는 html 문자열을 반환하는 함수를 받게된다. 해당 함수에서는 데이터, 기존 템플릿, 기존 템플릿에 대한 테마 총 세개의 인자를 갖게 된다.

| 이름                          | 타입                    | 설명                                                                                            |
| ----------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| model                         | object                  | 툴팁을 활성화 시킨 데이터 정보가 모인 객체. 함수의 첫번째 인자.                                 |
| model.x                       | number                  | 데이터의 x 좌표                                                                                 |
| model.y                       | number                  | 데이터의 y 좌표                                                                                 |
| model.category                | string                  | 데이터의 카테고리 값                                                                            |
| model.label                   | string                  | 데이터의 라벨 값                                                                                |
| model.data                    | object                  | 데이터 정보가 모인 객체                                                                         |
| model.data.category           | string                  | 데이터의 카테고리 값                                                                            |
| model.data.color              | string                  | 데이터의 시리즈 색상                                                                            |
| model.data.formattedValue     | string                  | formatter를 거친 데이터 값                                                                      |
| model.data.label              | string                  | 데이터의 라벨 값                                                                                |
| model.data.value              | 해당 차트의 데이터 타입 | 데이터 값                                                                                       |
| defaultTooltipTemplate        | object                  | 기존 HTML 템플릿 객체. 함수의 두번째 인자.                                                      |
| defaultTooltipTemplate.header | string                  | 카테고리가 노출되는 header 영역 html 템플릿                                                     |
| defaultTooltipTemplate.body   | string                  | 데이터가 노출되는 body 영역 html 템플릿                                                         |
| theme                         | object                  | 기존에 사용되던 툴팁의 테마. 함수의 세번째 인자. 구체적인 설명은 툴팁 테마 챕터에서 설명하겠다. |

간단하게 해당 옵션을 응용해 새로운 header를 사용하며, 기존 body를 그대로 사용하는 커스텀 툴팁을 만들어보았다.

```js
const options = {
  tooltip: {
    template: (model, defaultTooltipTemplate, theme) => {
      const { body, header } = defaultTooltipTemplate;
      const { background } = theme;

      return `
        <div style="
          background: ${background};
          width: 140px;
          padding: 0 5px;
          text-align: center;
          color: white;
          ">
            <p>🎊 ${model.category} 🎊</p>
            ${body}
          </div>`;
      `
    }
  }
}
```

해당 코드의 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102183437-2f81ac80-3ef1-11eb-8ebb-438cc153de99.png)

### transition

`tooltip.transition`은 툴팁의 이동 애니매이션을 조절할 수 있는 옵션이다. 작성법은 CSS [transition 속성](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)과 동일하다.

- default: `false`

tooltip의 위치 이동은 [`transform` 속성](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)을 통해 이뤄짐으로 transition-property는 `transform`이 되어야 한다.
옵션을 `true`로 지정할 경우 `transform 0.2s ease`로 움직인다.

간단한 예시로 툴팁을 좀 더 느리게 이동하도록 만들어보았다.

```js
const options = {
  tooltip: {
    transition: 'transform 1s ease-in',
  },
};
```

![tooltip-transition](https://user-images.githubusercontent.com/35371660/105424970-c0376f00-5c8b-11eb-9539-51732688898b.gif)

## theme

현재 제공되고 있는 tooltip의 테마 옵션은 다음과 같다.

```ts
interface TooltipTheme {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  body?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```

| 이름         | 타입   | 설명                                                                                                                            |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| background   | string | 배경 색상                                                                                                                       |
| borderColor  | string | 테두리 선 색상                                                                                                                  |
| borderWidth  | number | 테두리 선 너비                                                                                                                  |
| borderStyle  | string | 테두리 선 스타일. 사용 가능한 옵션은 [MDN 링크](https://developer.mozilla.org/ko/docs/Web/CSS/border-style)에서 확인할 수 있다. |
| borderRadius | number | 둥근 모서리 값                                                                                                                  |
| header       | object | 툴팁 header 영역 스타일                                                                                                         |
| body         | object | 툴팁 body 영역 스타일                                                                                                           |

간단한 예시로 툴팁의 background 색상과 테두리와 관련된 옵션들을 추가해보도록 하겠다.

```js
const options = {
  theme: {
    tooltip: {
      background: '#80CEE1',
      borderColor: '#3065AC',
      borderWidth: 10,
      borderRadius: 20,
      borderStyle: 'double',
    },
  },
};
```

해당 옵션을 적용한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102186142-84bfbd00-3ef5-11eb-8272-aa1093da0e98.png)
