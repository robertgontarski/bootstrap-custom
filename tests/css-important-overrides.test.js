import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector, classSelector, themeAttr, isImportant} from './helpers/css.js';
import {wins} from './helpers/specificity.js';
import {STATES, stateClassSelector} from './helpers/states.js';
import {ALL_COLORS} from './helpers/colors.js';
import {ALL_DISPLAYS, BREAKPOINTS} from './helpers/keywords.js';

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
 * @param {string} family - `text` or `bg`.
 * @param {string} color
 * @returns {Array<{label: string, selector: string}>}
 */
function colorUtilityLayers(family, color) {
	const layers = [];
	for (const state of STATES) {
		layers.push({label: state.name, selector: stateClassSelector(state, `${family}-${color}`)});
	}
	for (const theme of ['light', 'dark']) {
		layers.push({label: `${theme} theme`, selector: `${themeAttr(theme)} ${classSelector(`${theme}:${family}-${color}`)}`});
	}
	for (const theme of ['light', 'dark']) {
		for (const state of STATES) {
			layers.push({
				label: `${theme} theme + ${state.name}`,
				selector: stateClassSelector(state, `${family}-${color}`, theme),
			});
		}
	}
	return layers;
}

for (const family of ['text', 'bg']) {
	const color = 'blue-500';
	const baseSelector = classSelector(`${family}-${color}`);
	const baseRule = rule(baseSelector);

	test(`${family}-${color} base rule exists and is !important`, () => {
		assert.ok(isImportant(baseRule), `${baseSelector} is not !important`);
	});

	for (const {label, selector} of colorUtilityLayers(family, color)) {
		test(`${family}-${color} ${label} rule is !important and beats the base ${family}-${color} rule`, () => {
			const layerRule = rule(selector);

			assert.ok(isImportant(layerRule), `${selector} is not !important`);
			assert.ok(wins(layerRule, baseRule), `${selector} does not beat ${baseSelector}`);
		});
	}
}

test('hover:text-blue-500 overrides text-gray-700 while hovered', () => {
	const base = rule(classSelector('text-gray-700'));
	const hover = rule(`${classSelector('hover:text-blue-500')}:hover`);

	assert.ok(wins(hover, base), 'hover:text-blue-500 does not beat text-gray-700');
});

test('dark:bg-gray-900 overrides bg-white under a dark ancestor', () => {
	const base = rule(classSelector('bg-white'));
	const dark = rule(`${themeAttr('dark')} ${classSelector('dark:bg-gray-900')}`);

	assert.ok(isImportant(dark), 'dark:bg-gray-900 is not !important');
	assert.ok(wins(dark, base), 'dark:bg-gray-900 does not beat bg-white');
});

test('dark:d-none overrides d-flex under a dark ancestor', () => {
	const base = rule(classSelector('d-flex'));
	const dark = rule(`${themeAttr('dark')} ${classSelector('dark:d-none')}`);

	assert.ok(isImportant(dark), 'dark:d-none is not !important');
	assert.ok(wins(dark, base), 'dark:d-none does not beat d-flex');
});

test('light:d-none overrides d-flex under a light ancestor', () => {
	const base = rule(classSelector('d-flex'));
	const light = rule(`${themeAttr('light')} ${classSelector('light:d-none')}`);

	assert.ok(isImportant(light), 'light:d-none is not !important');
	assert.ok(wins(light, base), 'light:d-none does not beat d-flex');
});

for (const family of ['text', 'bg']) {
	test(`every ${family}-* state/theme/theme+state rule across all 99 colors is !important`, () => {
		for (const color of ALL_COLORS) {
			for (const {label, selector} of colorUtilityLayers(family, color)) {
				assert.ok(isImportant(rule(selector)), `${family}-${color} ${label} (${selector}) is not !important`);
			}
		}
	});
}

test('every light:/dark: d-* rule, base and every breakpoint, is !important for every display keyword', () => {
	for (const keyword of ALL_DISPLAYS) {
		for (const theme of ['light', 'dark']) {
			const base = `${themeAttr(theme)} ${classSelector(`${theme}:d-${keyword}`)}`;
			assert.ok(isImportant(rule(base)), `${base} is not !important`);
			for (const bp of BREAKPOINTS) {
				const responsive = `${themeAttr(theme)} ${classSelector(`${theme}:d-${bp}-${keyword}`)}`;
				assert.ok(isImportant(rule(responsive)), `${responsive} is not !important`);
			}
		}
	}
});
