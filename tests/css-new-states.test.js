import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector} from './helpers/css.js';
import {stateNamed, stateClassSelector} from './helpers/states.js';

const {rules} = getDistCss();
const bySelector = indexBySelector(rules);

/**
 * @param {string} selector
 * @returns {import('./helpers/css.js').CssRule}
 */
function rule(selector) {
	const matches = bySelector.get(selector);
	assert.ok(matches && matches.length > 0, `missing rule for ${selector}`);
	return matches[0];
}

/**
 * Color families whose modules keep `generate-variants`' default state
 * matrix (`src/styles/modules/_variables.scss` `$states`). `link` and
 * `btn`/`btn-outline` opt out (`$states: ()`) and are not covered here.
 * @type {string[]}
 */
const STATE_ENABLED_FAMILIES = [
	'text',
	'bg',
	'border',
	'border-top',
	'border-end',
	'border-bottom',
	'border-start',
	'shadow',
	'shadow-sm',
	'shadow-lg',
	'alert',
	'text-bg',
	'text-bg-outline',
	'fill',
	'stroke',
];

const SAMPLE_COLOR = 'blue-500';
const NEW_STATE_NAMES = ['focus-visible', 'disabled', 'group-hover'];

for (const family of STATE_ENABLED_FAMILIES) {
	for (const stateName of NEW_STATE_NAMES) {
		const state = stateNamed(stateName);

		test(`${stateName}:${family}-${SAMPLE_COLOR} rule exists (base, criterion 7)`, () => {
			rule(stateClassSelector(state, `${family}-${SAMPLE_COLOR}`));
		});

		test(`dark:${stateName}:${family}-${SAMPLE_COLOR} rule exists (themed, criterion 7)`, () => {
			rule(stateClassSelector(state, `${family}-${SAMPLE_COLOR}`, 'dark'));
		});
	}
}

test('disabled:bg-gray-300 rule exists for a disabled button (criterion 7)', () => {
	rule(stateClassSelector(stateNamed('disabled'), 'bg-gray-300'));
});

test('group-hover:text-blue-500 rule exists inside a hovered .group (criterion 7)', () => {
	rule(stateClassSelector(stateNamed('group-hover'), 'text-blue-500'));
});

test('disabled:bg-blue-500 compiles to :disabled, never a .disabled class', () => {
	const selector = stateClassSelector(stateNamed('disabled'), 'bg-blue-500');

	assert.equal(selector, '.disabled\\:bg-blue-500:disabled');
	rule(selector);
});

test('group-hover:text-blue-500 compiles to a :where(.group):hover ancestor', () => {
	const selector = stateClassSelector(stateNamed('group-hover'), 'text-blue-500');

	assert.equal(selector, ':where(.group):hover .group-hover\\:text-blue-500');
	rule(selector);
});

test('every group-hover: rule starts with the :where(.group):hover ancestor, for every state-enabled family', () => {
	const groupHover = stateNamed('group-hover');

	for (const family of STATE_ENABLED_FAMILIES) {
		const selector = stateClassSelector(groupHover, `${family}-${SAMPLE_COLOR}`);

		assert.ok(selector.startsWith(':where(.group):hover .'), `${family} group-hover selector is missing the :where(.group):hover ancestor`);
		rule(selector);
	}
});
