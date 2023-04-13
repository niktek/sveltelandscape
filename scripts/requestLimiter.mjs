import { RateLimiter } from './limiter/RateLimiter.mjs';
import process from 'process';
import { sleep } from './utils.mjs';

export class CallLimiter {
	constructor({ maxRequests, maxRequestWindowMS }) {
		this.maxRequests = maxRequests;
		this.maxRequestWindowMS = maxRequestWindowMS;
		this.limiter = new RateLimiter({
			tokensPerInterval: this.maxRequests,
			interval: this.maxRequestWindowMS,
			fireImmediately: false
		});
	}

	async acquireToken(fn) {
		if (this.limiter.tryRemoveTokens(1)) {
			await process.nextTick(fn);
			//return fn();
		} else {
			await sleep(this.maxRequestWindowMS);
			return this.acquireToken(fn);
		}
	}
}
