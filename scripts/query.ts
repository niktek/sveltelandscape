import { fetchPaginate } from 'fetch-paginate';

//https://registry.npmjs.org/-/v1/search?text=svelte&from=6400
const { items } = await fetchPaginate('https://registry.npmjs.org/-/v1/search?text=skeletonlabs');
console.dir(items);
