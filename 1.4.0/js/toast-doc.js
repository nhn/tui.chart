(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('toast.ui.doc', require('./src/js/fedoc'));

},{"./src/js/fedoc":3}],2:[function(require,module,exports){
/**
 * @fileoverview The content manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, ne-code-snippet
 */
var Content = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} options A set of content options
     *  @param {object} options.element A jquery element for infomation contents
     *  @param {object} options.codeElement A jquery element for code
     *  @param {object} options.content A initialize content
     */
    init: function(options) {
        this.$info = options.element;
        this.$code = options.codeElement;
        this.state = 'info';
        this.$code.hide();
        this.setInfo(options.content);
        this.setEvent();
    },

    /**
     * Set event
     */
    setEvent: function() {
        this.$info.on('click', ne.util.bind(this.onClick, this));
    },

    /**
     * Click event handler
     * @param {object} A jquery event object
     */
    onClick: function(e) {
        var target = e.target,
            tagName = target.tagName.toLowerCase(), 
            readme = this.$info.find('.readme');
        
        if (tagName === 'a') {
            if (readme.length &&  $.contains(readme[0], target)) {
                open(target.href);
            }
            e.preventDefault();
        }
        if (tagName === 'code' && $(target).parent().hasClass('container-source')) {
            this.fire('notify', {
                line: parseInt(target.innerHTML.replace('line', ''), 10) || 1
            });
        }
    },

    /**
     * Set information html to info
     * @param {string} html A html string to change content
     */
    setInfo: function(html) {
        this.$info.html(html);
    },

    /**
     * Set code html to code
     * @param {string} code A code html string to chagne content
     */
    setCode: function(code) {
        this.$code.html(code);
        this.setCodeLine();
    },
    
    /**
     * Set code line
     */
    setCodeLine: function() {
        var source,
            i,
            lineNumber,
            lineId,
            lines,
            totalLines,
            anchorHash;
        prettyPrint();
        source = this.$code.find('.prettyprint');
        if (source && source[0]) {
            anchorHash = document.location.hash.substring(1);
            lines = source[0].getElementsByTagName('li');
            totalLines = lines.length;
            i =  0;
            for (; i < totalLines; i++) {
                lineId = 'line' + i;
                lines[i].id = lineId;
                if (lineId === anchorHash) {
                    lines[i].className += ' selected';
                }
            }
        }
    },

    /**
     * Change tab for state change
     * @param {string} state A state to chagne tab
     */
    changeTab: function(state) {
        if (state === 'info') {
            this._enableInfo();
        } else {
            this._enableCode();
        }
    },

    /**
     * Be enable info state
     */
    _enableInfo: function() {
        this.state = 'info';        
        this.$info.show();
        this.$code.hide();
    },

    /**
     * Be enable code state
     */
    _enableCode: function() {
        this.state = 'code';
        this.$code.show();
        this.$info.hide();
    },

    /**
     * Move to moethod by id
     * @param {string} id A id to move by document.location attribute
     */
    moveTo: function(id) {
        document.location = document.URL.split('#')[0] + id; 
    },

    /**
     * Change tab and move to line (number)
     * @param {number} line The number of line to move
     */
    moveToLine: function(line) {
        this.changeTab('code');
        document.location = document.URL.split('#')[0] + '#line' + line; 
    }
});

