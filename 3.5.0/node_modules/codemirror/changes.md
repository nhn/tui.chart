## 5.24.0 (2017-02-20)

### Bug fixes

A cursor directly before a line-wrapping break is now drawn before or after the line break depending on which direction you arrived from.

Visual cursor motion in line-wrapped right-to-left text should be much more correct.

Fix bug in handling of read-only marked text.

[shell mode](http://codemirror.net/mode/shell/): Properly tokenize nested parentheses.

[python mode](http://codemirror.net/mode/python/): Support underscores in number literals.

[sass mode](http://codemirror.net/mode/sass/): Uses the full list of CSS properties and keywords from the CSS mode, rather than defining its own incomplete subset.

[css mode](http://codemirror.net/mode/css/): Expose `lineComment` property for LESS and SCSS dialects. Recognize vendor prefixes on pseudo-elements.

[julia mode](http://codemirror.net/mode/julia/): Properly indent `elseif` lines.

[markdown mode](http://codemirror.net/mode/markdown/): Properly recognize the end of fenced code blocks when inside other markup.

[scala mode](http://codemirror.net/mode/clike/): Improve handling of operators containing <code>#</code>, <code>@</code>, and <code>:</code> chars.

[xml mode](http://codemirror.net/mode/xml/): Allow dashes in HTML tag names.

[javascript mode](http://codemirror.net/mode/javascript/): Improve parsing of async methods, TypeScript-style comma-separated superclass lists.

[indent-fold addon](http://codemirror.net/demo/folding.html): Ignore comment lines.

### New features

Positions now support a `sticky` property which determines whether they should be associated with the character before (value `"before"`) or after (value `"after"`) them.

[vim bindings](http://codemirror.net/mode/demo/vim.html): Make it possible to remove built-in bindings through the API.

[comment addon](http://codemirror.net/doc/manual.html#addon_comment): Support a per-mode <code>useInnerComments</code> option to optionally suppress descending to the inner modes to get comment strings.

### Breaking changes

The [sass mode](http://codemirror.net/mode/sass/) now depends on the [css mode](http://codemirror.net/mode/css/).

