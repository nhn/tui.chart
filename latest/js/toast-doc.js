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
        var html;
        if (data.name) {
            this.changeTab({state: 'info'});
            this.menu.turnOnInfo();
            this.content.setInfo(fedoc.content[data.name + '.html']);
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
        if (!path) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb250ZW50LmpzIiwic3JjL2pzL2ZlZG9jLmpzIiwic3JjL2pzL21lbnUuanMiLCJzcmMvanMvc2VhcmNoLmpzIiwic3JjL2pzL3RlbXBsYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJuZS51dGlsLmRlZmluZU5hbWVzcGFjZSgndG9hc3QudWkuZG9jJywgcmVxdWlyZSgnLi9zcmMvanMvZmVkb2MnKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGNvbnRlbnQgbWFuYWdlclxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudC4gRkUgRGV2ZWxvcG1lbnQgdGVhbSAoZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5MS44LjMsIG5lLWNvZGUtc25pcHBldFxuICovXG52YXIgQ29udGVudCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBIHNldCBvZiBjb250ZW50IG9wdGlvbnNcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZWxlbWVudCBBIGpxdWVyeSBlbGVtZW50IGZvciBpbmZvbWF0aW9uIGNvbnRlbnRzXG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNvZGVFbGVtZW50IEEganF1ZXJ5IGVsZW1lbnQgZm9yIGNvZGVcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY29udGVudCBBIGluaXRpYWxpemUgY29udGVudFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy4kaW5mbyA9IG9wdGlvbnMuZWxlbWVudDtcbiAgICAgICAgdGhpcy4kY29kZSA9IG9wdGlvbnMuY29kZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgICAgICB0aGlzLnNldEluZm8ob3B0aW9ucy5jb250ZW50KTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnRcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGluZm8ub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25DbGljaywgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IEEganF1ZXJ5IGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICAgICAgdGFnTmFtZSA9IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCksIFxuICAgICAgICAgICAgcmVhZG1lID0gdGhpcy4kaW5mby5maW5kKCcucmVhZG1lJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2EnKSB7XG4gICAgICAgICAgICBpZiAocmVhZG1lLmxlbmd0aCAmJiAgJC5jb250YWlucyhyZWFkbWVbMF0sIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBvcGVuKHRhcmdldC5ocmVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2NvZGUnICYmICQodGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnY29udGFpbmVyLXNvdXJjZScpKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBsaW5lOiBwYXJzZUludCh0YXJnZXQuaW5uZXJIVE1MLnJlcGxhY2UoJ2xpbmUnLCAnJyksIDEwKSB8fCAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5mb3JtYXRpb24gaHRtbCB0byBpbmZvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBodG1sIHN0cmluZyB0byBjaGFuZ2UgY29udGVudFxuICAgICAqL1xuICAgIHNldEluZm86IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kaW5mby5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBodG1sIHRvIGNvZGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBBIGNvZGUgaHRtbCBzdHJpbmcgdG8gY2hhZ25lIGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb2RlOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgICAgIHRoaXMuJGNvZGUuaHRtbChjb2RlKTtcbiAgICAgICAgdGhpcy5zZXRDb2RlTGluZSgpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGNvZGUgbGluZVxuICAgICAqL1xuICAgIHNldENvZGVMaW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNvdXJjZSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBsaW5lTnVtYmVyLFxuICAgICAgICAgICAgbGluZUlkLFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICB0b3RhbExpbmVzLFxuICAgICAgICAgICAgYW5jaG9ySGFzaDtcbiAgICAgICAgcHJldHR5UHJpbnQoKTtcbiAgICAgICAgc291cmNlID0gdGhpcy4kY29kZS5maW5kKCcucHJldHR5cHJpbnQnKTtcbiAgICAgICAgaWYgKHNvdXJjZSAmJiBzb3VyY2VbMF0pIHtcbiAgICAgICAgICAgIGFuY2hvckhhc2ggPSBkb2N1bWVudC5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGxpbmVzID0gc291cmNlWzBdLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xuICAgICAgICAgICAgdG90YWxMaW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGkgPSAgMDtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgdG90YWxMaW5lczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGluZUlkID0gJ2xpbmUnICsgaTtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXS5pZCA9IGxpbmVJZDtcbiAgICAgICAgICAgICAgICBpZiAobGluZUlkID09PSBhbmNob3JIYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzW2ldLmNsYXNzTmFtZSArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRhYiBmb3Igc3RhdGUgY2hhbmdlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIEEgc3RhdGUgdG8gY2hhZ25lIHRhYlxuICAgICAqL1xuICAgIGNoYW5nZVRhYjogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZUluZm8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZUNvZGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCZSBlbmFibGUgaW5mbyBzdGF0ZVxuICAgICAqL1xuICAgIF9lbmFibGVJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpbmZvJzsgICAgICAgIFxuICAgICAgICB0aGlzLiRpbmZvLnNob3coKTtcbiAgICAgICAgdGhpcy4kY29kZS5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJlIGVuYWJsZSBjb2RlIHN0YXRlXG4gICAgICovXG4gICAgX2VuYWJsZUNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2NvZGUnO1xuICAgICAgICB0aGlzLiRjb2RlLnNob3coKTtcbiAgICAgICAgdGhpcy4kaW5mby5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gbW9ldGhvZCBieSBpZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBBIGlkIHRvIG1vdmUgYnkgZG9jdW1lbnQubG9jYXRpb24gYXR0cmlidXRlXG4gICAgICovXG4gICAgbW92ZVRvOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTC5zcGxpdCgnIycpWzBdICsgaWQ7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGFiIGFuZCBtb3ZlIHRvIGxpbmUgKG51bWJlcilcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZSBUaGUgbnVtYmVyIG9mIGxpbmUgdG8gbW92ZVxuICAgICAqL1xuICAgIG1vdmVUb0xpbmU6IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VUYWIoJ2NvZGUnKTtcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24gPSBkb2N1bWVudC5VUkwuc3BsaXQoJyMnKVswXSArICcjbGluZScgKyBsaW5lOyBcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oQ29udGVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRlbnQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIEZlZG9jIGVsZW1lbnRcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQuIEZFIERldmVsb3BtZW50IHRlYW0gKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeTEuOC4zLCBuZS1jb2RlLXNuaXBwZXRcbiAqL1xuXG52YXIgTWVudSA9IHJlcXVpcmUoJy4vbWVudScpO1xudmFyIENvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBTZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpO1xudmFyIHRlbXBsYXRlcyA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcblxudmFyIEZlZG9jID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1lbnUoe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9ucy5lbGVtZW50Lm1lbnUsXG4gICAgICAgICAgICB0YWI6IG9wdGlvbnMuZWxlbWVudC50YWJcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29udGVudCA9IG5ldyBDb250ZW50KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbnMuZWxlbWVudC5jb250ZW50LFxuICAgICAgICAgICAgY29kZUVsZW1lbnQ6IG9wdGlvbnMuZWxlbWVudC5jb2RlLFxuICAgICAgICAgICAgY29udGVudDogb3B0aW9ucy5kYXRhLmNvbnRlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gbmV3IFNlYXJjaCh7XG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb25zLmVsZW1lbnQuc2VhcmNoXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9tZW51ID0gb3B0aW9ucy5kYXRhLm1lbnU7XG4gICAgICAgIHRoaXMuc2V0TWVudSgpO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudHNcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5vbignbm90aWZ5JywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlUGFnZSwgdGhpcykpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCd0YWJDaGFuZ2UnLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VUYWIsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ3NlYXJjaCcsIG5lLnV0aWwuYmluZCh0aGlzLnNlYXJjaExpc3QsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHdvcmRzIGJ5IGxuYiBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgQSBzZWFyY2ggZGF0YVxuICAgICAqL1xuICAgIHNlYXJjaExpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHdvcmQgPSBkYXRhLnRleHQsXG4gICAgICAgICAgICBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgbmFtZXNwYWNlcyA9IHRoaXMuX21lbnUubmFtZXNwYWNlcyxcbiAgICAgICAgICAgIG1vZHVsZXMgPSB0aGlzLl9tZW51Lm1vZHVsZXMsXG4gICAgICAgICAgICBpbnRlcmZhY2VzID0gdGhpcy5fbWVudS5pbnRlcmZhY2VzLFxuICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgY2xhc3NlcyksXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgbW9kdWxlcyksXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgaW50ZXJmYWNlcyksXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgbmFtZXNwYWNlcykpO1xuICAgICAgICBpZiAoIXdvcmQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEuY2FsbGJhY2socmVzdWx0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBpbiBsbmIgYXJyYXlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIEEgc2VhcmNoIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgQSBkYXRhIGxpc3RcbiAgICAgKi9cbiAgICBmaW5kSW46IGZ1bmN0aW9uKHN0ciwgYXJyYXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCBcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGlmIChlbC5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGVsLm1ldGhvZHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzTWF0Y2hlZCA9IG0uaWQucmVwbGFjZSgnLicsICcnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyLnRvTG93ZXJDYXNlKCkpICE9PSAtMTsgXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc01hdGNoZWQgJiYgbS5hY2Nlc3MgIT09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBzZWxmLmhpZ2hsaWdodGluZyhtLmlkLCBzdHIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwOiBlbC5sb25nbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IHF1ZXJ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmQgQSB3b3JkIHRvIHN0cmVzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgQSBzdHJpbmcgaW5jbHVkZSB3b3JkXG4gICAgICovXG4gICAgaGlnaGxpZ2h0aW5nOiBmdW5jdGlvbih3b3JkLCBzdHIpIHtcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoc3RyLCAnaScsICdnJyksXG4gICAgICAgICAgICBvcmlnaW4gPSByZWcuZXhlYyh3b3JkKVswXTtcbiAgICAgICAgcmV0dXJuIHdvcmQucmVwbGFjZShyZWcsICc8c3Ryb25nPicgKyBvcmlnaW4gKyAnPC9zdHJvbmc+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYWduZSBUYWJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBBIHRhYiBkYXRhXG4gICAgICovXG4gICAgY2hhbmdlVGFiOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5jaGFuZ2VUYWIoZGF0YS5zdGF0ZSk7XG4gICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvbnRlbnQgcGFnZSBieSBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgQSBwYWdlIGRhdGFcbiAgICAgKi9cbiAgICBjaGFuZ2VQYWdlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBodG1sO1xuICAgICAgICBpZiAoZGF0YS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVRhYih7c3RhdGU6ICdpbmZvJ30pO1xuICAgICAgICAgICAgdGhpcy5tZW51LnR1cm5PbkluZm8oKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGZlZG9jLmNvbnRlbnRbZGF0YS5uYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFtkYXRhLmNvZGVOYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUbygnI2NvbnRlbnRUYWInKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5saW5lKSB7XG4gICAgICAgICAgICB0aGlzLm1lbnUudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUb0xpbmUoZGF0YS5saW5lKTtcbiAgICAgICAgfSAgIFxuICAgICAgICBpZiAoZGF0YS5ocmVmKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVRvKGRhdGEuaHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZW51LmZvY3VzKGRhdGEubmFtZSwgZGF0YS5jb2RlTmFtZSwgZGF0YS5pc0dsb2JhbCA/IGRhdGEuaHJlZiA6IG51bGwpOyBcbiAgICAgICAgdGhpcy5zZWFyY2gucmVzZXQoKTsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0dXRvcmlhbCBtZW51c1xuICAgICAqL1xuICAgIGdldFR1dG9yaWFsczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0dXRvcmlhbHMgPSB0aGlzLl9tZW51LnR1dG9yaWFscywgXG4gICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICBsaXN0ID0gJycsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCF0dXRvcmlhbHMgfHwgIXR1dG9yaWFscy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0dXRvcmlhbHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBsaXN0ICs9IHNlbGYudGVtcGxhdGluZyh0ZW1wbGF0ZXMudHV0b3JpYWxzLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogZWwubmFtZSxcbiAgICAgICAgICAgICAgICB0aXRsZTogZWwudGl0bGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaHRtbCArPSB0aGlzLnRlbXBsYXRpbmcodGVtcGxhdGVzLm1lbnUsIHtcbiAgICAgICAgICAgIHRpdGxlOiAnU2FtcGxlcycsXG4gICAgICAgICAgICBjbmFtZTogJ3R1dG9yaWFscycsXG4gICAgICAgICAgICBsaXN0OiBsaXN0XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBsaXN0IGJ5IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBBIGRhdGEgZm9yIGxpc3RcbiAgICAgKi9cbiAgICBnZXRMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGh0bWwgPSAnJztcbiAgICAgICAgZGF0YS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciBmYSA9IHNlbGYuZ2V0UGF0aChhLm1ldGEpICsgYS5sb25nbmFtZSxcbiAgICAgICAgICAgICAgICBmYiA9IHNlbGYuZ2V0UGF0aChiLm1ldGEpICsgYi5sb25nbmFtZTtcbiAgICAgICAgICAgIGlmKGZhIDwgZmIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZhID4gZmIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goZGF0YSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gc2VsZi5nZXRDb2RlKGVsLm1ldGEpLFxuICAgICAgICAgICAgICAgIG1lbWJlcnMgPSAnJyxcbiAgICAgICAgICAgICAgICBtZXRob2RzID0gJycsXG4gICAgICAgICAgICAgICAgbWh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICB0bXBsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZWwubWVtYmVycykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZXMubGlzdC5tZW1iZXJzOyAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWVtYmVycyA9IHNlbGYuX2dldElubmVySFRNTChlbC5tZW1iZXJzLCBjb2RlLCBlbC5sb25nbmFtZSwgdG1wbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZXMubGlzdC5tZXRob2RzO1xuICAgICAgICAgICAgICAgIG1ldGhvZHMgPSBzZWxmLl9nZXRJbm5lckhUTUwoZWwubWV0aG9kcywgY29kZSwgZWwubG9uZ25hbWUsIHRtcGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCArPSBzZWxmLnRlbXBsYXRpbmcodGVtcGxhdGVzLmxpc3Qub3V0ZXIsIHtcbiAgICAgICAgICAgICAgICBsb25nbmFtZTogZWwubG9uZ25hbWUsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBmdWxsbmFtZTogc2VsZi5nZXREaXJlY3RvcnkoZWwubWV0YSwgZWwubG9uZ25hbWUpLFxuICAgICAgICAgICAgICAgIG1lbWJlcnM6IG1lbWJlcnMsXG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWV0aG9kc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGlubmVyIGh0bWxcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBpdGVtcyBBbiBpdGVtIGFycmF5IHRvIGFwcGx5IHRlbXBsYXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgQSBjb2RlIG5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbG9uZ25hbWUgQSBmaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cm9uZ30gdG1wbCBBIHRlbXBsYXRlIFxuICAgICAqL1xuICAgIF9nZXRJbm5lckhUTUw6IGZ1bmN0aW9uKGl0ZW1zLCBjb2RlLCBsb25nbmFtZSwgdG1wbCkge1xuICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgbWh0bWwgPSAnJyxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobS5hY2Nlc3MgPT09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1odG1sICs9IHNlbGYudGVtcGxhdGluZyh0ZW1wbGF0ZXMubGlzdC5pbm5lciwge1xuICAgICAgICAgICAgICAgIGxvbmduYW1lOiBsb25nbmFtZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgICAgIGlkOiBtLmlkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBtLmlkLnJlcGxhY2UoJy4nLCAnJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG1odG1sKSB7XG4gICAgICAgICAgICBodG1sICs9IHNlbGYudGVtcGxhdGluZyh0bXBsLCB7XG4gICAgICAgICAgICAgICAgaHRtbDogbWh0bWxcbiAgICAgICAgICAgIH0pOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNsYXNzIGxpc3RzXG4gICAgICovXG4gICAgZ2V0Q2xhc3NlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghY2xhc3NlcyB8fCAhY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0NsYXNzZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdjbGFzc2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChjbGFzc2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBuYW1lc3BhY2VzXG4gICAgICovXG4gICAgZ2V0TmFtZXNwYWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuYW1lc3BhY2VzID0gdGhpcy5fbWVudS5uYW1lc3BhY2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghbmFtZXNwYWNlcyB8fCAhbmFtZXNwYWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ05hbWVzcGFjZXMnLFxuICAgICAgICAgICAgY25hbWU6ICduYW1lc3BhY2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChuYW1lc3BhY2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBnbG9iYWwgbWVudXNcbiAgICAgKi9cbiAgICBnZXRHbG9iYWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdsb2JhbHMgPSB0aGlzLl9tZW51Lmdsb2JhbHMsXG4gICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICBsaXN0ID0gJycsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFnbG9iYWxzIHx8ICFnbG9iYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGdsb2JhbHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGxpc3QgKz0gc2VsZi50ZW1wbGF0aW5nKHRlbXBsYXRlcy5nbG9iYWwsIHtcbiAgICAgICAgICAgICAgICBzY29wZTogZWwuc2NvcGUsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBpZDogZWwuaWQsXG4gICAgICAgICAgICAgICAgbG9uZ25hbWU6IGVsLmxvbmduYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgPSB0aGlzLnRlbXBsYXRpbmcodGVtcGxhdGVzLm1lbnUsIHtcbiAgICAgICAgICAgIHRpdGxlOiAnR2xvYmFscycsXG4gICAgICAgICAgICBjbmFtZTogJ2dsb2JhbHMnLFxuICAgICAgICAgICAgbGlzdDogbGlzdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbnRlcmZhY2VzXG4gICAgICovXG4gICAgZ2V0SW50ZXJmYWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnRlcmZhY2VzID0gdGhpcy5fbWVudS5pbnRlcmZhY2VzLFxuICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghaW50ZXJmYWNlcyB8fCAhaW50ZXJmYWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0ludGVyZmFjZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdpbnRlcmZhY2VzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChpbnRlcmZhY2VzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBtb2R1bGVzXG4gICAgICovXG4gICAgZ2V0TW9kdWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICBtb2R1bGVzID0gdGhpcy5fbWVudS5tb2R1bGVzLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghbW9kdWxlcyB8fCAhbW9kdWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ01vZHVsZXMnLFxuICAgICAgICAgICAgY25hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGxpc3Q6IHRoaXMuZ2V0TGlzdChtb2R1bGVzKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBtZW51IG9iamVjdCB0byBodG1sXG4gICAgICogQHRvZG8gVGhpcyBtaWdodCBiZSBtb3ZlZCB0byBtZW51LmpzXG4gICAgICovXG4gICAgc2V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJyc7XG4gICAgICAgIGh0bWwgKz0gdGhpcy5nZXRUdXRvcmlhbHMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldENsYXNzZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldE1vZHVsZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldE5hbWVzcGFjZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldEludGVyZmFjZXMoKTtcbiAgICAgICAgaHRtbCArPSB0aGlzLmdldEdsb2JhbHMoKTtcbiAgICAgICAgdGhpcy5tZW51LnNldE1lbnUoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ldGEgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhIFRoZSBmaWxlIG1ldGEgZGF0YVxuICAgICAqL1xuICAgIGdldENvZGU6IGZ1bmN0aW9uKG1ldGEpIHtcbiAgICAgICAgdmFyIHBhdGggPSBtZXRhLnBhdGguc3BsaXQoJy9zcmMvJylbMV07XG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRhLmZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXycpICsgJ18nICsgbWV0YS5maWxlbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRlbXBsYXRlIHN0cmluZ1xuICAgICAqL1xuICAgIHRlbXBsYXRpbmc6IGZ1bmN0aW9uKHRtcGwsIG1hcCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdG1wbC5yZXBsYWNlKC9cXHtcXHsoW15cXH1dKylcXH1cXH0vZywgZnVuY3Rpb24obWF0Y2hlZFN0cmluZywgbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXSB8fCAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGdldFBhdGg6IGZ1bmN0aW9uKG1ldGEpIHtcbiAgICAgICAgdmFyIHBhdGggPSBtZXRhLnBhdGguc3BsaXQoJy9zcmMvJylbMV07XG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aCB8fCAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZpbGUgZGlyZWN0b3J5IGluZm9cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YSBUaGUgZmlsZSBtZXRhIGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiBjbGFzc1xuICAgICAqL1xuICAgIGdldERpcmVjdG9yeTogZnVuY3Rpb24obWV0YSwgbmFtZSkge1xuICAgICAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aChtZXRhKTtcbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwiZGlyZWN0b3J5XCI+JyArIHBhdGgucmVwbGFjZSgvXFwvL2csICcvJykgKyAnLzwvc3Bhbj4nICsgbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNvbnRlbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBBIGh0bWwgc3RyaW5nIHRvIHNldCBjb250ZW50XG4gICAgICovXG4gICAgc2V0Q29udGVudDogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBQaWNrIGRhdGEgZnJvbSB0ZXh0IGZpbGVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICBwaWNrRGF0YTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHVybCA9IG5hbWUsXG4gICAgICAgICAgICB1cmxDb2RlID0gbmFtZSArICcuanMnO1xuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhmZWRvYy5jb250ZW50W25hbWVdKTtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFt1cmxDb2RlXSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZlZG9jO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBsZWZ0IG1lbnUgYW5kIHRhYiBtZW51IG1hbmFnZXJcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQuIEZFIERldmVsb3BtZW50IHRlYW0gKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeTEuOC4zLCBuZS1jb2RlLXNuaXBwZXRcbiAqL1xudmFyIE1lbnUgPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgZm9yIG1lbnVcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZWxlbWVudCBUaGUganF1ZXJ5IHdyYXBwaW5nIG9iamVjdCBmb3IgbGVmdCBtZW51XG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnRhYiBUaGUganF1ZXJ5IHdyYXBwaW5nIG9iamVjdCBmb3IgdGFiIG1lbnUgXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLiRtZW51ID0gb3B0aW9ucy5lbGVtZW50O1xuICAgICAgICB0aGlzLiR0YWIgPSBvcHRpb25zLnRhYjtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gJ21haW4nO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudCB0byBwYWdlIG1vdmVcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJG1lbnUub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25DbGlja01lbnUsIHRoaXMpKTtcbiAgICAgICAgdGhpcy4kdGFiLm9uKCdjbGljaycsIG5lLnV0aWwuYmluZCh0aGlzLm9uQ2xpY2tUYWIsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGFiIGNobmFnZSBldmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgSnF1ZXJ5RXZlbnQgb2JqZWN0XG4gICAgICovXG4gICAgb25DbGlja1RhYjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygndGFibWVudScpICYmICF0YXJnZXQuaGFzQ2xhc3MoJ29uJykpIHtcbiAgICAgICAgICAgIHZhciBpc0NvZGUgPSB0YXJnZXQuaGFzQ2xhc3MoJ2NvZGUnKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgndGFiQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBpc0NvZGUgPyAnY29kZScgOiAnaW5mbydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzQ29kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm5PbkluZm8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb2N1cyBvbiBzZWxlY3RlZCBtZW51XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNwZWMgQSBzcGVjaWZpY2F0aW9uIGlkIHRvIGZpbmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBBIGNvZGUgbGluZSB0byBtb3ZlXG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKHNwZWMsIGNvZGUsIGhyZWYpIHtcbiAgICAgICAgaWYgKCFzcGVjIHx8ICFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kbWVudS5maW5kKCcubGlzdGl0ZW0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgY2hpbGQgPSBzZWxmLmZpbmQoJ2FbaHJlZj0nICsgaHJlZiArICddJyk7ICAgXG4gICAgICAgICAgICBzZWxmLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgaWYgKGNoaWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChzZWxmLmF0dHIoJ2RhdGEtc3BlYycpID09PSBzcGVjKSAmJiBzZWxmLmF0dHIoJ2RhdGEtY29kZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIHNwZWNpZmljYXRpb24gcGFnZSBcbiAgICAgKi9cbiAgICB0dXJuT25JbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhYm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kdGFiLmZpbmQoJy5pbmZvJykuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIGNvZGUgcGFnZVxuICAgICAqL1xuICAgIHR1cm5PbkNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm90aWZ5IGZvciBjaGFuZ2UgY29udGVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBBIGNsaWNrIGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2tNZW51OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcHJlVGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNUdXRvcmlhbCA9IHByZVRhcmdldC5oYXNDbGFzcygndHV0b3JpYWxMaW5rJyksXG4gICAgICAgICAgICBpc0RpcmVjdG9yeSA9IHByZVRhcmdldC5oYXNDbGFzcygnZGlyZWN0b3J5JyksXG4gICAgICAgICAgICBtaWRUYXJnZXQgPSBpc0RpcmVjdG9yeSA/IHByZVRhcmdldC5wYXJlbnQoKSA6IHByZVRhcmdldCxcbiAgICAgICAgICAgIGhyZWYgPSBtaWRUYXJnZXQuYXR0cignaHJlZicpLFxuICAgICAgICAgICAgdGFyZ2V0ID0gaHJlZiA/IG1pZFRhcmdldC5wYXJlbnQoKSA6IG1pZFRhcmdldCxcbiAgICAgICAgICAgIGlzR2xvYmFsID0gdGFyZ2V0Lmhhc0NsYXNzKCdnbG9iYWxpdGVtJyksXG4gICAgICAgICAgICBzcGVjID0gdGFyZ2V0LmF0dHIoJ2RhdGEtc3BlYycpLFxuICAgICAgICAgICAgY29kZSA9IHRhcmdldC5hdHRyKCdkYXRhLWNvZGUnKTtcbiAgICAgICAgaWYgKGlzR2xvYmFsICYmICFocmVmKSB7XG4gICAgICAgICAgICBocmVmID0gdGFyZ2V0LmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVHV0b3JpYWwpIHtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGhyZWYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcGVjKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBzcGVjLFxuICAgICAgICAgICAgICAgIGNvZGVOYW1lOiBjb2RlLFxuICAgICAgICAgICAgICAgIGhyZWY6IGhyZWYsXG4gICAgICAgICAgICAgICAgaXNHbG9iYWw6IGlzR2xvYmFsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBodG1sXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBodG1sIHN0cmluZyB0byBzZXQgbWVudVxuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kbWVudS5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgbWVudSB3aXRoIHN0YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lbnUgQSBzZWxlY3RlZCBtZW51XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIEEgdGFiIHN0YXRlbWVudFxuICAgICAqL1xuICAgIHNlbGVjdDogZnVuY3Rpb24obWVudSwgc3RhdGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbWVudTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8ICdpbmZvJztcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIE9wZW4gc2VsZWN0ZWQgbWVudVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZW51IEEgc2VsZWN0ZWQgbWVudVxuICAgICAqLyBcbiAgICBvcGVuOiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuJG1lbnUuZmluZCgnLicgKyBtZW51KS5hZGRDbGFzcygndW5mb2xkJyk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGFiIG1lbnUgaHRtbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIFRoZSBodG1sIHRvIHNob3cgdXAgb24gcGFnZVxuICAgICAqL1xuICAgIHNldFRhYjogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiR0YWIuaHRtbChodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBPbiBzZWxlY3RlZCB0YWJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIHNlbGVjdGVkIHRhYiBuYW1lXG4gICAgICovXG4gICAgdGFiT246IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgIHRoaXMuJHRhYi5yZW1vdmVDbGFzcygpO1xuICAgICAgICAgdGhpcy4kdGFiLmFkZENsYXNzKCd0YWIgdGFiLScgKyBuYW1lKTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oTWVudSk7XG5tb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHNlYXJjaCBtYW5hZ2VyXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50LiBGRSBEZXZlbG9wbWVudCB0ZWFtIChkbF9qYXZhc2NyaXB0QG5obmVudC5jb20pXG4gKiBAZGVwZW5kZW5jeSBqcXVlcnkxLjguMywgbmUtY29kZS1zbmlwcGV0XG4gKi9cbnZhciBTZWFyY2ggPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcblxuICAgIC8qKlxuICAgICAqIFNwZWNpYWwga2V5IGNvZGVcbiAgICAgKi9cbiAgICBrZXlVcDogMzgsXG4gICAga2V5RG93bjogNDAsXG4gICAgZW50ZXI6IDEzLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmVsZW1lbnQgQSBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcHAgRmVkZWMgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCBhcHApIHtcbiAgICAgICAgdGhpcy4kZWwgPSBvcHRpb25zLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgdGhpcy4kbGlzdCA9IHRoaXMuJGVsLmZpbmQoJy5zZWFyY2hMaXN0Jyk7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLnJvb3QgPSBhcHA7XG4gICAgICAgIHRoaXMuX2FkZEV2ZW50KCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgRXZlbnRzXG4gICAgICovXG4gICAgX2FkZEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5wdXQub24oJ2tleXVwJywgbmUudXRpbC5iaW5kKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgZmlyc3QsXG4gICAgICAgICAgICAgICAgcXVlcnk7XG4gICAgICAgICAgICBpZihldmVudC5rZXlDb2RlID09PSB0aGlzLmtleVVwIHx8IGV2ZW50LmtleUNvZGUgPT09IHRoaXMua2V5RG93biB8fCBldmVudC5rZXlDb2RlID09PSB0aGlzLmVudGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGxpc3QuY3NzKCdkaXNwbGF5JykgIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5lbnRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGlzLiRsaXN0LmZpbmQoJ2xpLm9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHRoaXMuJGxpc3QuZmluZCgnbGknKS5lcSgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3VibWl0KHsgdGFyZ2V0OiBzZWxlY3RlZFswXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlyc3QubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdCh7IHRhcmdldDogZmlyc3RbMF19KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbShldmVudC5rZXlDb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCBpdGVtIGJ5IGtleWJvYXJkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgS2V5Y29kZVxuICAgICAqL1xuICAgIHNlbGVjdEl0ZW06IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICBsZW4gPSB0aGlzLiRsaXN0LmZpbmQoJ2xpJykubGVuZ3RoO1xuICAgICAgICBpZiAoIW5lLnV0aWwuaXNOdW1iZXIodGhpcy5pbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgICB9ICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb2RlID09PSB0aGlzLmtleVVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4IC0gMSArIGxlbikgJSBsZW47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCArIDEpICUgbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5lcSh0aGlzLmluZGV4KS5hZGRDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsKHRoaXMuJGxpc3QuZmluZCgnbGkub24nKS5maW5kKCdhJykudGV4dCgpKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHNlYXJjaFxuICAgICAqLyBcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGlucHV0LnZhbCgnJyk7XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5vZmYoJ2NsaWNrJyk7XG4gICAgICAgIHRoaXMuJGxpc3QuZW1wdHkoKTtcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgZm9yIGNoYW5nZSBieSBzZWFyY2ggcmVzdWx0IGxpc3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gQSBzdWJtaXQgZXZlbnQgb2JqZWN0XG4gICAgICovIFxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgIHNwZWMsIFxuICAgICAgICAgICAgY29kZTtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgaHJlZiA9IHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICBzcGVjID0gdGFyZ2V0LmZpbmQoJ3NwYW4nKS5hdHRyKCdkYXRhLXNwZWMnKTtcbiAgICAgICAgY29kZSA9IHRhcmdldC5maW5kKCdzcGFuJykuYXR0cignZGF0YS1jb2RlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICBjb2RlTmFtZTogY29kZSxcbiAgICAgICAgICAgICBuYW1lOiBzcGVjLFxuICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgfSk7XG4gICAgfSwgXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGFyZ2V0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IHRoYXQgaGF2ZSB0byBleHRyYWN0XG4gICAgICovXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgJHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhZ05hbWUgIT09ICdMSScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRhcmdldCgkdGFyZ2V0LnBhcmVudCgpWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaW5kIHdvcmQgYnkgaW5wdXQgdGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IEEgc3RyaW5nIHRvIGZpbmRcbiAgICAgKi9cbiAgICBmaW5kOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2VhcmNoJywgeyBcbiAgICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNlYXJjaCBsaXN0XG4gICAgICogQHBhcmFtIHthcnJheX0gbGlzdCBTZWFyY2ggcmVzdWx0IGxpc3QgXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgIHZhciBzdHIgPSAnJzsgXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgc3RyICs9ICc8bGk+PHNwYW4gZGF0YS1zcGVjPVwiJyArIGVsLmdyb3VwICsgJ1wiIGRhdGEtY29kZT1cIicgKyBlbC5jb2RlICsgJ1wiPjxhIGhyZWY9XCIjJyArIGVsLmlkICsgJ1wiPicgKyBlbC5sYWJlbC5yZXBsYWNlKCcuJywgJycpICsgJzwvYT48c3BhbiBjbGFzcz1cImdyb3VwXCI+JyArIGVsLmdyb3VwICsgJzwvc3Bhbj48L3NwYW4+PC9saT4nOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGxpc3QuaHRtbChzdHIpO1xuICAgICAgICBpZiAoc3RyKSB7XG4gICAgICAgICAgICB0aGlzLiRsaXN0LnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25TdWJtaXQsIHRoaXMpKTsgXG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlYXJjaCk7XG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgdGVtcGxhdGVzIGZvciBodG1sXG4gKi9cbnZhciB0ZW1wbGF0ZXMgPSB7XG4gICAgbWVudTogW1xuICAgICAgICAnPGgzPnt7dGl0bGV9fTwvaDM+JyxcbiAgICAgICAgJzx1bCBjbGFzcz17e2NuYW1lfX0+JyxcbiAgICAgICAgJ3t7bGlzdH19JyxcbiAgICAgICAgJzwvdWw+J1xuICAgIF0uam9pbignJyksXG4gICAgZ2xvYmFsOiAnPGxpIGNsYXNzPVwibGlzdGl0ZW0gZ2xvYmFsaXRlbVwiIGRhdGEtc3BlYz1cInt7c2NvcGV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xvbmduYW1lfX08L2E+PC9saT4nLFxuICAgIHR1dG9yaWFsczogJzxsaSBjbHNzcz1cInR1dG9yaWFsc1wiPjxhIGNsYXNzPVwidHV0b3JpYWxMaW5rXCIgaHJlZj1cInR1dG9yaWFsLXt7bmFtZX19Lmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+PC9saT4nLFxuICAgIGxpc3Q6IHtcbiAgICAgICAgb3V0ZXI6IFtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+JyxcbiAgICAgICAgICAgICc8YSBocmVmPVwiI1wiPnt7ZnVsbG5hbWV9fTwvYT4nLFxuICAgICAgICAgICAgJ3t7bWVtYmVyc319JyxcbiAgICAgICAgICAgICd7e21ldGhvZHN9fScsXG4gICAgICAgICAgICAnPC9saT4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1ldGhvZHM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1ldGhvZHM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1lbWJlcnM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIGlubmVyOiAnPGxpIGNsYXNzPVwibWVtYmVyaXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xhYmVsfX08L2E+PC9saT4nXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZXM7XG4iXX0=