ne.util.CustomEvents.mixin(Content);
module.exports = Content;

},{}],3:[function(require,module,exports){
/**
 * @fileoverview The Fedoc element
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, ne-code-snippet
 */

var Menu = require('./menu');
var Content = require('./content');
var Search = require('./search');
var templates = require('./template');

var Fedoc = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} options
     */
    init: function(options) {
        this.menu = new Menu({
            element: options.element.menu,
            tab: options.element.tab
        });
        this.content = new Content({
            element: options.element.content,
            codeElement: options.element.code,
            content: options.data.content
        });
        this.search = new Search({
            element: options.element.search
        });
        this._menu = options.data.menu;
        this.setMenu();
        this.setEvent();
    },

    /**
     * Set events
     */
    setEvent: function() {
        this.content.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('tabChange', ne.util.bind(this.changeTab, this));
        this.search.on('search', ne.util.bind(this.searchList, this));
        this.search.on('notify', ne.util.bind(this.changePage, this));
    },

    /**
     * Search words by lnb data
     * @param {object} data A search data
     */
    searchList: function(data) {
        var word = data.text,
            classes = this._menu.classes,
            namespaces = this._menu.namespaces,
            modules = this._menu.modules,
            interfaces = this._menu.interfaces,
            result = [];
        result = result.concat(
                this.findIn(word, classes),
                this.findIn(word, modules),
                this.findIn(word, interfaces),
                this.findIn(word, namespaces));
        if (!word) {
            result = [];
        }
        data.callback(result);
    },

    /**
     * Find in lnb array
     * @param {string} str A search string
     * @param {array} list A data list
     */
    findIn: function(str, array) {
        var result = [],
            self = this;
        ne.util.forEach(array, function(el) {
            var code = self.getCode(el.meta);
            if (el.methods) {
                ne.util.forEach(el.methods, function(m) {
                    var isMatched = m.id.replace('.', '').toLowerCase().indexOf(str.toLowerCase()) !== -1;
                    if (isMatched && m.access !== 'private') {
                        result.push({
                            id: m.id,
                            label: self.highlighting(m.id, str),
                            group: el.longname,
                            code: code
                        });
                    }
                });
            }
        });
        return result;
    },

    /**
     * Highlight query
     * @param {string} word A word to stress
     * @param {string} string A string include word
     */
    highlighting: function(word, str) {
        var reg = new RegExp(str, 'i', 'g'),
            origin = reg.exec(word)[0];
        return word.replace(reg, '<strong>' + origin + '</strong>');
    },

    /**
     * Chagne Tab
     * @param {object} data A tab data
     */
    changeTab: function(data) {
        this.content.changeTab(data.state);
   },

    /**
     * Set Content page by data
     * @param {object} data A page data
     */
    changePage: function(data) {
        var name = data.name;

        if (name) {
            this.changeTab({state: 'info'});
            this.menu.turnOnInfo();
            if (name.indexOf('module:') >= 0) {
                name = name.replace(/\:/g, '-').replace(/\//g, '_');
            }
            this.content.setInfo(fedoc.content[name + '.html']);
            this.content.setCode(fedoc.content[data.codeName + '.html']);
            this.content.moveTo('#contentTab');
        }
        if (data.line) {
            this.menu.turnOnCode();
            this.content.moveToLine(data.line);
        }
        if (data.href) {
            this.content.moveTo(data.href);
        }
        this.menu.focus(data.name, data.codeName, data.isGlobal ? data.href : null);
        this.search.reset();
    },

    /**
     * Get tutorial menus
     */
    getTutorials: function() {
        var tutorials = this._menu.tutorials,
            html = '',
            list = '',
            self = this;
        if (!tutorials || !tutorials.length) {
            return html;
        }
        ne.util.forEach(tutorials, function(el) {
            list += self.templating(templates.tutorials, {
                name: el.name,
                title: el.title
            });
        });
        html += this.templating(templates.menu, {
            title: 'Samples',
            cname: 'tutorials',
            list: list
        });
        return html;
    },

    /**
     * Make list by data
     * @param {object} data A data for list
     */
    getList: function(data) {
        var self = this,
            html = '';
        data.sort(function(a, b) {
            var fa = self.getPath(a.meta) + a.longname,
                fb = self.getPath(b.meta) + b.longname;
            if(fa < fb) {
                return -1;
            } else if (fa > fb) {
                return 1;
            } else {
                return 0;
            }
        });
        ne.util.forEach(data, function(el) {
            var code = self.getCode(el.meta),
                members = '',
                methods = '',
                mhtml = '',
                tmpl;

            if (el.members) {
                tmpl = templates.list.members;
                members = self._getInnerHTML(el.members, code, el.longname, tmpl);
            }
            if (el.methods) {
                tmpl = templates.list.methods;
                methods = self._getInnerHTML(el.methods, code, el.longname, tmpl);
            }
            html += self.templating(templates.list.outer, {
                longname: el.longname,
                code: code,
                fullname: self.getDirectory(el.meta, el.longname),
                members: members,
                methods: methods
            });
        });
        return html;
    },

    /**
     * Get inner html
     * @param {array} items An item array to apply template
     * @param {string} code A code name
     * @param {string} longname A file name
     * @param {strong} tmpl A template
     */
    _getInnerHTML: function(items, code, longname, tmpl) {
        var html = '',
            mhtml = '',
            self = this;
         ne.util.forEach(items, function(m) {
            if (m.access === 'private') {
                return;
            }
            mhtml += self.templating(templates.list.inner, {
                longname: longname,
                code: code,
                id: m.id,
                label: m.id.replace('.', '')
            });
        });
        if (mhtml) {
            html += self.templating(tmpl, {
                html: mhtml
            });
        }
        return html;
    },

    /**
     * Get class lists
     */
    getClasses: function() {
        var classes = this._menu.classes,
            html = '',
            self = this;
        if (!classes || !classes.length) {
            return html;
        }
        html += this.templating(templates.menu, {
            title: 'Classes',
            cname: 'classes',
            list: this.getList(classes)
        });
        return html;
    },

    /**
     * Get namespaces
     */
    getNamespaces: function() {
        var namespaces = this._menu.namespaces,
            html = '',
            self = this;
        if (!namespaces || !namespaces.length) {
            return html;
        }
        html += this.templating(templates.menu, {
            title: 'Namespaces',
            cname: 'namespaces',
            list: this.getList(namespaces)
        });
        return html;
    },

    /**
     * Get global menus
     */
    getGlobals: function() {
        var globals = this._menu.globals,
            html = '',
            list = '',
            self = this;
        if (!globals || !globals.length) {
            return html;
        }
        ne.util.forEach(globals, function(el) {
            var code = self.getCode(el.meta);
            list += self.templating(templates.global, {
                scope: el.scope,
                code: code,
                id: el.id,
                longname: el.longname
            });
        });
        html = this.templating(templates.menu, {
            title: 'Globals',
            cname: 'globals',
            list: list
        });
        return html;
    },

    /**
     * Get interfaces
     */
    getInterfaces: function() {
        var interfaces = this._menu.interfaces,
            html = '',
            self = this;
        if (!interfaces || !interfaces.length) {
            return html;
        }
        html += this.templating(templates.menu, {
            title: 'Interfaces',
            cname: 'interfaces',
            list: this.getList(interfaces)
        });
        return html;
    },

    /**
     * Get modules
     */
    getModules: function() {
        var html = '',
            modules = this._menu.modules,
            self = this;
        if (!modules || !modules.length) {
            return html;
        }
        html += this.templating(templates.menu, {
            title: 'Modules',
            cname: 'modules',
            list: this.getList(modules)
        });
        return html;
    },

    /**
     * Set menu object to html
     * @todo This might be moved to menu.js
     */
    setMenu: function() {
        var html = '';
        html += this.getTutorials();
        html += this.getClasses();
        html += this.getModules();
        html += this.getNamespaces();
        html += this.getInterfaces();
        html += this.getGlobals();
        this.menu.setMenu(html);
    },

    /**
     * Meta data
     * @param {object} meta The file meta data
     */
    getCode: function(meta) {
        var path = meta.path.split('/src/')[1];
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }
        if (!path) {
            return meta.filename;
        }
        return path.replace(/\//g, '_') + '_' + meta.filename;
    },

    /**
     * Return template string
     */
    templating: function(tmpl, map) {
        var result = tmpl.replace(/\{\{([^\}]+)\}\}/g, function(matchedString, name) {
            return map[name] || '';
        });
        return result;
    },

    getPath: function(meta) {
        var path = meta.path.split('/src/')[1];
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }
        return path || '';
    },

    /**
     * Get file directory info
     * @param {object} meta The file meta data
     * @param {string} name The name of class
     */
    getDirectory: function(meta, name) {
        var path = this.getPath(meta);
        if (!path || name.indexOf('module:') >= 0) {
            return name;
        }
        return '<span class="directory">' + path.replace(/\//g, '/') + '/</span>' + name;
    },

    /**
     * Set content
     * @param {string} html A html string to set content
     */
    setContent: function(html) {
        this.content.setInfo(html);
    },

    /**
     * Pick data from text files
     * @param {string} name A file name
     */
    pickData: function(name, callback) {
        var url = name,
            urlCode = name + '.js';
        this.content.setInfo(fedoc.content[name]);
        this.content.setCode(fedoc.content[urlCode]);
    },
});

