import { create } from '@orama/orama';

const db = await create({
	schema: {
		word: 'string'
	}
});
