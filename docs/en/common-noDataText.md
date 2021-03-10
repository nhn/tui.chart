# No Data Text

No Data Text is options for displaying a message like "No data to display".

![image](https://user-images.githubusercontent.com/35371660/110044680-e53ff700-7d8c-11eb-9cd3-6640296b4211.png)

## Text change

The default text value is "No data to display". Use `options.lang.noData` when you want to process i18n or change the text.

```js
const options = {
  lang: {
    noData: '😭No Data!!😭',
  },
};
```

The result of the above option is shown as shown below.

![image](https://user-images.githubusercontent.com/35371660/110045554-30a6d500-7d8e-11eb-8e64-9b1b9d91ca58.png)

## Theme

The following is a list of themes that can be modified in the No Data Text.

```ts
interface NoDataTheme {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
}
```

| 이름       | 타입             | 설명        |
| ---------- | ---------------- | ----------- |
| fontSize   | string           | font size   |
| fontFamily | string           | font family |
| fontWeight | number \| string | font weight |
| color      | string           | color       |

Let's change the color of the text as a simple example.

```js
const options = {
  theme: {
    noData: {
      fontSize: 30,
      fontFamily: 'Verdana',
      fontWeight: 'bold',
      color: '#3ee',
    },
  },
};
```

The result of the above option is shown as shown below.

![image](https://user-images.githubusercontent.com/35371660/110046386-42d54300-7d8f-11eb-9afd-148dd6738abd.png)