module.exports = Fedoc;

},{"./content":2,"./menu":4,"./search":5,"./template":6}],4:[function(require,module,exports){
/**
 * @fileoverview The left menu and tab menu manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, ne-code-snippet
 */
var Menu = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} options The options for menu
     *  @param {object} options.element The jquery wrapping object for left menu
     *  @param {object} options.tab The jquery wrapping object for tab menu 
     */
    init: function(options) {
        this.$menu = options.element;
        this.$tab = options.tab;
        this.current = 'main';
        this.state = 'info';
        this.setEvent();
    },

    /**
     * Set event to page move
     */
    setEvent: function() {
        this.$menu.on('click', ne.util.bind(this.onClickMenu, this));
        this.$tab.on('click', ne.util.bind(this.onClickTab, this));
    },

    /**
     * Tab chnage event
     * @param {object} event The JqueryEvent object
     */
    onClickTab: function(event) {
        var target = $(event.target);
        if (target.hasClass('tabmenu') && !target.hasClass('on')) {
            var isCode = target.hasClass('code');
            this.fire('tabChange', {
                state: isCode ? 'code' : 'info'
            });
            if (isCode) {
                this.turnOnCode();
            } else {
                this.turnOnInfo();
            }
        }
    },

    /**
     * Focus on selected menu
     * @param {string} spec A specification id to find
     * @param {string} code A code line to move
     */
    focus: function(spec, code, href) {
        if (!spec || !code) {
            return;
        }
        this.$menu.find('.listitem').each(function(index) {
            var self = $(this),
                child = self.find('a[href=' + href + ']');   
            self.removeClass('selected');
            if (child.length) {
                self.addClass('selected');
            } else {
                if (href) {
                    return;
                }
                if ((self.attr('data-spec') === spec) && self.attr('data-code')) {
                    self.addClass('selected');
                } 
            }
        });
    },

    /**
     * Focus on specification page 
     */
    turnOnInfo: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.info').addClass('on');
    },

    /**
     * Focus on code page
     */
    turnOnCode: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.code').addClass('on');
    },

    /**
     * Notify for change content
     * @param {object} event A click event object
     */
    onClickMenu: function(event) {
        event.preventDefault();
        var preTarget = $(event.target),
            isTutorial = preTarget.hasClass('tutorialLink'),
            isDirectory = preTarget.hasClass('directory'),
            midTarget = isDirectory ? preTarget.parent() : preTarget,
            href = midTarget.attr('href'),
            target = href ? midTarget.parent() : midTarget,
            isGlobal = target.hasClass('globalitem'),
            spec = target.attr('data-spec'),
            code = target.attr('data-code');
        if (isGlobal && !href) {
            href = target.find('a').attr('href');
        }
        if (isTutorial) {
            window.open(href);
            return;
        }
        if (spec) {
            this.fire('notify', {
                name: spec,
                codeName: code,
                href: href,
                isGlobal: isGlobal
            });
        }
    },

    /**
     * Set menu html
     * @param {string} html A html string to set menu
     */
    setMenu: function(html) {
        this.$menu.html(html);
    },

    /**
     * Select menu with state
     * @param {string} menu A selected menu
     * @param {string} state A tab statement
     */
    select: function(menu, state) {
        this.current = menu;
        this.state = state || 'info';
    },
    
    /**
     * Open selected menu
     * @param {string} menu A selected menu
     */ 
    open: function(menu) {
        this.$menu.find('.' + menu).addClass('unfold'); 
    },

    /**
     * Set tab menu html
     * @param {string} html The html to show up on page
     */
    setTab: function(html) {
        this.$tab.html(html);
    }, 
    
    /**
     * On selected tab
     * @param {string} name A selected tab name
     */
    tabOn: function(name) {
         this.$tab.removeClass();
         this.$tab.addClass('tab tab-' + name);
    }
});

