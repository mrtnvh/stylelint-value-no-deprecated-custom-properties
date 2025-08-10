import stylelint from 'stylelint';
import valueParser from 'postcss-value-parser';
import ruleName from './rule-name.mjs';
import messages from './messages.mjs';

// validate css declarations
export default (decl, { result, customProperties }) => {
	const valueAST = valueParser(decl.value);

	validateValueAST(valueAST, { result, customProperties, decl });
};

// validate a value ast
const validateValueAST = (ast, { result, customProperties, decl }) => {
	const isValid = typeof ast?.walk === 'function';

	if (!isValid) {
		return;
	}

	ast.walk((node) => {
		if (isVarFunction(node)) {
			const [propertyNode, , ...fallbacks] = node.nodes;
			const propertyName = propertyNode.value;
			const customProperty = customProperties.get(propertyName);

			// If property is not found in list, do nothing.
			// Testing is custom property is known is something to be dealt with by a plugin as
			// https://github.com/csstools/stylelint-value-no-unknown-custom-properties
			if (!customProperty) {
				return;
			}

			// If the custom property is not deprecated, do nothing.
			if (!customProperty.deprecated) {
				return;
			}

			// conditionally test fallbacks
			if (fallbacks.length) {
				validateValueAST(
					{ nodes: fallbacks.filter(isVarFunction) },
					{ result, customProperties, decl },
				);

				return;
			}

			// report deprecated custom properties
			stylelint.utils.report({
				message: messages.deprecated(propertyName, decl.prop, customProperty.deprecationComment),
				node: decl,
				result,
				ruleName,
				word: String(propertyName),
			});
		}
	});
};

// whether the node is a var() function
const isVarFunction = (node) =>
	node.type === 'function' && node.value === 'var' && node.nodes[0].value.startsWith('--');
