import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

/**
 * @typedef {Object} CssRule
 * @property {string} selector - one top-level selector, already split out of
 *   a comma-separated selector list; still CSS-escaped as written.
 * @property {string} declarations - the raw declaration block of the rule
 *   this selector belongs to.
 * @property {string|null} media - the innermost `@media` prelude the rule
 *   sits in (e.g. `@media (min-width:768px)`), or `null` at the top level.
 * @property {number} order - source position of the rule; selectors that
 *   share one comma-separated rule share the same order.
 */

const RECURSING_AT_RULES = new Set(['media', 'supports', 'layer', 'container']);

/**
 * @param {string} repoRootPath
 * @returns {string}
 */
function distCssPath(repoRootPath) {
	return path.join(repoRootPath, 'dist', 'bootstrap.css');
}

/**
 * @returns {string}
 */
export function repoRoot() {
	const here = path.dirname(fileURLToPath(import.meta.url));
	return path.resolve(here, '..', '..');
}

/**
 * @returns {string}
 */
export function readDistCss() {
	return readFileSync(distCssPath(repoRoot()), 'utf8');
}

/**
 * @param {string} s
 * @returns {string}
 */
function stripComments(s) {
	let out = '';
	let i = 0;
	let quote = null;
	while (i < s.length) {
		const c = s[i];
		if (quote) {
			out += c;
			if (c === '\\') {
				out += s[i + 1] ?? '';
				i += 2;
				continue;
			}
			if (c === quote) quote = null;
			i++;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			out += c;
			i++;
			continue;
		}
		if (c === '/' && s[i + 1] === '*') {
			const end = s.indexOf('*/', i + 2);
			i = end === -1 ? s.length : end + 2;
			continue;
		}
		out += c;
		i++;
	}
	return out;
}

/**
 * Index of the character in `s` that closes the bracket opened at `openIndex`
 * (`openChar` there), tracking nesting and skipping quoted/escaped content.
 * @param {string} s
 * @param {number} openIndex
 * @param {string} openChar
 * @param {string} closeChar
 * @returns {number}
 */
export function findMatching(s, openIndex, openChar, closeChar) {
	let depth = 0;
	let quote = null;
	for (let i = openIndex; i < s.length; i++) {
		const c = s[i];
		if (quote) {
			if (c === '\\') {
				i++;
				continue;
			}
			if (c === quote) quote = null;
			continue;
		}
		if (c === '\\') {
			i++;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			continue;
		}
		if (c === openChar) depth++;
		else if (c === closeChar) {
			depth--;
			if (depth === 0) return i;
		}
	}
	return s.length - 1;
}

/**
 * Index of the next top-level `{`, `}` or `;` from `from`, ignoring
 * occurrences inside `()`/`[]`/quotes.
 * @param {string} s
 * @param {number} from
 * @returns {number}
 */
function nextTopLevelDelimiter(s, from) {
	let depth = 0;
	let quote = null;
	for (let i = from; i < s.length; i++) {
		const c = s[i];
		if (quote) {
			if (c === '\\') {
				i++;
				continue;
			}
			if (c === quote) quote = null;
			continue;
		}
		if (c === '\\') {
			i++;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			continue;
		}
		if (c === '(' || c === '[') depth++;
		else if (c === ')' || c === ']') depth--;
		else if (depth === 0 && (c === '{' || c === ';' || c === '}')) return i;
	}
	return -1;
}

/**
 * Splits `s` on top-level occurrences of `separator`, ignoring ones inside
 * `()`/`[]`/quotes or escaped with a backslash.
 * @param {string} s
 * @param {string} separator
 * @returns {string[]}
 */
export function splitTopLevel(s, separator) {
	const parts = [];
	let depth = 0;
	let quote = null;
	let current = '';
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		if (quote) {
			current += c;
			if (c === '\\') {
				current += s[i + 1] ?? '';
				i++;
				continue;
			}
			if (c === quote) quote = null;
			continue;
		}
		if (c === '\\') {
			current += c + (s[i + 1] ?? '');
			i++;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			current += c;
			continue;
		}
		if (c === '(' || c === '[') depth++;
		if (c === ')' || c === ']') depth--;
		if (c === separator && depth === 0) {
			parts.push(current);
			current = '';
			continue;
		}
		current += c;
	}
	parts.push(current);
	return parts;
}

/**
 * Parses minified CSS into a flat, source-ordered list of rules, one entry
 * per selector in a comma-separated selector list. Recurses into `@media`
 * (and `@supports`/`@layer`/`@container`); drops the body of every other
 * at-rule (`@keyframes`, `@font-face`, ...) without extracting rules from it.
 * @param {string} source
 * @returns {CssRule[]}
 */
