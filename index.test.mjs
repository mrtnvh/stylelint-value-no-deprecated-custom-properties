import { describe } from 'node:test';
import { testRule } from 'stylelint-test-rule-node';
import plugin from './src/index.mjs';

const rule = plugin.rule;
const messages = plugin.rule.messages;

describe('Test basic checks', () => {
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: null, accept: [{ code: '' }] });
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: true, accept: [{ code: '' }] });
});

describe('Test disabled', () => {
	const accept = [{ code: 'body { color: var(--brand-blue); }', description: 'ignored custom property' }];
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: null, accept });
});

describe('Test enabled', () => {
	const accept = [
		{ code: 'body { --brand-blue: #33f; color: var(--brand-blue); }' },
		{ code: ':root { --brand-blue: #33f; } body { color: var(--brand-blue); }' },
		{ code: 'html { --brand-blue: #33f; } body { color: var(--brand-blue); }' },
		{ code: '* { --brand-blue: #33f; } body { color: var(--brand-blue); }' },
		{ code: '.anything { --brand-blue: #33f; } body { color: var(--brand-blue); }' },
		{ code: ':root { --brand-blue: #33f; --brand-color: var(--brand-blue); }' },
		{ code: "@import './test/import-custom-properties.css'; body { color: var(--brand-red); }" },
		{ code: '@import "./test/import-custom-properties.css" screen; body { color: var(--brand-red); }' },
		{ code: '@import "./test/import-custom-properties.css"/**/; body { color: var(--brand-red); }' },
		{ code: '@import url(./test/import-custom-properties.css); body { color: var(--brand-red); }' },
		{ code: "@import url('./test/import-custom-properties.css'); body { color: var(--brand-red); }" },
		{ code: "@import url( './test/import-custom-properties.css'/**/)/**/; body { color: var(--brand-red); }" },
		{ code: "@import url(\t'./test/import-custom-properties.css'\t)\t; body { color: var(--brand-red); }" },
		{ code: '@import url(./test/import-custom-properties.css) screen; body { color: var(--brand-red); }' },
		{ code: '@import url("./test/import-custom-properties.css") screen; body { color: var(--brand-red); }' },
		{ code: '@import url("./test/import-custom-properties.css" url-mod); body { color: var(--brand-red); }' },
		{ code: "@import './test/import-custom-properties.css'; @import './test/import-custom-properties123.css'; body { color: var(--brand-red); }" },
		{ code: 'color: var(--my-undefined-color, #ffffff);' },
	];
	const reject = [
		{ code: 'body { color: var(--brand-blue); }', message: messages.unexpected('--brand-blue', 'color') },
		{ code: "@import './test/import-custom-properties123.css'; body { color: var(--brand-red); }", message: messages.unexpected('--brand-red', 'color') },
	];
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: true, accept, reject });
});

describe('Test fallbacks', () => {
	const accept = [{ code: 'body { color: var(--brand-blue, #33f); }' }];
	const reject = [{ code: 'body { color: var(--brand-blue, var(--brand-red)); }', message: messages.unexpected('--brand-red', 'color') }];
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: true, accept, reject });
});

describe('Test enabled: not var()s', () => {
	const accept = [{ code: 'body { color: brand-blue; }' }, { code: 'body { color: var(); }' }];
	testRule({ plugins: ['.'], ruleName: rule.ruleName, config: true, accept });
});

describe('Test enabled: { importFrom }', () => {
	describe('object', () => {
		const config = [true, { importFrom: { customProperties: { '--brand-blue': '#fff' } } }];
		const accept = [{ code: 'body { color: var(--brand-blue); }' }];
		const reject = [
			{ code: 'body { color: var(--brand-blu); }', message: messages.unexpected('--brand-blu', 'color') },
			{ code: 'body { color: var(--brand-bluez); }', message: messages.unexpected('--brand-bluez', 'color') },
		];
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config, accept, reject });
	});

	describe('files', () => {
		const config = [true, { importFrom: ['./test/import-custom-properties.json', './test/import-custom-properties.css'] }];
		const accept = [{ code: 'body { background-color: var(--brand-red); background: var(--brand-green); color: var(--brand-blue); }' }];
		const reject = [
			{ code: 'body { color: var(--brand-blu); }', message: messages.unexpected('--brand-blu', 'color') },
			{ code: 'body { color: var(--brand-bluez); }', message: messages.unexpected('--brand-bluez', 'color') },
		];
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config, accept, reject });
	});

	describe('js', () => {
		const config = [true, { importFrom: ['./test/dummy-module-package/import-custom-properties.js'] }];
		const accept = [{ code: 'body { border-color: var(--brand-white); }' }];
		const reject = [];
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config, accept, reject });
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config: [true, { importFrom: ['./test/dummy-package/import-custom-properties.js'] }], accept, reject });
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config: [true, { importFrom: ['./test/import-custom-properties.cjs'] }], accept, reject });
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config: [true, { importFrom: ['./test/import-custom-properties.mjs'] }], accept, reject });
	});

	describe('resolver', () => {
		const config = [true, { resolver: { paths: './test' } }];
		const accept = [{ code: '@import "import-custom-properties-absolute.css"; body { background-color: var(--brand-red); background: var(--brand-green); }' }];
		const reject = [];
		testRule({ plugins: ['.'], ruleName: rule.ruleName, config, accept, reject });
	});
});
