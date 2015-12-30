(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('toast.ui.doc', require('./src/js/app'));

},{"./src/js/app":2}],2:[function(require,module,exports){
var Menu = require('./menu');
var Content = require('./content');
var Search = require('./search');

var App = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} option 
     */
    init: function(option) {
        this.menu = new Menu({
            element: option.element.menu,
            tab: option.element.tab
        });
        this.content = new Content({
            element: option.element.content,
            codeElement: option.element.code,
            content: option.data.content
        });
        this.search = new Search({
            element: option.element.search
        });
        this._menu = option.data.menu;
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
     */
    searchList: function(data) {
        var word = data.text,
            classes = this._menu.classes,
            namespaces = this._menu.namespaces,
            result = this.findIn(word, classes);
        result = result.concat(this.findIn(word, namespaces));
        if (!word) {
            result = [];
        }
        data.callback(result);
    },

    /**
     * Find in lnb array
     */
    findIn: function(str, array) {
        var result = [], 
            self = this;
        ne.util.forEach(array, function(el) {
            var code = self.getCode(el.meta);
            if (el.methods) {
                ne.util.forEach(el.methods, function(m) {
                    if (m.id.replace('.', '').toLowerCase().indexOf(str.toLowerCase()) !== -1 && m.access !== 'private') {
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
     */
    highlighting: function(word, str) {
        var reg = new RegExp(str, 'i', 'g'),
            origin = reg.exec(word)[0];
        return word.replace(reg, '<strong>' + origin + '</strong>');
    },

    /**
     * Chagne Tab
     */
    changeTab: function(data) {
        this.content.changeTab(data.state);
   },

    /**
     * Set Content page by data
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
        this.search.reset(); 
    },

    /**
     * Set menu object to html
     * @todo This might be moved to menu.js
     */
    setMenu: function() {
        var html = '',
            self = this,
            classes = this._menu.classes,
            namespace = this._menu.namespaces,
            tutorials = this._menu.tutorials;


        html += '<ul class="classes">';
        ne.util.forEach(classes, function(el) {
            var code = self.getCode(el.meta);
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {           
                html += '<div class="title"><strong>Members</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.members, function(m) {
                    html += '<li class="memberitem" data-spec="' + el.longname + '" data-code="' + code + '"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.methods, function(m) {
                    if (m.access === 'private') return;
                    html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
        });
        html += '</ul>';

        html += '<ul class="namespace">';
        ne.util.forEach(namespace, function(el) {
            var code = self.getCode(el.meta);
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {
                html += '<div class="title"><strong>Members</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.members, function(m) {
                    html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
            ne.util.forEach(el.methods, function(m) {
                if (m.access === 'private') return;
                html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id.replace('.', '') + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
});
        html += '</ul>';

        this.menu.setMenu(html);
    },

    find: function() {
        return [
            {
                id: 'idididid'
            },
            {
                id: 'asdfasdf'
            }
        ];
    },
    
    /**
     * Meta data
     */
    getCode: function(meta) {
        var path = meta.path.split('/js/')[1];
        if (!path) {
            return meta.filename;
        }
        return path.replace(/\//g, '_') + '_' + meta.filename;
    },

    /**
     * Set content
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

module.exports = App;

},{"./content":3,"./menu":4,"./search":5}],3:[function(require,module,exports){
var Content = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$info = option.element;
        this.$code = option.codeElement;
        this.state = 'info';
        this.$code.hide();
        this.setInfo(option.content);
        this.setEvent();
    },

    setEvent: function() {
        this.$info.on('click', ne.util.bind(this.onClick, this));
    },

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
        if (
            tagName === 'code' &&
            $(target).parent().hasClass('container-source') 
           ) {
            this.fire('notify', {
                line: parseInt(target.innerHTML.replace('line', ''), 10) || 1
            });
        }
    },

    /**
     * Set information html to info
     */
    setInfo: function(html) {
        this.$info.html(html);
    },

    /**
     * Set code html to code
     */
    setCode: function(code) {
        this.$code.html(code);
        this.setCodeLine();
    },
    
    /**
     * Set code line
     */
    setCodeLine: function() {
        prettyPrint();
        var source = this.$code.find('.prettyprint');
        var i = 0;
        var lineNumber = 0;
        var lineId;
        var lines;
        var totalLines;
        var anchorHash;

        if (source && source[0]) {
            anchorHash = document.location.hash.substring(1);
            lines = source[0].getElementsByTagName('li');
            totalLines = lines.length;

            for (; i < totalLines; i++) {
                lineNumber++;
                lineId = 'line' + lineNumber;
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

},{}],4:[function(require,module,exports){
var Menu = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$menu = option.element;
        this.$tab = option.tab;
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
//        this.$tab.on('mouseover', ne.util.bind(this.onMouseover, this));
//        this.$tab.on('mouseout', ne.util.bind(this.onMouseout, this));
    },

    /**
     * On mouse over
     */
    onMouseover: function() {
        this.$tab.find('ul').fadeIn(100);
    },

    onMouseout: function() {
        var self = this;
        setTimeout(function() {
            self.$tab.find('ul').fadeOut();
        }, 2000);
    },

    /**
     * Tab chnage event
     * @param {object} event The JqueryEvent object
     */
    onClickTab: function(event) {
        var target = $(event.target);
        if (target.hasClass('tabmenu')
           && !target.hasClass('on')) {
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

    turnOnInfo: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.info').addClass('on');
    },
    turnOnCode: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.code').addClass('on');
    },

    /**
     * Notify for change content
     */
    onClickMenu: function(event) {
        event.preventDefault();
        var target = $(event.target),
            href = target.attr('href'),
            target = href ? target.parent() : target,
            spec = target.attr('data-spec'),
            code = target.attr('data-code');

        if (spec) {
            this.fire('notify', {
                name: spec,
                codeName: code,
                href: href
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
     */
    select: function(menu, state) {
        this.current = menu;
        this.state = state || 'info';
    },
    
    /**
     * Open selected menu
     */ 
    open: function(menu) {
        this.$menu.find('.' + menu).addClass('unfold'); 
    },

    /**
     * Set tab menu html
     */
    setTab: function(html) {
        this.$tab.html(html);
    }, 
    
    /**
     * On selected tab
     */
    tabOn: function(name) {
         this.$tab.removeClass();
         this.$tab.addClass('tab tab-' + name);
    }
});

ne.util.CustomEvents.mixin(Menu);
module.exports = Menu;

},{}],5:[function(require,module,exports){
var Search = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option, app) {
        this.$el = option.element;
        this.$input = this.$el.find('input');
        this.$list = this.$el.find('.searchList');
        this.$list.hide();
        this.root = app;
        this._addEvent();
    },

    /**
     * Add Events
     */
    _addEvent: function() {
        this.$input.on('keyup', ne.util.bind(function(event) {
            this.find(event.target.value); 
        }, this));
        this.$list.on('click', ne.util.bind(this.onSubmit, this)); 
    },
    
    /**
     * Reset search
     */ 
    reset: function() {
        this.$input.val('');
        this.$list.empty();
        this.$list.hide();
    },

    /**
     * Submit for change by search result list
     */ 
    onSubmit: function(event) {
        var target = $(event.target),
            href = target.attr('href'),
            target = href ? target.parent() : target,
            spec = target.attr('data-spec'),
            code = target.attr('data-code');
        this.fire('notify', {
             codeName: code,
             name: spec,
             href: href
        });
    }, 
    
    /**
     * Find word by input text
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
    }
});

ne.util.CustomEvents.mixin(Search);
module.exports = Search;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9hcHAuanMiLCJzcmMvanMvY29udGVudC5qcyIsInNyYy9qcy9tZW51LmpzIiwic3JjL2pzL3NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJuZS51dGlsLmRlZmluZU5hbWVzcGFjZSgndG9hc3QudWkuZG9jJywgcmVxdWlyZSgnLi9zcmMvanMvYXBwJykpO1xuIiwidmFyIE1lbnUgPSByZXF1aXJlKCcuL21lbnUnKTtcbnZhciBDb250ZW50ID0gcmVxdWlyZSgnLi9jb250ZW50Jyk7XG52YXIgU2VhcmNoID0gcmVxdWlyZSgnLi9zZWFyY2gnKTtcblxudmFyIEFwcCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uIFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLm1lbnUgPSBuZXcgTWVudSh7XG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb24uZWxlbWVudC5tZW51LFxuICAgICAgICAgICAgdGFiOiBvcHRpb24uZWxlbWVudC50YWJcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29udGVudCA9IG5ldyBDb250ZW50KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbi5lbGVtZW50LmNvbnRlbnQsXG4gICAgICAgICAgICBjb2RlRWxlbWVudDogb3B0aW9uLmVsZW1lbnQuY29kZSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbi5kYXRhLmNvbnRlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gbmV3IFNlYXJjaCh7XG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb24uZWxlbWVudC5zZWFyY2hcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21lbnUgPSBvcHRpb24uZGF0YS5tZW51O1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnRzXG4gICAgICovXG4gICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCdub3RpZnknLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMubWVudS5vbigndGFiQ2hhbmdlJywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlVGFiLCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2VhcmNoLm9uKCdzZWFyY2gnLCBuZS51dGlsLmJpbmQodGhpcy5zZWFyY2hMaXN0LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2VhcmNoLm9uKCdub3RpZnknLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB3b3JkcyBieSBsbmIgZGF0YVxuICAgICAqL1xuICAgIHNlYXJjaExpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHdvcmQgPSBkYXRhLnRleHQsXG4gICAgICAgICAgICBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgbmFtZXNwYWNlcyA9IHRoaXMuX21lbnUubmFtZXNwYWNlcyxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZmluZEluKHdvcmQsIGNsYXNzZXMpO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuZmluZEluKHdvcmQsIG5hbWVzcGFjZXMpKTtcbiAgICAgICAgaWYgKCF3b3JkKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhLmNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgaW4gbG5iIGFycmF5XG4gICAgICovXG4gICAgZmluZEluOiBmdW5jdGlvbihzdHIsIGFycmF5KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXSwgXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmdldENvZGUoZWwubWV0YSk7XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtLmlkLnJlcGxhY2UoJy4nLCAnJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHN0ci50b0xvd2VyQ2FzZSgpKSAhPT0gLTEgJiYgbS5hY2Nlc3MgIT09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBzZWxmLmhpZ2hsaWdodGluZyhtLmlkLCBzdHIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwOiBlbC5sb25nbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IHF1ZXJ5XG4gICAgICovXG4gICAgaGlnaGxpZ2h0aW5nOiBmdW5jdGlvbih3b3JkLCBzdHIpIHtcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoc3RyLCAnaScsICdnJyksXG4gICAgICAgICAgICBvcmlnaW4gPSByZWcuZXhlYyh3b3JkKVswXTtcbiAgICAgICAgcmV0dXJuIHdvcmQucmVwbGFjZShyZWcsICc8c3Ryb25nPicgKyBvcmlnaW4gKyAnPC9zdHJvbmc+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYWduZSBUYWJcbiAgICAgKi9cbiAgICBjaGFuZ2VUYWI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhpcy5jb250ZW50LmNoYW5nZVRhYihkYXRhLnN0YXRlKTtcbiAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgQ29udGVudCBwYWdlIGJ5IGRhdGFcbiAgICAgKi9cbiAgICBjaGFuZ2VQYWdlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBodG1sO1xuICAgICAgICBpZiAoZGF0YS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVRhYih7c3RhdGU6ICdpbmZvJ30pO1xuICAgICAgICAgICAgdGhpcy5tZW51LnR1cm5PbkluZm8oKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGZlZG9jLmNvbnRlbnRbZGF0YS5uYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFtkYXRhLmNvZGVOYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUbygnI2NvbnRlbnRUYWInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLmxpbmUpIHtcbiAgICAgICAgICAgIHRoaXMubWVudS50dXJuT25Db2RlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVRvTGluZShkYXRhLmxpbmUpO1xuICAgICAgICB9ICAgXG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5ocmVmKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVRvKGRhdGEuaHJlZik7XG4gICAgICAgIH0gXG4gICAgICAgIHRoaXMuc2VhcmNoLnJlc2V0KCk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBvYmplY3QgdG8gaHRtbFxuICAgICAqIEB0b2RvIFRoaXMgbWlnaHQgYmUgbW92ZWQgdG8gbWVudS5qc1xuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgbmFtZXNwYWNlID0gdGhpcy5fbWVudS5uYW1lc3BhY2VzLFxuICAgICAgICAgICAgdHV0b3JpYWxzID0gdGhpcy5fbWVudS50dXRvcmlhbHM7XG5cblxuICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJjbGFzc2VzXCI+JztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNsYXNzZXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cImxpc3RpdGVtXCIgZGF0YS1zcGVjPVwiJytlbC5sb25nbmFtZSsnXCIgZGF0YS1jb2RlPVwiJytjb2RlKydcIj48YSBocmVmPVwiI1wiPicgKyBlbC5sb25nbmFtZSArICc8L2E+JztcbiAgICAgICAgICAgIGlmIChlbC5tZW1iZXJzKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImlubmVyXCI+JztcbiAgICAgICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZWwubWVtYmVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJtZW1iZXJpdGVtXCIgZGF0YS1zcGVjPVwiJyArIGVsLmxvbmduYW1lICsgJ1wiIGRhdGEtY29kZT1cIicgKyBjb2RlICsgJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWV0aG9kczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwiaW5uZXJcIj4nO1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtLmFjY2VzcyA9PT0gJ3ByaXZhdGUnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8L2xpPic7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9ICc8L3VsPic7XG5cbiAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwibmFtZXNwYWNlXCI+JztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKG5hbWVzcGFjZSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gc2VsZi5nZXRDb2RlKGVsLm1ldGEpO1xuICAgICAgICAgICAgaHRtbCArPSAnPGxpIGNsYXNzPVwibGlzdGl0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjXCI+JyArIGVsLmxvbmduYW1lICsgJzwvYT4nO1xuICAgICAgICAgICAgaWYgKGVsLm1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImlubmVyXCI+JztcbiAgICAgICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZWwubWVtYmVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJtZW1iZXJpdGVtXCIgZGF0YS1zcGVjPVwiJytlbC5sb25nbmFtZSsnXCIgZGF0YS1jb2RlPVwiJytjb2RlKydcIj48YSBocmVmPVwiIycgKyBtLmlkICsgJ1wiPicgKyBtLmlkICsgJzwvYT48L2xpPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPC91bD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1ldGhvZHM8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImlubmVyXCI+JztcbiAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgaWYgKG0uYWNjZXNzID09PSAncHJpdmF0ZScpIHJldHVybjtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJtZW1iZXJpdGVtXCIgZGF0YS1zcGVjPVwiJytlbC5sb25nbmFtZSsnXCIgZGF0YS1jb2RlPVwiJytjb2RlKydcIj48YSBocmVmPVwiIycgKyBtLmlkICsgJ1wiPicgKyBtLmlkLnJlcGxhY2UoJy4nLCAnJykgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8L2xpPic7XG59KTtcbiAgICAgICAgaHRtbCArPSAnPC91bD4nO1xuXG4gICAgICAgIHRoaXMubWVudS5zZXRNZW51KGh0bWwpO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2lkaWRpZGlkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2FzZGZhc2RmJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogTWV0YSBkYXRhXG4gICAgICovXG4gICAgZ2V0Q29kZTogZnVuY3Rpb24obWV0YSkge1xuICAgICAgICB2YXIgcGF0aCA9IG1ldGEucGF0aC5zcGxpdCgnL2pzLycpWzFdO1xuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRhLmZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXycpICsgJ18nICsgbWV0YS5maWxlbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb250ZW50OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGh0bWwpO1xuICAgIH0sIFxuICAgIFxuICAgIC8qKlxuICAgICAqIFBpY2sgZGF0YSBmcm9tIHRleHQgZmlsZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIHBpY2tEYXRhOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdXJsID0gbmFtZSxcbiAgICAgICAgICAgIHVybENvZGUgPSBuYW1lICsgJy5qcyc7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhmZWRvYy5jb250ZW50W25hbWVdKTtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFt1cmxDb2RlXSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsInZhciBDb250ZW50ID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLiRpbmZvID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGNvZGUgPSBvcHRpb24uY29kZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgICAgICB0aGlzLnNldEluZm8ob3B0aW9uLmNvbnRlbnQpO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5mby5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICAgICAgdGFnTmFtZSA9IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCksIFxuICAgICAgICAgICAgcmVhZG1lID0gdGhpcy4kaW5mby5maW5kKCcucmVhZG1lJyk7XG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnYScpIHtcbiAgICAgICAgICAgIGlmIChyZWFkbWUubGVuZ3RoICYmICAkLmNvbnRhaW5zKHJlYWRtZVswXSwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIG9wZW4odGFyZ2V0LmhyZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGFnTmFtZSA9PT0gJ2NvZGUnICYmXG4gICAgICAgICAgICAkKHRhcmdldCkucGFyZW50KCkuaGFzQ2xhc3MoJ2NvbnRhaW5lci1zb3VyY2UnKSBcbiAgICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBsaW5lOiBwYXJzZUludCh0YXJnZXQuaW5uZXJIVE1MLnJlcGxhY2UoJ2xpbmUnLCAnJyksIDEwKSB8fCAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5mb3JtYXRpb24gaHRtbCB0byBpbmZvXG4gICAgICovXG4gICAgc2V0SW5mbzogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiRpbmZvLmh0bWwoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb2RlIGh0bWwgdG8gY29kZVxuICAgICAqL1xuICAgIHNldENvZGU6IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdGhpcy4kY29kZS5odG1sKGNvZGUpO1xuICAgICAgICB0aGlzLnNldENvZGVMaW5lKCk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBsaW5lXG4gICAgICovXG4gICAgc2V0Q29kZUxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBwcmV0dHlQcmludCgpO1xuICAgICAgICB2YXIgc291cmNlID0gdGhpcy4kY29kZS5maW5kKCcucHJldHR5cHJpbnQnKTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgbGluZU51bWJlciA9IDA7XG4gICAgICAgIHZhciBsaW5lSWQ7XG4gICAgICAgIHZhciBsaW5lcztcbiAgICAgICAgdmFyIHRvdGFsTGluZXM7XG4gICAgICAgIHZhciBhbmNob3JIYXNoO1xuXG4gICAgICAgIGlmIChzb3VyY2UgJiYgc291cmNlWzBdKSB7XG4gICAgICAgICAgICBhbmNob3JIYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBsaW5lcyA9IHNvdXJjZVswXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcbiAgICAgICAgICAgIHRvdGFsTGluZXMgPSBsaW5lcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvciAoOyBpIDwgdG90YWxMaW5lczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGluZU51bWJlcisrO1xuICAgICAgICAgICAgICAgIGxpbmVJZCA9ICdsaW5lJyArIGxpbmVOdW1iZXI7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0uaWQgPSBsaW5lSWQ7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVJZCA9PT0gYW5jaG9ySGFzaCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lc1tpXS5jbGFzc05hbWUgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0YWIgZm9yIHN0YXRlIGNoYW5nZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBBIHN0YXRlIHRvIGNoYWduZSB0YWJcbiAgICAgKi9cbiAgICBjaGFuZ2VUYWI6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ2luZm8nKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVJbmZvKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVDb2RlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmUgZW5hYmxlIGluZm8gc3RhdGVcbiAgICAgKi9cbiAgICBfZW5hYmxlSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7ICAgICAgICBcbiAgICAgICAgdGhpcy4kaW5mby5zaG93KCk7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCZSBlbmFibGUgY29kZSBzdGF0ZVxuICAgICAqL1xuICAgIF9lbmFibGVDb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb2RlJztcbiAgICAgICAgdGhpcy4kY29kZS5zaG93KCk7XG4gICAgICAgIHRoaXMuJGluZm8uaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG1vZXRob2QgYnkgaWRcbiAgICAgKi9cbiAgICBtb3ZlVG86IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gZG9jdW1lbnQuVVJMLnNwbGl0KCcjJylbMF0gKyBpZDsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0YWIgYW5kIG1vdmUgdG8gbGluZSAobnVtYmVyKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRoZSBudW1iZXIgb2YgbGluZSB0byBtb3ZlXG4gICAgICovXG4gICAgbW92ZVRvTGluZTogZnVuY3Rpb24obGluZSkge1xuICAgICAgICB0aGlzLmNoYW5nZVRhYignY29kZScpO1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTC5zcGxpdCgnIycpWzBdICsgJyNsaW5lJyArIGxpbmU7IFxuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihDb250ZW50KTtcbm1vZHVsZS5leHBvcnRzID0gQ29udGVudDtcbiIsInZhciBNZW51ID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLiRtZW51ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJHRhYiA9IG9wdGlvbi50YWI7XG4gICAgICAgIHRoaXMuY3VycmVudCA9ICdtYWluJztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpbmZvJztcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnQgdG8gcGFnZSBtb3ZlXG4gICAgICovXG4gICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRtZW51Lm9uKCdjbGljaycsIG5lLnV0aWwuYmluZCh0aGlzLm9uQ2xpY2tNZW51LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuJHRhYi5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrVGFiLCB0aGlzKSk7XG4vLyAgICAgICAgdGhpcy4kdGFiLm9uKCdtb3VzZW92ZXInLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3ZlciwgdGhpcykpO1xuLy8gICAgICAgIHRoaXMuJHRhYi5vbignbW91c2VvdXQnLCBuZS51dGlsLmJpbmQodGhpcy5vbk1vdXNlb3V0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIG1vdXNlIG92ZXJcbiAgICAgKi9cbiAgICBvbk1vdXNlb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHRhYi5maW5kKCd1bCcpLmZhZGVJbigxMDApO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi4kdGFiLmZpbmQoJ3VsJykuZmFkZU91dCgpO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGFiIGNobmFnZSBldmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgSnF1ZXJ5RXZlbnQgb2JqZWN0XG4gICAgICovXG4gICAgb25DbGlja1RhYjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygndGFibWVudScpXG4gICAgICAgICAgICYmICF0YXJnZXQuaGFzQ2xhc3MoJ29uJykpIHtcbiAgICAgICAgICAgIHZhciBpc0NvZGUgPSB0YXJnZXQuaGFzQ2xhc3MoJ2NvZGUnKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgndGFiQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBpc0NvZGUgPyAnY29kZScgOiAnaW5mbydcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNDb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuT25Db2RlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybk9uSW5mbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHR1cm5PbkluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmluZm8nKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuICAgIHR1cm5PbkNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm90aWZ5IGZvciBjaGFuZ2UgY29udGVudFxuICAgICAqL1xuICAgIG9uQ2xpY2tNZW51OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaHJlZiA9IHRhcmdldC5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICB0YXJnZXQgPSBocmVmID8gdGFyZ2V0LnBhcmVudCgpIDogdGFyZ2V0LFxuICAgICAgICAgICAgc3BlYyA9IHRhcmdldC5hdHRyKCdkYXRhLXNwZWMnKSxcbiAgICAgICAgICAgIGNvZGUgPSB0YXJnZXQuYXR0cignZGF0YS1jb2RlJyk7XG5cbiAgICAgICAgaWYgKHNwZWMpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnbm90aWZ5Jywge1xuICAgICAgICAgICAgICAgIG5hbWU6IHNwZWMsXG4gICAgICAgICAgICAgICAgY29kZU5hbWU6IGNvZGUsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG1lbnUgaHRtbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaHRtbCBzdHJpbmcgdG8gc2V0IG1lbnVcbiAgICAgKi9cbiAgICBzZXRNZW51OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuJG1lbnUuaHRtbChodG1sKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IG1lbnUgd2l0aCBzdGF0ZVxuICAgICAqL1xuICAgIHNlbGVjdDogZnVuY3Rpb24obWVudSwgc3RhdGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbWVudTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8ICdpbmZvJztcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIE9wZW4gc2VsZWN0ZWQgbWVudVxuICAgICAqLyBcbiAgICBvcGVuOiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuJG1lbnUuZmluZCgnLicgKyBtZW51KS5hZGRDbGFzcygndW5mb2xkJyk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGFiIG1lbnUgaHRtbFxuICAgICAqL1xuICAgIHNldFRhYjogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiR0YWIuaHRtbChodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBPbiBzZWxlY3RlZCB0YWJcbiAgICAgKi9cbiAgICB0YWJPbjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgdGhpcy4kdGFiLnJlbW92ZUNsYXNzKCk7XG4gICAgICAgICB0aGlzLiR0YWIuYWRkQ2xhc3MoJ3RhYiB0YWItJyArIG5hbWUpO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihNZW51KTtcbm1vZHVsZS5leHBvcnRzID0gTWVudTtcbiIsInZhciBTZWFyY2ggPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uLCBhcHApIHtcbiAgICAgICAgdGhpcy4kZWwgPSBvcHRpb24uZWxlbWVudDtcbiAgICAgICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB0aGlzLiRsaXN0ID0gdGhpcy4kZWwuZmluZCgnLnNlYXJjaExpc3QnKTtcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMucm9vdCA9IGFwcDtcbiAgICAgICAgdGhpcy5fYWRkRXZlbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIEV2ZW50c1xuICAgICAqL1xuICAgIF9hZGRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGlucHV0Lm9uKCdrZXl1cCcsIG5lLnV0aWwuYmluZChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdGhpcy5maW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7IFxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuJGxpc3Qub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25TdWJtaXQsIHRoaXMpKTsgXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXNldCBzZWFyY2hcbiAgICAgKi8gXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRpbnB1dC52YWwoJycpO1xuICAgICAgICB0aGlzLiRsaXN0LmVtcHR5KCk7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgZm9yIGNoYW5nZSBieSBzZWFyY2ggcmVzdWx0IGxpc3RcbiAgICAgKi8gXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBocmVmID0gdGFyZ2V0LmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgIHRhcmdldCA9IGhyZWYgPyB0YXJnZXQucGFyZW50KCkgOiB0YXJnZXQsXG4gICAgICAgICAgICBzcGVjID0gdGFyZ2V0LmF0dHIoJ2RhdGEtc3BlYycpLFxuICAgICAgICAgICAgY29kZSA9IHRhcmdldC5hdHRyKCdkYXRhLWNvZGUnKTtcbiAgICAgICAgdGhpcy5maXJlKCdub3RpZnknLCB7XG4gICAgICAgICAgICAgY29kZU5hbWU6IGNvZGUsXG4gICAgICAgICAgICAgbmFtZTogc3BlYyxcbiAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgIH0pO1xuICAgIH0sIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEZpbmQgd29yZCBieSBpbnB1dCB0ZXh0XG4gICAgICovXG4gICAgZmluZDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLmZpcmUoJ3NlYXJjaCcsIHsgXG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzZWFyY2ggbGlzdFxuICAgICAqL1xuICAgIHVwZGF0ZTogZnVuY3Rpb24obGlzdCkge1xuICAgICAgICB2YXIgc3RyID0gJyc7IFxuICAgICAgICBuZS51dGlsLmZvckVhY2gobGlzdCwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHN0ciArPSAnPGxpPjxzcGFuIGRhdGEtc3BlYz1cIicgKyBlbC5ncm91cCArICdcIiBkYXRhLWNvZGU9XCInICsgZWwuY29kZSArICdcIj48YSBocmVmPVwiIycgKyBlbC5pZCArICdcIj4nICsgZWwubGFiZWwucmVwbGFjZSgnLicsICcnKSArICc8L2E+PHNwYW4gY2xhc3M9XCJncm91cFwiPicgKyBlbC5ncm91cCArICc8L3NwYW4+PC9zcGFuPjwvbGk+JzsgXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRsaXN0Lmh0bWwoc3RyKTtcbiAgICAgICAgaWYgKHN0cikge1xuICAgICAgICAgICAgdGhpcy4kbGlzdC5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VhcmNoKTtcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoO1xuIl19
