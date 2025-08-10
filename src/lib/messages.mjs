import stylelint from 'stylelint';
import ruleName from './rule-name.mjs';

export default stylelint.utils.ruleMessages(ruleName, {
	deprecated: (name, prop, deprecationDescription) =>
		[
			'Deprecated custom property',
			`"${name}"`,
			'inside declaration',
			`"${prop}"`,
			'.',
			deprecationDescription,
		]
			.filter((part) => !!part)
			.join(' '),
});
