import fs from 'node:fs/promises';
import postcss from 'postcss';
import getCustomPropertiesFromRoot from './get-custom-properties-from-root.mjs';

export default async function getCustomPropertiesFromCSSFile(from, resolver) {
	try {
		const css = await fs.readFile(from, 'utf8');
		const root = postcss.parse(css, { from });

		return await getCustomPropertiesFromRoot(root, resolver);
	} catch (e) {
		return {};
	}
}
