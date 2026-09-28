import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, findRules, classSelector, themeAttr} from './helpers/css.js';

const {rules} = getDistCss();

const REDUCED_MOTION_MEDIA = '@media (prefers-reduced-motion:reduce)';

/**
 * The one rule for `selector` that sits inside `@media
 * (prefers-reduced-motion:reduce)`. Bootstrap has its own unrelated
 * `prefers-reduced-motion` blocks earlier in the file, and every transition
 * / animate class also has an un-neutralized rule outside this media query,
 * so matching by selector text alone is not enough (criterion 9).
 * @param {string} selector
 * @returns {import('./helpers/css.js').CssRule}
 */
function reducedMotionRule(selector) {
	const matches = findRules(rules, selector).filter((candidate) => candidate.media === REDUCED_MOTION_MEDIA);

	assert.equal(matches.length, 1, `expected exactly one ${REDUCED_MOTION_MEDIA} rule for ${selector}, found ${matches.length}`);
	return matches[0];
}

const TRANSITION_CLASSES = [
	'transition',
	'transition-colors',
	'transition-opacity',
	'transition-transform',
	'transition-shadow',
	'transition-fast',
	'transition-slow',
	'transition-none',
	'transition-linear',
	'transition-in',
	'transition-out',
	'transition-in-out',
];

const ANIMATE_CLASSES = ['animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce'];

for (const name of TRANSITION_CLASSES) {
	test(`.${name} is neutralized under prefers-reduced-motion (criterion 9)`, () => {
		const neutralized = reducedMotionRule(classSelector(name));

		assert.equal(neutralized.declarations, 'transition:none');
	});

	for (const theme of ['light', 'dark']) {
		test(`${theme}:${name} is neutralized under prefers-reduced-motion (criterion 9)`, () => {
			const neutralized = reducedMotionRule(`${themeAttr(theme)} ${classSelector(`${theme}:${name}`)}`);

			assert.equal(neutralized.declarations, 'transition:none');
		});
	}
}

for (const name of ANIMATE_CLASSES) {
	test(`.${name} is neutralized under prefers-reduced-motion (criterion 9)`, () => {
		const neutralized = reducedMotionRule(classSelector(name));

		assert.equal(neutralized.declarations, 'animation:none');
	});

	for (const theme of ['light', 'dark']) {
		test(`${theme}:${name} is neutralized under prefers-reduced-motion (criterion 9)`, () => {
			const neutralized = reducedMotionRule(`${themeAttr(theme)} ${classSelector(`${theme}:${name}`)}`);

			assert.equal(neutralized.declarations, 'animation:none');
		});
	}
}
