karma-narrow-reporter
=====================

Reporter for narrow width space of screen

![2016-08-05 2 32 30](https://cloud.githubusercontent.com/assets/389021/17427254/0ff51df8-5b1a-11e6-89a8-49917fc3c8d9.png)

* For narrow width space
* List only failed specs (you can see success specs by option)
* Stop running specs if you failed any spec(by option)

### Install this using npm:

    npm install karma-narrow-reporter

### Include this specrunner in your `karma.conf.js` like so:

    reporters: ['narrow'],

### Options


``` javascript

narrowReporter: {
    showSuccess: true, //Show success testcase, default is false
    stopOnFirstFail : true //Stop running testcase when you failed any testcase, default is false
},

```



License
-------
    Copyright (C) 2014 - 2016 Sungho Kim <shirenbeat@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
