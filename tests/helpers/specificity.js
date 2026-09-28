import {findMatching, splitTopLevel} from './css.js';

/**
 * @typedef {Object} Specificity
 * @property {number} ids
 * @property {number} classes
 * @property {number} elements
 */

const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
const SPECIFICITY_FROM_ARGUMENT = new Set(['not', 'is', 'matches', 'has']);

/**
 * Reads a single compound selector token starting at `i` (a class, id,
 * pseudo-class/element, attribute selector or type selector) and returns the
 * index right after it.
 * @param {string} s
 * @param {number} i
 * @returns {number}
 */
function skipIdentifier(s, i) {
	let pos = i;
	while (pos < s.length) {
		const c = s[pos];
		if (c === '\\') {
			pos += 2;
			continue;
		}
		if (/[A-Za-z0-9_-]/.test(c)) {
			pos += 1;
			continue;
		}
		break;
	}
	return pos;
}

/**
 * @param {string} s
 * @param {number} openIndex - index of the `(` right after the pseudo-class name.
 * @returns {{argsStart: number, argsEnd: number, end: number}}
 */
function readPseudoArgs(s, openIndex) {
	const closeIndex = findMatching(s, openIndex, '(', ')');
	return {argsStart: openIndex + 1, argsEnd: closeIndex, end: closeIndex + 1};
}

/**
 * @param {Specificity} a
 * @param {Specificity} b
 * @returns {number} negative if `a` is less specific, positive if more, 0 if equal.
 */
export function compareSpecificity(a, b) {
	if (a.ids !== b.ids) return a.ids - b.ids;
	if (a.classes !== b.classes) return a.classes - b.classes;
	return a.elements - b.elements;
}

/**
 * CSS specificity of a single selector (no top-level commas). `:where()`
 * always contributes zero; `:is()`/`:not()`/`:has()` contribute the
 * specificity of their most specific argument, per the CSS Selectors spec.
 * @param {string} selector
 * @returns {Specificity}
 */
export function specificity(selector) {
	let ids = 0;
	let classes = 0;
	let elements = 0;
	let i = 0;
	while (i < selector.length) {
		const c = selector[i];
		if (c === ' ' || c === '>' || c === '+' || c === '~' || c === '*') {
			i += 1;
			continue;
		}
		if (c === '#') {
			ids += 1;
			i = skipIdentifier(selector, i + 1);
			continue;
		}
		if (c === '.') {
			classes += 1;
			i = skipIdentifier(selector, i + 1);
			continue;
		}
		if (c === '[') {
			classes += 1;
			i = findMatching(selector, i, '[', ']') + 1;
			continue;
		}
		if (c === ':') {
			if (selector[i + 1] === ':') {
				elements += 1;
				const nameEnd = skipIdentifier(selector, i + 2);
				i = selector[nameEnd] === '(' ? readPseudoArgs(selector, nameEnd).end : nameEnd;
				continue;
			}
			const nameEnd = skipIdentifier(selector, i + 1);
			const name = selector.slice(i + 1, nameEnd).toLowerCase();
			const hasArgs = selector[nameEnd] === '(';
			const args = hasArgs ? readPseudoArgs(selector, nameEnd) : null;
			if (name === 'where') {
				// Contributes nothing, for itself or its argument.
			} else if (SPECIFICITY_FROM_ARGUMENT.has(name) && args) {
				let best = {ids: 0, classes: 0, elements: 0};
				for (const alt of splitTopLevel(selector.slice(args.argsStart, args.argsEnd), ',')) {
					const candidate = specificity(alt.trim());
					if (compareSpecificity(candidate, best) > 0) best = candidate;
				}
				ids += best.ids;
				classes += best.classes;
				elements += best.elements;
			} else if (LEGACY_PSEUDO_ELEMENTS.has(name)) {
				elements += 1;
			} else {
				classes += 1;
			}
			i = args ? args.end : nameEnd;
			continue;
		}
		if (c === '\\') {
			i += 2;
			continue;
		}
		elements += 1;
		i = skipIdentifier(selector, i);
	}
	return {ids, classes, elements};
}

/**
 * Whether `candidate` beats `base` in the cascade: higher specificity, or
 * equal specificity and a later source position.
 * @param {import('./css.js').CssRule} candidate
 * @param {import('./css.js').CssRule} base
 * @returns {boolean}
 */
export function wins(candidate, base) {
	const cmp = compareSpecificity(specificity(candidate.selector), specificity(base.selector));
	if (cmp !== 0) return cmp > 0;
	return candidate.order > base.order;
}
