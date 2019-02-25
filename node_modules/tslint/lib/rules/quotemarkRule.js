"use strict";
/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tsutils_1 = require("tsutils");
var ts = require("typescript");
var Lint = require("../index");
var OPTION_SINGLE = "single";
var OPTION_DOUBLE = "double";
var OPTION_BACKTICK = "backtick";
var OPTION_JSX_SINGLE = "jsx-single";
var OPTION_JSX_DOUBLE = "jsx-double";
var OPTION_AVOID_TEMPLATE = "avoid-template";
var OPTION_AVOID_ESCAPE = "avoid-escape";
var Rule = /** @class */ (function (_super) {
    tslib_1.__extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* tslint:enable:object-literal-sort-keys */
    Rule.FAILURE_STRING = function (actual, expected) {
        return actual + " should be " + expected;
    };
    Rule.prototype.apply = function (sourceFile) {
        var args = this.ruleArguments;
        var quoteMark = getQuotemarkPreference(args);
        var jsxQuoteMark = getJSXQuotemarkPreference(args);
        return this.applyWithFunction(sourceFile, walk, {
            avoidEscape: hasArg(OPTION_AVOID_ESCAPE),
            avoidTemplate: hasArg(OPTION_AVOID_TEMPLATE),
            jsxQuoteMark: jsxQuoteMark,
            quoteMark: quoteMark,
        });
        function hasArg(name) {
            return args.indexOf(name) !== -1;
        }
    };
    /* tslint:disable:object-literal-sort-keys */
    Rule.metadata = {
        ruleName: "quotemark",
        description: "Enforces quote character for string literals.",
        hasFix: true,
        optionsDescription: Lint.Utils.dedent(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n            Five arguments may be optionally provided:\n\n            * `\"", "\"` enforces single quotes.\n            * `\"", "\"` enforces double quotes.\n            * `\"", "\"` enforces backticks.\n            * `\"", "\"` enforces single quotes for JSX attributes.\n            * `\"", "\"` enforces double quotes for JSX attributes.\n            * `\"", "\"` forbids single-line untagged template strings that do not contain string interpolations.\n            * `\"", "\"` allows you to use the \"other\" quotemark in cases where escaping would normally be required.\n            For example, `[true, \"", "\", \"", "\"]` would not report a failure on the string literal\n            `'Hello \"World\"'`."], ["\n            Five arguments may be optionally provided:\n\n            * \\`\"", "\"\\` enforces single quotes.\n            * \\`\"", "\"\\` enforces double quotes.\n            * \\`\"", "\"\\` enforces backticks.\n            * \\`\"", "\"\\` enforces single quotes for JSX attributes.\n            * \\`\"", "\"\\` enforces double quotes for JSX attributes.\n            * \\`\"", "\"\\` forbids single-line untagged template strings that do not contain string interpolations.\n            * \\`\"", "\"\\` allows you to use the \"other\" quotemark in cases where escaping would normally be required.\n            For example, \\`[true, \"", "\", \"", "\"]\\` would not report a failure on the string literal\n            \\`'Hello \"World\"'\\`."])), OPTION_SINGLE, OPTION_DOUBLE, OPTION_BACKTICK, OPTION_JSX_SINGLE, OPTION_JSX_DOUBLE, OPTION_AVOID_TEMPLATE, OPTION_AVOID_ESCAPE, OPTION_DOUBLE, OPTION_AVOID_ESCAPE),
        options: {
            type: "array",
            items: {
                type: "string",
                enum: [
                    OPTION_SINGLE,
                    OPTION_DOUBLE,
                    OPTION_BACKTICK,
                    OPTION_JSX_SINGLE,
                    OPTION_JSX_DOUBLE,
                    OPTION_AVOID_ESCAPE,
                    OPTION_AVOID_TEMPLATE,
                ],
            },
            minLength: 0,
            maxLength: 5,
        },
        optionExamples: [
            [true, OPTION_SINGLE, OPTION_AVOID_ESCAPE, OPTION_AVOID_TEMPLATE],
            [true, OPTION_SINGLE, OPTION_JSX_DOUBLE],
        ],
        type: "style",
        typescriptOnly: false,
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(ctx) {
    var sourceFile = ctx.sourceFile, options = ctx.options;
    ts.forEachChild(sourceFile, function cb(node) {
        if (tsutils_1.isStringLiteral(node) ||
            (options.avoidTemplate &&
                tsutils_1.isNoSubstitutionTemplateLiteral(node) &&
                node.parent.kind !== ts.SyntaxKind.TaggedTemplateExpression &&
                tsutils_1.isSameLine(sourceFile, node.getStart(sourceFile), node.end))) {
            var expectedQuoteMark = node.parent.kind === ts.SyntaxKind.JsxAttribute
                ? options.jsxQuoteMark
                : options.quoteMark;
            var actualQuoteMark = sourceFile.text[node.end - 1];
            if (actualQuoteMark === expectedQuoteMark) {
                return;
            }
            var fixQuoteMark = expectedQuoteMark;
            var needsQuoteEscapes = node.text.includes(expectedQuoteMark);
            // This string requires escapes to use the expected quote mark, but `avoid-escape` was passed
            if (needsQuoteEscapes && options.avoidEscape) {
                if (node.kind === ts.SyntaxKind.StringLiteral) {
                    return;
                }
                // If we are expecting double quotes, use single quotes to avoid
                //   escaping. Otherwise, just use double quotes.
                fixQuoteMark = expectedQuoteMark === '"' ? "'" : '"';
                // It also includes the fixQuoteMark. Let's try to use single
                //   quotes instead, unless we originally expected single
                //   quotes, in which case we will try to use backticks. This
                //   means that we may use backtick even with avoid-template
                //   in trying to avoid escaping. What is the desired priority
                //   here?
                if (node.text.includes(fixQuoteMark)) {
                    fixQuoteMark = expectedQuoteMark === "'" ? "`" : "'";
                    // It contains all of the other kinds of quotes. Escaping is
                    //   unavoidable, sadly.
                    if (node.text.includes(fixQuoteMark)) {
                        return;
                    }
                }
            }
            var start = node.getStart(sourceFile);
            var text = sourceFile.text.substring(start + 1, node.end - 1);
            if (needsQuoteEscapes) {
                text = text.replace(new RegExp(fixQuoteMark, "g"), "\\" + fixQuoteMark);
            }
            text = text.replace(new RegExp("\\\\" + actualQuoteMark, "g"), actualQuoteMark);
            return ctx.addFailure(start, node.end, Rule.FAILURE_STRING(actualQuoteMark, fixQuoteMark), new Lint.Replacement(start, node.end - start, fixQuoteMark + text + fixQuoteMark));
        }
        ts.forEachChild(node, cb);
    });
}
function getQuotemarkPreference(args) {
    var _a;
    var quoteFromOption = (_a = {},
        _a[OPTION_SINGLE] = "'",
        _a[OPTION_DOUBLE] = '"',
        _a[OPTION_BACKTICK] = "`",
        _a);
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        switch (arg) {
            case OPTION_SINGLE:
            case OPTION_DOUBLE:
            case OPTION_BACKTICK:
                return quoteFromOption[arg];
        }
    }
    // Default to double quotes if no pref is found.
    return '"';
}
function getJSXQuotemarkPreference(args) {
    var _a;
    var jsxQuoteFromOption = (_a = {},
        _a[OPTION_JSX_SINGLE] = "'",
        _a[OPTION_JSX_DOUBLE] = '"',
        _a);
    for (var _i = 0, args_2 = args; _i < args_2.length; _i++) {
        var arg = args_2[_i];
        switch (arg) {
            case OPTION_JSX_SINGLE:
            case OPTION_JSX_DOUBLE:
                return jsxQuoteFromOption[arg];
        }
    }
    // The JSX preference was not found, so try to use the regular preference.
    //   If the regular pref is backtick, use double quotes instead.
    var regularQuotemark = getQuotemarkPreference(args);
    return regularQuotemark !== "`" ? regularQuotemark : '"';
}
var templateObject_1;
