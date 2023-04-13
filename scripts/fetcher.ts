//https://registry.npmjs.org/-/v1/search?text=svelte&size=10&from=0
import { writeFileSync } from 'fs';
import { CallLimiter } from './alimiter';
import { sleep } from './utils';

//const landscapeData = await restoreData();
const landscapeData: Array<object> = [];
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

async function fetchRetry(callAPIFn) {
	const response = await callAPIFn();
	if (response.status === 429) {
		console.log(...response.headers);
		const retryAfter = response.headers.get('retry-after') ?? '120';
		const millisToSleep = getMillisToSleep(retryAfter);
		await sleep(millisToSleep);
		return fetchRetry(callAPIFn);
	}
	return response;
}

function generateNpmQueries() {
	const fetchUrls: string[] = [];
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

const queries: string[] = generateNpmQueries();
const rateLimiter = new CallLimiter({ maxRequests: 10, maxRequestWindowMS: 1000 });
const promises = queries.map((item) =>
	fetchRetry(() =>
		rateLimiter.acquireToken(() => fetch(item).then((res) => landscapeData.push(res.json())))
	)
);
const responses = await Promise.all(promises);
console.dir(landscapeData);
console.dir(responses);
/*
const data = await response.json();
	data.objects.forEach(async (item) => {
		landscapeData.push(item.package);
	});
	*/
//console.log(landscapeData);
//writeFileSync('./sveltelandscape.data', JSON.stringify(landscapeData));
