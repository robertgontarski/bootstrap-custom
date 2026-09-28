import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, indexBySelector, findRule, classSelector, themeAttr, isImportant} from './helpers/css.js';
import {BREAKPOINTS, FS_ARBITRARY_KEYS, FS_SIZE_KEYS} from './helpers/keywords.js';

const {source, rules} = getDistCss();
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

test('no [class*= selector remains in the built CSS', () => {
	assert.equal(source.includes('[class*='), false);
});

test('every unprefixed arbitrary font size (8px..100px) appears exactly once, unprefixed and !important', () => {
	for (const key of FS_ARBITRARY_KEYS) {
		const selector = classSelector(`fs-${key}`);
		const matches = bySelector.get(selector) ?? [];

		assert.equal(matches.length, 1, `${selector} appears ${matches.length} times, expected 1`);
		assert.equal(matches[0].media, null, `${selector} should not be wrapped in a media query`);
		assert.ok(isImportant(matches[0]), `${selector} is not !important`);
	}
});

test('every dark:/light: fs-[Npx] arbitrary size only applies under its theme ancestor and is !important', () => {
	for (const key of FS_ARBITRARY_KEYS) {
		for (const theme of ['light', 'dark']) {
			const selector = `${themeAttr(theme)} ${classSelector(`${theme}:fs-${key}`)}`;
			const themed = rule(selector);

			assert.equal(themed.media, null, `${selector} should not be wrapped in a media query`);
			assert.ok(isImportant(themed), `${selector} is not !important`);
		}
		const bareSelector = classSelector(`dark:fs-${key}`);
		assert.equal(bySelector.has(bareSelector), false, `${bareSelector} must not exist as a bare, ancestor-less selector`);
	}
});

test('light:fs-[16px] only applies under a light ancestor', () => {
	const themed = findRule(rules, `${themeAttr('light')} ${classSelector('light:fs-[16px]')}`);

	assert.ok(themed, 'missing [data-bs-theme=light] .light\\:fs-\\[16px\\]');
	assert.equal(themed.media, null);
	assert.ok(isImportant(themed));
});

test('fs-[16px] applies below 768px, fs-md-[24px] applies from 768px, each exactly once', () => {
	const unprefixed = bySelector.get(classSelector('fs-[16px]')) ?? [];
	const responsive = bySelector.get(classSelector('fs-md-[24px]')) ?? [];

	assert.equal(unprefixed.length, 1);
	assert.equal(unprefixed[0].media, null);
	assert.equal(responsive.length, 1);
	assert.equal(responsive[0].media, '@media (min-width:768px)');
});

test('fs-md-[24px] appears exactly once per breakpoint, not once per named font size', () => {
	for (const bp of BREAKPOINTS) {
		const selector = classSelector(`fs-${bp}-[24px]`);
		const matches = bySelector.get(selector) ?? [];

		assert.equal(matches.length, 1, `${selector} appears ${matches.length} times, expected 1`);
	}
});

test('fs-xs-4 is not wrapped in a media query', () => {
	const xs = rule(classSelector('fs-xs-4'));

	assert.equal(xs.media, null);
});

test('fs-md-4 wins over fs-6 from 768px up (equal specificity, later position)', () => {
	const fs6 = rule(classSelector('fs-6'));
	const fsMd4 = rule(classSelector('fs-md-4'));

	assert.equal(fs6.media, null);
	assert.equal(fsMd4.media, '@media (min-width:768px)');
	assert.ok(isImportant(fs6));
	assert.ok(isImportant(fsMd4));
	assert.ok(fsMd4.order > fs6.order, 'fs-md-4 does not come after fs-6');
});

test('every breakpoint fs-* rule (named and arbitrary, base and themed) is !important, for every breakpoint', () => {
	for (const bp of BREAKPOINTS) {
		for (const key of FS_SIZE_KEYS) {
			const base = classSelector(`fs-${bp}-${key}`);
			assert.ok(isImportant(rule(base)), `${base} is not !important`);
			for (const theme of ['light', 'dark']) {
				const themed = `${themeAttr(theme)} ${classSelector(`${theme}:fs-${bp}-${key}`)}`;
				assert.ok(isImportant(rule(themed)), `${themed} is not !important`);
			}
		}
	}
});