export function parseCss(source) {
	const text = stripComments(source);
	/** @type {CssRule[]} */
	const rules = [];
	let order = 0;

	/**
	 * @param {string} chunk
	 * @param {string|null} media
	 * @returns {void}
	 */
	function walk(chunk, media) {
		let pos = 0;
		while (pos < chunk.length) {
			const delimiter = nextTopLevelDelimiter(chunk, pos);
			if (delimiter === -1) break;
			const delimiterChar = chunk[delimiter];
			const prelude = chunk.slice(pos, delimiter).trim();
			if (delimiterChar === ';' || delimiterChar === '}') {
				pos = delimiter + 1;
				continue;
			}
			const bodyEnd = findMatching(chunk, delimiter, '{', '}');
			const body = chunk.slice(delimiter + 1, bodyEnd);
			if (prelude.startsWith('@')) {
				const name = (prelude.match(/^@([a-zA-Z-]+)/) ?? ['', ''])[1].toLowerCase();
				if (name === 'media') {
					walk(body, prelude.replace(/\s+/g, ' ').trim());
				} else if (RECURSING_AT_RULES.has(name)) {
					walk(body, media);
				}
			} else if (prelude.length > 0) {
				const currentOrder = order;
				order += 1;
				for (const rawSelector of splitTopLevel(prelude, ',')) {
					const selector = rawSelector.trim();
					if (selector.length > 0) {
						rules.push({selector, declarations: body.trim(), media, order: currentOrder});
					}
				}
			}
			pos = bodyEnd + 1;
		}
	}

	walk(text, null);
	return rules;
}

/**
 * Names declared by every `@keyframes` rule. `parseCss` recurses into
 * `@media`/`@supports`/`@layer`/`@container` but drops the body of every
 * other at-rule, including `@keyframes`, without extracting rules from it -
 * this is the minimal extra pass needed to assert `app-*` keyframes exist.
 * @param {string} source
 * @returns {string[]}
 */
export function parseKeyframeNames(source) {
	const text = stripComments(source);
	const pattern = /@(?:-webkit-|-moz-|-o-)?keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
	const names = [];
	let match = pattern.exec(text);
	while (match !== null) {
		names.push(match[1]);
		match = pattern.exec(text);
	}
	return names;
}

/**
 * @returns {{source: string, rules: CssRule[], keyframeNames: string[]}}
 */
function parseDistCss() {
	const source = readDistCss();
	return {source, rules: parseCss(source), keyframeNames: parseKeyframeNames(source)};
}

/** @type {{source: string, rules: CssRule[], keyframeNames: string[]}|null} */
let distCssCache = null;

/**
 * Reads and parses `dist/bootstrap.css` once per process.
 * @returns {{source: string, rules: CssRule[], keyframeNames: string[]}}
 */
export function getDistCss() {
	if (!distCssCache) {
		distCssCache = parseDistCss();
	}
	return distCssCache;
}

/**
 * @param {CssRule[]} rules
 * @returns {Map<string, CssRule[]>}
 */
export function indexBySelector(rules) {
	/** @type {Map<string, CssRule[]>} */
	const index = new Map();
	for (const rule of rules) {
		const bucket = index.get(rule.selector);
		if (bucket) {
			bucket.push(rule);
		} else {
			index.set(rule.selector, [rule]);
		}
	}
	return index;
}

/**
 * @param {CssRule[]} rules
 * @param {string} selector
 * @returns {CssRule[]}
 */
export function findRules(rules, selector) {
	return rules.filter((rule) => rule.selector === selector);
}

/**
 * @param {CssRule[]} rules
 * @param {string} selector
 * @returns {CssRule|undefined}
 */
export function findRule(rules, selector) {
	return rules.find((rule) => rule.selector === selector);
}

/**
 * @param {CssRule} rule
 * @returns {boolean}
 */
export function isImportant(rule) {
	return rule.declarations.includes('!important');
}

/**
 * @param {string} name - a class name without the leading `.`, e.g.
 *   `dark:hover:text-blue-500` or `fs-[16px]`.
 * @returns {string}
 */
export function escapeClassName(name) {
	return name.replace(/[:[\]]/g, (ch) => `\\${ch}`);
}

/**
 * @param {string} name - a class name without the leading `.`.
 * @returns {string}
 */
export function classSelector(name) {
	return `.${escapeClassName(name)}`;
}

/**
 * @param {'light'|'dark'} theme
 * @returns {string}
 */
export function themeAttr(theme) {
	return `[data-bs-theme=${theme}]`;
}