ne.util.CustomEvents.mixin(Menu);
module.exports = Menu;

},{}],5:[function(require,module,exports){
/**
 * @fileoverview The search manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, ne-code-snippet
 */
var Search = ne.util.defineClass({

    /**
     * Special key code
     */
    keyUp: 38,
    keyDown: 40,
    enter: 13,

    /**
     * Initialize
     * @param {object} options
     *  @param {object} options.element A search element
     * @param {object} app Fedec instance
     */
    init: function(options, app) {
        this.$el = options.element;
        this.$input = this.$el.find('input');
        this.$list = this.$el.find('.searchList');
        this.$list.hide();
        this.root = app;
        this._addEvent();
        this.index = null;
    },

    /**
     * Add Events
     */
    _addEvent: function() {
        this.$input.on('keyup', ne.util.bind(function(event) {
            var selected,
                first,
                query;
            if(event.keyCode === this.keyUp || event.keyCode === this.keyDown || event.keyCode === this.enter) {
                if (this.$list.css('display') !== 'none') {
                    if (event.keyCode === this.enter) {
                        selected = this.$list.find('li.on');
                        first = this.$list.find('li').eq(0);
                        if (selected.length !== 0) {
                            this.onSubmit({ target: selected[0] });
                        } else if (first.length !== 0) {
                            this.onSubmit({ target: first[0]});
                        }
                    } else {
                        this.selectItem(event.keyCode);
                    }
                }
            } else {
                this.find(event.target.value); 
            }
        }, this));
    },

    /**
     * Select item by keyboard
     * @param {number} code Keycode
     */
    selectItem: function(code) {
        var len;
        this.$list.find('li').removeClass('on');
        len = this.$list.find('li').length;
        if (!ne.util.isNumber(this.index)) {
            this.index = 0;
        }  else {
            if (code === this.keyUp) {
                this.index = (this.index - 1 + len) % len;
            } else {
                this.index = (this.index + 1) % len;
            }
        }
        this.$list.find('li').eq(this.index).addClass('on');
        this.$input.val(this.$list.find('li.on').find('a').text());
    },
    
    /**
     * Reset search
     */ 
    reset: function() {
        this.$input.val('');
        this.$list.find('li').off('click');
        this.$list.empty();
        this.$list.hide();
        this.index = null;
    },

    /**
     * Submit for change by search result list
     * @param {object} A submit event object
     */ 
    onSubmit: function(event) {
        var target = event.target,
            href,
            spec, 
            code;
        target = this.getTarget(target);
        href = target.find('a').attr('href');
        spec = target.find('span').attr('data-spec');
        code = target.find('span').attr('data-code');
        
        this.fire('notify', {
             codeName: code,
             name: spec,
             href: href
        });
    }, 

    /**
     * Get target
     * @param {object} target The target that have to extract
     */
    getTarget: function(target) {
        var tagName = target.tagName.toUpperCase(),
            $target = $(target);
        if (tagName !== 'LI') {
            return this.getTarget($target.parent()[0]);
        } else {
            return $target;
        }
    },
    
    /**
     * Find word by input text
     * @param {string} text A string to find
     */
    find: function(text) {
        var self = this;
        this.$list.hide();
        this.fire('search', { 
            text: text,
            callback: function(data) {
                self.update(data);
            }
        });
    },

    /**
     * Update search list
     * @param {array} list Search result list 
     */
    update: function(list) {
        var str = ''; 
        ne.util.forEach(list, function(el) {
            str += '<li><span data-spec="' + el.group + '" data-code="' + el.code + '"><a href="#' + el.id + '">' + el.label.replace('.', '') + '</a><span class="group">' + el.group + '</span></span></li>'; 
        });
        this.$list.html(str);
        if (str) {
            this.$list.show();
        }
        this.$list.find('li').on('click', ne.util.bind(this.onSubmit, this)); 
    }
});

ne.util.CustomEvents.mixin(Search);
module.exports = Search;

},{}],6:[function(require,module,exports){
/**
 * @fileoverview The templates for html
 */
var templates = {
    menu: [
        '<h3>{{title}}</h3>',
        '<ul class={{cname}}>',
        '{{list}}',
        '</ul>'
    ].join(''),
    global: '<li class="listitem globalitem" data-spec="{{scope}}" data-code="{{code}}"><a href="#{{id}}">{{longname}}</a></li>',
    tutorials: '<li clsss="tutorials"><a class="tutorialLink" href="tutorial-{{name}}.html" target="_blank">{{title}}</a></li>',
    list: {
        outer: [
            '<li class="listitem" data-spec="{{longname}}" data-code="{{code}}">',
            '<a href="#">{{fullname}}</a>',
            '{{members}}',
            '{{methods}}',
            '</li>'
        ].join(''),
        methods: [
            '<div class="title"><strong>Methods</strong></div>',
            '<ul class="inner">',
            '{{html}}',
            '</ul>'
        ].join(''),
        members: [
            '<div class="title"><strong>Members</strong></div>',
            '<ul class="inner">',
            '{{html}}',
            '</ul>'
        ].join(''),
        inner: '<li class="memberitem" data-spec="{{longname}}" data-code="{{code}}"><a href="#{{id}}">{{label}}</a></li>'
    }
};

module.exports = templates;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb250ZW50LmpzIiwic3JjL2pzL2ZlZG9jLmpzIiwic3JjL2pzL21lbnUuanMiLCJzcmMvanMvc2VhcmNoLmpzIiwic3JjL2pzL3RlbXBsYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0b2FzdC51aS5kb2MnLCByZXF1aXJlKCcuL3NyYy9qcy9mZWRvYycpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgY29udGVudCBtYW5hZ2VyXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50LiBGRSBEZXZlbG9wbWVudCB0ZWFtIChkbF9qYXZhc2NyaXB0QG5obmVudC5jb20pXG4gKiBAZGVwZW5kZW5jeSBqcXVlcnkxLjguMywgbmUtY29kZS1zbmlwcGV0XG4gKi9cbnZhciBDb250ZW50ID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIEEgc2V0IG9mIGNvbnRlbnQgb3B0aW9uc1xuICAgICAqICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5lbGVtZW50IEEganF1ZXJ5IGVsZW1lbnQgZm9yIGluZm9tYXRpb24gY29udGVudHNcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY29kZUVsZW1lbnQgQSBqcXVlcnkgZWxlbWVudCBmb3IgY29kZVxuICAgICAqICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5jb250ZW50IEEgaW5pdGlhbGl6ZSBjb250ZW50XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLiRpbmZvID0gb3B0aW9ucy5lbGVtZW50O1xuICAgICAgICB0aGlzLiRjb2RlID0gb3B0aW9ucy5jb2RlRWxlbWVudDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpbmZvJztcbiAgICAgICAgdGhpcy4kY29kZS5oaWRlKCk7XG4gICAgICAgIHRoaXMuc2V0SW5mbyhvcHRpb25zLmNvbnRlbnQpO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudFxuICAgICAqL1xuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5mby5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gQSBqcXVlcnkgZXZlbnQgb2JqZWN0XG4gICAgICovXG4gICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG4gICAgICAgICAgICB0YWdOYW1lID0gdGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgXG4gICAgICAgICAgICByZWFkbWUgPSB0aGlzLiRpbmZvLmZpbmQoJy5yZWFkbWUnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnYScpIHtcbiAgICAgICAgICAgIGlmIChyZWFkbWUubGVuZ3RoICYmICAkLmNvbnRhaW5zKHJlYWRtZVswXSwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIG9wZW4odGFyZ2V0LmhyZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnY29kZScgJiYgJCh0YXJnZXQpLnBhcmVudCgpLmhhc0NsYXNzKCdjb250YWluZXItc291cmNlJykpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnbm90aWZ5Jywge1xuICAgICAgICAgICAgICAgIGxpbmU6IHBhcnNlSW50KHRhcmdldC5pbm5lckhUTUwucmVwbGFjZSgnbGluZScsICcnKSwgMTApIHx8IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbmZvcm1hdGlvbiBodG1sIHRvIGluZm9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBBIGh0bWwgc3RyaW5nIHRvIGNoYW5nZSBjb250ZW50XG4gICAgICovXG4gICAgc2V0SW5mbzogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiRpbmZvLmh0bWwoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb2RlIGh0bWwgdG8gY29kZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIEEgY29kZSBodG1sIHN0cmluZyB0byBjaGFnbmUgY29udGVudFxuICAgICAqL1xuICAgIHNldENvZGU6IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdGhpcy4kY29kZS5odG1sKGNvZGUpO1xuICAgICAgICB0aGlzLnNldENvZGVMaW5lKCk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBsaW5lXG4gICAgICovXG4gICAgc2V0Q29kZUxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc291cmNlLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGxpbmVOdW1iZXIsXG4gICAgICAgICAgICBsaW5lSWQsXG4gICAgICAgICAgICBsaW5lcyxcbiAgICAgICAgICAgIHRvdGFsTGluZXMsXG4gICAgICAgICAgICBhbmNob3JIYXNoO1xuICAgICAgICBwcmV0dHlQcmludCgpO1xuICAgICAgICBzb3VyY2UgPSB0aGlzLiRjb2RlLmZpbmQoJy5wcmV0dHlwcmludCcpO1xuICAgICAgICBpZiAoc291cmNlICYmIHNvdXJjZVswXSkge1xuICAgICAgICAgICAgYW5jaG9ySGFzaCA9IGRvY3VtZW50LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgbGluZXMgPSBzb3VyY2VbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG4gICAgICAgICAgICB0b3RhbExpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgaSA9ICAwO1xuICAgICAgICAgICAgZm9yICg7IGkgPCB0b3RhbExpbmVzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaW5lSWQgPSAnbGluZScgKyBpO1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldLmlkID0gbGluZUlkO1xuICAgICAgICAgICAgICAgIGlmIChsaW5lSWQgPT09IGFuY2hvckhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbaV0uY2xhc3NOYW1lICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGFiIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgQSBzdGF0ZSB0byBjaGFnbmUgdGFiXG4gICAgICovXG4gICAgY2hhbmdlVGFiOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdpbmZvJykge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlSW5mbygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlQ29kZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJlIGVuYWJsZSBpbmZvIHN0YXRlXG4gICAgICovXG4gICAgX2VuYWJsZUluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nOyAgICAgICAgXG4gICAgICAgIHRoaXMuJGluZm8uc2hvdygpO1xuICAgICAgICB0aGlzLiRjb2RlLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmUgZW5hYmxlIGNvZGUgc3RhdGVcbiAgICAgKi9cbiAgICBfZW5hYmxlQ29kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnY29kZSc7XG4gICAgICAgIHRoaXMuJGNvZGUuc2hvdygpO1xuICAgICAgICB0aGlzLiRpbmZvLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBtb2V0aG9kIGJ5IGlkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIEEgaWQgdG8gbW92ZSBieSBkb2N1bWVudC5sb2NhdGlvbiBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBtb3ZlVG86IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gZG9jdW1lbnQuVVJMLnNwbGl0KCcjJylbMF0gKyBpZDsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0YWIgYW5kIG1vdmUgdG8gbGluZSAobnVtYmVyKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRoZSBudW1iZXIgb2YgbGluZSB0byBtb3ZlXG4gICAgICovXG4gICAgbW92ZVRvTGluZTogZnVuY3Rpb24obGluZSkge1xuICAgICAgICB0aGlzLmNoYW5nZVRhYignY29kZScpO1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTC5zcGxpdCgnIycpWzBdICsgJyNsaW5lJyArIGxpbmU7IFxuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihDb250ZW50KTtcbm1vZHVsZS5leHBvcnRzID0gQ29udGVudDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgRmVkb2MgZWxlbWVudFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudC4gRkUgRGV2ZWxvcG1lbnQgdGVhbSAoZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5MS44LjMsIG5lLWNvZGUtc25pcHBldFxuICovXG5cbnZhciBNZW51ID0gcmVxdWlyZSgnLi9tZW51Jyk7XG52YXIgQ29udGVudCA9IHJlcXVpcmUoJy4vY29udGVudCcpO1xudmFyIFNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJyk7XG52YXIgdGVtcGxhdGVzID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xuXG52YXIgRmVkb2MgPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubWVudSA9IG5ldyBNZW51KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbnMuZWxlbWVudC5tZW51LFxuICAgICAgICAgICAgdGFiOiBvcHRpb25zLmVsZW1lbnQudGFiXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBuZXcgQ29udGVudCh7XG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb25zLmVsZW1lbnQuY29udGVudCxcbiAgICAgICAgICAgIGNvZGVFbGVtZW50OiBvcHRpb25zLmVsZW1lbnQuY29kZSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbnMuZGF0YS5jb250ZW50XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNlYXJjaCA9IG5ldyBTZWFyY2goe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9ucy5lbGVtZW50LnNlYXJjaFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbWVudSA9IG9wdGlvbnMuZGF0YS5tZW51O1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnRzXG4gICAgICovXG4gICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCdub3RpZnknLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMubWVudS5vbigndGFiQ2hhbmdlJywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlVGFiLCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2VhcmNoLm9uKCdzZWFyY2gnLCBuZS51dGlsLmJpbmQodGhpcy5zZWFyY2hMaXN0LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2VhcmNoLm9uKCdub3RpZnknLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB3b3JkcyBieSBsbmIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIEEgc2VhcmNoIGRhdGFcbiAgICAgKi9cbiAgICBzZWFyY2hMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciB3b3JkID0gZGF0YS50ZXh0LFxuICAgICAgICAgICAgY2xhc3NlcyA9IHRoaXMuX21lbnUuY2xhc3NlcyxcbiAgICAgICAgICAgIG5hbWVzcGFjZXMgPSB0aGlzLl9tZW51Lm5hbWVzcGFjZXMsXG4gICAgICAgICAgICBtb2R1bGVzID0gdGhpcy5fbWVudS5tb2R1bGVzLFxuICAgICAgICAgICAgaW50ZXJmYWNlcyA9IHRoaXMuX21lbnUuaW50ZXJmYWNlcyxcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KFxuICAgICAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIGNsYXNzZXMpLFxuICAgICAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIG1vZHVsZXMpLFxuICAgICAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIGludGVyZmFjZXMpLFxuICAgICAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIG5hbWVzcGFjZXMpKTtcbiAgICAgICAgaWYgKCF3b3JkKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhLmNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgaW4gbG5iIGFycmF5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBBIHNlYXJjaCBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBsaXN0IEEgZGF0YSBsaXN0XG4gICAgICovXG4gICAgZmluZEluOiBmdW5jdGlvbihzdHIsIGFycmF5KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGlmIChlbC5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGVsLm1ldGhvZHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzTWF0Y2hlZCA9IG0uaWQucmVwbGFjZSgnLicsICcnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTWF0Y2hlZCAmJiBtLmFjY2VzcyAhPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHNlbGYuaGlnaGxpZ2h0aW5nKG0uaWQsIHN0ciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IGVsLmxvbmduYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWdobGlnaHQgcXVlcnlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29yZCBBIHdvcmQgdG8gc3RyZXNzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBBIHN0cmluZyBpbmNsdWRlIHdvcmRcbiAgICAgKi9cbiAgICBoaWdobGlnaHRpbmc6IGZ1bmN0aW9uKHdvcmQsIHN0cikge1xuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChzdHIsICdpJywgJ2cnKSxcbiAgICAgICAgICAgIG9yaWdpbiA9IHJlZy5leGVjKHdvcmQpWzBdO1xuICAgICAgICByZXR1cm4gd29yZC5yZXBsYWNlKHJlZywgJzxzdHJvbmc+JyArIG9yaWdpbiArICc8L3N0cm9uZz4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhZ25lIFRhYlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIEEgdGFiIGRhdGFcbiAgICAgKi9cbiAgICBjaGFuZ2VUYWI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhpcy5jb250ZW50LmNoYW5nZVRhYihkYXRhLnN0YXRlKTtcbiAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ29udGVudCBwYWdlIGJ5IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBBIHBhZ2UgZGF0YVxuICAgICAqL1xuICAgIGNoYW5nZVBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBkYXRhLm5hbWU7XG5cbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlVGFiKHtzdGF0ZTogJ2luZm8nfSk7XG4gICAgICAgICAgICB0aGlzLm1lbnUudHVybk9uSW5mbygpO1xuICAgICAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignbW9kdWxlOicpID49IDApIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9cXDovZywgJy0nKS5yZXBsYWNlKC9cXC8vZywgJ18nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGZlZG9jLmNvbnRlbnRbbmFtZSArICcuaHRtbCddKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5zZXRDb2RlKGZlZG9jLmNvbnRlbnRbZGF0YS5jb2RlTmFtZSArICcuaHRtbCddKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5tb3ZlVG8oJyNjb250ZW50VGFiJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEubGluZSkge1xuICAgICAgICAgICAgdGhpcy5tZW51LnR1cm5PbkNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5tb3ZlVG9MaW5lKGRhdGEubGluZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEuaHJlZikge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUbyhkYXRhLmhyZWYpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVudS5mb2N1cyhkYXRhLm5hbWUsIGRhdGEuY29kZU5hbWUsIGRhdGEuaXNHbG9iYWwgPyBkYXRhLmhyZWYgOiBudWxsKTtcbiAgICAgICAgdGhpcy5zZWFyY2gucmVzZXQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHR1dG9yaWFsIG1lbnVzXG4gICAgICovXG4gICAgZ2V0VHV0b3JpYWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHR1dG9yaWFscyA9IHRoaXMuX21lbnUudHV0b3JpYWxzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgbGlzdCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghdHV0b3JpYWxzIHx8ICF0dXRvcmlhbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuICAgICAgICBuZS51dGlsLmZvckVhY2godHV0b3JpYWxzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgbGlzdCArPSBzZWxmLnRlbXBsYXRpbmcodGVtcGxhdGVzLnR1dG9yaWFscywge1xuICAgICAgICAgICAgICAgIG5hbWU6IGVsLm5hbWUsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGVsLnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ1NhbXBsZXMnLFxuICAgICAgICAgICAgY25hbWU6ICd0dXRvcmlhbHMnLFxuICAgICAgICAgICAgbGlzdDogbGlzdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgbGlzdCBieSBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgQSBkYXRhIGZvciBsaXN0XG4gICAgICovXG4gICAgZ2V0TGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBodG1sID0gJyc7XG4gICAgICAgIGRhdGEuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgZmEgPSBzZWxmLmdldFBhdGgoYS5tZXRhKSArIGEubG9uZ25hbWUsXG4gICAgICAgICAgICAgICAgZmIgPSBzZWxmLmdldFBhdGgoYi5tZXRhKSArIGIubG9uZ25hbWU7XG4gICAgICAgICAgICBpZihmYSA8IGZiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmYSA+IGZiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKSxcbiAgICAgICAgICAgICAgICBtZW1iZXJzID0gJycsXG4gICAgICAgICAgICAgICAgbWV0aG9kcyA9ICcnLFxuICAgICAgICAgICAgICAgIG1odG1sID0gJycsXG4gICAgICAgICAgICAgICAgdG1wbDtcblxuICAgICAgICAgICAgaWYgKGVsLm1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0bXBsID0gdGVtcGxhdGVzLmxpc3QubWVtYmVycztcbiAgICAgICAgICAgICAgICBtZW1iZXJzID0gc2VsZi5fZ2V0SW5uZXJIVE1MKGVsLm1lbWJlcnMsIGNvZGUsIGVsLmxvbmduYW1lLCB0bXBsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbC5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgdG1wbCA9IHRlbXBsYXRlcy5saXN0Lm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgbWV0aG9kcyA9IHNlbGYuX2dldElubmVySFRNTChlbC5tZXRob2RzLCBjb2RlLCBlbC5sb25nbmFtZSwgdG1wbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9IHNlbGYudGVtcGxhdGluZyh0ZW1wbGF0ZXMubGlzdC5vdXRlciwge1xuICAgICAgICAgICAgICAgIGxvbmduYW1lOiBlbC5sb25nbmFtZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgICAgIGZ1bGxuYW1lOiBzZWxmLmdldERpcmVjdG9yeShlbC5tZXRhLCBlbC5sb25nbmFtZSksXG4gICAgICAgICAgICAgICAgbWVtYmVyczogbWVtYmVycyxcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZXRob2RzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW5uZXIgaHRtbFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGl0ZW1zIEFuIGl0ZW0gYXJyYXkgdG8gYXBwbHkgdGVtcGxhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBBIGNvZGUgbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsb25nbmFtZSBBIGZpbGUgbmFtZVxuICAgICAqIEBwYXJhbSB7c3Ryb25nfSB0bXBsIEEgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5uZXJIVE1MOiBmdW5jdGlvbihpdGVtcywgY29kZSwgbG9uZ25hbWUsIHRtcGwpIHtcbiAgICAgICAgdmFyIGh0bWwgPSAnJyxcbiAgICAgICAgICAgIG1odG1sID0gJycsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgaWYgKG0uYWNjZXNzID09PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtaHRtbCArPSBzZWxmLnRlbXBsYXRpbmcodGVtcGxhdGVzLmxpc3QuaW5uZXIsIHtcbiAgICAgICAgICAgICAgICBsb25nbmFtZTogbG9uZ25hbWUsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBpZDogbS5pZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogbS5pZC5yZXBsYWNlKCcuJywgJycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtaHRtbCkge1xuICAgICAgICAgICAgaHRtbCArPSBzZWxmLnRlbXBsYXRpbmcodG1wbCwge1xuICAgICAgICAgICAgICAgIGh0bWw6IG1odG1sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIGxpc3RzXG4gICAgICovXG4gICAgZ2V0Q2xhc3NlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghY2xhc3NlcyB8fCAhY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0NsYXNzZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdjbGFzc2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChjbGFzc2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBuYW1lc3BhY2VzXG4gICAgICovXG4gICAgZ2V0TmFtZXNwYWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuYW1lc3BhY2VzID0gdGhpcy5fbWVudS5uYW1lc3BhY2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghbmFtZXNwYWNlcyB8fCAhbmFtZXNwYWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ05hbWVzcGFjZXMnLFxuICAgICAgICAgICAgY25hbWU6ICduYW1lc3BhY2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChuYW1lc3BhY2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBnbG9iYWwgbWVudXNcbiAgICAgKi9cbiAgICBnZXRHbG9iYWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdsb2JhbHMgPSB0aGlzLl9tZW51Lmdsb2JhbHMsXG4gICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICBsaXN0ID0gJycsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFnbG9iYWxzIHx8ICFnbG9iYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGdsb2JhbHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGxpc3QgKz0gc2VsZi50ZW1wbGF0aW5nKHRlbXBsYXRlcy5nbG9iYWwsIHtcbiAgICAgICAgICAgICAgICBzY29wZTogZWwuc2NvcGUsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBpZDogZWwuaWQsXG4gICAgICAgICAgICAgICAgbG9uZ25hbWU6IGVsLmxvbmduYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgPSB0aGlzLnRlbXBsYXRpbmcodGVtcGxhdGVzLm1lbnUsIHtcbiAgICAgICAgICAgIHRpdGxlOiAnR2xvYmFscycsXG4gICAgICAgICAgICBjbmFtZTogJ2dsb2JhbHMnLFxuICAgICAgICAgICAgbGlzdDogbGlzdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbnRlcmZhY2VzXG4gICAgICovXG4gICAgZ2V0SW50ZXJmYWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnRlcmZhY2VzID0gdGhpcy5fbWVudS5pbnRlcmZhY2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghaW50ZXJmYWNlcyB8fCAhaW50ZXJmYWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0ludGVyZmFjZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdpbnRlcmZhY2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChpbnRlcmZhY2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBtb2R1bGVzXG4gICAgICovXG4gICAgZ2V0TW9kdWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICBtb2R1bGVzID0gdGhpcy5fbWVudS5tb2R1bGVzLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghbW9kdWxlcyB8fCAhbW9kdWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ01vZHVsZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChtb2R1bGVzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBtZW51IG9iamVjdCB0byBodG1sXG4gICAgICogQHRvZG8gVGhpcyBtaWdodCBiZSBtb3ZlZCB0byBtZW51LmpzXG4gICAgICovXG4gICAgc2V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJyc7XG4gICAgICAgIGh0bWwgKz0gdGhpcy5nZXRUdXRvcmlhbHMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldENsYXNzZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldE1vZHVsZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldE5hbWVzcGFjZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldEludGVyZmFjZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldEdsb2JhbHMoKTtcbiAgICAgICAgdGhpcy5tZW51LnNldE1lbnUoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ldGEgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhIFRoZSBmaWxlIG1ldGEgZGF0YVxuICAgICAqL1xuICAgIGdldENvZGU6IGZ1bmN0aW9uKG1ldGEpIHtcbiAgICAgICAgdmFyIHBhdGggPSBtZXRhLnBhdGguc3BsaXQoJy9zcmMvJylbMV07XG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRhLmZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXycpICsgJ18nICsgbWV0YS5maWxlbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRlbXBsYXRlIHN0cmluZ1xuICAgICAqL1xuICAgIHRlbXBsYXRpbmc6IGZ1bmN0aW9uKHRtcGwsIG1hcCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdG1wbC5yZXBsYWNlKC9cXHtcXHsoW15cXH1dKylcXH1cXH0vZywgZnVuY3Rpb24obWF0Y2hlZFN0cmluZywgbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXSB8fCAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGdldFBhdGg6IGZ1bmN0aW9uKG1ldGEpIHtcbiAgICAgICAgdmFyIHBhdGggPSBtZXRhLnBhdGguc3BsaXQoJy9zcmMvJylbMV07XG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aCB8fCAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZpbGUgZGlyZWN0b3J5IGluZm9cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YSBUaGUgZmlsZSBtZXRhIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiBjbGFzc1xuICAgICAqL1xuICAgIGdldERpcmVjdG9yeTogZnVuY3Rpb24obWV0YSwgbmFtZSkge1xuICAgICAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aChtZXRhKTtcbiAgICAgICAgaWYgKCFwYXRoIHx8IG5hbWUuaW5kZXhPZignbW9kdWxlOicpID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJkaXJlY3RvcnlcIj4nICsgcGF0aC5yZXBsYWNlKC9cXC8vZywgJy8nKSArICcvPC9zcGFuPicgKyBuYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29udGVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaHRtbCBzdHJpbmcgdG8gc2V0IGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb250ZW50OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIGRhdGEgZnJvbSB0ZXh0IGZpbGVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICBwaWNrRGF0YTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHVybCA9IG5hbWUsXG4gICAgICAgICAgICB1cmxDb2RlID0gbmFtZSArICcuanMnO1xuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhmZWRvYy5jb250ZW50W25hbWVdKTtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFt1cmxDb2RlXSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZlZG9jO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBsZWZ0IG1lbnUgYW5kIHRhYiBtZW51IG1hbmFnZXJcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQuIEZFIERldmVsb3BtZW50IHRlYW0gKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeTEuOC4zLCBuZS1jb2RlLXNuaXBwZXRcbiAqL1xudmFyIE1lbnUgPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgZm9yIG1lbnVcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZWxlbWVudCBUaGUganF1ZXJ5IHdyYXBwaW5nIG9iamVjdCBmb3IgbGVmdCBtZW51XG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRhYiBUaGUganF1ZXJ5IHdyYXBwaW5nIG9iamVjdCBmb3IgdGFiIG1lbnUgXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLiRtZW51ID0gb3B0aW9ucy5lbGVtZW50O1xuICAgICAgICB0aGlzLiR0YWIgPSBvcHRpb25zLnRhYjtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gJ21haW4nO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudCB0byBwYWdlIG1vdmVcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJG1lbnUub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25DbGlja01lbnUsIHRoaXMpKTtcbiAgICAgICAgdGhpcy4kdGFiLm9uKCdjbGljaycsIG5lLnV0aWwuYmluZCh0aGlzLm9uQ2xpY2tUYWIsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGFiIGNobmFnZSBldmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgSnF1ZXJ5RXZlbnQgb2JqZWN0XG4gICAgICovXG4gICAgb25DbGlja1RhYjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygndGFibWVudScpICYmICF0YXJnZXQuaGFzQ2xhc3MoJ29uJykpIHtcbiAgICAgICAgICAgIHZhciBpc0NvZGUgPSB0YXJnZXQuaGFzQ2xhc3MoJ2NvZGUnKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgndGFiQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBpc0NvZGUgPyAnY29kZScgOiAnaW5mbydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzQ29kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm5PbkluZm8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb2N1cyBvbiBzZWxlY3RlZCBtZW51XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNwZWMgQSBzcGVjaWZpY2F0aW9uIGlkIHRvIGZpbmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBBIGNvZGUgbGluZSB0byBtb3ZlXG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKHNwZWMsIGNvZGUsIGhyZWYpIHtcbiAgICAgICAgaWYgKCFzcGVjIHx8ICFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kbWVudS5maW5kKCcubGlzdGl0ZW0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgY2hpbGQgPSBzZWxmLmZpbmQoJ2FbaHJlZj0nICsgaHJlZiArICddJyk7ICAgXG4gICAgICAgICAgICBzZWxmLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgaWYgKGNoaWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChzZWxmLmF0dHIoJ2RhdGEtc3BlYycpID09PSBzcGVjKSAmJiBzZWxmLmF0dHIoJ2RhdGEtY29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIHNwZWNpZmljYXRpb24gcGFnZSBcbiAgICAgKi9cbiAgICB0dXJuT25JbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhYm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kdGFiLmZpbmQoJy5pbmZvJykuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIGNvZGUgcGFnZVxuICAgICAqL1xuICAgIHR1cm5PbkNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm90aWZ5IGZvciBjaGFuZ2UgY29udGVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBBIGNsaWNrIGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2tNZW51OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcHJlVGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNUdXRvcmlhbCA9IHByZVRhcmdldC5oYXNDbGFzcygndHV0b3JpYWxMaW5rJyksXG4gICAgICAgICAgICBpc0RpcmVjdG9yeSA9IHByZVRhcmdldC5oYXNDbGFzcygnZGlyZWN0b3J5JyksXG4gICAgICAgICAgICBtaWRUYXJnZXQgPSBpc0RpcmVjdG9yeSA/IHByZVRhcmdldC5wYXJlbnQoKSA6IHByZVRhcmdldCxcbiAgICAgICAgICAgIGhyZWYgPSBtaWRUYXJnZXQuYXR0cignaHJlZicpLFxuICAgICAgICAgICAgdGFyZ2V0ID0gaHJlZiA/IG1pZFRhcmdldC5wYXJlbnQoKSA6IG1pZFRhcmdldCxcbiAgICAgICAgICAgIGlzR2xvYmFsID0gdGFyZ2V0Lmhhc0NsYXNzKCdnbG9iYWxpdGVtJyksXG4gICAgICAgICAgICBzcGVjID0gdGFyZ2V0LmF0dHIoJ2RhdGEtc3BlYycpLFxuICAgICAgICAgICAgY29kZSA9IHRhcmdldC5hdHRyKCdkYXRhLWNvZGUnKTtcbiAgICAgICAgaWYgKGlzR2xvYmFsICYmICFocmVmKSB7XG4gICAgICAgICAgICBocmVmID0gdGFyZ2V0LmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVHV0b3JpYWwpIHtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGhyZWYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcGVjKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBzcGVjLFxuICAgICAgICAgICAgICAgIGNvZGVOYW1lOiBjb2RlLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWYsXG4gICAgICAgICAgICAgICAgaXNHbG9iYWw6IGlzR2xvYmFsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBodG1sXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBodG1sIHN0cmluZyB0byBzZXQgbWVudVxuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kbWVudS5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgbWVudSB3aXRoIHN0YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lbnUgQSBzZWxlY3RlZCBtZW51XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIEEgdGFiIHN0YXRlbWVudFxuICAgICAqL1xuICAgIHNlbGVjdDogZnVuY3Rpb24obWVudSwgc3RhdGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbWVudTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8ICdpbmZvJztcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIE9wZW4gc2VsZWN0ZWQgbWVudVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZW51IEEgc2VsZWN0ZWQgbWVudVxuICAgICAqLyBcbiAgICBvcGVuOiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuJG1lbnUuZmluZCgnLicgKyBtZW51KS5hZGRDbGFzcygndW5mb2xkJyk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGFiIG1lbnUgaHRtbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIFRoZSBodG1sIHRvIHNob3cgdXAgb24gcGFnZVxuICAgICAqL1xuICAgIHNldFRhYjogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiR0YWIuaHRtbChodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBPbiBzZWxlY3RlZCB0YWJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIHNlbGVjdGVkIHRhYiBuYW1lXG4gICAgICovXG4gICAgdGFiT246IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgIHRoaXMuJHRhYi5yZW1vdmVDbGFzcygpO1xuICAgICAgICAgdGhpcy4kdGFiLmFkZENsYXNzKCd0YWIgdGFiLScgKyBuYW1lKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oTWVudSk7XG5tb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHNlYXJjaCBtYW5hZ2VyXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50LiBGRSBEZXZlbG9wbWVudCB0ZWFtIChkbF9qYXZhc2NyaXB0QG5obmVudC5jb20pXG4gKiBAZGVwZW5kZW5jeSBqcXVlcnkxLjguMywgbmUtY29kZS1zbmlwcGV0XG4gKi9cbnZhciBTZWFyY2ggPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcblxuICAgIC8qKlxuICAgICAqIFNwZWNpYWwga2V5IGNvZGVcbiAgICAgKi9cbiAgICBrZXlVcDogMzgsXG4gICAga2V5RG93bjogNDAsXG4gICAgZW50ZXI6IDEzLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmVsZW1lbnQgQSBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcHAgRmVkZWMgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCBhcHApIHtcbiAgICAgICAgdGhpcy4kZWwgPSBvcHRpb25zLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgdGhpcy4kbGlzdCA9IHRoaXMuJGVsLmZpbmQoJy5zZWFyY2hMaXN0Jyk7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLnJvb3QgPSBhcHA7XG4gICAgICAgIHRoaXMuX2FkZEV2ZW50KCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgRXZlbnRzXG4gICAgICovXG4gICAgX2FkZEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5wdXQub24oJ2tleXVwJywgbmUudXRpbC5iaW5kKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgZmlyc3QsXG4gICAgICAgICAgICAgICAgcXVlcnk7XG4gICAgICAgICAgICBpZihldmVudC5rZXlDb2RlID09PSB0aGlzLmtleVVwIHx8IGV2ZW50LmtleUNvZGUgPT09IHRoaXMua2V5RG93biB8fCBldmVudC5rZXlDb2RlID09PSB0aGlzLmVudGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGxpc3QuY3NzKCdkaXNwbGF5JykgIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5lbnRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGlzLiRsaXN0LmZpbmQoJ2xpLm9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHRoaXMuJGxpc3QuZmluZCgnbGknKS5lcSgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3VibWl0KHsgdGFyZ2V0OiBzZWxlY3RlZFswXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlyc3QubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdCh7IHRhcmdldDogZmlyc3RbMF19KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbShldmVudC5rZXlDb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCBpdGVtIGJ5IGtleWJvYXJkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgS2V5Y29kZVxuICAgICAqL1xuICAgIHNlbGVjdEl0ZW06IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICBsZW4gPSB0aGlzLiRsaXN0LmZpbmQoJ2xpJykubGVuZ3RoO1xuICAgICAgICBpZiAoIW5lLnV0aWwuaXNOdW1iZXIodGhpcy5pbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgICB9ICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb2RlID09PSB0aGlzLmtleVVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4IC0gMSArIGxlbikgJSBsZW47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCArIDEpICUgbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5lcSh0aGlzLmluZGV4KS5hZGRDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsKHRoaXMuJGxpc3QuZmluZCgnbGkub24nKS5maW5kKCdhJykudGV4dCgpKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHNlYXJjaFxuICAgICAqLyBcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGlucHV0LnZhbCgnJyk7XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5vZmYoJ2NsaWNrJyk7XG4gICAgICAgIHRoaXMuJGxpc3QuZW1wdHkoKTtcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgZm9yIGNoYW5nZSBieSBzZWFyY2ggcmVzdWx0IGxpc3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gQSBzdWJtaXQgZXZlbnQgb2JqZWN0XG4gICAgICovIFxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgIHNwZWMsIFxuICAgICAgICAgICAgY29kZTtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgaHJlZiA9IHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICBzcGVjID0gdGFyZ2V0LmZpbmQoJ3NwYW4nKS5hdHRyKCdkYXRhLXNwZWMnKTtcbiAgICAgICAgY29kZSA9IHRhcmdldC5maW5kKCdzcGFuJykuYXR0cignZGF0YS1jb2RlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICBjb2RlTmFtZTogY29kZSxcbiAgICAgICAgICAgICBuYW1lOiBzcGVjLFxuICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgfSk7XG4gICAgfSwgXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGFyZ2V0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IHRoYXQgaGF2ZSB0byBleHRyYWN0XG4gICAgICovXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgJHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhZ05hbWUgIT09ICdMSScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRhcmdldCgkdGFyZ2V0LnBhcmVudCgpWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaW5kIHdvcmQgYnkgaW5wdXQgdGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IEEgc3RyaW5nIHRvIGZpbmRcbiAgICAgKi9cbiAgICBmaW5kOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2VhcmNoJywgeyBcbiAgICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNlYXJjaCBsaXN0XG4gICAgICogQHBhcmFtIHthcnJheX0gbGlzdCBTZWFyY2ggcmVzdWx0IGxpc3QgXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgIHZhciBzdHIgPSAnJzsgXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgc3RyICs9ICc8bGk+PHNwYW4gZGF0YS1zcGVjPVwiJyArIGVsLmdyb3VwICsgJ1wiIGRhdGEtY29kZT1cIicgKyBlbC5jb2RlICsgJ1wiPjxhIGhyZWY9XCIjJyArIGVsLmlkICsgJ1wiPicgKyBlbC5sYWJlbC5yZXBsYWNlKCcuJywgJycpICsgJzwvYT48c3BhbiBjbGFzcz1cImdyb3VwXCI+JyArIGVsLmdyb3VwICsgJzwvc3Bhbj48L3NwYW4+PC9saT4nOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGxpc3QuaHRtbChzdHIpO1xuICAgICAgICBpZiAoc3RyKSB7XG4gICAgICAgICAgICB0aGlzLiRsaXN0LnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25TdWJtaXQsIHRoaXMpKTsgXG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlYXJjaCk7XG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgdGVtcGxhdGVzIGZvciBodG1sXG4gKi9cbnZhciB0ZW1wbGF0ZXMgPSB7XG4gICAgbWVudTogW1xuICAgICAgICAnPGgzPnt7dGl0bGV9fTwvaDM+JyxcbiAgICAgICAgJzx1bCBjbGFzcz17e2NuYW1lfX0+JyxcbiAgICAgICAgJ3t7bGlzdH19JyxcbiAgICAgICAgJzwvdWw+J1xuICAgIF0uam9pbignJyksXG4gICAgZ2xvYmFsOiAnPGxpIGNsYXNzPVwibGlzdGl0ZW0gZ2xvYmFsaXRlbVwiIGRhdGEtc3BlYz1cInt7c2NvcGV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xvbmduYW1lfX08L2E+PC9saT4nLFxuICAgIHR1dG9yaWFsczogJzxsaSBjbHNzcz1cInR1dG9yaWFsc1wiPjxhIGNsYXNzPVwidHV0b3JpYWxMaW5rXCIgaHJlZj1cInR1dG9yaWFsLXt7bmFtZX19Lmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+PC9saT4nLFxuICAgIGxpc3Q6IHtcbiAgICAgICAgb3V0ZXI6IFtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+JyxcbiAgICAgICAgICAgICc8YSBocmVmPVwiI1wiPnt7ZnVsbG5hbWV9fTwvYT4nLFxuICAgICAgICAgICAgJ3t7bWVtYmVyc319JyxcbiAgICAgICAgICAgICd7e21ldGhvZHN9fScsXG4gICAgICAgICAgICAnPC9saT4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1ldGhvZHM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1ldGhvZHM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1lbWJlcnM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIGlubmVyOiAnPGxpIGNsYXNzPVwibWVtYmVyaXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xhYmVsfX08L2E+PC9saT4nXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZXM7XG4iXX0=
