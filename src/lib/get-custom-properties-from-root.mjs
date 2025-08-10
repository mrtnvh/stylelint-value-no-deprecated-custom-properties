import path from 'node:path';
import valueParser from 'postcss-value-parser';
import { resolveId } from './resolve-id.mjs';
import getCustomPropertiesFromCSSFile from './get-custom-properties-from-css-file.mjs';

// return custom selectors from the css root, conditionally removing them
export default async function getCustomPropertiesFromRoot(root, resolver) {
	// initialize custom selectors
	const customProperties = new Map();

	// resolve current file directory
	let sourceDir = process.cwd();
	if (root.source && root.source.input && root.source.input.file) {
		sourceDir = path.dirname(root.source.input.file);
	}

	// recursively add custom properties from @import statements
	const importPromises = [];
	root.walkAtRules('import', (atRule) => {
		const fileName = parseImportParams(atRule.params);
		if (!fileName) {
			return;
		}

		if (path.isAbsolute(fileName)) {
			importPromises.push(getCustomPropertiesFromCSSFile(fileName, resolver));
		} else {
			const promise = resolveId(fileName, sourceDir, {
				paths: resolver.paths,
				extensions: resolver.extensions,
				moduleDirectories: resolver.moduleDirectories,
			})
				.then((filePath) => getCustomPropertiesFromCSSFile(filePath, resolver))
				.catch(() => {});

			importPromises.push(promise);
		}
	});

	(await Promise.all(importPromises)).forEach((propertiesFromImport) => {
		if (!propertiesFromImport || !propertiesFromImport.size) {
			return;
		}

		propertiesFromImport.forEach((value, key) => {
			customProperties.set(key, value);
		});
	});

	// for each custom property declaration
	root.walkDecls((decl) => {
		if (!decl.variable || !decl.prop.startsWith('--')) {
			return;
		}

		const deprecated = false;

		// write the parsed value to the custom property
		customProperties.set(decl.prop, {
			value: decl.value,
			deprecated,
		});
	});

	// return all custom properties, preferring :root properties over html properties
	return customProperties;
}

function parseImportParams(params) {
	const nodes = valueParser(params).nodes;
	if (!nodes.length) {
		return;
	}

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (node.type === 'space' || node.type === 'comment') {
			continue;
		}

		if (node.type === 'string') {
			return node.value;
		}

		if (node.type === 'function' && /url/i.test(node.value)) {
			for (let j = 0; j < node.nodes.length; j++) {
				const urlNode = node.nodes[j];
				if (urlNode.type === 'space' || urlNode.type === 'comment') {
					continue;
				}

				if (urlNode.type === 'word') {
					return urlNode.value;
				}

				if (urlNode.type === 'string') {
					return urlNode.value;
				}

				return false;
			}
		}

		return false;
	}

	return false;
}
