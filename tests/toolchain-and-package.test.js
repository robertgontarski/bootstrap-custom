import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {repoRoot} from './helpers/css.js';

const root = repoRoot();
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

test('dist holds only bootstrap.css after the build', () => {
	const entries = readdirSync(path.join(root, 'dist'));

	assert.deepEqual(entries, ['bootstrap.css']);
});

test('package.json declares bootstrap ^5.3.8', () => {
	assert.equal(pkg.dependencies.bootstrap, '^5.3.8');
});

test('package.json declares vite on the 8.x line', () => {
	assert.match(pkg.devDependencies.vite, /^\^8\./);
});

test('package.json declares sass on the 1.x line', () => {
	assert.match(pkg.devDependencies.sass, /^\^1\./);
});

test('package.json declares the Node 20.19 / 22.12 engine range', () => {
	assert.equal(pkg.engines.node, '^20.19.0 || >=22.12.0');
});

test('package.json drops path and @popperjs/core', () => {
	const declared = {...pkg.dependencies, ...pkg.devDependencies};

	assert.equal('path' in declared, false);
	assert.equal('@popperjs/core' in declared, false);
});
