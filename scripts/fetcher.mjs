//https://registry.npmjs.org/-/v1/search?text=svelte&size=10&from=0
import { writeFileSync } from 'fs';
import { sleep } from './utils.mjs';

const landscapeData = [];
const getCount = await fetch('https://registry.npmjs.org/-/v1/search?text=svelte&size=1&from=0');
const count = await getCount.json();
const total = count.total;

function getMillisToSleep(retryHeaderString) {
	let millisToSleep = Math.round(parseFloat(retryHeaderString) * 1000);
	if (isNaN(millisToSleep)) {
		millisToSleep = Math.max(0, new Date(retryHeaderString).getTime() - Date.now());
	}
	return millisToSleep;
}

async function fetchRetry(fetchItem) {
	const response = await fetch(fetchItem);
	if (response.ok) {
		let json = await response.json();
		json.objects.forEach((item) => {landscapeData.push(item);} );
		// landscapeData.push(json.objects);
	}
	if (response.status === 429) {
		console.log(...response.headers);
		const retryAfter = response.headers.get('retry-after') ?? '120';
		const millisToSleep = getMillisToSleep(retryAfter);
		await sleep(millisToSleep);
		return fetchRetry(fetchItem);
	}
	return response;
}

function generateNpmQueries() {
	const fetchUrls = [];
	const size = 250;
	const calls = Math.floor(total / size);
	for (let x = 0; x < calls; x++) {
		fetchUrls.push(
			`https://registry.npmjs.org/-/v1/search?text=svelte&size=${size}&from=${x * size}`
		);
	}
	const finalFrom = total - (total % size);
	fetchUrls.push(
		`https://registry.npmjs.org/-/v1/search?text=svelte&size=${total % size}&from=${finalFrom}`
	);
	return fetchUrls;
}

const queries = generateNpmQueries();
const promises = queries.map((item) => fetchRetry(item));
const responses = await Promise.all(promises);
writeFileSync('./sveltelandscape.data', JSON.stringify(landscapeData, null, '\t'));
