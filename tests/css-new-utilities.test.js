import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector, findRules, classSelector, themeAttr, isImportant} from './helpers/css.js';
import {stateNamed, stateClassSelector} from './helpers/states.js';
import {ALL_COLORS} from './helpers/colors.js';

const {rules, keyframeNames} = getDistCss();
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
 * @param {import('./helpers/css.js').CssRule[]} group
 * @returns {number}
 */
function maxOrder(group) {
	return Math.max(...group.map((r) => r.order));
}

/**
 * @param {import('./helpers/css.js').CssRule[]} group
 * @returns {number}
 */
function minOrder(group) {
	return Math.min(...group.map((r) => r.order));
}

test('--app-color-blue-500-rgb is defined in :root, alongside --app-color-blue-500', () => {
	// `modules/elements/_root.scss` emits its own `:root { ... }` block, separate
	// from Bootstrap's, so it must be matched by content, not just by selector.
	const appRoot = findRules(rules, ':root').find((candidate) => candidate.declarations.includes('--app-color-blue-500:'));

	assert.ok(appRoot, 'missing the :root rule declaring --app-color-*');
	assert.match(appRoot.declarations, /--app-color-blue-500:#[0-9a-f]{6}/);
	assert.match(appRoot.declarations, /--app-color-blue-500-rgb:\d{1,3}, \d{1,3}, \d{1,3}/);
});

for (const [family, cssVariable] of [
	['bg', '--bs-bg-opacity'],
	['text', '--bs-text-opacity'],
	['border', '--bs-border-opacity'],
]) {
	test(`${family}-opacity-50 sets ${cssVariable} to .5`, () => {
		const opacityRule = rule(classSelector(`${family}-opacity-50`));

		assert.equal(opacityRule.declarations, `${cssVariable}:.5`);
	});

	test(`${family}-blue-500 reads --app-color-blue-500-rgb through ${cssVariable}`, () => {
		const colorRule = rule(classSelector(`${family}-blue-500`));

		assert.match(colorRule.declarations, new RegExp(`rgba\\(var\\(--app-color-blue-500-rgb\\), var\\(${cssVariable}\\)\\)`));
	});

	test(`hover:${family}-blue-500 stays a solid color, not the opacity scale`, () => {
		const hoverRule = rule(stateClassSelector(stateNamed('hover'), `${family}-blue-500`));

		assert.equal(hoverRule.declarations.includes('--app-color-blue-500-rgb'), false, `${hoverRule.selector} still reads the opacity scale`);
	});
}

const GRADIENT_DIRECTIONS = ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'];

for (const direction of GRADIENT_DIRECTIONS) {
	test(`bg-gradient-to-${direction} rule exists`, () => {
		const gradientRule = rule(classSelector(`bg-gradient-to-${direction}`));

		assert.match(gradientRule.declarations, /^background-image:linear-gradient\(/);
	});
}

/**
 * @param {string} name - `from`, `via` or `to`.
 * @returns {Array<{label: string, rules: import('./helpers/css.js').CssRule[]}>}
 */
function gradientStopLayers(name) {
	return [
		{label: `${name} base`, rules: ALL_COLORS.map((color) => rule(classSelector(`${name}-${color}`)))},
		{
			label: `${name} light theme`,
			rules: ALL_COLORS.map((color) => rule(`${themeAttr('light')} ${classSelector(`light:${name}-${color}`)}`)),
		},
		{
			label: `${name} dark theme`,
			rules: ALL_COLORS.map((color) => rule(`${themeAttr('dark')} ${classSelector(`dark:${name}-${color}`)}`)),
		},
	];
}

test('gradient stops follow from < via < to, base then light: then dark: within each family (criterion 8)', () => {
	const layers = [...gradientStopLayers('from'), ...gradientStopLayers('via'), ...gradientStopLayers('to')];

	for (let i = 1; i < layers.length; i++) {
		assert.ok(
			maxOrder(layers[i - 1].rules) < minOrder(layers[i].rules),
			`${layers[i].label} does not fully follow ${layers[i - 1].label}`,
		);
	}
});

test('fill-red-500 sets fill to a solid color', () => {
	const fillRule = rule(classSelector('fill-red-500'));

	assert.match(fillRule.declarations, /^fill:#[0-9a-f]{6}$/);
});

test('stroke-red-500 sets stroke to a solid color', () => {
	const strokeRule = rule(classSelector('stroke-red-500'));

	assert.match(strokeRule.declarations, /^stroke:#[0-9a-f]{6}$/);
});

test('accent-green-500 sets accent-color and has no hover: state variant', () => {
	const accentRule = rule(classSelector('accent-green-500'));

	assert.match(accentRule.declarations, /^accent-color:#[0-9a-f]{6}$/);
	assert.equal(bySelector.has(stateClassSelector(stateNamed('hover'), 'accent-green-500')), false, 'accent-* must not have a hover: state variant');
});

test('focus-ring-blue-500 sets --bs-focus-ring-color from the color scale', () => {
	const focusRingRule = rule(classSelector('focus-ring-blue-500'));

	assert.match(focusRingRule.declarations, /--bs-focus-ring-color:rgba\(var\(--app-color-blue-500-rgb\), var\(--bs-focus-ring-opacity\)\)/);
});

test('link-underline-blue-500 sets the underline color, !important, from the color scale', () => {
	const linkUnderlineRule = rule(classSelector('link-underline-blue-500'));

	assert.ok(isImportant(linkUnderlineRule), `${linkUnderlineRule.selector} is not !important`);
	assert.match(linkUnderlineRule.declarations, /text-decoration-color:rgba\(var\(--app-color-blue-500-rgb\), var\(--bs-link-underline-opacity\)\)/);
});

const TRANSITION_LAYERS = [
	{label: 'transition (base)', classes: ['transition']},
	{label: 'transition-property', classes: ['transition-colors', 'transition-opacity', 'transition-transform', 'transition-shadow']},
	{label: 'transition-duration', classes: ['transition-fast', 'transition-slow', 'transition-none']},
	{label: 'transition-easing', classes: ['transition-linear', 'transition-in', 'transition-out', 'transition-in-out']},
];

/**
 * @param {string[]} classNames
 * @returns {import('./helpers/css.js').CssRule[]}
 */
function transitionClassRules(classNames) {
	return classNames.flatMap((name) => [
		rule(classSelector(name)),
		rule(`${themeAttr('light')} ${classSelector(`light:${name}`)}`),
		rule(`${themeAttr('dark')} ${classSelector(`dark:${name}`)}`),
	]);
}

test('transition-property classes come before transition-duration and transition-easing classes (criterion 8)', () => {
	const layers = TRANSITION_LAYERS.map(({label, classes}) => ({label, rules: transitionClassRules(classes)}));

	for (let i = 1; i < layers.length; i++) {
		assert.ok(
			maxOrder(layers[i - 1].rules) < minOrder(layers[i].rules),
			`${layers[i].label} does not fully follow ${layers[i - 1].label}`,
		);
	}
});

test('transition-colors sets the color-related property list', () => {
	const transitionColors = rule(classSelector('transition-colors'));

	assert.match(transitionColors.declarations, /^transition-property:color,background-color,border-color,text-decoration-color,fill,stroke/);
});

for (const name of ['app-spin', 'app-ping', 'app-pulse', 'app-bounce']) {
	test(`@keyframes ${name} exists in the built CSS`, () => {
		assert.ok(keyframeNames.includes(name), `missing @keyframes ${name}`);
	});
}

test('animate-spin references the app-spin keyframe', () => {
	const animateSpin = rule(classSelector('animate-spin'));

	assert.match(animateSpin.declarations, /\bapp-spin\b/);
});

test('line-clamp-3 and line-clamp-none render their declared behavior', () => {
	const clamp3 = rule(classSelector('line-clamp-3'));
	const clampNone = rule(classSelector('line-clamp-none'));

	assert.match(clamp3.declarations, /-webkit-line-clamp:3/);
	assert.match(clamp3.declarations, /overflow:hidden/);
	assert.match(clampNone.declarations, /-webkit-line-clamp:unset/);
	assert.match(clampNone.declarations, /overflow:visible/);
});

test('line-clamp-md-none exists inside the 768px breakpoint', () => {
	const clampMdNone = rule(classSelector('line-clamp-md-none'));

	assert.equal(clampMdNone.media, '@media (min-width:768px)');
});
