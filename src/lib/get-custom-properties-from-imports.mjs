// import fs from 'node:fs/promises';
import path from 'node:path';
import getCustomPropertiesFromCSSFile from './get-custom-properties-from-css-file.mjs';

/**
 * Get Custom Properties from Sources
 */
export default function getCustomPropertiesFromSources(sources, resolver) {
	return sources
		.map((source) => {
			if (source instanceof Promise) {
				return source;
			} else if (source instanceof Function) {
				return source();
			}

			// read the source as an object
			const opts = source === Object(source) ? source : { from: String(source) };

			// skip objects with Custom Properties
			if (opts.customProperties || opts['custom-properties']) {
				return opts;
			}

			// source pathname
			const from = path.resolve(String(opts.from || ''));

			// type of file being read from
			const type = (opts.type || path.extname(from).slice(1)).toLowerCase();

			return { type, from };
		})
		.reduce(async (customProperties, source) => {
			const { type, from } = await source;

			if (type !== 'css') {
				return customProperties;
			}

			return new Map([
				...(await customProperties),
				...(await getCustomPropertiesFromCSSFile(from, resolver)),
			]);
		}, new Map());
}
