/**
 * based on John Resig's `tmpl` implementation
 * http://ejohn.org/blog/javascript-micro-templating/
 * and cho45's micro-template
 * https://github.com/cho45/micro-template.js
 */
;(function(){

    var cache = {};

    window.tmpl = function(selector, data, variable) {
        var $this = document.querySelector(selector);

        if (!cache[selector] && $this) {
            cache[selector] = (function() {
                var src = $this.innerHTML;

                var body = (
                        (variable ?
                         "var " + variable + " = this.stash;\n" : "with (this.stash) {\n") +
                            "this.ret += '"  +
                            src.
                                replace(/<%/g, '\x11').replace(/%>/g, '\x13'). // if you want other tag, just edit this line
                                replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27').
                                replace(/^\s*|\s*$/g, '').
                                replace(/\n/g, function () { return "';\nthis.ret += '\\n" }).
                                replace(/\x11=(.+?)\x13/g, "' + ($1) + '").
                                replace(/\x11-(.+?)\x13/g, "' + this.escapeHTML($1) + '").
                                replace(/\x11(.+?)\x13/g, "'; $1; this.ret += '") +
                        "'; " + (variable ? "" : "}") + "return this.ret;" +
                        "//@ sourceURL=/tmpl/" + selector + "\n" // source map
                    ).replace(/this\.ret \+= '';/g, '');

                var fn = new Function(variable, body);
                var map  = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\x22' : '&#x22;', '\x27' : '&#x27;' };
                var escapeHTML = function (src) { return ('' + src).replace(/[&<>\'\"]/g, function (_) { return map[_] }) };

                return function (stash) { return fn.call({ escapeHTML: escapeHTML, line: 1, ret : '', stash: stash }) };
            }) ();
        }

        return data ? cache[selector](data) : cache[selector];
    };
})();