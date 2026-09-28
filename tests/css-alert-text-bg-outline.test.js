import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, findRule, classSelector, themeAttr} from './helpers/css.js';
import {specificity, compareSpecificity, wins} from './helpers/specificity.js';
import {STATES, stateClassSelector} from './helpers/states.js';

const {rules} = getDistCss();

/**
 * @param {string} family - `alert` or `text-bg-outline`.
 * @param {string} color
 */
function autoDarkPaletteSelector(family, color) {
	return `${themeAttr('dark')} :where(${classSelector(`${family}-${color}`)}:not(.force-light))`;
}

for (const [family, color] of [
	['alert', 'red-500'],
	['text-bg-outline', 'blue-500'],
]) {
	const base = findRule(rules, classSelector(`${family}-${color}`));
	const autoDark = findRule(rules, autoDarkPaletteSelector(family, color));

	test(`${family}-${color} base rule exists`, () => {
		assert.ok(base, `missing ${classSelector(`${family}-${color}`)}`);
	});

	test(`${family}-${color} automatic dark palette has the base class's specificity and comes later`, () => {
		assert.ok(autoDark, `missing automatic dark palette rule for ${family}-${color}`);
		assert.equal(compareSpecificity(specificity(autoDark.selector), specificity(base.selector)), 0);
		assert.ok(autoDark.order > base.order, 'automatic dark palette does not come after the base rule');
	});

	test(`dark:${family}-${color} beats the automatic dark palette`, () => {
		const explicit = findRule(rules, `${themeAttr('dark')} ${classSelector(`dark:${family}-${color}`)}`);

		assert.ok(explicit, `missing dark:${family}-${color}`);
		assert.ok(wins(explicit, autoDark), `dark:${family}-${color} does not beat the automatic dark palette`);
	});

	test(`${STATES[0].name}:${family}-${color} beats the automatic dark palette`, () => {
		const state = findRule(rules, stateClassSelector(STATES[0], `${family}-${color}`));

		assert.ok(state, `missing ${STATES[0].name}:${family}-${color}`);
		assert.ok(wins(state, autoDark), `${STATES[0].name}:${family}-${color} does not beat the automatic dark palette`);
	});
}

test('dark:alert-red-500 uses the same dark palette values as the automatic dark palette', () => {
	const explicit = findRule(rules, `${themeAttr('dark')} ${classSelector('dark:alert-red-500')}`);
	const autoDark = findRule(rules, autoDarkPaletteSelector('alert', 'red-500'));

	assert.equal(explicit.declarations, autoDark.declarations);
});

test('dark:text-bg-outline-blue-500 declares a full border (width and style), unlike the automatic dark palette', () => {
	const explicit = findRule(rules, `${themeAttr('dark')} ${classSelector('dark:text-bg-outline-blue-500')}`);
	const autoDark = findRule(rules, autoDarkPaletteSelector('text-bg-outline', 'blue-500'));

	assert.match(explicit.declarations, /border:[^;]*solid/);
	assert.equal(autoDark.declarations.includes('border:'), false);
	assert.ok(autoDark.declarations.includes('border-color:'));
});
