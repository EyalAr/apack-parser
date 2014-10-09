'use strict';

(function(undefined) {

    var decree = require('decree'),
        DEFAULT_SYNTAX = require('./defaultSyntax'),
        defs = require('./defs');

    decree.register('regexp', function(v) {
        return v instanceof RegExp;
    });

    var syntaxJudge = decree(defs.SYNTAX_DECS);

    /**
     * Build a parsing function based on the given syntax.
     */
    function getParser(syntax) {
        syntax = syntax || {};

        if (Object.prototype.toString.call(syntax) !== '[object Object]')
            throw Error("Expected first argument to be an object");

        syntax.durationMarks = syntax.durationMarks || DEFAULT_SYNTAX.durationMarks;
        syntax.tagMarks = syntax.tagMarks || DEFAULT_SYNTAX.tagMarks;
        syntax.actionsDelimiter = syntax.actionsDelimiter || DEFAULT_SYNTAX.actionsDelimiter;
        syntax.parametersDelimiter = syntax.parametersDelimiter || DEFAULT_SYNTAX.parametersDelimiter;
        syntax.commentPrefix = syntax.commentPrefix || DEFAULT_SYNTAX.commentPrefix;
        syntax.actions = syntax.actions || DEFAULT_SYNTAX.actions;

        // validate syntax
        syntaxJudge([syntax.durationMarks,
            syntax.tagMarks,
            syntax.actionsDelimiter,
            syntax.parametersDelimiter,
            syntax.commentPrefix,
            syntax.actions
        ]);

        // regular expressions
        syntax.re = {

            tag: new RegExp(
                "^" +
                reEscape(syntax.tagMarks[0]) +
                "(.+)" +
                reEscape(syntax.tagMarks[1]) +
                "$"
            ),

            duration: new RegExp(
                "^" +
                reEscape(syntax.durationMarks[0]) +
                "(\\d+\\.?\\d*)\\s*(\\w*)" +
                reEscape(syntax.durationMarks[1]) +
                "$"
            )

        };

        return function(text) {
            return parse(text, syntax);
        }
    }

    /**
     * Parse an animation pack text based on the given syntax.
     * @param text {string} The raw text to parse.
     * @returns {object} An animation pack tree.
     */
    function parse(text, syntax) {

        if (Object.prototype.toString.call(text) !== '[object String]')
            throw Error("Expected first argument to be a string");

        var wsRe = /^(\s*)\S+/, // match white space at start of line
            indRe = null, // later
            indBase = null; // base indentation

        // break text into lines:
        var lines = text.split(/[\n\r]/)

        // clearn remaining line breaks (mostly for Windows users)
        .map(function(line, i) {
            return {
                content: line.replace(/[\n\r]/, ''),
                num: i
            };
        })

        // filter out comments:
        .map(function(line) {
            var i = line.content.indexOf(syntax.commentPrefix);
            if (i !== -1) line.content = line.content.substr(0, i);
            return line;
        })

        // ignore empty lines
        .filter(function(line) {
            return line.content.trim().length !== 0
        })

        // remember this line's index in the array (need it later):
        .map(function(line, i) {
            line.idx = i;
            return line;
        })

        // detect indentation of each line:
        .map(function(line) {
            var m = line.content.match(wsRe);
            // m will always contain a match because we removed all empty
            // lines.
            // m[0] contains the white spaces at the start of the line.
            var ind = m[1].length;
            if (ind > 0) {
                if (!indBase) {
                    indBase = ind;
                    indRe = new RegExp("^" + m[1][0] + "*$");
                }
                // check the indentation is valid:
                if (!indRe.test(m[1]))
                    throw Error("Mixed spaces and tabs at line " + (line.num + 1));
                ind /= indBase;
                if (ind != (0 | ind))
                    throw Error("Inconsistent indentation at line " + (line.num + 1));
            }
            line.ind = ind;
            return line;
        })

        // trim lines:
        .map(function(line) {
            line.content = line.content.trim();
            return line;
        })

        // build tree hirarchy:
        .map(function(line, i, lines) {
            var p = -1; // root
            for (var j = i - 1; j >= 0; j--) {
                if (lines[j].ind < line.ind) {
                    p = j;
                    break;
                }
            }
            line.parentIdx = p; // parent's index in `lines`
            return line;
        });

        // build a tree:
        var tree = {
            lineIdx: -1, // corresponding line index in `lines`
            tag: null,
            duration: null,
            actions: [],
            children: []
        };
        buildTree(tree, lines, syntax);

        return tree;
    };

    /**
     * Parse a line.
     * @param {string} line Line to parse.
     * @param {int} num The line number.
     * @returns {object} Object representing the parsed line. Fields:
     *      - tag {String}
     *      - duration {Object}
     *          - value {String}
     *          - unit {String}
     *      - actions {Array[Object]}
     *          - name {String}
     *          - params {Array}
     */
    function parseLine(line, num, syntax) {
        var hasDuration = true,
            hasTag = true,
            res = {
                tag: null,
                duration: null,
                actions: [],
            };

        // first check if it's a 'tag' line:
        var m = line.match(syntax.re.tag);
        if (m) {
            res.tag = m[1];
            return res;
        }

        res.actions = line.split(syntax.actionsDelimiter);

        var last = res.actions[res.actions.length - 1].split(syntax.durationMarks[0]);

        if (last.length > 1) {
            res.actions[res.actions.length - 1] = last[0];
            last = syntax.durationMarks[0] + last.slice(1).join(syntax.durationMarks[0]);
        } else {
            // user didn't specify duration
            hasDuration = false;
            last = last[0];
        }

        last = last.split(syntax.tagMarks[0]);
        if (last.length > 1) {
            if (!hasDuration) {
                res.actions[res.actions.length - 1] = last[0];
                last = last[1];
            }
        } else {
            // user didn't specify tag
            hasTag = false;
        }

        if (hasDuration) res.duration = last[0];
        if (hasTag) {
            if (hasDuration) res.tag = last[1];
            else res.tag = last;
            res.tag = syntax.tagMarks[0] + res.tag;
        }

        if (res.tag) {
            m = res.tag.trim().match(syntax.re.tag);
            if (!m) throw Error("Invalid tag (line " + (num + 1) + ")");
            res.tag = m[1];
        }

        if (res.duration) {
            m = res.duration.trim().match(syntax.re.duration);
            if (!m) throw Error("Invalid duration (line " + (num + 1) + ")");
            var toMs = defs.DURATION_UNITS[m[2].toLowerCase()];
            if (!toMs) throw Error("Invalid duration time unit '" + m[2] + "' (line " + (num + 1) + ")");
            res.duration = +m[1] * toMs;
        }

        res.actions = res.actions.map(function(action, i) {
            var parts = action.trim().split(syntax.parametersDelimiter),
                name = parts[0],
                params = parts.slice(1);
            if (syntax.actions.indexOf(name) === -1)
                throw Error("Invalid action" + (name.length ? " '" + name + "'" : '') + " (line " + (num + 1) + ")");
            if (!params.length)
                throw Error("Action '" + name + "' missing params (line " + (num + 1) + ")");
            return {
                name: name,
                params: params
            };
        });

        return res;
    }

    /**
     * Escape a string for regex construction.
     * @param string s The string to escape
     * @returns string The escaped string.
     */
    function reEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     * Recursively build the tree by parsing each line and its children.
     */
    function buildTree(root, lines, syntax) {
        root.children = lines.filter(function(line, i) {
            return line.parentIdx === root.lineIdx;
        }).map(function(line) {
            var subTree = parseLine(line.content, line.num, syntax);
            subTree.lineIdx = line.idx;
            buildTree(subTree, lines, syntax);
            return subTree;
        });
    }

    module.exports = getParser;

})(void 0);
