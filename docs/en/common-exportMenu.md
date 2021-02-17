# Export Menu

Data from all charts can be exported to image (`.jpeg`, `.png`) files and `csv` or `xls` files.

## Options
Options that can be used with export feature are as follows.

```ts
type ExportMenuOptions = {
  visible?: boolean;
  filename?: string;
};
```

## visible
When the `exportMenu.visible` option is set to `false`, the export menu button is not displayed with the chart.

* default: `true`

```js
const options = {
  exportMenu: {
    visible: false
  }
};
```

### filename

The `exportMenu.filename` option can be used to configure the filename of the exported file. If the filename is not set, the file will be exported using the chart's title (`chart.title`) as default. If the chart's title is not set, the file will be exported as `'tui-chart'`.

```js
const options = {
  exportMenu: {
    filename: 'custom_file_name'
  }
};
```
