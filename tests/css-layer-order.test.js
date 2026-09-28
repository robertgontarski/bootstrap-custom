import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector, classSelector, themeAttr} from './helpers/css.js';
import {specificity, compareSpecificity, wins} from './helpers/specificity.js';
import {STATES, stateNamed, stateClassSelector} from './helpers/states.js';
import {ALL_COLORS} from './helpers/colors.js';

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
 * @param {import('./helpers/css.js').CssRule[]} layerRules
 * @returns {number}
 */
function maxOrder(layerRules) {
	return Math.max(...layerRules.map((r) => r.order));
}

/**
 * @param {import('./helpers/css.js').CssRule[]} layerRules
 * @returns {number}
 */
function minOrder(layerRules) {
	return Math.min(...layerRules.map((r) => r.order));
}

/**
 * @typedef {Object} ColorFamily
 * @property {string} name - class-name prefix, e.g. `text-bg-outline`.
 * @property {boolean} ownBase - whether this module emits its own unprefixed base rule.
 * @property {boolean} autoDarkPalette - whether it has the alert/text-bg-outline automatic dark palette.
 */

/** @type {ColorFamily[]} */
const COLOR_FAMILIES = [
	{name: 'text', ownBase: false, autoDarkPalette: false},
	{name: 'bg', ownBase: false, autoDarkPalette: false},
	{name: 'border', ownBase: false, autoDarkPalette: false},
	{name: 'border-top', ownBase: true, autoDarkPalette: false},
	{name: 'border-end', ownBase: true, autoDarkPalette: false},
	{name: 'border-bottom', ownBase: true, autoDarkPalette: false},
	{name: 'border-start', ownBase: true, autoDarkPalette: false},
	{name: 'shadow', ownBase: true, autoDarkPalette: false},
	{name: 'shadow-sm', ownBase: true, autoDarkPalette: false},
	{name: 'shadow-lg', ownBase: true, autoDarkPalette: false},
	{name: 'alert', ownBase: true, autoDarkPalette: true},
	{name: 'text-bg', ownBase: true, autoDarkPalette: false},
	{name: 'text-bg-outline', ownBase: true, autoDarkPalette: true},
	{name: 'fill', ownBase: true, autoDarkPalette: false},
	{name: 'stroke', ownBase: true, autoDarkPalette: false},
];

/**
 * @param {ColorFamily} family
 * @returns {Array<{label: string, rules: import('./helpers/css.js').CssRule[]}>}
 */
function buildLayers({name, ownBase, autoDarkPalette}) {
	const layers = [];

	if (ownBase) {
		layers.push({label: 'base', rules: ALL_COLORS.map((color) => rule(classSelector(`${name}-${color}`)))});
	}
	if (autoDarkPalette) {
		layers.push({
			label: 'automatic dark palette',
			rules: ALL_COLORS.map((color) =>
				rule(`${themeAttr('dark')} :where(${classSelector(`${name}-${color}`)}:not(.force-light))`),
			),
		});
	}
	for (const state of STATES) {
		layers.push({
			label: state.name,
			rules: ALL_COLORS.map((color) => rule(stateClassSelector(state, `${name}-${color}`))),
		});
	}
	for (const theme of ['light', 'dark']) {
		layers.push({
			label: `${theme} theme`,
			rules: ALL_COLORS.map((color) => rule(`${themeAttr(theme)} ${classSelector(`${theme}:${name}-${color}`)}`)),
		});
	}
	for (const theme of ['light', 'dark']) {
		for (const state of STATES) {
			layers.push({
				label: `${theme} theme + ${state.name}`,
				rules: ALL_COLORS.map((color) => rule(stateClassSelector(state, `${name}-${color}`, theme))),
			});
		}
	}
	return layers;
}

for (const family of COLOR_FAMILIES) {
	test(`${family.name}-* layer order and specificity hold across all 99 colors`, () => {
		const layers = buildLayers(family);

		for (const layer of layers) {
			const first = specificity(layer.rules[0].selector);
			for (const layerRule of layer.rules) {
				assert.equal(
					compareSpecificity(specificity(layerRule.selector), first),
					0,
					`${family.name} ${layer.label}: ${layerRule.selector} specificity differs from the rest of the layer`,
				);
			}
		}

		for (let i = 1; i < layers.length; i++) {
			assert.ok(
				maxOrder(layers[i - 1].rules) < minOrder(layers[i].rules),
				`${family.name} ${layers[i].label} does not fully follow ${family.name} ${layers[i - 1].label}`,
			);
		}
	});
}

test('dark:text-blue-500 wins over hover:text-red-500 in dark theme, whatever the colors (criterion 4)', () => {
	const hoverRed = rule(`${classSelector('hover:text-red-500')}:hover`);
	const darkBlue = rule(`${themeAttr('dark')} ${classSelector('dark:text-blue-500')}`);

	assert.ok(wins(darkBlue, hoverRed), 'dark:text-blue-500 does not beat hover:text-red-500');
});

test('active:bg-blue-500 beats focus:bg-red-500 while pressed, whatever the colors (criterion 4)', () => {
	const focusRed = rule(`${classSelector('focus:bg-red-500')}:focus`);
	const activeBlue = rule(`${classSelector('active:bg-blue-500')}:active`);

	assert.ok(wins(activeBlue, focusRed), 'active:bg-blue-500 does not beat focus:bg-red-500');
});

test('dark:hover:bg-blue-500 wins over dark:bg-red-500 while hovered, whatever the colors (criterion 4)', () => {
	const darkRed = rule(`${themeAttr('dark')} ${classSelector('dark:bg-red-500')}`);
	const darkHoverBlue = rule(stateClassSelector(stateNamed('hover'), 'bg-blue-500', 'dark'));

	assert.ok(wins(darkHoverBlue, darkRed), 'dark:hover:bg-blue-500 does not beat dark:bg-red-500');
});

test('disabled:bg-blue-500 beats active:bg-red-500 while both apply, whatever the colors (criterion 4)', () => {
	const activeRed = rule(stateClassSelector(stateNamed('active'), 'bg-red-500'));
	const disabledBlue = rule(stateClassSelector(stateNamed('disabled'), 'bg-blue-500'));

	assert.ok(wins(disabledBlue, activeRed), 'disabled:bg-blue-500 does not beat active:bg-red-500');
});
