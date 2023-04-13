import { create, insert } from '@orama/orama';
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence';
import { existsSync } from 'fs';

export function saveData(landscapeData) {
	persistToFile(landscapeData, 'binary', 'sveltelandscape.data');
}

export async function restoreData() {
	if (existsSync('sveltelandscape.data')) {
		const landscapeData = restoreFromFile('binary', './sveltelandscape.data');
		return landscapeData;
	} else {
		const landscapeData = await create({
			schema: {
				name: 'string',
				description: 'string',
				keywords: 'string',
			}
		});
		await insert(landscapeData, {
			name: 'svelte',
			version: '3.0.0',
			description: 'Cybernetically enhanced web apps',
			keywords: 'svelte, sveltejs, svelte.js, svelte framework',
			date: '2019-01-01',
			links: {
				homepage: 'https://svelte.dev',
				npm: 'https://www.npmjs.com/package/svelte',
				repository: 'https://github.com/sveltejs/svelte',
			}
		});
		saveData(landscapeData);
		return landscapeData;
	}
}

restoreData();