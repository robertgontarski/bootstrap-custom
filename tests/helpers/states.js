import {classSelector, themeAttr} from './css.js';

/**
 * @typedef {Object} StateDef
 * @property {string} name - class-name segment, e.g. `hover` in `.hover\:text-red-500`.
 * @property {string} ownPseudo - pseudo-class appended to the utility class
 *   itself (`:hover`); empty when the state lives on an ancestor instead (group-hover).
 * @property {string} ancestorPrefix - selector plus trailing combinator space
 *   prepended before the utility class (`:where(.group):hover `); empty when there is none.
 */

/**
 * Ordered pseudo-class states, weakest to strongest in the generator's
 * cascade (`src/styles/modules/_variables.scss` `$states`): a later state
 * wins over an earlier one at equal specificity. `:where(.group):hover`
 * keeps group-hover at the same specificity as the pseudo-class states (a
 * class plus a pseudo-class), so list order alone decides a tie.
 * @type {StateDef[]}
 */
export const STATES = [
	{name: 'group-hover', ownPseudo: '', ancestorPrefix: ':where(.group):hover '},
	{name: 'hover', ownPseudo: ':hover', ancestorPrefix: ''},
	{name: 'focus', ownPseudo: ':focus', ancestorPrefix: ''},
	{name: 'focus-visible', ownPseudo: ':focus-visible', ancestorPrefix: ''},
	{name: 'active', ownPseudo: ':active', ancestorPrefix: ''},
	{name: 'disabled', ownPseudo: ':disabled', ancestorPrefix: ''},
];

/**
 * @param {string} name
 * @returns {StateDef}
 */
export function stateNamed(name) {
	const state = STATES.find((candidate) => candidate.name === name);
	if (!state) {
		throw new Error(`unknown state: ${name}`);
	}
	return state;
}

/**
 * The compiled selector for one state variant of `<className>`, matching
 * `generate-variants`' state layer (no `theme`) or theme + state layer
 * (`theme` set).
 * @param {StateDef} state
 * @param {string} className - class name segment after any `theme:` prefix, e.g. `text-blue-500`.
 * @param {'light'|'dark'|null} [theme]
 * @returns {string}
 */
export function stateClassSelector(state, className, theme = null) {
	const prefixedClass = theme ? `${theme}:${state.name}:${className}` : `${state.name}:${className}`;
	const selector = `${state.ancestorPrefix}${classSelector(prefixedClass)}${state.ownPseudo}`;
	return theme ? `${themeAttr(theme)} ${selector}` : selector;
}
