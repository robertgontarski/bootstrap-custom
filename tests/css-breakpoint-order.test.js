import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector, classSelector, themeAttr} from './helpers/css.js';
import {ALL_CURSORS, ALL_DISPLAYS, ALL_LINE_CLAMPS, BREAKPOINTS, FS_SIZE_KEYS, FS_ARBITRARY_KEYS} from './helpers/keywords.js';

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

/**
 * Every non-breakpoint rule comes before every breakpoint rule, and
 * breakpoint groups ascend, `xs` first (no media query).
 * @param {string} label
 * @param {string[]} nonBreakpointSelectors
 * @param {(bp: string) => string[]} breakpointSelectors
 */
function assertBreakpointsFollowAndAscend(label, nonBreakpointSelectors, breakpointSelectors) {
	const nonBreakpoint = nonBreakpointSelectors.map(rule);
	const groups = BREAKPOINTS.map((bp) => ({bp, rules: breakpointSelectors(bp).map(rule)}));

	assert.ok(
		maxOrder(nonBreakpoint) < minOrder(groups[0].rules),
		`${label}: non-breakpoint rules do not all precede the ${groups[0].bp} breakpoint`,
	);
	for (let i = 1; i < groups.length; i++) {
		assert.ok(
			maxOrder(groups[i - 1].rules) < minOrder(groups[i].rules),
			`${label}: ${groups[i - 1].bp} does not fully precede ${groups[i].bp}`,
		);
	}
}

test('cursor-* breakpoint rules follow every non-breakpoint rule and ascend, for every keyword', () => {
	assertBreakpointsFollowAndAscend(
		'cursor',
		ALL_CURSORS.map((keyword) => classSelector(`cursor-${keyword}`)),
		(bp) => ALL_CURSORS.map((keyword) => classSelector(`cursor-${bp}-${keyword}`)),
	);
});

test('light:/dark: d-* breakpoint rules follow every non-breakpoint light:/dark: d-* rule and ascend, for every keyword', () => {
	assertBreakpointsFollowAndAscend(
		'd',
		ALL_DISPLAYS.flatMap((keyword) =>
			['light', 'dark'].map((theme) => `${themeAttr(theme)} ${classSelector(`${theme}:d-${keyword}`)}`),
		),
		(bp) =>
			ALL_DISPLAYS.flatMap((keyword) =>
				['light', 'dark'].map((theme) => `${themeAttr(theme)} ${classSelector(`${theme}:d-${bp}-${keyword}`)}`),
			),
	);
});

test('line-clamp-* breakpoint rules follow every non-breakpoint line-clamp-* rule and ascend, base and themed, for every keyword', () => {
	assertBreakpointsFollowAndAscend(
		'line-clamp',
		ALL_LINE_CLAMPS.flatMap((keyword) => [
			classSelector(`line-clamp-${keyword}`),
			`${themeAttr('light')} ${classSelector(`light:line-clamp-${keyword}`)}`,
			`${themeAttr('dark')} ${classSelector(`dark:line-clamp-${keyword}`)}`,
		]),
		(bp) =>
			ALL_LINE_CLAMPS.flatMap((keyword) => [
				classSelector(`line-clamp-${bp}-${keyword}`),
				`${themeAttr('light')} ${classSelector(`light:line-clamp-${bp}-${keyword}`)}`,
				`${themeAttr('dark')} ${classSelector(`dark:line-clamp-${bp}-${keyword}`)}`,
			]),
	);
});

test('fs-* breakpoint rules follow every non-breakpoint fs-* rule and ascend, named and arbitrary sizes', () => {
	assertBreakpointsFollowAndAscend(
		'fs',
		FS_ARBITRARY_KEYS.flatMap((key) => [
			classSelector(`fs-${key}`),
			`${themeAttr('light')} ${classSelector(`light:fs-${key}`)}`,
			`${themeAttr('dark')} ${classSelector(`dark:fs-${key}`)}`,
		]),
		(bp) =>
			FS_SIZE_KEYS.flatMap((key) => [
				classSelector(`fs-${bp}-${key}`),
				`${themeAttr('light')} ${classSelector(`light:fs-${bp}-${key}`)}`,
				`${themeAttr('dark')} ${classSelector(`dark:fs-${bp}-${key}`)}`,
			]),
	);
});
