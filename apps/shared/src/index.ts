import * as utils from './helpers/utils';
import * as reactive from './store/reactive';
import * as scale from './helpers/scale';
import * as color from './helpers/color';
import * as tooltip from './helpers/tooltip';
import * as htmlSanitizer from './helpers/htmlSanitizer';
import EventEmitter from './helpers/eventEmitter';

export default {
  ...utils,
  ...reactive,
  ...scale,
  ...color,
  ...tooltip,
  ...htmlSanitizer,
  EventEmitter,
};
