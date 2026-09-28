import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDistCss, findRule} from './helpers/css.js';

const {source, rules} = getDistCss();

test(':root declares --bs-gray-100 through --bs-gray-900', () => {
	const root = findRule(rules, ':root');

	assert.ok(root, 'missing a :root rule');
	for (let weight = 100; weight <= 900; weight += 100) {
		assert.ok(root.declarations.includes(`--bs-gray-${weight}:`), `missing --bs-gray-${weight}`);
	}
});

test('no --bs-gray-gray- variable remains anywhere in the built CSS', () => {
	assert.equal(source.includes('--bs-gray-gray-'), false);
});
