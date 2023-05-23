/*

This piece of code is licensed under GNU GPL 3.0 or later.

*/

import {} from "../../libs/showdown/showdown.min.js";

{
	// Batch type comparison, one array-based, one argument-based
	try {
		var Compare = function () {
			this.type = function (dType, args) {
				var count = 0;
				Array.from(args).forEach(function (e) {
					if (!!e) {
						if (e.constructor == dType) {
							count ++;
						};
					};
				});
				return count;
			};
			this.able = function (args) {
				var count = 0;
				Array.from(args).forEach(function (e) {
					if (e != null && e != undefined) {
						count ++;
					};
				});
				return count;
			};
		};
		Compare = new Compare();
	} catch (err) {};
	try {
		var Compard = function () {
			this.type = function () {
				var dType = arguments[0];
				var args = Array.from(arguments).slice(1, arguments.length - 1);
				return Compare.type(dType, args);
			};
			this.able = function () {
				return Compare.able(arguments);
			};
		};
		Compard = new Compard();
	} catch (err) {};
	// Apply templates to a string
	let objectPath = function (path, obj) {
		let result = obj, paths = path.split(".");
		paths.forEach(function (e) {
			if (Compard.able(result, result[e]) < 2) {
				result = "${" + path + "}";
			} else {
				result = result[e];
			};
		});
		return result;
	};
	String.prototype.apply = function (map, activator = "${}") {
		// JS string templates
		/*
		Mode 0 for seeking replacement activation
		Mode 1 for building replacement instruction
		*/
		let mode = 0, skip = 0, step = -1, instr = [], found = "", result = "";
		Array.from(this).forEach(function (e) {
			if (skip > 0) {
				result += e;
				skip --;
			} else if (e == '\\') {
				skip ++;
			} else {
				switch (mode) {
					case 0: {
						if (e == activator[0]) {
							mode = 1;
						} else {
							result += e;
						};
						break;
					};
					case 1: {
						if (e == activator[1]) {
							step ++;
							instr.push("");
						} else if (e == activator[2]) {
							found = objectPath(instr[step], map);
							step --;
							if (step < 0) {
								result += found;
							} else {
								instr[step] += found;
							};
							instr.pop();
						} else if (step < 0) {
							if (e != activator[0]) {
								result += e;
								mode = 0;
							};
						} else {
							instr[step] += e;
						};
						break;
					};
				};
			};
		});
		return result;
	};
};

if (!Deno.args[0]) {
	throw(`No site context path provided.`);
};
if (!Deno.args[1]) {
	throw(`No template context path provided.`);
};
let pathCtxSite = Deno.args[0], pathCtxTpl = Deno.args[1];
console.error(`Building "${pathCtxTpl}"...`);

let mdParser = new showdown.Converter({
	omitExtraWLInCodeBlocks: true,
	ghCompatibleHeaderId: true,
	parseImgDimensions: true,
	simplifiedAutoLink: true,
	excludeTrailingPunctuationFromURLs: true,
	strikethrough: true,
	tables: true,
	tablesHeaderId: true,
	tasklists: true,
	disableForced4SpacesIndentedSublists: true,
	simpleLineBreaks: true,
	requireSpaceBeforeHeadingText: true
});

// Load contexts
let ctxSite = JSON.parse(Deno.readTextFileSync(pathCtxSite)),
ctxTpl = JSON.parse(Deno.readTextFileSync(pathCtxTpl)),
workDir = pathCtxTpl.slice(0, pathCtxTpl.lastIndexOf("/"));

// Context building
let context = {
	"site": ctxSite?.site || {},
	"base": {},
	"page": ctxTpl?.page || {},
	"text": {}
};

// Load all texts
for (let key in ctxSite?.load?.md) {
	context.base[key] = mdParser.makeHtml(Deno.readTextFileSync(`${ctxSite.load.md[key]}`));
};
for (let key in ctxSite?.load?.text) {
	context.base[key] = Deno.readTextFileSync(`${ctxSite.load.text[key]}`);
};
for (let key in ctxTpl?.load?.md) {
	context.text[key] = mdParser.makeHtml(Deno.readTextFileSync(`${workDir}/${ctxTpl.load.md[key]}`));
};
for (let key in ctxTpl?.load?.text) {
	context.text[key] = Deno.readTextFileSync(`${workDir}/${ctxTpl.load.text[key]}`);
};
// Copy all texts
for (let key in ctxSite?.copy?.md) {
	context.base[key] = mdParser.makeHtml(ctxSite.copy.md[key]);
};
for (let key in ctxSite?.copy?.text) {
	context.base[key] = ctxSite.copy.text[key];
};
for (let key in ctxTpl?.copy?.md) {
	context.text[key] = mdParser.makeHtml(ctxTpl.copy.md[key]);
	context.text[key] = context.text[key].slice(context.text[key].indexOf("<p>"), context.text[key].lastIndexOf("</p>"));
};
for (let key in ctxTpl?.copy?.text) {
	context.text[key] = ctxTpl.copy.text[key];
};

// Context done
//console.error(context);
console.info(Deno.readTextFileSync(`${workDir}/${ctxTpl.template}`).apply(context));
